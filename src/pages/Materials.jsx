import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ materialName: '', category: '', brand: '', unit: 'pcs', totalQuantity: 0, minimumStockLevel: 5, location: '' });
  const [issue, setIssue] = useState({ materialId: '', userId: '', quantity: 1, remarks: '' });

  const load = () => {
    api.get('/materials').then(({ data }) => setMaterials(data));
    api.get('/users').then(({ data }) => setUsers(data));
  };
  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/materials', { ...form, totalQuantity: Number(form.totalQuantity), minimumStockLevel: Number(form.minimumStockLevel) });
    setForm({ materialName: '', category: '', brand: '', unit: 'pcs', totalQuantity: 0, minimumStockLevel: 5, location: '' });
    load();
  };

  const issueMaterial = async (event) => {
    event.preventDefault();
    await api.post('/materials/issue', { ...issue, materialId: Number(issue.materialId), userId: Number(issue.userId), quantity: Number(issue.quantity) });
    setIssue({ materialId: '', userId: '', quantity: 1, remarks: '' });
    load();
  };

  return (
    <section className="page fade-in">
      <div className="section-title">
        <div>
          <p className="eyebrow">Consumables</p>
          <h2>Material Management</h2>
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

      <div className="table-card glass">
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Total</th><th>Available</th><th>Min Stock</th><th>Location</th></tr></thead>
          <tbody>{materials.map((material) => <tr key={material.id}><td>{material.materialName}</td><td>{material.category}</td><td>{material.totalQuantity}</td><td>{material.availableQuantity}</td><td>{material.minimumStockLevel}</td><td>{material.location}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
