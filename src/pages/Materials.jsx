import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SmartSearchBar from '../components/SmartSearchBar.jsx';
import api, { cleanPayload } from '../services/api.js';

const uniqueOptions = (items, key, label = 'All') => [
  { value: 'ALL', label },
  ...Array.from(new Set(items.map((item) => item?.[key]).filter(Boolean)))
    .sort()
    .map((value) => ({ value, label: value })),
];

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [form, setForm] = useState({ materialName: '', category: '', brand: '', unit: 'pcs', totalQuantity: 0, minimumStockLevel: 5, location: '' });
  const [issue, setIssue] = useState({ materialId: '', userId: '', quantity: 1, remarks: '' });

  const load = () => {
    api.get('/materials').then(({ data }) => setMaterials(data));
    api.get('/materials/issues').then(({ data }) => setIssues(data.slice(0, 5)));
    api.get('/users').then(({ data }) => setUsers(data));
  };
  useEffect(() => { load(); }, []);

  const materialsWithStock = useMemo(() => materials.map((material) => {
    const available = Number(material.availableQuantity || 0);
    const minimum = Number(material.minimumStockLevel || 0);
    let stockStatus = 'IN_STOCK';
    if (available <= 0) stockStatus = 'OUT_OF_STOCK';
    else if (available <= minimum) stockStatus = 'LOW_STOCK';
    return { ...material, stockStatus };
  }), [materials]);

  const filteredMaterials = useMemo(() => {
    const term = search.trim().toLowerCase();

    return materialsWithStock.filter((material) => {
      const matchesSearch = !term || [
        material.materialName,
        material.category,
        material.brand,
        material.unit,
        material.location,
        material.stockStatus,
      ].some((value) => String(value || '').toLowerCase().includes(term));

      const matchesCategory = categoryFilter === 'ALL' || material.category === categoryFilter;
      const matchesLocation = locationFilter === 'ALL' || material.location === locationFilter;
      const matchesStock = stockFilter === 'ALL' || material.stockStatus === stockFilter;

      return matchesSearch && matchesCategory && matchesLocation && matchesStock;
    });
  }, [materialsWithStock, search, categoryFilter, locationFilter, stockFilter]);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/materials', cleanPayload({ ...form, totalQuantity: Number(form.totalQuantity), minimumStockLevel: Number(form.minimumStockLevel) }));
    setForm({ materialName: '', category: '', brand: '', unit: 'pcs', totalQuantity: 0, minimumStockLevel: 5, location: '' });
    load();
  };

  const issueMaterial = async (event) => {
    event.preventDefault();
    await api.post('/materials/issue', cleanPayload({ ...issue, materialId: Number(issue.materialId), userId: Number(issue.userId), quantity: Number(issue.quantity) }));
    setIssue({ materialId: '', userId: '', quantity: 1, remarks: '' });
    load();
  };

  const clearSearch = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setLocationFilter('ALL');
    setStockFilter('ALL');
  };

  return (
    <section className="page fade-in">
      <div className="section-title">
        <div>
          <p className="eyebrow">Consumables</p>
          <h2>Material Management</h2>
        </div>
        <div className="actions">
          <Link className="btn ghost" to="/inventory">Inventory List</Link>
          <Link className="btn" to="/material-issues">Issued List</Link>
        </div>
      </div>

      <form className="form-grid glass" onSubmit={submit}>
        {['materialName', 'category', 'brand', 'unit', 'totalQuantity', 'minimumStockLevel', 'location'].map((field) => (
          <input key={field} type={field.includes('Quantity') || field.includes('Level') ? 'number' : 'text'} placeholder={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={['materialName', 'category', 'totalQuantity'].includes(field)} />
        ))}
        <button className="btn">Add Material</button>
      </form>

      <form className="form-grid glass compact" onSubmit={issueMaterial}>
        <select value={issue.materialId} onChange={(e) => setIssue({ ...issue, materialId: e.target.value })} required>
          <option value="">Select Material</option>
          {materials.map((material) => <option key={material.id} value={material.id}>{material.materialName} ({material.availableQuantity})</option>)}
        </select>
        <select value={issue.userId} onChange={(e) => setIssue({ ...issue, userId: e.target.value })} required>
          <option value="">Issue To</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </select>
        <input type="number" min="1" value={issue.quantity} onChange={(e) => setIssue({ ...issue, quantity: e.target.value })} />
        <input placeholder="Remarks" value={issue.remarks} onChange={(e) => setIssue({ ...issue, remarks: e.target.value })} />
        <button className="btn">Issue Material</button>
      </form>

      <SmartSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Smart search materials by name, category, brand, unit, stock status, location..."
        total={materials.length}
        filtered={filteredMaterials.length}
        onClear={clearSearch}
        filters={[
          { name: 'category', label: 'Category', value: categoryFilter, onChange: setCategoryFilter, options: uniqueOptions(materialsWithStock, 'category', 'All Categories') },
          { name: 'location', label: 'Location', value: locationFilter, onChange: setLocationFilter, options: uniqueOptions(materialsWithStock, 'location', 'All Locations') },
          { name: 'stock', label: 'Stock', value: stockFilter, onChange: setStockFilter, options: [{ value: 'ALL', label: 'All Stock' }, { value: 'IN_STOCK', label: 'In Stock' }, { value: 'LOW_STOCK', label: 'Low Stock' }, { value: 'OUT_OF_STOCK', label: 'Out of Stock' }] },
        ]}
        chips={[
          search && `Search: ${search}`,
          categoryFilter !== 'ALL' && `Category: ${categoryFilter}`,
          locationFilter !== 'ALL' && `Location: ${locationFilter}`,
          stockFilter !== 'ALL' && `Stock: ${stockFilter.replaceAll('_', ' ')}`,
        ]}
      />

      <div className="table-card glass space-bottom">
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Brand</th><th>Total</th><th>Available</th><th>Issued</th><th>Min Stock</th><th>Status</th><th>Location</th></tr></thead>
          <tbody>
            {filteredMaterials.map((material) => <tr key={material.id}><td>{material.materialName}</td><td>{material.category}</td><td>{material.brand || '-'}</td><td>{material.totalQuantity}</td><td>{material.availableQuantity}</td><td>{Number(material.totalQuantity || 0) - Number(material.availableQuantity || 0)}</td><td>{material.minimumStockLevel}</td><td><span className={`pill ${material.stockStatus === 'IN_STOCK' ? 'success' : 'danger'}`}>{material.stockStatus.replaceAll('_', ' ')}</span></td><td>{material.location || '-'}</td></tr>)}
            {!filteredMaterials.length && <tr><td colSpan="9" className="empty-cell">No materials found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="section-title small-title">
        <div>
          <p className="eyebrow">Latest activity</p>
          <h2>Recent Issued Materials</h2>
        </div>
        <Link className="btn ghost" to="/material-issues">View All</Link>
      </div>

      <div className="table-card glass">
        <table>
          <thead><tr><th>Date</th><th>Material</th><th>Issued To</th><th>Qty</th><th>Remarks</th></tr></thead>
          <tbody>
            {issues.map((item) => (
              <tr key={item.id}>
                <td>{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : '-'}</td>
                <td>{item.material?.materialName || '-'}</td>
                <td>{item.user?.name || '-'}</td>
                <td><span className="pill gold">{item.quantity}</span></td>
                <td>{item.remarks || '-'}</td>
              </tr>
            ))}
            {!issues.length && <tr><td colSpan="5" className="empty-cell">No material issued yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
