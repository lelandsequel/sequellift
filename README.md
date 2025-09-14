# NYC Elevator Modernization Opportunity Finder

A comprehensive web application that helps elevator companies identify buildings needing modernization services in New York City.

## Features

- **Dashboard**: Real-time statistics and key metrics
- **Interactive Map**: Building locations with clustering and heat maps  
- **Advanced Search**: Filter by borough, year built, violations, and opportunity scores
- **Building Profiles**: Detailed information including elevator specs and violation history
- **Opportunity Scoring**: Weighted algorithm considering building age, violations, and market factors
- **Export & Reporting**: CSV/JSON export capabilities

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with connection pooling
- **Maps**: Leaflet with React-Leaflet
- **API**: RESTful design with comprehensive error handling

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nyc-elevator-finder
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies  
   cd ../frontend
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb nyc_elevators
   
   # Set environment variables
   cd ../backend
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   
   # Setup database schema and seed data
   npm run db:setup
   npm run db:seed
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend (port 3001)
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend (port 5173)  
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## API Endpoints

- `GET /api/buildings` - List buildings with filtering
- `GET /api/buildings/:id` - Building details
- `GET /api/opportunities` - Opportunity analysis
- `GET /api/analytics/summary` - Dashboard statistics
- `POST /api/export` - Export data (CSV/JSON)

## Database Schema

- **buildings**: Core building information
- **elevators**: Elevator specifications and age
- **violations**: DOB violations history
- **opportunities**: Calculated opportunity scores

## Scoring Algorithm

Opportunity scores are calculated using weighted factors:
- Building age (30%)
- Violations count (25%) 
- Building/elevator age ratio (20%)
- Recent sales activity (15%)
- Building class potential (10%)

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # API request handlers
│   │   ├── services/        # Business logic
│   │   ├── scripts/         # Database setup/seeding
│   │   └── ...
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── ...
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/nyc_elevators
NODE_ENV=development
PORT=3001
```

## Next Steps / TODOs

- [ ] Add user authentication
- [ ] Implement territory management  
- [ ] Add email notifications for new opportunities
- [ ] Integrate with real NYC Open Data APIs
- [ ] Add advanced analytics dashboard
- [ ] Implement caching layer
- [ ] Add unit/integration tests
- [ ] Deploy to production

---

Built with ❤️ for elevator modernization professionals in NYC.