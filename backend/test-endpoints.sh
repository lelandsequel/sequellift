#!/bin/bash

echo "==============================================="
echo "Testing NYC Elevator API Endpoints"
echo "==============================================="
echo ""

BASE_URL="http://localhost:3001/api"

echo "1. Testing /api/buildings with pagination and sorting"
echo "----------------------------------------------"
curl -s "$BASE_URL/buildings?limit=3&sort_by=opportunity_score&sort_order=desc" | jq '{success, pagination, data_count: .data | length}'
echo ""

echo "2. Testing /api/buildings with borough filter"
echo "----------------------------------------------"
curl -s "$BASE_URL/buildings?borough=Manhattan&limit=3" | jq '{success, data: .data[] | {address, borough}}'
echo ""

echo "3. Testing /api/buildings with year built filter"
echo "----------------------------------------------"
curl -s "$BASE_URL/buildings?year_built_min=1930&year_built_max=1960&limit=3" | jq '{success, data: .data[] | {address, year_built}}'
echo ""

echo "4. Testing /api/buildings with score filter"
echo "----------------------------------------------"
curl -s "$BASE_URL/buildings?score_min=70&limit=3" | jq '{success, data: .data[] | {address, opportunity_score}}'
echo ""

echo "5. Testing /api/buildings/:id (detailed building)"
echo "----------------------------------------------"
# First get building IDs
IDS=$(curl -s "$BASE_URL/buildings?limit=1" | jq -r '.data[0].id')
if [ ! -z "$IDS" ]; then
  curl -s "$BASE_URL/buildings/$IDS" | jq '{success, building: .data | {address, borough, opportunity_score}}'
else
  echo "No building IDs found"
fi
echo ""

echo "6. Testing /api/buildings/:id/elevators"
echo "----------------------------------------------"
if [ ! -z "$IDS" ]; then
  curl -s "$BASE_URL/buildings/$IDS/elevators" | jq '{success, count}'
else
  echo "No building IDs found"
fi
echo ""

echo "7. Testing /api/buildings/:id/violations"
echo "----------------------------------------------"
if [ ! -z "$IDS" ]; then
  curl -s "$BASE_URL/buildings/$IDS/violations" | jq '{success, count}'
else
  echo "No building IDs found"
fi
echo ""

echo "8. Testing /api/analytics/statistics"
echo "----------------------------------------------"
curl -s "$BASE_URL/analytics/statistics" | jq '{success, stats: .data | {total_buildings, critical_opportunities, average_opportunity_score}}'
echo ""

echo "9. Testing /api/analytics/hot-opportunities"
echo "----------------------------------------------"
curl -s "$BASE_URL/analytics/hot-opportunities?limit=3" | jq '{success, count, top_building: .data[0] | {address, opportunity_score}}'
echo ""

echo "10. Testing /api/analytics/recent-violations"
echo "----------------------------------------------"
curl -s "$BASE_URL/analytics/recent-violations?days=365" | jq '{success, count}'
echo ""

echo "11. Testing /api/analytics/score-distribution"
echo "----------------------------------------------"
curl -s "$BASE_URL/analytics/score-distribution" | jq '{success, distribution: .data}'
echo ""

echo "12. Testing /api/analytics/roi-analysis"
echo "----------------------------------------------"
curl -s "$BASE_URL/analytics/roi-analysis" | jq '{success, analysis: .data}'
echo ""

echo "13. Testing /api/opportunities with filters"
echo "----------------------------------------------"
curl -s "$BASE_URL/opportunities?priority=Critical&limit=3" | jq '{success, count: .data | length}'
echo ""

echo "14. Testing /api/health"
echo "----------------------------------------------"
curl -s "$BASE_URL/health" | jq '{status, database}'
echo ""

echo "==============================================="
echo "Testing complete!"
echo "==============================================="