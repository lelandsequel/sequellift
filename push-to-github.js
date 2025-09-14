import { Octokit } from '@octokit/rest'
import fs from 'fs'
import path from 'path'

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (!file.startsWith('.') && !filePath.includes('node_modules')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

async function createBlob(octokit, owner, repo, filePath) {
  const content = fs.readFileSync(filePath);
  const encoding = 'base64';
  
  const response = await octokit.rest.git.createBlob({
    owner,
    repo,
    content: content.toString(encoding),
    encoding
  });
  
  return response.data.sha;
}

async function pushToGitHub() {
  try {
    const octokit = await getUncachableGitHubClient();
    const owner = 'lelandsequel';
    const repo = 'sequellift';
    
    console.log('Getting repository information...');
    
    // Get the current main branch reference
    let ref;
    try {
      const refResponse = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: 'heads/main'
      });
      ref = refResponse.data;
    } catch (error) {
      // If main doesn't exist, try master
      try {
        const refResponse = await octokit.rest.git.getRef({
          owner,
          repo,
          ref: 'heads/master'
        });
        ref = refResponse.data;
      } catch (masterError) {
        console.error('Could not find main or master branch');
        throw masterError;
      }
    }
    
    console.log('Current HEAD:', ref.object.sha);
    
    // Get the current commit
    const commitResponse = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: ref.object.sha
    });
    
    const currentTreeSha = commitResponse.data.tree.sha;
    
    // Get all files in the current directory
    console.log('Scanning files...');
    const files = getAllFiles('./');
    console.log(`Found ${files.length} files to upload`);
    
    // Create blobs for all files
    const tree = [];
    
    for (const filePath of files) {
      console.log(`Processing: ${filePath}`);
      const blobSha = await createBlob(octokit, owner, repo, filePath);
      
      tree.push({
        path: filePath.replace('./', ''),
        mode: '100644',
        type: 'blob',
        sha: blobSha
      });
    }
    
    console.log('Creating tree...');
    const treeResponse = await octokit.rest.git.createTree({
      owner,
      repo,
      tree,
      base_tree: currentTreeSha
    });
    
    console.log('Creating commit...');
    const commitMessageTitle = 'Add NYC Elevator Modernization Finder';
    const commitMessageBody = `Complete full-stack application with:

- React/TypeScript frontend with Vite
- Node.js/Express backend
- PostgreSQL database with seeded NYC building data
- Interactive map with Leaflet
- Advanced search and filtering
- Building profiles and opportunity scoring
- Export capabilities

Ready for continued development outside Replit.`;
    
    const newCommitResponse = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `${commitMessageTitle}\n\n${commitMessageBody}`,
      tree: treeResponse.data.sha,
      parents: [ref.object.sha]
    });
    
    console.log('Updating reference...');
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: ref.ref.replace('refs/', ''),
      sha: newCommitResponse.data.sha
    });
    
    console.log('✅ Successfully pushed to GitHub!');
    console.log(`🔗 Repository: https://github.com/${owner}/${repo}`);
    console.log(`📝 Commit: ${newCommitResponse.data.sha}`);
    
  } catch (error) {
    console.error('❌ Error pushing to GitHub:', error.message);
    throw error;
  }
}

pushToGitHub();