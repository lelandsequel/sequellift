import { Pool } from 'pg';
import { BuildingFilter, PaginationOptions, DashboardStatistics } from '../types';

export class DataService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Build WHERE clause from filters
   */
  private buildWhereClause(filters: BuildingFilter): { clause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.borough) {
      conditions.push(`b.borough = $${paramIndex}`);
      params.push(filters.borough);
      paramIndex++;
    }

    if (filters.zip_code) {
      conditions.push(`b.zip_code = $${paramIndex}`);
      params.push(filters.zip_code);
      paramIndex++;
    }

    if (filters.year_built_min) {
      conditions.push(`b.year_built >= $${paramIndex}`);
      params.push(filters.year_built_min);
      paramIndex++;
    }

    if (filters.year_built_max) {
      conditions.push(`b.year_built <= $${paramIndex}`);
      params.push(filters.year_built_max);
      paramIndex++;
    }

    if (filters.floors_min) {
      conditions.push(`b.floors >= $${paramIndex}`);
      params.push(filters.floors_min);
      paramIndex++;
    }

    if (filters.floors_max) {
      conditions.push(`b.floors <= $${paramIndex}`);
      params.push(filters.floors_max);
      paramIndex++;
    }

    if (filters.last_inspection_from) {
      conditions.push(`b.last_inspection_date >= $${paramIndex}`);
      params.push(filters.last_inspection_from);
      paramIndex++;
    }

    if (filters.last_inspection_to) {
      conditions.push(`b.last_inspection_date <= $${paramIndex}`);
      params.push(filters.last_inspection_to);
      paramIndex++;
    }

    const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { clause, params };
  }

  /**
   * Get filtered and paginated buildings
   */
  async getBuildings(filters: BuildingFilter, pagination: PaginationOptions) {
    try {
      const { clause, params } = this.buildWhereClause(filters);
      let paramIndex = params.length + 1;

      // Build the main query
      let query = `
        SELECT 
          b.*,
          COUNT(DISTINCT e.id) as elevator_count,
          COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'Open') as open_violations,
          COUNT(DISTINCT v.id) as total_violations,
          MAX(o.opportunity_score) as opportunity_score,
          MAX(o.priority_level) as priority_level,
          MAX(o.estimated_value) as estimated_value
        FROM buildings b
        LEFT JOIN elevators e ON b.id = e.building_id
        LEFT JOIN violations v ON b.id = v.building_id
        LEFT JOIN opportunities o ON b.id = o.building_id
        ${clause}
        GROUP BY b.id
      `;

      // Add HAVING clause for violation count filter
      if (filters.violation_count_min) {
        query += ` HAVING COUNT(DISTINCT v.id) >= $${paramIndex}`;
        params.push(filters.violation_count_min);
        paramIndex++;
      }

      // Add score filter
      if (filters.score_min) {
        const havingKeyword = filters.violation_count_min ? ' AND' : ' HAVING';
        query += `${havingKeyword} MAX(o.opportunity_score) >= $${paramIndex}`;
        params.push(filters.score_min);
        paramIndex++;
      }

      // Add sorting
      const sortColumn = this.getSortColumn(pagination.sort_by);
      const sortOrder = pagination.sort_order === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortColumn} ${sortOrder}`;

      // Add pagination
      const limit = pagination.limit || 20;
      const offset = pagination.offset || 0;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await this.pool.query(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(DISTINCT b.id) as total
        FROM buildings b
        LEFT JOIN violations v ON b.id = v.building_id
        LEFT JOIN opportunities o ON b.id = o.building_id
        ${clause}
      `;
      
      // For count query, we need to rebuild params without limit and offset
      const baseParamsLength = params.length - 2; // Exclude limit and offset
      const countParams = params.slice(0, baseParamsLength);
      
      if (filters.violation_count_min || filters.score_min) {
        // Build HAVING clause with proper parameter placeholders
        let havingClauses = [];
        let havingParams = [...countParams];
        let havingParamIndex = countParams.length + 1;
        
        if (filters.violation_count_min) {
          havingClauses.push(`COUNT(DISTINCT v.id) >= $${havingParamIndex}`);
          havingParams.push(filters.violation_count_min);
          havingParamIndex++;
        }
        
        if (filters.score_min) {
          havingClauses.push(`MAX(o.opportunity_score) >= $${havingParamIndex}`);
          havingParams.push(filters.score_min);
        }
        
        countQuery = `
          SELECT COUNT(*) as total FROM (
            SELECT b.id
            FROM buildings b
            LEFT JOIN violations v ON b.id = v.building_id
            LEFT JOIN opportunities o ON b.id = o.building_id
            ${clause}
            GROUP BY b.id
            HAVING ${havingClauses.join(' AND ')}
          ) as filtered
        `;
        countParams.length = 0;
        countParams.push(...havingParams);
      }
      
      const countResult = await this.pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      return {
        data: result.rows,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit),
          current_page: Math.floor(offset / limit) + 1
        }
      };
    } catch (error) {
      console.error('Error fetching buildings:', error);
      throw error;
    }
  }

  /**
   * Get valid sort column
   */
  private getSortColumn(sortBy?: string): string {
    const validColumns: { [key: string]: string } = {
      'score': 'opportunity_score',
      'opportunity_score': 'opportunity_score',
      'year_built': 'b.year_built',
      'floors': 'b.floors',
      'violations': 'total_violations',
      'address': 'b.address',
      'borough': 'b.borough',
      'last_inspection': 'b.last_inspection_date'
    };

    return validColumns[sortBy || ''] || 'opportunity_score';
  }

  /**
   * Get detailed building by ID
   */
  async getBuildingById(id: number) {
    try {
      const buildingQuery = await this.pool.query(
        `SELECT b.*, 
         COUNT(DISTINCT e.id) as elevator_count,
         COUNT(DISTINCT v.id) as total_violations,
         COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'Open') as open_violations,
         o.opportunity_score,
         o.priority_level,
         o.estimated_value,
         o.modernization_potential,
         o.risk_factors,
         o.recommended_actions,
         o.roi_estimate,
         o.payback_period_years,
         o.energy_savings_potential
         FROM buildings b
         LEFT JOIN elevators e ON b.id = e.building_id
         LEFT JOIN violations v ON b.id = v.building_id
         LEFT JOIN opportunities o ON b.id = o.building_id
         WHERE b.id = $1
         GROUP BY b.id, o.id`,
        [id]
      );

      if (buildingQuery.rows.length === 0) {
        return null;
      }

      return buildingQuery.rows[0];
    } catch (error) {
      console.error('Error fetching building by ID:', error);
      throw error;
    }
  }

  /**
   * Get elevators for a building
   */
  async getBuildingElevators(buildingId: number) {
    try {
      const result = await this.pool.query(
        `SELECT * FROM elevators WHERE building_id = $1 ORDER BY elevator_id`,
        [buildingId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching building elevators:', error);
      throw error;
    }
  }

  /**
   * Get violations for a building
   */
  async getBuildingViolations(buildingId: number) {
    try {
      const result = await this.pool.query(
        `SELECT * FROM violations WHERE building_id = $1 ORDER BY violation_date DESC`,
        [buildingId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching building violations:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStatistics(): Promise<DashboardStatistics> {
    try {
      // Get basic counts
      const counts = await this.pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM buildings) as total_buildings,
          (SELECT COUNT(*) FROM opportunities WHERE opportunity_score >= 85) as critical_opportunities,
          (SELECT AVG(opportunity_score) FROM opportunities) as average_opportunity_score,
          (SELECT COUNT(*) FROM violations) as total_violations,
          (SELECT COUNT(*) FROM violations WHERE status = 'Open') as open_violations
      `);

      // Get borough distribution
      const boroughDist = await this.pool.query(`
        SELECT borough, COUNT(*) as count 
        FROM buildings 
        GROUP BY borough
      `);

      // Get violation trend (last 6 months)
      const violationTrend = await this.pool.query(`
        SELECT 
          TO_CHAR(violation_date, 'Mon YYYY') as month,
          COUNT(*) as count
        FROM violations
        WHERE violation_date >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY TO_CHAR(violation_date, 'Mon YYYY'), DATE_TRUNC('month', violation_date)
        ORDER BY DATE_TRUNC('month', violation_date)
      `);

      // Get score distribution
      const scoreDist = await this.pool.query(`
        SELECT 
          CASE 
            WHEN opportunity_score >= 85 THEN 'Critical (85-100)'
            WHEN opportunity_score >= 65 THEN 'High (65-84)'
            WHEN opportunity_score >= 40 THEN 'Medium (40-64)'
            WHEN opportunity_score >= 20 THEN 'Low (20-39)'
            ELSE 'Very Low (0-19)'
          END as score_range,
          COUNT(*) as count
        FROM opportunities
        GROUP BY score_range
        ORDER BY 
          CASE 
            WHEN MIN(opportunity_score) >= 85 THEN 1
            WHEN MIN(opportunity_score) >= 65 THEN 2
            WHEN MIN(opportunity_score) >= 40 THEN 3
            WHEN MIN(opportunity_score) >= 20 THEN 4
            ELSE 5
          END
      `);

      const boroughDistribution: { [key: string]: number } = {};
      boroughDist.rows.forEach(row => {
        boroughDistribution[row.borough] = parseInt(row.count);
      });

      return {
        total_buildings: parseInt(counts.rows[0].total_buildings),
        critical_opportunities: parseInt(counts.rows[0].critical_opportunities),
        average_opportunity_score: parseFloat(counts.rows[0].average_opportunity_score) || 0,
        total_violations: parseInt(counts.rows[0].total_violations),
        open_violations: parseInt(counts.rows[0].open_violations),
        borough_distribution: boroughDistribution,
        violation_trend: violationTrend.rows.map(row => ({
          month: row.month,
          count: parseInt(row.count)
        })),
        score_distribution: scoreDist.rows.map(row => ({
          range: row.score_range,
          count: parseInt(row.count)
        }))
      };
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Get hot opportunities (top scoring buildings)
   */
  async getHotOpportunities(limit: number = 10) {
    try {
      const result = await this.pool.query(`
        SELECT 
          b.*,
          o.opportunity_score,
          o.priority_level,
          o.estimated_value,
          o.modernization_potential,
          o.roi_estimate,
          COUNT(DISTINCT e.id) as elevator_count,
          COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'Open') as open_violations
        FROM buildings b
        JOIN opportunities o ON b.id = o.building_id
        LEFT JOIN elevators e ON b.id = e.building_id
        LEFT JOIN violations v ON b.id = v.building_id
        GROUP BY b.id, o.id
        ORDER BY o.opportunity_score DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching hot opportunities:', error);
      throw error;
    }
  }

  /**
   * Get buildings with recent violations
   */
  async getRecentViolations(days: number = 30) {
    try {
      const result = await this.pool.query(`
        SELECT DISTINCT
          b.*,
          COUNT(DISTINCT v.id) as recent_violation_count,
          MAX(v.violation_date) as latest_violation_date,
          STRING_AGG(DISTINCT v.violation_type, ', ') as violation_types,
          MAX(o.opportunity_score) as opportunity_score
        FROM buildings b
        JOIN violations v ON b.id = v.building_id
        LEFT JOIN opportunities o ON b.id = o.building_id
        WHERE v.violation_date >= CURRENT_DATE - ($1 || ' days')::INTERVAL
        GROUP BY b.id
        ORDER BY latest_violation_date DESC
      `, [days]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching recent violations:', error);
      throw error;
    }
  }
}