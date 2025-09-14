import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Buildings from './pages/Buildings';
import BuildingProfile from './pages/BuildingProfile';
import Opportunities from './pages/Opportunities';
import Analytics from './pages/Analytics';
import LandingPage from './pages/LandingPage';
import Map from './pages/Map';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/buildings" element={<Buildings />} />
            <Route path="/building/:id" element={<BuildingProfile />} />
            <Route path="/map" element={<Map />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/landing" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App