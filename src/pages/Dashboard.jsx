import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard.jsx';
import api from '../services/api.js';

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/reports/dashboard').then(({ data }) => setStats(data));
  }, []);

  return (
    <section className="page fade-in">
      <div className="dashboard-hero glass">
        <div>
          <p className="eyebrow">Live overview</p>
          <h2>Premium control room for every asset, user and material movement.</h2>
          <p>
            Track assigned assets, available stock, returns, digital signatures, issued material and inventory health from a single professional dashboard.
          </p>
          <div className="dashboard-actions">
            <Link className="btn" to="/assets">Add / View Assets</Link>
            <Link className="btn ghost" to="/assignments">Assign Asset</Link>
            <Link className="btn ghost" to="/inventory">Inventory List</Link>
          </div>
        </div>
        <div className="hero-visual">
          <span className="radar-dot one" />
          <span className="radar-dot two" />
          <span className="radar-dot three" />
          <div className="hero-metric">
            <span>Total registered assets</span>
            <strong>{stats.assets || 0}</strong>
          </div>
        </div>
      </div>

      <div className="section-title">
        <div>
          <p className="eyebrow">Operational metrics</p>
          <h2>Asset Health Snapshot</h2>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Users" value={stats.users || 0} note="Organization people" />
        <StatCard label="Total Assets" value={stats.assets || 0} note="Registered inventory" />
        <StatCard label="Assigned" value={stats.assignedAssets || 0} note="Currently with users" />
        <StatCard label="Available" value={stats.availableAssets || 0} note="Ready to assign" />
        <StatCard label="Material Items" value={stats.materials || 0} note="Inventory SKUs" />
        <StatCard label="Issued Material" value={stats.issuedMaterialQuantity || 0} note="Total issued quantity" />
        <StatCard label="Issue Records" value={stats.materialIssues || 0} note="Material issue entries" />
        <StatCard label="Returns" value={stats.returns || 0} note="Completed returns" />
        <StatCard label="Low Stock" value={stats.lowStockMaterials || 0} note="Materials need attention" />
      </div>

      <div className="hero-panel glass">
        <div>
          <p className="eyebrow">Current build</p>
          <h3>Asset register, assignment, digital sign, returns, materials, issued listing and inventory list are ready.</h3>
          <p>This professional UI is optimized for organization login, user login, Excel user import, material issue tracking, inventory reporting and daily IT asset operations.</p>
        </div>
      </div>
    </section>
  );
}
