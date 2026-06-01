import { useEffect, useMemo, useState } from 'react';
import SmartSearchBar from '../components/SmartSearchBar.jsx';
import api from '../services/api.js';

const uniqueOptions = (items, key, label = 'All') => [
  { value: 'ALL', label },
  ...Array.from(new Set(items.map((item) => item?.[key]).filter(Boolean)))
    .sort()
    .map((value) => ({ value, label: value })),
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [form, setForm] = useState({ employeeCode: '', name: '', email: '', phone: '', department: '', designation: '', location: '', password: '123456', role: 'USER' });

  const load = () => api.get('/users').then(({ data }) => setUsers(data));
  useEffect(() => { load(); }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = !term || [
        user.employeeCode,
        user.name,
        user.email,
        user.phone,
        user.department,
        user.designation,
        user.location,
        user.role,
      ].some((value) => String(value || '').toLowerCase().includes(term));

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesDepartment = departmentFilter === 'ALL' || user.department === departmentFilter;
      const matchesLocation = locationFilter === 'ALL' || user.location === locationFilter;

      return matchesSearch && matchesRole && matchesDepartment && matchesLocation;
    });
  }, [users, search, roleFilter, departmentFilter, locationFilter]);

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
    event.target.value = '';
    load();
  };

  const clearSearch = () => {
    setSearch('');
    setRoleFilter('ALL');
    setDepartmentFilter('ALL');
    setLocationFilter('ALL');
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

      <SmartSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Smart search users by name, employee code, email, phone, department, location..."
        total={users.length}
        filtered={filteredUsers.length}
        onClear={clearSearch}
        filters={[
          { name: 'role', label: 'Role', value: roleFilter, onChange: setRoleFilter, options: uniqueOptions(users, 'role', 'All Roles') },
          { name: 'department', label: 'Department', value: departmentFilter, onChange: setDepartmentFilter, options: uniqueOptions(users, 'department', 'All Departments') },
          { name: 'location', label: 'Location', value: locationFilter, onChange: setLocationFilter, options: uniqueOptions(users, 'location', 'All Locations') },
        ]}
        chips={[
          search && `Search: ${search}`,
          roleFilter !== 'ALL' && `Role: ${roleFilter}`,
          departmentFilter !== 'ALL' && `Department: ${departmentFilter}`,
          locationFilter !== 'ALL' && `Location: ${locationFilter}`,
        ]}
      />

      <div className="table-card glass">
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Email</th><th>Department</th><th>Designation</th><th>Location</th><th>Role</th></tr></thead>
          <tbody>
            {filteredUsers.map((user) => <tr key={user.id}><td>{user.employeeCode}</td><td>{user.name}</td><td>{user.email}</td><td>{user.department || '-'}</td><td>{user.designation || '-'}</td><td>{user.location || '-'}</td><td><span className="pill">{user.role}</span></td></tr>)}
            {!filteredUsers.length && <tr><td colSpan="7" className="empty-cell">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
