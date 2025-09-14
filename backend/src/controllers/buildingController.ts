import { Request, Response } from 'express';
import { DataService } from '../services/dataService';
import { ScoringService } from '../services/scoringService';
import pool from '../config/database';
import { BuildingFilter, PaginationOptions } from '../types';

const dataService = new DataService(pool);
const scoringService = new ScoringService(pool);

export class BuildingController {
  /**
   * Get filtered and paginated buildings
   */
  async getBuildings(req: Request, res: Response) {
    try {
      // Parse filters from query params
      const filters: BuildingFilter = {
        borough: req.query.borough as string,
        zip_code: req.query.zip_code as string,
        year_built_min: req.query.year_built_min ? parseInt(req.query.year_built_min as string) : undefined,
        year_built_max: req.query.year_built_max ? parseInt(req.query.year_built_max as string) : undefined,
        floors_min: req.query.floors_min ? parseInt(req.query.floors_min as string) : undefined,
        floors_max: req.query.floors_max ? parseInt(req.query.floors_max as string) : undefined,
        violation_count_min: req.query.violation_count_min ? parseInt(req.query.violation_count_min as string) : undefined,
        score_min: req.query.score_min ? parseFloat(req.query.score_min as string) : undefined,
        last_inspection_from: req.query.last_inspection_from ? new Date(req.query.last_inspection_from as string) : undefined,
        last_inspection_to: req.query.last_inspection_to ? new Date(req.query.last_inspection_to as string) : undefined
      };

      // Parse pagination options
      const pagination: PaginationOptions = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as 'asc' | 'desc'
      };

      // Validate pagination values
      if (pagination.limit && (pagination.limit < 1 || pagination.limit > 100)) {
        return res.status(400).json({ error: 'Limit must be between 1 and 100' });
      }

      if (pagination.offset && pagination.offset < 0) {
        return res.status(400).json({ error: 'Offset must be non-negative' });
      }

      const result = await dataService.getBuildings(filters, pagination);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching buildings:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch buildings' 
      });
    }
  }

  /**
   * Get building by ID with all related data
   */
  async getBuildingById(req: Request, res: Response) {
    try {
      const buildingId = parseInt(req.params.id);
      
      if (isNaN(buildingId)) {
        return res.status(400).json({ error: 'Invalid building ID' });
      }

      const building = await dataService.getBuildingById(buildingId);
      
      if (!building) {
        return res.status(404).json({ error: 'Building not found' });
      }

      // Get score breakdown
      const scoreBreakdown = await scoringService.calculateOpportunityScore(buildingId);

      res.json({
        success: true,
        data: {
          ...building,
          score_breakdown: scoreBreakdown
        }
      });
    } catch (error) {
      console.error('Error fetching building:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch building details' 
      });
    }
  }

  /**
   * Get elevators for a specific building
   */
  async getBuildingElevators(req: Request, res: Response) {
    try {
      const buildingId = parseInt(req.params.id);
      
      if (isNaN(buildingId)) {
        return res.status(400).json({ error: 'Invalid building ID' });
      }

      const elevators = await dataService.getBuildingElevators(buildingId);
      
      res.json({
        success: true,
        count: elevators.length,
        data: elevators
      });
    } catch (error) {
      console.error('Error fetching elevators:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch elevators' 
      });
    }
  }

  /**
   * Get violations for a specific building
   */
  async getBuildingViolations(req: Request, res: Response) {
    try {
      const buildingId = parseInt(req.params.id);
      
      if (isNaN(buildingId)) {
        return res.status(400).json({ error: 'Invalid building ID' });
      }

      const violations = await dataService.getBuildingViolations(buildingId);
      
      res.json({
        success: true,
        count: violations.length,
        data: violations
      });
    } catch (error) {
      console.error('Error fetching violations:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch violations' 
      });
    }
  }

  /**
   * Recalculate opportunity score for a building
   */
  async recalculateScore(req: Request, res: Response) {
    try {
      const buildingId = parseInt(req.params.id);
      
      if (isNaN(buildingId)) {
        return res.status(400).json({ error: 'Invalid building ID' });
      }

      const scoreBreakdown = await scoringService.calculateOpportunityScore(buildingId);
      
      // Update the opportunity record
      await pool.query(
        `UPDATE opportunities 
         SET opportunity_score = $1, 
             priority_level = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE building_id = $3`,
        [
          scoreBreakdown.total_score,
          scoreBreakdown.total_score >= 85 ? 'Critical' :
          scoreBreakdown.total_score >= 65 ? 'High' :
          scoreBreakdown.total_score >= 40 ? 'Medium' : 'Low',
          buildingId
        ]
      );

      res.json({
        success: true,
        message: 'Score recalculated successfully',
        score_breakdown: scoreBreakdown
      });
    } catch (error) {
      console.error('Error recalculating score:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to recalculate score' 
      });
    }
  }
}

export default new BuildingController();