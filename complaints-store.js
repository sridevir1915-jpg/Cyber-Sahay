/* Mock complaint data. Everything stays in this browser; no real report is sent. */
(function () {
  const accountsKey = 'cyberSahayAccounts';
  const sessionKey = 'cyberSahaySession';
  const accounts = {
    '9876543210': {
      mobile: '9876543210', pin: '1234', name: 'Aarav',
      complaints: [
        { id: 'CS-2026-104821', type: 'financial_fraud', label: 'UPI payment fraud', status: 1, filed: 'today' },
        { id: 'CS-2026-092405', type: 'financial_fraud', label: 'Card payment fraud', status: 2, filed: '2 days ago' }
      ]
    },
    '9123456780': {
      mobile: '9123456780', pin: '5678', name: 'Meera',
      complaints: [
        { id: 'NCH-2026-382619', type: 'harassment', label: 'Online threats', status: 1, filed: 'today' },
        { id: 'NCO-2026-614923', type: 'other', label: 'Fake profile / impersonation', status: 2, filed: '4 days ago' }
      ]
    },
    '9988776655': {
      mobile: '9988776655', pin: '2468', name: 'Kabir',
      complaints: [{ id: 'CS-2026-081772', type: 'financial_fraud', label: 'Impersonation fraud', status: 3, filed: '8 days ago' }]
    }
  };
  const readAccounts = () => JSON.parse(localStorage.getItem(accountsKey) || 'null') || accounts;
  const writeAccounts = (value) => localStorage.setItem(accountsKey, JSON.stringify(value));
  const prefixFor = (type) => ({ financial_fraud: 'CS', harassment: 'NCH', other: 'NCO' })[type] || 'CS';
  const currentMobile = () => localStorage.getItem(sessionKey);
  const currentAccount = () => readAccounts()[currentMobile()] || null;

  window.CyberSahayComplaints = {
    get() { return currentAccount()?.complaints || []; },
    getAccount() { return currentAccount(); },
    login(identifier, pin) {
      const accountList = Object.values(readAccounts());
      const account = accountList.find((item) => item.mobile === identifier || item.complaints.some((complaint) => complaint.id.toLowerCase() === identifier.toLowerCase()));
      if (!account || account.pin !== pin) return false;
      localStorage.setItem(sessionKey, account.mobile);
      return true;
    },
    logout() { localStorage.removeItem(sessionKey); },
    post(complaint) {
      const account = currentAccount();
      if (!account) return null;
      const id = `${prefixFor(complaint.type)}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const saved = { ...complaint, id, status: 0, filed: 'today' };
      const allAccounts = readAccounts();
      allAccounts[account.mobile].complaints.unshift(saved);
      writeAccounts(allAccounts);
      return saved;
    }
  };
}());
