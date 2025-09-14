import { Request, Response } from 'express';
import pool from '../config/database';

export class OpportunityController {
  /**
   * Get all opportunities with filtering
   */
  async getOpportunities(req: Request, res: Response) {
    try {
      // Parse query parameters
      const priority = req.query.priority as string;
      const status = req.query.status as string;
      const minScore = req.query.min_score ? parseFloat(req.query.min_score as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

      // Build query
      let query = `
        SELECT 
          o.*,
          b.building_id,
          b.address,
          b.borough,
          b.year_built,
          b.floors,
          b.owner_name
        FROM opportunities o
        JOIN buildings b ON o.building_id = b.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;

      if (priority) {
        query += ` AND o.priority_level = $${paramIndex}`;
        params.push(priority);
        paramIndex++;
      }

      if (status) {
        query += ` AND o.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (minScore !== undefined) {
        query += ` AND o.opportunity_score >= $${paramIndex}`;
        params.push(minScore);
        paramIndex++;
      }

      query += ` ORDER BY o.opportunity_score DESC`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM opportunities o
        WHERE 1=1
      `;
      
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (priority) {
        countQuery += ` AND o.priority_level = $${countParamIndex}`;
        countParams.push(priority);
        countParamIndex++;
      }

      if (status) {
        countQuery += ` AND o.status = $${countParamIndex}`;
        countParams.push(status);
        countParamIndex++;
      }

      if (minScore !== undefined) {
        countQuery += ` AND o.opportunity_score >= $${countParamIndex}`;
        countParams.push(minScore);
      }

      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit),
          current_page: Math.floor(offset / limit) + 1
        }
      });
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch opportunities' 
      });
    }
  }

  /**
   * Update opportunity status
   */
  async updateOpportunityStatus(req: Request, res: Response) {
    try {
      const opportunityId = parseInt(req.params.id);
      const { status, notes } = req.body;

      if (isNaN(opportunityId)) {
        return res.status(400).json({ error: 'Invalid opportunity ID' });
      }

      const validStatuses = ['identified', 'contacted', 'proposal_sent', 'negotiating', 'won', 'lost'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }

      const result = await pool.query(
        `UPDATE opportunities 
         SET status = $1, 
             notes = COALESCE($2, notes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [status, notes, opportunityId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }

      res.json({
        success: true,
        message: 'Opportunity status updated',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating opportunity:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update opportunity' 
      });
    }
  }
}

export default new OpportunityController();