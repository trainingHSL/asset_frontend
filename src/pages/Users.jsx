import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ employeeCode: '', name: '', email: '', phone: '', department: '', designation: '', location: '', password: '123456', role: 'USER' });

  const load = () => api.get('/users').then(({ data }) => setUsers(data));
  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/users', form);
    setForm({ employeeCode: '', name: '', email: '', phone: '', department: '', designation: '', location: '', password: '123456', role: 'USER' });
    load();
  };

  const importExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    await api.post('/users/import-excel', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    load();
  };

  return (
    <section className="page fade-in">
      <div className="section-title">
        <div>
          <p className="eyebrow">People</p>
          <h2>User Management</h2>
        </div>
        <label className="upload-btn">Upload Excel<input type="file" accept=".xlsx,.xls" onChange={importExcel} /></label>
      </div>

      <form className="form-grid glass" onSubmit={submit}>
        {['employeeCode', 'name', 'email', 'phone', 'department', 'designation', 'location', 'password'].map((field) => (
          <input key={field} placeholder={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={['employeeCode', 'name', 'email'].includes(field)} />
        ))}
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="USER">USER</option>
          <option value="ASSET_MANAGER">ASSET_MANAGER</option>
        </select>
        <button className="btn">Add User</button>
      </form>

      <div className="table-card glass">
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Email</th><th>Department</th><th>Role</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id}><td>{user.employeeCode}</td><td>{user.name}</td><td>{user.email}</td><td>{user.department}</td><td><span className="pill">{user.role}</span></td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
