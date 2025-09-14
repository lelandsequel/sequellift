import pool from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  try {
    console.log('Setting up database schema...');
    
    // Create buildings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS buildings (
        id SERIAL PRIMARY KEY,
        building_id VARCHAR(50) UNIQUE NOT NULL,
        address VARCHAR(255) NOT NULL,
        borough VARCHAR(50) NOT NULL,
        zip_code VARCHAR(10),
        year_built INTEGER,
        floors INTEGER,
        units INTEGER,
        owner_name VARCHAR(255),
        owner_contact VARCHAR(255),
        property_manager VARCHAR(255),
        last_inspection_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Buildings table created');
    
    // Create elevators table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS elevators (
        id SERIAL PRIMARY KEY,
        building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
        elevator_id VARCHAR(50) UNIQUE NOT NULL,
        device_number VARCHAR(50),
        type VARCHAR(50),
        manufacturer VARCHAR(100),
        year_installed INTEGER,
        capacity INTEGER,
        floors_served INTEGER,
        last_inspection_date DATE,
        inspection_status VARCHAR(50),
        modernization_year INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Elevators table created');
    
    // Create violations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS violations (
        id SERIAL PRIMARY KEY,
        building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
        violation_id VARCHAR(50) UNIQUE NOT NULL,
        violation_date DATE,
        violation_type VARCHAR(100),
        description TEXT,
        severity VARCHAR(50),
        status VARCHAR(50),
        resolution_date DATE,
        fine_amount DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Violations table created');
    
    // Create opportunities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id SERIAL PRIMARY KEY,
        building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
        opportunity_score DECIMAL(5, 2),
        priority_level VARCHAR(20),
        estimated_value DECIMAL(12, 2),
        modernization_potential VARCHAR(50),
        risk_factors TEXT,
        recommended_actions TEXT,
        roi_estimate DECIMAL(5, 2),
        payback_period_years DECIMAL(4, 2),
        energy_savings_potential DECIMAL(5, 2),
        status VARCHAR(50) DEFAULT 'identified',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Opportunities table created');
    
    // Create indexes for better query performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_buildings_borough ON buildings(borough)',
      'CREATE INDEX IF NOT EXISTS idx_buildings_year_built ON buildings(year_built)',
      'CREATE INDEX IF NOT EXISTS idx_elevators_building_id ON elevators(building_id)',
      'CREATE INDEX IF NOT EXISTS idx_violations_building_id ON violations(building_id)',
      'CREATE INDEX IF NOT EXISTS idx_violations_severity ON violations(severity)',
      'CREATE INDEX IF NOT EXISTS idx_opportunities_building_id ON opportunities(building_id)',
      'CREATE INDEX IF NOT EXISTS idx_opportunities_score ON opportunities(opportunity_score DESC)',
      'CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON opportunities(priority_level)'
    ];
    
    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }
    console.log('✓ Indexes created');
    
    console.log('\n✅ Database schema setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase().then(() => {
    console.log('Setup completed successfully');
    process.exit(0);
  }).catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

export default setupDatabase;