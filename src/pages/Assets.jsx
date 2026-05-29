import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({ assetCode: '', assetName: '', assetType: '', brand: '', model: '', serialNumber: '', purchaseDate: '', warrantyEndDate: '', location: '', remarks: '' });

  const load = () => api.get('/assets').then(({ data }) => setAssets(data));
  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/assets', form);
    setForm({ assetCode: '', assetName: '', assetType: '', brand: '', model: '', serialNumber: '', purchaseDate: '', warrantyEndDate: '', location: '', remarks: '' });
    load();
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

      <div className="table-card glass">
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Brand</th><th>Serial</th><th>Status</th><th>Location</th></tr></thead>
          <tbody>{assets.map((asset) => <tr key={asset.id}><td>{asset.assetCode}</td><td>{asset.assetName}</td><td>{asset.assetType}</td><td>{asset.brand}</td><td>{asset.serialNumber}</td><td><span className="pill gold">{asset.status}</span></td><td>{asset.location}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
