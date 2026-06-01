import { useEffect, useMemo, useState } from 'react';
import SmartSearchBar from '../components/SmartSearchBar.jsx';
import api, { cleanPayload } from '../services/api.js';

const uniqueOptions = (items, getter, label = 'All') => [
  { value: 'ALL', label },
  ...Array.from(new Set(items.map(getter).filter(Boolean)))
    .sort()
    .map((value) => ({ value, label: String(value).replaceAll('_', ' ') })),
];

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [form, setForm] = useState({ assetId: '', userId: '', assignedDate: new Date().toISOString().slice(0, 10), expectedReturnDate: '', remarks: '' });

  const load = () => {
    api.get('/assignments').then(({ data }) => setAssignments(data));
    api.get('/users').then(({ data }) => setUsers(data));
    api.get('/assets?status=AVAILABLE').then(({ data }) => setAssets(data));
  };
  useEffect(() => { load(); }, []);

  const filteredAssignments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return assignments.filter((item) => {
      const matchesSearch = !term || [
        item.asset?.assetCode,
        item.asset?.assetName,
        item.asset?.assetType,
        item.asset?.brand,
        item.asset?.model,
        item.asset?.serialNumber,
        item.user?.employeeCode,
        item.user?.name,
        item.user?.email,
        item.user?.department,
        item.user?.designation,
        item.status,
        item.remarks,
      ].some((value) => String(value || '').toLowerCase().includes(term));

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesDepartment = departmentFilter === 'ALL' || item.user?.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [assignments, search, statusFilter, departmentFilter]);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/assignments', cleanPayload({ ...form, assetId: Number(form.assetId), userId: Number(form.userId) }));
    setForm({ assetId: '', userId: '', assignedDate: new Date().toISOString().slice(0, 10), expectedReturnDate: '', remarks: '' });
    load();
  };

  const processReturn = async (assignmentId) => {
    await api.post('/returns', { assignmentId, returnDate: new Date().toISOString().slice(0, 10), returnCondition: 'GOOD' });
    load();
  };

  const clearSearch = () => {
    setSearch('');
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
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

      <SmartSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Smart search assignments by asset, serial number, employee, department, status..."
        total={assignments.length}
        filtered={filteredAssignments.length}
        onClear={clearSearch}
        filters={[
          { name: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter, options: uniqueOptions(assignments, (item) => item.status, 'All Status') },
          { name: 'department', label: 'Department', value: departmentFilter, onChange: setDepartmentFilter, options: uniqueOptions(assignments, (item) => item.user?.department, 'All Departments') },
        ]}
        chips={[
          search && `Search: ${search}`,
          statusFilter !== 'ALL' && `Status: ${statusFilter.replaceAll('_', ' ')}`,
          departmentFilter !== 'ALL' && `Department: ${departmentFilter}`,
        ]}
      />

      <div className="table-card glass">
        <table>
          <thead><tr><th>Asset</th><th>Code</th><th>User</th><th>Department</th><th>Assigned Date</th><th>Return Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {filteredAssignments.map((item) => <tr key={item.id}><td>{item.asset?.assetName || '-'}</td><td>{item.asset?.assetCode || '-'}</td><td>{item.user?.name || '-'}</td><td>{item.user?.department || '-'}</td><td>{item.assignedDate}</td><td>{item.expectedReturnDate || '-'}</td><td><span className="pill">{item.status}</span></td><td>{item.status !== 'RETURNED' && <button className="btn ghost small" onClick={() => processReturn(item.id)}>Return</button>}</td></tr>)}
            {!filteredAssignments.length && <tr><td colSpan="8" className="empty-cell">No assignments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
