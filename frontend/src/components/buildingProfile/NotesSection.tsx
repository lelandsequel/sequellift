import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Save,
  Plus,
  Trash2,
  User,
  Calendar,
  Clock,
  MessageSquare,
  Tag,
  Search,
  Filter,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  category: 'general' | 'technical' | 'sales' | 'maintenance' | 'urgent';
  tags: string[];
  isImportant: boolean;
  isPrivate: boolean;
}

interface Activity {
  id: string;
  type: 'note_added' | 'profile_viewed' | 'contact_added' | 'status_changed' | 'document_uploaded';
  description: string;
  user: string;
  timestamp: string;
}

interface NotesSectionProps {
  buildingId: string;
  onClose: () => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ buildingId, onClose }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState<Partial<Note>>({
    content: '',
    category: 'general',
    tags: [],
    isImportant: false,
    isPrivate: false
  });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'activity'>('notes');

  useEffect(() => {
    // Load mock notes
    const mockNotes: Note[] = [
      {
        id: '1',
        content: 'Building owner expressed strong interest in modernization during last meeting. Ready to review proposals.',
        author: 'John Smith',
        timestamp: '2024-03-15 14:30',
        category: 'sales',
        tags: ['opportunity', 'high-priority'],
        isImportant: true,
        isPrivate: false
      },
      {
        id: '2',
        content: 'Elevator #3 showing signs of wear. Recommend prioritizing this unit in modernization proposal.',
        author: 'Sarah Johnson',
        timestamp: '2024-03-14 09:15',
        category: 'technical',
        tags: ['elevator', 'maintenance'],
        isImportant: false,
        isPrivate: false
      },
      {
        id: '3',
        content: 'Budget approval expected by end of Q2. Finance team reviewing capital allocation.',
        author: 'Michael Chen',
        timestamp: '2024-03-13 16:45',
        category: 'sales',
        tags: ['budget', 'timeline'],
        isImportant: true,
        isPrivate: true
      },
      {
        id: '4',
        content: 'Compliance deadline approaching for violation VIO-2024-001. Must address by April 15.',
        author: 'System',
        timestamp: '2024-03-12 08:00',
        category: 'urgent',
        tags: ['compliance', 'violation'],
        isImportant: true,
        isPrivate: false
      }
    ];

    // Load mock activities
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'profile_viewed',
        description: 'Profile viewed by sales team',
        user: 'John Smith',
        timestamp: '2024-03-15 15:30'
      },
      {
        id: '2',
        type: 'note_added',
        description: 'Added note about owner interest',
        user: 'John Smith',
        timestamp: '2024-03-15 14:30'
      },
      {
        id: '3',
        type: 'contact_added',
        description: 'New contact added: Michael Chen',
        user: 'Sarah Johnson',
        timestamp: '2024-03-14 11:00'
      },
      {
        id: '4',
        type: 'status_changed',
        description: 'Opportunity status changed to High Priority',
        user: 'System',
        timestamp: '2024-03-13 09:00'
      },
      {
        id: '5',
        type: 'document_uploaded',
        description: 'Technical assessment report uploaded',
        user: 'Michael Chen',
        timestamp: '2024-03-12 14:15'
      }
    ];

    setNotes(mockNotes);
    setActivities(mockActivities);
  }, [buildingId]);

  const handleAddNote = () => {
    if (newNote.content) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote.content,
        author: 'Current User',
        timestamp: new Date().toLocaleString('en-US', { 
          month: 'numeric', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit', 
          minute: '2-digit'
        }),
        category: newNote.category || 'general',
        tags: newNote.tags || [],
        isImportant: newNote.isImportant || false,
        isPrivate: newNote.isPrivate || false
      };
      
      setNotes([note, ...notes]);
      
      // Add activity
      const activity: Activity = {
        id: Date.now().toString(),
        type: 'note_added',
        description: 'Added new note',
        user: 'Current User',
        timestamp: note.timestamp
      };
      setActivities([activity, ...activities]);
      
      setNewNote({
        content: '',
        category: 'general',
        tags: [],
        isImportant: false,
        isPrivate: false
      });
      setShowAddNote(false);
      setCurrentTag('');
    }
  };

  const handleUpdateNote = () => {
    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote.id ? editingNote : n));
      setEditingNote(null);
    }
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  const handleAddTag = () => {
    if (currentTag && newNote.tags && !newNote.tags.includes(currentTag)) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, currentTag]
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags?.filter(t => t !== tag) || []
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'general': 'bg-gray-100 text-gray-800',
      'technical': 'bg-blue-100 text-blue-800',
      'sales': 'bg-green-100 text-green-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note_added': return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'profile_viewed': return <User className="h-4 w-4 text-green-600" />;
      case 'contact_added': return <User className="h-4 w-4 text-purple-600" />;
      case 'status_changed': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'document_uploaded': return <FileText className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    if (filterCategory !== 'all' && note.category !== filterCategory) return false;
    if (searchQuery && !note.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-[#004b87] text-white flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <Edit3 className="h-5 w-5 mr-2" />
          Notes & Activity
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-gray-50 border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-white text-[#004b87] border-b-2 border-[#004b87]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'bg-white text-[#004b87] border-b-2 border-[#004b87]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Activity ({activities.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'notes' ? (
          <div className="p-6 space-y-4">
            {/* Search and Filter */}
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="sales">Sales</option>
                <option value="maintenance">Maintenance</option>
                <option value="urgent">Urgent</option>
              </select>
              <button
                onClick={() => setShowAddNote(true)}
                className="px-4 py-2 bg-[#ff6319] text-white rounded-md hover:bg-[#e5541a] transition-colors flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Note</span>
              </button>
            </div>

            {/* Add Note Form */}
            {showAddNote && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Add New Note</h4>
                <div className="space-y-3">
                  <textarea
                    placeholder="Enter your note..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87] h-24 resize-none"
                  />
                  <div className="flex space-x-2">
                    <select
                      value={newNote.category}
                      onChange={(e) => setNewNote({ ...newNote, category: e.target.value as any })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="sales">Sales</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <div className="flex-1 flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add tag..."
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>
                  {newNote.tags && newNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newNote.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newNote.isImportant}
                        onChange={(e) => setNewNote({ ...newNote, isImportant: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Mark as important</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newNote.isPrivate}
                        onChange={(e) => setNewNote({ ...newNote, isPrivate: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Private note</span>
                    </label>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-[#004b87] text-white rounded-md hover:bg-[#003a6c] transition-colors"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => {
                        setShowAddNote(false);
                        setNewNote({
                          content: '',
                          category: 'general',
                          tags: [],
                          isImportant: false,
                          isPrivate: false
                        });
                        setCurrentTag('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="space-y-3">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>No notes found</p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <div key={note.id} className="bg-white rounded-lg shadow-sm p-4">
                    {editingNote?.id === note.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <textarea
                          value={editingNote.content}
                          onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87] h-24 resize-none"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateNote}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNote(null)}
                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(note.category)}`}>
                              {note.category}
                            </span>
                            {note.isImportant && (
                              <span className="text-orange-500">
                                <AlertCircle className="h-4 w-4" />
                              </span>
                            )}
                            {note.isPrivate && (
                              <span className="text-gray-400">
                                <FileText className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setEditingNote(note)}
                              className="p-1 text-gray-400 hover:text-[#004b87] transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-900 mb-2">{note.content}</p>
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {note.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{note.author}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{note.timestamp}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          // Activity Tab
          <div className="p-6 space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{activity.user}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.timestamp}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 border-t px-6 py-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              <span className="font-semibold">{notes.filter(n => n.isImportant).length}</span> important notes
            </span>
            <span className="text-gray-600">
              <span className="font-semibold">{notes.filter(n => n.category === 'urgent').length}</span> urgent items
            </span>
          </div>
          <button className="text-[#004b87] hover:underline">
            Export Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesSection;