import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pool from './config/database';

// Import routes
import buildingRoutes from './routes/buildingRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import opportunityRoutes from './routes/opportunityRoutes';
import exportRoutes from './routes/exportRoutes';

// Import middleware
import { validateBuildingFilters, errorHandler } from './middleware/validation';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint with actual database connectivity test
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Test database connectivity with a simple query
    const result = await pool.query('SELECT 1 as test');
    return res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: result.rows[0].test === 1 ? 'connected' : 'connection issue'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// API Routes - Use organized routes with validation
app.use('/api/buildings', validateBuildingFilters, buildingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/exports', exportRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
});