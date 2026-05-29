import { useEffect, useState } from 'react';
import SignaturePad from '../components/SignaturePad.jsx';
import api from '../services/api.js';

export default function MyAssets() {
  const [assignments, setAssignments] = useState([]);
  const [signature, setSignature] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => api.get('/assignments/my-assets').then(({ data }) => setAssignments(data));
  useEffect(() => { load(); }, []);

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

  return (
    <section className="page fade-in">
      <div className="section-title">
        <div>
          <p className="eyebrow">User portal</p>
          <h2>My Assets</h2>
        </div>
      </div>

      <div className="cards-grid">
        {assignments.map((item) => (
          <div className="asset-card glass" key={item.id}>
            <div className="asset-icon">⌘</div>
            <h3>{item.asset?.assetName}</h3>
            <p>{item.asset?.brand} {item.asset?.model}</p>
            <span className="pill gold">{item.status}</span>
            <small>Assigned: {item.assignedDate}</small>
            <div className="actions">
              {item.status === 'PENDING_SIGNATURE' && <button className="btn small" onClick={() => setSelected(item)}>Sign</button>}
              {item.status === 'ASSIGNED' && <button className="btn ghost small" onClick={() => requestReturn(item.id)}>Request Return</button>}
            </div>
          </div>
        ))}
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
