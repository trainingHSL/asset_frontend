import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({ assetId: '', userId: '', assignedDate: new Date().toISOString().slice(0, 10), expectedReturnDate: '', remarks: '' });

  const load = () => {
    api.get('/assignments').then(({ data }) => setAssignments(data));
    api.get('/users').then(({ data }) => setUsers(data));
    api.get('/assets?status=AVAILABLE').then(({ data }) => setAssets(data));
  };
  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/assignments', { ...form, assetId: Number(form.assetId), userId: Number(form.userId) });
    setForm({ assetId: '', userId: '', assignedDate: new Date().toISOString().slice(0, 10), expectedReturnDate: '', remarks: '' });
    load();
  };

  const processReturn = async (assignmentId) => {
    await api.post('/returns', { assignmentId, returnDate: new Date().toISOString().slice(0, 10), returnCondition: 'GOOD' });
    load();
  };

  return (
    <section className="page fade-in">
      <div className="section-title">
        <div>
          <p className="eyebrow">Assign and return</p>
          <h2>Asset Assignments</h2>
        </div>
      </div>

      <form className="form-grid glass" onSubmit={submit}>
        <select value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} required>
          <option value="">Select Asset</option>
          {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.assetCode} - {asset.assetName}</option>)}
        </select>
        <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required>
          <option value="">Select User</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.employeeCode} - {user.name}</option>)}
        </select>
        <input type="date" value={form.assignedDate} onChange={(e) => setForm({ ...form, assignedDate: e.target.value })} required />
        <input type="date" value={form.expectedReturnDate} onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })} />
        <input placeholder="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        <button className="btn">Assign Asset</button>
      </form>

      <div className="table-card glass">
        <table>
          <thead><tr><th>Asset</th><th>User</th><th>Assigned Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{assignments.map((item) => <tr key={item.id}><td>{item.asset?.assetName}</td><td>{item.user?.name}</td><td>{item.assignedDate}</td><td><span className="pill">{item.status}</span></td><td>{item.status !== 'RETURNED' && <button className="btn ghost small" onClick={() => processReturn(item.id)}>Return</button>}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
