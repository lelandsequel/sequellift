import { Pool } from 'pg';
import { ScoreBreakdown } from '../types';

export class ScoringService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Calculate modernization opportunity score for a building
   * Weights:
   * - Years since last modernization: 30%
   * - Current violation count: 25%
   * - Building age vs elevator age ratio: 20%
   * - Recent property sale activity: 15%
   * - Building class upgrade potential: 10%
   */
  async calculateOpportunityScore(buildingId: number): Promise<ScoreBreakdown> {
    try {
      // Get building details
      const buildingQuery = await this.pool.query(
        `SELECT b.*, 
         COUNT(DISTINCT v.id) as violation_count,
         MIN(e.modernization_year) as oldest_modernization,
         AVG(e.year_installed) as avg_elevator_age
         FROM buildings b
         LEFT JOIN violations v ON b.id = v.building_id AND v.status = 'Open'
         LEFT JOIN elevators e ON b.id = e.building_id
         WHERE b.id = $1
         GROUP BY b.id`,
        [buildingId]
      );

      if (buildingQuery.rows.length === 0) {
        throw new Error('Building not found');
      }

      const building = buildingQuery.rows[0];
      const currentYear = new Date().getFullYear();
      
      // Calculate years since last modernization
      const lastModernization = building.oldest_modernization || building.year_built;
      const yearsSinceModernization = currentYear - lastModernization;
      
      // Score factors (0-100 for each)
      // 1. Years since modernization (30% weight)
      let modernizationScore = Math.min(100, (yearsSinceModernization / 40) * 100);
      
      // 2. Violation count (25% weight) 
      const violationCount = parseInt(building.violation_count) || 0;
      let violationScore = Math.min(100, violationCount * 20);
      
      // 3. Building age vs elevator age ratio (20% weight)
      const buildingAge = currentYear - building.year_built;
      const avgElevatorAge = building.avg_elevator_age ? 
        currentYear - Math.floor(building.avg_elevator_age) : buildingAge;
      const ageRatio = avgElevatorAge / Math.max(1, buildingAge);
      let elevatorAgeScore = Math.min(100, ageRatio * 100);
      
      // 4. Recent sale activity (15% weight) - simulated with random for demo
      const recentSale = Math.random() > 0.7;
      let saleActivityScore = recentSale ? 80 : 20;
      
      // 5. Building class upgrade potential (10% weight)
      let upgradePotentialScore = 0;
      if (building.borough === 'Manhattan') {
        upgradePotentialScore += 40;
      } else if (building.borough === 'Brooklyn') {
        upgradePotentialScore += 30;
      } else {
        upgradePotentialScore += 20;
      }
      
      if (building.floors > 50) {
        upgradePotentialScore += 40;
      } else if (building.floors > 20) {
        upgradePotentialScore += 25;
      } else {
        upgradePotentialScore += 10;
      }
      
      if (buildingAge > 50) {
        upgradePotentialScore += 20;
      }
      
      upgradePotentialScore = Math.min(100, upgradePotentialScore);
      
      // Calculate weighted total score
      const totalScore = Math.round(
        (modernizationScore * 0.30) +
        (violationScore * 0.25) +
        (elevatorAgeScore * 0.20) +
        (saleActivityScore * 0.15) +
        (upgradePotentialScore * 0.10)
      );
      
      // Determine building class
      let buildingClass = 'C';
      if (building.floors > 50 && building.borough === 'Manhattan') {
        buildingClass = 'A';
      } else if (building.floors > 30 || building.borough === 'Manhattan') {
        buildingClass = 'B';
      }
      
      return {
        total_score: totalScore,
        age_score: modernizationScore,
        violation_score: violationScore,
        elevator_age_score: elevatorAgeScore,
        sale_activity_score: saleActivityScore,
        upgrade_potential_score: upgradePotentialScore,
        factors: {
          years_since_modernization: yearsSinceModernization,
          violation_count: violationCount,
          building_age: buildingAge,
          elevator_age: avgElevatorAge,
          recent_sale: recentSale,
          building_class: buildingClass
        }
      };
    } catch (error) {
      console.error('Error calculating opportunity score:', error);
      throw error;
    }
  }

  /**
   * Update opportunity scores for all buildings
   */
  async updateAllOpportunityScores(): Promise<void> {
    try {
      const buildings = await this.pool.query('SELECT id FROM buildings');
      
      for (const building of buildings.rows) {
        const scoreBreakdown = await this.calculateOpportunityScore(building.id);
        
        // Determine priority level based on score
        let priorityLevel = 'Low';
        if (scoreBreakdown.total_score >= 85) {
          priorityLevel = 'Critical';
        } else if (scoreBreakdown.total_score >= 65) {
          priorityLevel = 'High';
        } else if (scoreBreakdown.total_score >= 40) {
          priorityLevel = 'Medium';
        }
        
        // Update opportunity record
        await this.pool.query(
          `UPDATE opportunities 
           SET opportunity_score = $1, 
               priority_level = $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE building_id = $3`,
          [scoreBreakdown.total_score, priorityLevel, building.id]
        );
      }
    } catch (error) {
      console.error('Error updating opportunity scores:', error);
      throw error;
    }
  }
}