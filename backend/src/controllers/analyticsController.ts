import { Request, Response } from 'express';
import { DataService } from '../services/dataService';
import pool from '../config/database';

const dataService = new DataService(pool);

export class AnalyticsController {
  /**
   * Get dashboard statistics
   */
  async getStatistics(_req: Request, res: Response) {
    try {
      const statistics = await dataService.getDashboardStatistics();
      
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch statistics' 
      });
    }
  }

  /**
   * Get hot opportunities (top scoring buildings)
   */
  async getHotOpportunities(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      if (limit < 1 || limit > 50) {
        return res.status(400).json({ error: 'Limit must be between 1 and 50' });
      }

      const opportunities = await dataService.getHotOpportunities(limit);
      
      res.json({
        success: true,
        count: opportunities.length,
        data: opportunities
      });
    } catch (error) {
      console.error('Error fetching hot opportunities:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch hot opportunities' 
      });
    }
  }

  /**
   * Get buildings with recent violations
   */
  async getRecentViolations(req: Request, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      
      if (days < 1 || days > 365) {
        return res.status(400).json({ error: 'Days must be between 1 and 365' });
      }

      const violations = await dataService.getRecentViolations(days);
      
      res.json({
        success: true,
        count: violations.length,
        days_included: days,
        data: violations
      });
    } catch (error) {
      console.error('Error fetching recent violations:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch recent violations' 
      });
    }
  }

  /**
   * Get opportunity score distribution
   */
  async getScoreDistribution(_req: Request, res: Response) {
    try {
      const result = await pool.query(`
        SELECT 
          CASE 
            WHEN opportunity_score >= 85 THEN 'Critical (85-100)'
            WHEN opportunity_score >= 65 THEN 'High (65-84)'
            WHEN opportunity_score >= 40 THEN 'Medium (40-64)'
            WHEN opportunity_score >= 20 THEN 'Low (20-39)'
            ELSE 'Very Low (0-19)'
          END as score_range,
          COUNT(*) as count,
          AVG(estimated_value) as avg_estimated_value,
          AVG(roi_estimate) as avg_roi
        FROM opportunities
        GROUP BY CASE 
            WHEN opportunity_score >= 85 THEN 'Critical (85-100)'
            WHEN opportunity_score >= 65 THEN 'High (65-84)'
            WHEN opportunity_score >= 40 THEN 'Medium (40-64)'
            WHEN opportunity_score >= 20 THEN 'Low (20-39)'
            ELSE 'Very Low (0-19)'
          END
        ORDER BY 
          CASE 
            WHEN MIN(opportunity_score) >= 85 THEN 1
            WHEN MIN(opportunity_score) >= 65 THEN 2
            WHEN MIN(opportunity_score) >= 40 THEN 3
            WHEN MIN(opportunity_score) >= 20 THEN 4
            ELSE 5
          END
      `);

      res.json({
        success: true,
        data: result.rows.map(row => ({
          score_range: row.score_range,
          count: parseInt(row.count),
          avg_estimated_value: parseFloat(row.avg_estimated_value) || 0,
          avg_roi: parseFloat(row.avg_roi) || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching score distribution:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch score distribution' 
      });
    }
  }

  /**
   * Get ROI analysis
   */
  async getROIAnalysis(_req: Request, res: Response) {
    try {
      const result = await pool.query(`
        SELECT 
          priority_level,
          COUNT(*) as count,
          AVG(roi_estimate) as avg_roi,
          AVG(payback_period_years) as avg_payback_years,
          AVG(energy_savings_potential) as avg_energy_savings,
          SUM(estimated_value) as total_value
        FROM opportunities
        GROUP BY priority_level
        ORDER BY 
          CASE priority_level
            WHEN 'Critical' THEN 1
            WHEN 'High' THEN 2
            WHEN 'Medium' THEN 3
            WHEN 'Low' THEN 4
          END
      `);

      res.json({
        success: true,
        data: result.rows.map(row => ({
          priority_level: row.priority_level,
          count: parseInt(row.count),
          avg_roi: parseFloat(row.avg_roi) || 0,
          avg_payback_years: parseFloat(row.avg_payback_years) || 0,
          avg_energy_savings: parseFloat(row.avg_energy_savings) || 0,
          total_value: parseFloat(row.total_value) || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching ROI analysis:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch ROI analysis' 
      });
    }
  }
}

export default new AnalyticsController();