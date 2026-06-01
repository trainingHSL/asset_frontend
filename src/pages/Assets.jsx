import { useEffect, useMemo, useState } from 'react';
import SmartSearchBar from '../components/SmartSearchBar.jsx';
import api, { cleanPayload } from '../services/api.js';

const uniqueOptions = (items, key, label = 'All') => [
  { value: 'ALL', label },
  ...Array.from(new Set(items.map((item) => item?.[key]).filter(Boolean)))
    .sort()
    .map((value) => ({ value, label: String(value).replaceAll('_', ' ') })),
];

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [form, setForm] = useState({ assetCode: '', assetName: '', assetType: '', brand: '', model: '', serialNumber: '', purchaseDate: '', warrantyEndDate: '', location: '', remarks: '' });

  const load = () => api.get('/assets').then(({ data }) => setAssets(data));
  useEffect(() => { load(); }, []);

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesSearch = !term || [
        asset.assetCode,
        asset.assetName,
        asset.assetType,
        asset.brand,
        asset.model,
        asset.serialNumber,
        asset.status,
        asset.location,
        asset.remarks,
      ].some((value) => String(value || '').toLowerCase().includes(term));

      const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || asset.assetType === typeFilter;
      const matchesLocation = locationFilter === 'ALL' || asset.location === locationFilter;

      return matchesSearch && matchesStatus && matchesType && matchesLocation;
    });
  }, [assets, search, statusFilter, typeFilter, locationFilter]);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/assets', cleanPayload(form));
    setForm({ assetCode: '', assetName: '', assetType: '', brand: '', model: '', serialNumber: '', purchaseDate: '', warrantyEndDate: '', location: '', remarks: '' });
    load();
  };

  const clearSearch = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setLocationFilter('ALL');
  };

  return (
    <section className="page fade-in">
      <div className="section-title">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Asset List</h2>
        </div>
      </div>

      <form className="form-grid glass" onSubmit={submit}>
        {['assetCode', 'assetName', 'assetType', 'brand', 'model', 'serialNumber', 'purchaseDate', 'warrantyEndDate', 'location', 'remarks'].map((field) => (
          <input key={field} type={field.includes('Date') ? 'date' : 'text'} placeholder={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={['assetCode', 'assetName', 'assetType'].includes(field)} />
        ))}
        <button className="btn">Add Asset</button>
      </form>

      <SmartSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Smart search assets by code, name, serial number, brand, model, status, location..."
        total={assets.length}
        filtered={filteredAssets.length}
        onClear={clearSearch}
        filters={[
          { name: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter, options: uniqueOptions(assets, 'status', 'All Status') },
          { name: 'type', label: 'Type', value: typeFilter, onChange: setTypeFilter, options: uniqueOptions(assets, 'assetType', 'All Types') },
          { name: 'location', label: 'Location', value: locationFilter, onChange: setLocationFilter, options: uniqueOptions(assets, 'location', 'All Locations') },
        ]}
        chips={[
          search && `Search: ${search}`,
          statusFilter !== 'ALL' && `Status: ${statusFilter.replaceAll('_', ' ')}`,
          typeFilter !== 'ALL' && `Type: ${typeFilter}`,
          locationFilter !== 'ALL' && `Location: ${locationFilter}`,
        ]}
      />

      <div className="table-card glass">
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Brand</th><th>Model</th><th>Serial</th><th>Status</th><th>Location</th></tr></thead>
          <tbody>
            {filteredAssets.map((asset) => <tr key={asset.id}><td>{asset.assetCode}</td><td>{asset.assetName}</td><td>{asset.assetType}</td><td>{asset.brand || '-'}</td><td>{asset.model || '-'}</td><td>{asset.serialNumber || '-'}</td><td><span className="pill gold">{asset.status}</span></td><td>{asset.location || '-'}</td></tr>)}
            {!filteredAssets.length && <tr><td colSpan="8" className="empty-cell">No assets found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
