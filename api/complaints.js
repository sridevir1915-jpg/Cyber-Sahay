/* Mock complaint API. Data stays in this browser; no real report is sent. */
(function () {
  const key = 'cyberSahayComplaints';
  const seeds = [
    { id: 'CS-2026-104821', type: 'financial_fraud', label: 'UPI payment fraud', status: 1, filed: 'today' },
    { id: 'CS-2026-092405', type: 'financial_fraud', label: 'Card payment fraud', status: 2, filed: '2 days ago' },
    { id: 'CS-2026-081772', type: 'financial_fraud', label: 'Impersonation fraud', status: 3, filed: '8 days ago' },
    { id: 'NCH-2026-382619', type: 'harassment', label: 'Online threats', status: 1, filed: 'today' },
    { id: 'NCO-2026-614923', type: 'other', label: 'Fake profile / impersonation', status: 2, filed: '4 days ago' }
  ];
  const read = () => JSON.parse(localStorage.getItem(key) || 'null') || seeds;
  const write = (complaints) => localStorage.setItem(key, JSON.stringify(complaints));
  const prefixFor = (type) => ({ financial_fraud: 'CS', harassment: 'NCH', other: 'NCO' })[type];
  window.CyberSahayComplaints = {
    get() { return read(); },
    post(complaint) {
      const id = `${prefixFor(complaint.type)}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const saved = { ...complaint, id, status: 0, filed: 'today' };
      write([saved, ...read()]);
      return saved;
    }
  };
}());
