import { useEffect, useMemo, useState } from 'react';
import SmartSearchBar from '../components/SmartSearchBar.jsx';
import api from '../services/api.js';

const statusLabel = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
};

const uniqueOptions = (items, key, label = 'All') => [
  { value: 'ALL', label },
  ...Array.from(new Set(items.map((item) => item?.[key]).filter(Boolean)))
    .sort()
    .map((value) => ({ value, label: value })),
];

export default function Inventory() {
  const [materials, setMaterials] = useState([]);
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');

  useEffect(() => {
    Promise.all([api.get('/materials/inventory'), api.get('/assets')]).then(([materialResponse, assetResponse]) => {
      setMaterials(materialResponse.data);
      setAssets(assetResponse.data);
    });
  }, []);

  const filteredMaterials = useMemo(() => {
    const term = search.trim().toLowerCase();

    return materials.filter((material) => {
      const matchesSearch = !term || [
        material.materialName,
        material.category,
        material.brand,
        material.location,
        material.stockStatus,
        material.unit,
      ].some((value) => String(value || '').toLowerCase().includes(term));

      const matchesStatus = statusFilter === 'ALL' || material.stockStatus === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || material.category === categoryFilter;
      const matchesLocation = locationFilter === 'ALL' || material.location === locationFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
    });
  }, [materials, search, statusFilter, categoryFilter, locationFilter]);

  const assetSummary = useMemo(() => {
    return assets.reduce((summary, asset) => {
      summary[asset.status] = (summary[asset.status] || 0) + 1;
      return summary;
    }, {});
  }, [assets]);

  const materialTotals = useMemo(() => {
    return filteredMaterials.reduce(
      (summary, material) => {
        summary.total += Number(material.totalQuantity || 0);
        summary.available += Number(material.availableQuantity || 0);
        summary.issued += Number(material.currentIssuedQuantity || 0);
        summary.lowStock += material.stockStatus === 'LOW_STOCK' || material.stockStatus === 'OUT_OF_STOCK' ? 1 : 0;
        return summary;
      },
      { total: 0, available: 0, issued: 0, lowStock: 0 },
    );
  }, [filteredMaterials]);

  const clearSearch = () => {
    setSearch('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setLocationFilter('ALL');
  };

  return (
    <section className="page fade-in">
      <div className="section-title">
        <div>
          <p className="eyebrow">Stock command</p>
          <h2>Inventory List</h2>
        </div>
      </div>

      <div className="stats-grid slim">
        <div className="stat-card glass"><span>Total Material Stock</span><strong>{materialTotals.total}</strong><small>All material units</small></div>
        <div className="stat-card glass"><span>Available Stock</span><strong>{materialTotals.available}</strong><small>Ready to issue</small></div>
        <div className="stat-card glass"><span>Issued Stock</span><strong>{materialTotals.issued}</strong><small>Currently issued</small></div>
        <div className="stat-card glass"><span>Low Stock Items</span><strong>{materialTotals.lowStock}</strong><small>Need purchase attention</small></div>
      </div>

      <div className="inventory-grid">
        <div className="hero-panel glass">
          <p className="eyebrow">Asset inventory summary</p>
          <h3>{assets.length} registered assets</h3>
          <div className="status-grid">
            {Object.entries(assetSummary).map(([status, count]) => (
              <span key={status}><strong>{count}</strong>{status.replaceAll('_', ' ')}</span>
            ))}
            {!assets.length && <span><strong>0</strong>No assets found</span>}
          </div>
        </div>

        <div className="hero-panel glass">
          <p className="eyebrow">Material health</p>
          <h3>{filteredMaterials.length} material items</h3>
          <p>Track total quantity, available quantity, issued quantity, and low-stock status in one place.</p>
        </div>
      </div>

      <SmartSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Smart search inventory by material, category, brand, location, stock status..."
        total={materials.length}
        filtered={filteredMaterials.length}
        onClear={clearSearch}
        filters={[
          { name: 'status', label: 'Stock Status', value: statusFilter, onChange: setStatusFilter, options: [{ value: 'ALL', label: 'All Status' }, { value: 'IN_STOCK', label: 'In Stock' }, { value: 'LOW_STOCK', label: 'Low Stock' }, { value: 'OUT_OF_STOCK', label: 'Out of Stock' }] },
          { name: 'category', label: 'Category', value: categoryFilter, onChange: setCategoryFilter, options: uniqueOptions(materials, 'category', 'All Categories') },
          { name: 'location', label: 'Location', value: locationFilter, onChange: setLocationFilter, options: uniqueOptions(materials, 'location', 'All Locations') },
        ]}
        chips={[
          search && `Search: ${search}`,
          statusFilter !== 'ALL' && `Status: ${statusLabel[statusFilter] || statusFilter}`,
          categoryFilter !== 'ALL' && `Category: ${categoryFilter}`,
          locationFilter !== 'ALL' && `Location: ${locationFilter}`,
        ]}
      />

      <div className="table-card glass">
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Total</th>
              <th>Available</th>
              <th>Issued</th>
              <th>Min Stock</th>
              <th>Stock %</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((material) => (
              <tr key={material.id}>
                <td>{material.materialName}</td>
                <td>{material.category}</td>
                <td>{material.brand || '-'}</td>
                <td>{material.totalQuantity} {material.unit}</td>
                <td>{material.availableQuantity} {material.unit}</td>
                <td>{material.currentIssuedQuantity} {material.unit}</td>
                <td>{material.minimumStockLevel}</td>
                <td>
                  <div className="stock-bar"><span style={{ width: `${Math.min(material.stockPercentage || 0, 100)}%` }} /></div>
                  <small className="muted-line">{material.stockPercentage || 0}% available</small>
                </td>
                <td><span className={`pill ${material.stockStatus === 'IN_STOCK' ? 'success' : 'danger'}`}>{statusLabel[material.stockStatus] || material.stockStatus}</span></td>
                <td>{material.location || '-'}</td>
              </tr>
            ))}
            {!filteredMaterials.length && (
              <tr>
                <td colSpan="10" className="empty-cell">No inventory item found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
