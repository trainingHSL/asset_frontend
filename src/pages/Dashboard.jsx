import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard.jsx';
import api from '../services/api.js';

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/reports/dashboard').then(({ data }) => setStats(data));
  }, []);

  return (
    <section className="page fade-in">
      <div className="section-title">
        <div>
          <p className="eyebrow">Live overview</p>
          <h2>Asset Command Center</h2>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Users" value={stats.users || 0} note="Organization people" />
        <StatCard label="Total Assets" value={stats.assets || 0} note="Registered inventory" />
        <StatCard label="Assigned" value={stats.assignedAssets || 0} note="Currently with users" />
        <StatCard label="Available" value={stats.availableAssets || 0} note="Ready to assign" />
        <StatCard label="Returns" value={stats.returns || 0} note="Completed returns" />
        <StatCard label="Low Stock" value={stats.lowStockMaterials || 0} note="Materials need attention" />
      </div>

      <div className="hero-panel glass">
        <div>
          <p className="eyebrow">Next build step</p>
          <h3>Add users, add assets, then assign with signature.</h3>
          <p>This starter already supports organization login, user login, Excel user import, asset assignment, digital sign, return, material issue and dashboard reports.</p>
        </div>
      </div>
    </section>
  );
}
