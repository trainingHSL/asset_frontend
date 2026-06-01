import { useEffect, useMemo, useState } from 'react';
import SmartSearchBar from '../components/SmartSearchBar.jsx';
import SignaturePad from '../components/SignaturePad.jsx';
import api from '../services/api.js';

const uniqueOptions = (items, getter, label = 'All') => [
  { value: 'ALL', label },
  ...Array.from(new Set(items.map(getter).filter(Boolean)))
    .sort()
    .map((value) => ({ value, label: String(value).replaceAll('_', ' ') })),
];

export default function MyAssets() {
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [signature, setSignature] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => api.get('/assignments/my-assets').then(({ data }) => setAssignments(data));
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
        item.status,
        item.assignedDate,
      ].some((value) => String(value || '').toLowerCase().includes(term));

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assignments, search, statusFilter]);

  const sign = async () => {
    if (!selected || !signature) return;
    await api.patch(`/assignments/${selected.id}/sign`, { digitalSignature: signature });
    setSelected(null);
    setSignature('');
    load();
  };

  const requestReturn = async (id) => {
    await api.patch(`/assignments/${id}/request-return`);
    load();
  };

  const clearSearch = () => {
    setSearch('');
    setStatusFilter('ALL');
  };

  return (
    <section className="page fade-in">
      <div className="section-title">
        <div>
          <p className="eyebrow">User portal</p>
          <h2>My Assets</h2>
        </div>
      </div>

      <SmartSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Smart search my assets by name, code, serial number, brand, model, status..."
        total={assignments.length}
        filtered={filteredAssignments.length}
        onClear={clearSearch}
        filters={[
          { name: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter, options: uniqueOptions(assignments, (item) => item.status, 'All Status') },
        ]}
        chips={[
          search && `Search: ${search}`,
          statusFilter !== 'ALL' && `Status: ${statusFilter.replaceAll('_', ' ')}`,
        ]}
      />

      <div className="cards-grid">
        {filteredAssignments.map((item) => (
          <div className="asset-card glass" key={item.id}>
            <div className="asset-icon">⌘</div>
            <h3>{item.asset?.assetName}</h3>
            <p>{item.asset?.brand} {item.asset?.model}</p>
            <span className="pill gold">{item.status}</span>
            <small>Code: {item.asset?.assetCode || '-'}</small>
            <small>Serial: {item.asset?.serialNumber || '-'}</small>
            <small>Assigned: {item.assignedDate}</small>
            <div className="actions">
              {item.status === 'PENDING_SIGNATURE' && <button className="btn small" onClick={() => setSelected(item)}>Sign</button>}
              {item.status === 'ASSIGNED' && <button className="btn ghost small" onClick={() => requestReturn(item.id)}>Request Return</button>}
            </div>
          </div>
        ))}
        {!filteredAssignments.length && <div className="empty-panel glass">No matching assets found.</div>}
      </div>

      {selected && (
        <div className="modal-backdrop">
          <div className="modal glass">
            <h2>Digital Signature</h2>
            <p>Please sign to confirm that you received <strong>{selected.asset?.assetName}</strong> in good condition.</p>
            <SignaturePad onChange={setSignature} />
            <div className="actions right">
              <button className="btn ghost" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn" onClick={sign}>Confirm Signature</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
