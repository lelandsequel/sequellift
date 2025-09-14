import pool from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('Seeding database with NYC building data...');
    
    // Clear existing data
    await pool.query('DELETE FROM opportunities');
    await pool.query('DELETE FROM violations');
    await pool.query('DELETE FROM elevators');
    await pool.query('DELETE FROM buildings');
    console.log('✓ Cleared existing data');
    
    // Insert buildings data
    const buildings = [
      {
        building_id: 'MAN-001',
        address: '350 Fifth Avenue',
        borough: 'Manhattan',
        zip_code: '10118',
        year_built: 1931,
        floors: 102,
        units: 250,
        owner_name: 'Empire State Realty Trust',
        owner_contact: 'info@empirestatebuilding.com',
        property_manager: 'Jones Lang LaSalle',
        last_inspection_date: '2024-06-15'
      },
      {
        building_id: 'MAN-002',
        address: '30 Rockefeller Plaza',
        borough: 'Manhattan',
        zip_code: '10112',
        year_built: 1933,
        floors: 70,
        units: 180,
        owner_name: 'Tishman Speyer',
        owner_contact: 'contact@tishmanspeyer.com',
        property_manager: 'Tishman Speyer Management',
        last_inspection_date: '2024-08-20'
      },
      {
        building_id: 'BRK-001',
        address: '1 MetroTech Center',
        borough: 'Brooklyn',
        zip_code: '11201',
        year_built: 1992,
        floors: 30,
        units: 120,
        owner_name: 'Forest City Ratner',
        owner_contact: 'info@forestcity.net',
        property_manager: 'Brookfield Properties',
        last_inspection_date: '2024-09-10'
      },
      {
        building_id: 'QNS-001',
        address: '28-07 Jackson Avenue',
        borough: 'Queens',
        zip_code: '11101',
        year_built: 1999,
        floors: 50,
        units: 450,
        owner_name: 'TF Cornerstone',
        owner_contact: 'info@tfcornerstone.com',
        property_manager: 'TF Cornerstone Management',
        last_inspection_date: '2024-07-22'
      },
      {
        building_id: 'MAN-003',
        address: '432 Park Avenue',
        borough: 'Manhattan',
        zip_code: '10022',
        year_built: 2015,
        floors: 96,
        units: 104,
        owner_name: 'CIM Group',
        owner_contact: 'contact@cimgroup.com',
        property_manager: 'Douglas Elliman',
        last_inspection_date: '2024-10-05'
      },
      {
        building_id: 'BRX-001',
        address: '1500 Waters Place',
        borough: 'Bronx',
        zip_code: '10461',
        year_built: 1962,
        floors: 40,
        units: 320,
        owner_name: 'A&E Real Estate',
        owner_contact: 'info@aerealestate.com',
        property_manager: 'A&E Management',
        last_inspection_date: '2024-05-18'
      },
      {
        building_id: 'MAN-004',
        address: '1 Wall Street',
        borough: 'Manhattan',
        zip_code: '10005',
        year_built: 1931,
        floors: 50,
        units: 566,
        owner_name: 'Macklowe Properties',
        owner_contact: 'info@macklowe.com',
        property_manager: 'Macklowe Management',
        last_inspection_date: '2024-11-01'
      },
      {
        building_id: 'BRK-002',
        address: '111 Lawrence Street',
        borough: 'Brooklyn',
        zip_code: '11201',
        year_built: 2017,
        floors: 25,
        units: 280,
        owner_name: 'Adam America Real Estate',
        owner_contact: 'contact@adamamerica.com',
        property_manager: 'Rose Associates',
        last_inspection_date: '2024-09-25'
      },
      {
        building_id: 'MAN-005',
        address: '220 Central Park South',
        borough: 'Manhattan',
        zip_code: '10019',
        year_built: 2019,
        floors: 70,
        units: 118,
        owner_name: 'Vornado Realty Trust',
        owner_contact: 'info@vno.com',
        property_manager: 'Vornado Management',
        last_inspection_date: '2024-12-10'
      },
      {
        building_id: 'QNS-002',
        address: '42-20 24th Street',
        borough: 'Queens',
        zip_code: '11101',
        year_built: 2008,
        floors: 45,
        units: 500,
        owner_name: 'Rockrose Development',
        owner_contact: 'info@rockrose.com',
        property_manager: 'Rockrose Management',
        last_inspection_date: '2024-08-30'
      },
      {
        building_id: 'MAN-006',
        address: '731 Lexington Avenue',
        borough: 'Manhattan',
        zip_code: '10022',
        year_built: 1958,
        floors: 54,
        units: 200,
        owner_name: 'Bloomberg LP',
        owner_contact: 'facilities@bloomberg.com',
        property_manager: 'CBRE',
        last_inspection_date: '2024-07-15'
      },
      {
        building_id: 'BRK-003',
        address: '300 Ashland Place',
        borough: 'Brooklyn',
        zip_code: '11217',
        year_built: 2016,
        floors: 53,
        units: 590,
        owner_name: 'Two Trees Management',
        owner_contact: 'info@twotreesny.com',
        property_manager: 'Two Trees Management',
        last_inspection_date: '2024-10-20'
      }
    ];
    
    const buildingIds: number[] = [];
    for (const building of buildings) {
      const result = await pool.query(
        `INSERT INTO buildings (
          building_id, address, borough, zip_code, year_built, 
          floors, units, owner_name, owner_contact, property_manager, last_inspection_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [
          building.building_id, building.address, building.borough, building.zip_code,
          building.year_built, building.floors, building.units, building.owner_name,
          building.owner_contact, building.property_manager, building.last_inspection_date
        ]
      );
      buildingIds.push(result.rows[0].id);
    }
    console.log(`✓ Inserted ${buildings.length} buildings`);
    
    // Insert elevators data
    const elevatorData = [
      { building_idx: 0, count: 73, manufacturer: 'Otis', year_installed: 1931, modernization_year: 2019 },
      { building_idx: 1, count: 48, manufacturer: 'Westinghouse', year_installed: 1933, modernization_year: 2018 },
      { building_idx: 2, count: 18, manufacturer: 'ThyssenKrupp', year_installed: 1992, modernization_year: null },
      { building_idx: 3, count: 24, manufacturer: 'Schindler', year_installed: 1999, modernization_year: null },
      { building_idx: 4, count: 6, manufacturer: 'ThyssenKrupp', year_installed: 2015, modernization_year: null },
      { building_idx: 5, count: 28, manufacturer: 'Otis', year_installed: 1962, modernization_year: 2005 },
      { building_idx: 6, count: 32, manufacturer: 'Otis', year_installed: 1931, modernization_year: 2020 },
      { building_idx: 7, count: 4, manufacturer: 'Kone', year_installed: 2017, modernization_year: null },
      { building_idx: 8, count: 8, manufacturer: 'ThyssenKrupp', year_installed: 2019, modernization_year: null },
      { building_idx: 9, count: 22, manufacturer: 'Schindler', year_installed: 2008, modernization_year: null },
      { building_idx: 10, count: 40, manufacturer: 'Otis', year_installed: 1958, modernization_year: 2010 },
      { building_idx: 11, count: 8, manufacturer: 'Kone', year_installed: 2016, modernization_year: null }
    ];
    
    let elevatorCount = 0;
    for (const elev of elevatorData) {
      for (let i = 0; i < Math.min(elev.count, 5); i++) { // Insert max 5 elevators per building for demo
        await pool.query(
          `INSERT INTO elevators (
            building_id, elevator_id, device_number, type, manufacturer,
            year_installed, capacity, floors_served, last_inspection_date,
            inspection_status, modernization_year
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            buildingIds[elev.building_idx],
            `ELV-${buildingIds[elev.building_idx]}-${i + 1}`,
            `DEV-${Math.floor(100000 + Math.random() * 900000)}`,
            i === 0 ? 'Freight' : 'Passenger',
            elev.manufacturer,
            elev.year_installed,
            i === 0 ? 4000 : 2500,
            buildings[elev.building_idx].floors,
            buildings[elev.building_idx].last_inspection_date,
            'Active',
            elev.modernization_year
          ]
        );
        elevatorCount++;
      }
    }
    console.log(`✓ Inserted ${elevatorCount} elevators`);
    
    // Insert violations data
    const violationTypes = [
      { type: 'Door Malfunction', severity: 'High', fine: 2500 },
      { type: 'Safety Test Overdue', severity: 'Medium', fine: 1500 },
      { type: 'Certificate Expired', severity: 'Low', fine: 500 },
      { type: 'Emergency Phone Inoperative', severity: 'High', fine: 2000 },
      { type: 'Inspection Overdue', severity: 'Medium', fine: 1000 }
    ];
    
    let violationCount = 0;
    for (let idx = 0; idx < buildingIds.length; idx++) {
      // Buildings with older elevators get more violations
      const building = buildings[idx];
      const numViolations = building.year_built < 1980 ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 2);
      
      for (let i = 0; i < numViolations; i++) {
        const violation = violationTypes[Math.floor(Math.random() * violationTypes.length)];
        const violationDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const isResolved = Math.random() > 0.3;
        
        await pool.query(
          `INSERT INTO violations (
            building_id, violation_id, violation_date, violation_type,
            description, severity, status, resolution_date, fine_amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            buildingIds[idx],
            `VIO-${buildingIds[idx]}-${i + 1}`,
            violationDate,
            violation.type,
            `${violation.type} detected during routine inspection`,
            violation.severity,
            isResolved ? 'Resolved' : 'Open',
            isResolved ? new Date(violationDate.getTime() + (30 * 24 * 60 * 60 * 1000)) : null,
            violation.fine
          ]
        );
        violationCount++;
      }
    }
    console.log(`✓ Inserted ${violationCount} violations`);
    
    // Calculate and insert opportunities
    for (let idx = 0; idx < buildingIds.length; idx++) {
      const building = buildings[idx];
      const buildingAge = 2025 - building.year_built;
      
      // Calculate opportunity score based on various factors
      let score = 0;
      let priority = 'Low';
      let estimatedValue = 0;
      
      // Age factor (older buildings score higher)
      if (buildingAge > 80) {
        score += 40;
        estimatedValue += 5000000;
      } else if (buildingAge > 50) {
        score += 30;
        estimatedValue += 3000000;
      } else if (buildingAge > 30) {
        score += 20;
        estimatedValue += 1500000;
      } else if (buildingAge > 15) {
        score += 10;
        estimatedValue += 500000;
      }
      
      // Floor count factor (taller buildings score higher)
      if (building.floors > 70) {
        score += 30;
        estimatedValue += 3000000;
      } else if (building.floors > 40) {
        score += 20;
        estimatedValue += 1500000;
      } else if (building.floors > 20) {
        score += 10;
        estimatedValue += 750000;
      }
      
      // Borough factor (Manhattan scores higher due to property values)
      if (building.borough === 'Manhattan') {
        score += 20;
        estimatedValue *= 1.5;
      } else if (building.borough === 'Brooklyn') {
        score += 10;
        estimatedValue *= 1.2;
      }
      
      // Determine priority level
      if (score >= 70) {
        priority = 'Critical';
      } else if (score >= 50) {
        priority = 'High';
      } else if (score >= 30) {
        priority = 'Medium';
      }
      
      const roiEstimate = 15 + Math.random() * 20; // 15-35% ROI
      const paybackPeriod = 3 + Math.random() * 7; // 3-10 years
      const energySavings = 20 + Math.random() * 30; // 20-50% energy savings
      
      await pool.query(
        `INSERT INTO opportunities (
          building_id, opportunity_score, priority_level, estimated_value,
          modernization_potential, risk_factors, recommended_actions,
          roi_estimate, payback_period_years, energy_savings_potential,
          status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          buildingIds[idx],
          Math.min(score, 100),
          priority,
          estimatedValue,
          score >= 50 ? 'High' : score >= 30 ? 'Medium' : 'Low',
          buildingAge > 50 ? 'Aging infrastructure, increased maintenance costs, potential safety concerns' : 'Standard wear and tear',
          buildingAge > 50 ? 'Full modernization recommended including motor, controller, and cab upgrades' : 'Selective modernization of controllers and safety systems',
          roiEstimate.toFixed(2),
          paybackPeriod.toFixed(2),
          energySavings.toFixed(2),
          'identified',
          `Building age: ${buildingAge} years, ${building.floors} floors, located in ${building.borough}`
        ]
      );
    }
    console.log(`✓ Inserted ${buildingIds.length} opportunity assessments`);
    
    console.log('\n✅ Database seeding complete!');
    console.log(`Summary:
      - Buildings: ${buildings.length}
      - Elevators: ${elevatorCount}
      - Violations: ${violationCount}
      - Opportunities: ${buildingIds.length}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  }).catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

export default seedDatabase;