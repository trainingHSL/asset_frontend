import { useEffect, useMemo, useState } from 'react';
import SmartSearchBar from '../components/SmartSearchBar.jsx';
import api from '../services/api.js';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

const uniqueOptions = (items, getter, label = 'All') => [
  { value: 'ALL', label },
  ...Array.from(new Set(items.map(getter).filter(Boolean)))
    .sort()
    .map((value) => ({ value, label: value })),
];

export default function MaterialIssues() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('ALL');

  useEffect(() => {
    api.get('/materials/issues').then(({ data }) => setIssues(data));
  }, []);

  const filteredIssues = useMemo(() => {
    const term = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesSearch = !term || [
        issue.material?.materialName,
        issue.material?.category,
        issue.material?.brand,
        issue.user?.name,
        issue.user?.employeeCode,
        issue.user?.department,
        issue.issuedByUser?.name,
        issue.remarks,
        issue.quantity,
      ].some((value) => String(value || '').toLowerCase().includes(term));

      const matchesCategory = categoryFilter === 'ALL' || issue.material?.category === categoryFilter;
      const matchesDepartment = departmentFilter === 'ALL' || issue.user?.department === departmentFilter;
      const matchesUser = userFilter === 'ALL' || issue.user?.name === userFilter;

      return matchesSearch && matchesCategory && matchesDepartment && matchesUser;
    });
  }, [issues, search, categoryFilter, departmentFilter, userFilter]);

  const totalIssued = filteredIssues.reduce((sum, issue) => sum + Number(issue.quantity || 0), 0);

  const clearSearch = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setDepartmentFilter('ALL');
    setUserFilter('ALL');
  };

  return (
    <section className="page fade-in">
      <div className="section-title">
        <div>
          <p className="eyebrow">Material movement</p>
          <h2>Issued Materials</h2>
        </div>
        <div className="mini-stat glass">
          <span>Total issued qty</span>
          <strong>{totalIssued}</strong>
        </div>
      </div>

      <SmartSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Smart search issued materials by material, user, employee code, department, issued by, remarks..."
        total={issues.length}
        filtered={filteredIssues.length}
        onClear={clearSearch}
        filters={[
          { name: 'category', label: 'Category', value: categoryFilter, onChange: setCategoryFilter, options: uniqueOptions(issues, (issue) => issue.material?.category, 'All Categories') },
          { name: 'department', label: 'Department', value: departmentFilter, onChange: setDepartmentFilter, options: uniqueOptions(issues, (issue) => issue.user?.department, 'All Departments') },
          { name: 'user', label: 'Issued To', value: userFilter, onChange: setUserFilter, options: uniqueOptions(issues, (issue) => issue.user?.name, 'All Users') },
        ]}
        chips={[
          search && `Search: ${search}`,
          categoryFilter !== 'ALL' && `Category: ${categoryFilter}`,
          departmentFilter !== 'ALL' && `Department: ${departmentFilter}`,
          userFilter !== 'ALL' && `Issued To: ${userFilter}`,
        ]}
      />

      <div className="table-card glass">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Material</th>
              <th>Category</th>
              <th>Issued To</th>
              <th>Department</th>
              <th>Qty</th>
              <th>Issued By</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => (
              <tr key={issue.id}>
                <td>{formatDate(issue.issueDate)}</td>
                <td>{issue.material?.materialName || '-'}</td>
                <td>{issue.material?.category || '-'}</td>
                <td>
                  <strong>{issue.user?.name || '-'}</strong>
                  <small className="muted-line">{issue.user?.employeeCode || ''}</small>
                </td>
                <td>{issue.user?.department || '-'}</td>
                <td><span className="pill gold">{issue.quantity}</span></td>
                <td>{issue.issuedByUser?.name || issue.issuedBy || '-'}</td>
                <td>{issue.remarks || '-'}</td>
              </tr>
            ))}
            {!filteredIssues.length && (
              <tr>
                <td colSpan="8" className="empty-cell">No issued material record found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
