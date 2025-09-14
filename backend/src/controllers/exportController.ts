import { Request, Response } from 'express';
import pool from '../config/database';
import {
  exportBuildingsToCSV,
  exportOpportunitiesToCSV,
  exportViolationsToCSV,
  generateExecutiveSummary,
  generateTerritoryAnalysis,
  convertToFormat,
  exportTemplates,
  ExportOptions
} from '../utils/exportUtils';

class ExportController {
  // Export buildings data
  async exportBuildings(req: Request, res: Response) {
    try {
      const {
        format = 'csv',
        borough,
        minScore,
        maxScore,
        priority,
        limit,
        includeElevators = false,
        includeViolations = false
      } = req.body;

      // Build query with filters
      let query = `
        WITH building_stats AS (
          SELECT 
            b.*,
            COALESCE(COUNT(DISTINCT e.id), 0) as elevator_count,
            COALESCE(COUNT(DISTINCT v.id), 0) as violation_count,
            COALESCE(COUNT(DISTINCT CASE WHEN v.severity = 'Critical' THEN v.id END), 0) as critical_violations
          FROM buildings b
          LEFT JOIN elevators e ON b.id = e.building_id
          LEFT JOIN violations v ON b.id = v.building_id
          GROUP BY b.id
        )
        SELECT 
          bs.*,
          CASE 
            WHEN o.opportunity_score >= 80 THEN bs.elevator_count * 150000
            WHEN o.opportunity_score >= 60 THEN bs.elevator_count * 120000
            ELSE bs.elevator_count * 90000
          END as estimated_project_value,
          o.opportunity_score,
          o.priority_level
        FROM building_stats bs
        LEFT JOIN opportunities o ON bs.id = o.building_id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (borough) {
        query += ` AND bs.borough = $${paramIndex++}`;
        params.push(borough);
      }

      if (minScore !== undefined) {
        query += ` AND o.opportunity_score >= $${paramIndex++}`;
        params.push(minScore);
      }

      if (maxScore !== undefined) {
        query += ` AND o.opportunity_score <= $${paramIndex++}`;
        params.push(maxScore);
      }

      if (priority) {
        query += ` AND o.priority_level = $${paramIndex++}`;
        params.push(priority);
      }

      query += ' ORDER BY o.opportunity_score DESC NULLS LAST';

      if (limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(limit);
      }

      const result = await pool.query(query, params);
      const buildings = result.rows;

      // Include related data if requested
      if (includeElevators || includeViolations) {
        for (const building of buildings) {
          if (includeElevators) {
            const elevatorsResult = await pool.query(
              'SELECT * FROM elevators WHERE building_id = $1',
              [building.id]
            );
            building.elevators = elevatorsResult.rows;
          }

          if (includeViolations) {
            const violationsResult = await pool.query(
              'SELECT * FROM violations WHERE building_id = $1 ORDER BY violation_date DESC',
              [building.id]
            );
            building.violations = violationsResult.rows;
          }
        }
      }

      // Convert to requested format
      const exportResult = convertToFormat(buildings, format as 'csv' | 'json', {
        format: format as 'csv' | 'json',
        includeRelated: includeElevators || includeViolations
      });

      // Set appropriate headers
      res.setHeader('Content-Type', exportResult.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      
      return res.send(exportResult.data);
    } catch (error) {
      console.error('Error exporting buildings:', error);
      return res.status(500).json({ error: 'Failed to export buildings data' });
    }
  }

  // Export opportunities data
  async exportOpportunities(req: Request, res: Response) {
    try {
      const {
        format = 'csv',
        status,
        priority,
        minScore,
        borough,
        limit
      } = req.body;

      // Build query with filters
      let query = `
        WITH building_opps AS (
          SELECT 
            b.id as building_db_id,
            b.building_id,
            b.address as building_address,
            b.borough,
            b.zip_code,
            b.owner_name,
            b.owner_contact,
            b.year_built,
            EXTRACT(YEAR FROM CURRENT_DATE) - b.year_built as years_since_built,
            COUNT(DISTINCT e.id) as elevator_count,
            COUNT(DISTINCT v.id) as violation_count,
            COUNT(DISTINCT CASE WHEN v.severity = 'Critical' THEN v.id END) as critical_violations,
            MIN(v.violation_date + INTERVAL '30 days') as compliance_deadline,
            b.created_at,
            b.updated_at
          FROM buildings b
          LEFT JOIN elevators e ON b.id = e.building_id
          LEFT JOIN violations v ON b.id = v.building_id
          GROUP BY b.id
        )
        SELECT 
          bo.*,
          o.opportunity_score,
          o.priority_level,
          CASE 
            WHEN o.opportunity_score >= 80 THEN 'Hot'
            WHEN o.opportunity_score >= 60 THEN 'Warm'
            ELSE 'Cold'
          END as opportunity_type,
          o.status,
          CASE 
            WHEN o.opportunity_score >= 80 THEN bo.elevator_count * 150000
            WHEN o.opportunity_score >= 60 THEN bo.elevator_count * 120000
            ELSE bo.elevator_count * 90000
          END as estimated_project_value,
          bo.building_id || '-OPP' as opportunity_id
        FROM building_opps bo
        INNER JOIN opportunities o ON bo.building_db_id = o.building_id
        WHERE o.opportunity_score > 0
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (priority) {
        query += ` AND o.priority_level = $${paramIndex++}`;
        params.push(priority);
      }

      if (minScore !== undefined) {
        query += ` AND o.opportunity_score >= $${paramIndex++}`;
        params.push(minScore);
      }

      if (borough) {
        query += ` AND bo.borough = $${paramIndex++}`;
        params.push(borough);
      }

      query += ' ORDER BY o.opportunity_score DESC';

      if (limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(limit);
      }

      const result = await pool.query(query, params);
      const opportunities = result.rows;

      // Convert to requested format
      const exportResult = convertToFormat(opportunities, format as 'csv' | 'json', {
        format: format as 'csv' | 'json'
      });

      // Set appropriate headers
      res.setHeader('Content-Type', exportResult.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      
      return res.send(exportResult.data);
    } catch (error) {
      console.error('Error exporting opportunities:', error);
      return res.status(500).json({ error: 'Failed to export opportunities data' });
    }
  }

  // Export violations data
  async exportViolations(req: Request, res: Response) {
    try {
      const {
        format = 'csv',
        severity,
        status = 'Open',
        borough,
        buildingId,
        limit
      } = req.body;

      // Build query with filters
      let query = `
        SELECT 
          v.*,
          b.building_id,
          b.address as building_address,
          b.borough,
          b.owner_name
        FROM violations v
        JOIN buildings b ON v.building_id = b.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (severity) {
        query += ` AND v.severity = $${paramIndex++}`;
        params.push(severity);
      }

      if (status) {
        query += ` AND v.status = $${paramIndex++}`;
        params.push(status);
      }

      if (borough) {
        query += ` AND b.borough = $${paramIndex++}`;
        params.push(borough);
      }

      if (buildingId) {
        query += ` AND b.building_id = $${paramIndex++}`;
        params.push(buildingId);
      }

      query += ' ORDER BY v.violation_date DESC';

      if (limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(limit);
      }

      const result = await pool.query(query, params);
      const violations = result.rows;

      // Convert to requested format
      const exportResult = exportViolationsToCSV(violations, {
        format: format as 'csv' | 'json'
      });

      // Set appropriate headers
      res.setHeader('Content-Type', exportResult.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      
      return res.send(exportResult.data);
    } catch (error) {
      console.error('Error exporting violations:', error);
      return res.status(500).json({ error: 'Failed to export violations data' });
    }
  }

  // Generate and export comprehensive report
  async generateReport(req: Request, res: Response) {
    try {
      const {
        reportType = 'executive_summary',
        format = 'json',
        period = 'last_30_days',
        borough,
        includeCharts = false
      } = req.body;

      let reportData: any = {};

      switch (reportType) {
        case 'executive_summary':
          reportData = await this.generateExecutiveSummaryData(period, borough);
          break;
        case 'territory_analysis':
          reportData = await this.generateTerritoryAnalysisData(period);
          break;
        case 'violation_compliance':
          reportData = await this.generateViolationComplianceData(period, borough);
          break;
        case 'roi_analysis':
          reportData = await this.generateROIAnalysisData(period, borough);
          break;
        case 'pipeline_report':
          reportData = await this.generatePipelineReportData(period, borough);
          break;
        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }

      // Add metadata
      reportData.metadata = {
        report_type: reportType,
        generated_at: new Date().toISOString(),
        period,
        filters: { borough },
        format
      };

      // For PDF format, we'll return a JSON structure that could be converted to PDF
      if (format === 'pdf') {
        // In a real implementation, you would use a PDF generation library
        reportData.pdf_ready = true;
        reportData.layout = 'professional';
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `${reportType}_report_${timestamp}.${format}`;

      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      return res.json(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
      return res.status(500).json({ error: 'Failed to generate report' });
    }
  }

  // Get available export templates
  async getExportTemplates(req: Request, res: Response) {
    try {
      const templates = Object.entries(exportTemplates).map(([key, template]) => ({
        id: key,
        ...template
      }));

      return res.json({
        templates,
        custom_templates: [] // Placeholder for user-defined templates
      });
    } catch (error) {
      console.error('Error fetching export templates:', error);
      return res.status(500).json({ error: 'Failed to fetch export templates' });
    }
  }

  // Apply export template
  async applyExportTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const { format = 'csv' } = req.body;

      const template = exportTemplates[templateId as keyof typeof exportTemplates];
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Apply template filters to get data
      let query = `
        WITH building_stats AS (
          SELECT 
            b.*,
            COALESCE(COUNT(DISTINCT e.id), 0) as elevator_count,
            COALESCE(COUNT(DISTINCT v.id), 0) as violation_count,
            COALESCE(COUNT(DISTINCT CASE WHEN v.severity = 'Critical' THEN v.id END), 0) as critical_violations
          FROM buildings b
          LEFT JOIN elevators e ON b.id = e.building_id
          LEFT JOIN violations v ON b.id = v.building_id
          GROUP BY b.id
        )
        SELECT 
          bs.*,
          CASE 
            WHEN o.opportunity_score >= 80 THEN bs.elevator_count * 150000
            WHEN o.opportunity_score >= 60 THEN bs.elevator_count * 120000
            ELSE bs.elevator_count * 90000
          END as estimated_project_value,
          o.opportunity_score,
          o.priority_level
        FROM building_stats bs
        LEFT JOIN opportunities o ON bs.id = o.building_id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (template.filters.minScore) {
        query += ` AND o.opportunity_score >= $${paramIndex++}`;
        params.push(template.filters.minScore);
      }

      if (template.filters.priority) {
        query += ` AND o.priority_level = $${paramIndex++}`;
        params.push(template.filters.priority);
      }

      query += ' ORDER BY o.opportunity_score DESC NULLS LAST';

      if (template.filters.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(template.filters.limit);
      }

      const result = await pool.query(query, params);
      const data = result.rows;

      // Convert to requested format using template fields
      const exportResult = convertToFormat(data, format as 'csv' | 'json', {
        format: format as 'csv' | 'json',
        fields: template.fields
      });

      res.setHeader('Content-Type', exportResult.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      
      return res.send(exportResult.data);
    } catch (error) {
      console.error('Error applying export template:', error);
      return res.status(500).json({ error: 'Failed to apply export template' });
    }
  }

  // Helper methods for generating report data
  private async generateExecutiveSummaryData(period: string, borough?: string) {
    const stats = await this.getStatistics(borough);
    const topOpportunities = await this.getTopOpportunities(10, borough);
    const boroughDist = await this.getBoroughDistribution();
    const scoreDist = await this.getScoreDistribution(borough);

    return generateExecutiveSummary({
      period,
      totalBuildings: stats.totalBuildings,
      totalOpportunities: stats.totalOpportunities,
      totalPipelineValue: stats.totalPipelineValue,
      averageScore: stats.averageScore,
      highPriorityCount: stats.highPriorityCount,
      criticalViolations: stats.criticalViolations,
      topOpportunities,
      boroughDistribution: boroughDist,
      scoreDistribution: scoreDist
    });
  }

  private async generateTerritoryAnalysisData(period: string) {
    const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
    const territoryData: any = {};

    for (const borough of boroughs) {
      const stats = await this.getStatistics(borough);
      const key = borough.toLowerCase().replace(' ', '_');
      territoryData[key] = {
        buildings: stats.totalBuildings,
        opportunities: stats.totalOpportunities,
        pipelineValue: stats.totalPipelineValue,
        avgScore: stats.averageScore
      };
    }

    const hotZones = await this.getHotZones();
    const coverageGaps = await this.getCoverageGaps();

    return generateTerritoryAnalysis({
      territories: boroughs,
      ...territoryData,
      hotZones,
      coverageGaps
    });
  }

  private async generateViolationComplianceData(period: string, borough?: string) {
    let query = `
      SELECT 
        COUNT(*) as total_violations,
        COUNT(CASE WHEN severity = 'Critical' THEN 1 END) as critical_violations,
        COUNT(CASE WHEN status = 'Open' THEN 1 END) as open_violations,
        COUNT(CASE WHEN (violation_date + INTERVAL '30 days') < CURRENT_DATE THEN 1 END) as overdue_violations,
        AVG(EXTRACT(DAY FROM (CURRENT_DATE - violation_date))) as avg_age_days
      FROM violations v
      JOIN buildings b ON v.building_id = b.id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (borough) {
      query += ' AND b.borough = $1';
      params.push(borough);
    }

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  private async generateROIAnalysisData(period: string, borough?: string) {
    let query = `
      SELECT 
        o.priority_level,
        COUNT(*) as count,
        AVG(o.opportunity_score) as avg_score,
        SUM(e.elevator_count) as total_elevators,
        SUM(
          CASE 
            WHEN o.opportunity_score >= 80 THEN e.elevator_count * 150000
            WHEN o.opportunity_score >= 60 THEN e.elevator_count * 120000
            ELSE e.elevator_count * 90000
          END
        ) as total_value
      FROM buildings b
      INNER JOIN opportunities o ON b.id = o.building_id
      LEFT JOIN (
        SELECT building_id, COUNT(*) as elevator_count
        FROM elevators
        GROUP BY building_id
      ) e ON b.id = e.building_id
      WHERE o.opportunity_score > 0
    `;

    const params: any[] = [];
    if (borough) {
      query += ' AND borough = $1';
      params.push(borough);
    }

    query += ' GROUP BY o.priority_level';

    const result = await pool.query(query, params);
    return result.rows;
  }

  private async generatePipelineReportData(period: string, borough?: string) {
    let query = `
      WITH building_pipeline AS (
        SELECT 
          b.*,
          COUNT(DISTINCT e.id) as elevator_count,
          COUNT(DISTINCT v.id) as violation_count
        FROM buildings b
        LEFT JOIN elevators e ON b.id = e.building_id
        LEFT JOIN violations v ON b.id = v.building_id
        GROUP BY b.id
      )
      SELECT 
        bp.*,
        o.opportunity_score,
        o.priority_level,
        CASE 
          WHEN o.opportunity_score >= 80 THEN 'Hot'
          WHEN o.opportunity_score >= 60 THEN 'Warm'
          ELSE 'Cold'
        END as pipeline_stage,
        CASE 
          WHEN o.opportunity_score >= 80 THEN bp.elevator_count * 150000
          WHEN o.opportunity_score >= 60 THEN bp.elevator_count * 120000
          ELSE bp.elevator_count * 90000
        END as estimated_value
      FROM building_pipeline bp
      INNER JOIN opportunities o ON bp.id = o.building_id
      WHERE o.opportunity_score > 40
    `;

    const params: any[] = [];
    if (borough) {
      query += ' AND bp.borough = $1';
      params.push(borough);
    }

    query += ' ORDER BY o.opportunity_score DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Helper methods for statistics
  private async getStatistics(borough?: string) {
    let whereClause = borough ? 'WHERE b.borough = $1' : 'WHERE 1=1';
    const params = borough ? [borough] : [];

    const statsQuery = `
      SELECT 
        COUNT(DISTINCT b.id) as total_buildings,
        COUNT(DISTINCT CASE WHEN o.opportunity_score > 50 THEN b.id END) as total_opportunities,
        AVG(o.opportunity_score) as average_score,
        COUNT(DISTINCT CASE WHEN o.priority_level = 'High' OR o.priority_level = 'Critical' THEN b.id END) as high_priority_count,
        COUNT(DISTINCT CASE WHEN v.severity = 'Critical' THEN v.id END) as critical_violations,
        SUM(
          CASE 
            WHEN o.opportunity_score >= 80 THEN e.elevator_count * 150000
            WHEN o.opportunity_score >= 60 THEN e.elevator_count * 120000
            ELSE e.elevator_count * 90000
          END
        ) as total_pipeline_value
      FROM buildings b
      LEFT JOIN opportunities o ON b.id = o.building_id
      LEFT JOIN (
        SELECT building_id, COUNT(*) as elevator_count
        FROM elevators
        GROUP BY building_id
      ) e ON b.id = e.building_id
      LEFT JOIN violations v ON b.id = v.building_id
      ${whereClause}
    `;

    const result = await pool.query(statsQuery, params);
    return {
      totalBuildings: parseInt(result.rows[0].total_buildings || '0'),
      totalOpportunities: parseInt(result.rows[0].total_opportunities || '0'),
      averageScore: parseFloat(result.rows[0].average_score || '0'),
      highPriorityCount: parseInt(result.rows[0].high_priority_count || '0'),
      criticalViolations: parseInt(result.rows[0].critical_violations || '0'),
      totalPipelineValue: parseFloat(result.rows[0].total_pipeline_value || '0')
    };
  }

  private async getTopOpportunities(limit: number, borough?: string) {
    let query = `
      WITH building_top AS (
        SELECT 
          b.id,
          b.building_id,
          b.address,
          b.borough,
          COUNT(DISTINCT e.id) as elevator_count
        FROM buildings b
        LEFT JOIN elevators e ON b.id = e.building_id
        GROUP BY b.id
      )
      SELECT 
        bt.building_id,
        bt.address,
        bt.borough,
        o.opportunity_score,
        o.priority_level,
        bt.elevator_count,
        CASE 
          WHEN o.opportunity_score >= 80 THEN bt.elevator_count * 150000
          WHEN o.opportunity_score >= 60 THEN bt.elevator_count * 120000
          ELSE bt.elevator_count * 90000
        END as estimated_value
      FROM building_top bt
      INNER JOIN opportunities o ON bt.id = o.building_id
      WHERE o.opportunity_score > 60
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (borough) {
      query += ` AND bt.borough = $${paramIndex++}`;
      params.push(borough);
    }

    query += ` ORDER BY o.opportunity_score DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  }

  private async getBoroughDistribution() {
    const query = `
      SELECT 
        b.borough,
        COUNT(DISTINCT b.id) as count,
        AVG(o.opportunity_score) as avg_score
      FROM buildings b
      LEFT JOIN opportunities o ON b.id = o.building_id
      GROUP BY b.borough
    `;

    const result = await pool.query(query);
    const distribution: any = {};
    result.rows.forEach(row => {
      distribution[row.borough] = {
        count: parseInt(row.count),
        avgScore: parseFloat(row.avg_score || '0')
      };
    });
    return distribution;
  }

  private async getScoreDistribution(borough?: string) {
    let query = `
      SELECT 
        CASE 
          WHEN o.opportunity_score >= 80 THEN '80-100'
          WHEN o.opportunity_score >= 60 THEN '60-79'
          WHEN o.opportunity_score >= 40 THEN '40-59'
          WHEN o.opportunity_score >= 20 THEN '20-39'
          ELSE '0-19'
        END as score_range,
        COUNT(*) as count
      FROM buildings b
      INNER JOIN opportunities o ON b.id = o.building_id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (borough) {
      query += ' AND b.borough = $1';
      params.push(borough);
    }

    query += ' GROUP BY score_range ORDER BY score_range DESC';

    const result = await pool.query(query, params);
    const distribution: any = {};
    result.rows.forEach(row => {
      distribution[row.score_range] = parseInt(row.count);
    });
    return distribution;
  }

  private async getHotZones() {
    const query = `
      SELECT 
        zip_code,
        COUNT(*) as building_count,
        AVG(opportunity_score) as avg_score,
        SUM(elevator_count) as total_elevators
      FROM buildings b
      LEFT JOIN (
        SELECT building_id, COUNT(*) as elevator_count
        FROM elevators
        GROUP BY building_id
      ) e ON b.building_id = e.building_id
      WHERE opportunity_score >= 70
      GROUP BY zip_code
      HAVING COUNT(*) >= 3
      ORDER BY avg_score DESC
      LIMIT 10
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  private async getCoverageGaps() {
    const query = `
      SELECT 
        zip_code,
        COUNT(*) as building_count,
        AVG(opportunity_score) as avg_score
      FROM buildings
      WHERE opportunity_score >= 60
      GROUP BY zip_code
      HAVING COUNT(*) < 2
      ORDER BY avg_score DESC
      LIMIT 10
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  private async getHotZones() {
    const query = `
      SELECT 
        b.zip_code,
        COUNT(*) as count,
        AVG(o.opportunity_score) as avg_score
      FROM buildings b
      INNER JOIN opportunities o ON b.id = o.building_id
      WHERE o.opportunity_score > 70
      GROUP BY b.zip_code
      ORDER BY avg_score DESC
      LIMIT 10
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  private async getCoverageGaps() {
    const query = `
      SELECT 
        b.zip_code,
        COUNT(*) as count
      FROM buildings b
      LEFT JOIN opportunities o ON b.id = o.building_id
      WHERE o.opportunity_score < 30 OR o.opportunity_score IS NULL
      GROUP BY b.zip_code
      HAVING COUNT(*) > 5
      ORDER BY count DESC
      LIMIT 10
    `;

    const result = await pool.query(query);
    return result.rows;
  }
}

export default new ExportController();