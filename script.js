const prototypeMessage = 'This option is coming soon in a full version. For an immediate emergency, call 112.';

document.querySelectorAll('[data-coming-soon]').forEach((button) => {
  button.addEventListener('click', () => {
    const notice = document.getElementById('coming-soon');
    notice.textContent = prototypeMessage;
    notice.classList.remove('hidden');
    notice.focus();
  });
});

const form = document.getElementById('report-form');
if (form) {
  const fields = [...form.querySelectorAll('.form-step')];
  let current = 0;
  const saved = JSON.parse(localStorage.getItem('cyberSahayReport') || '{}');
  fields.forEach((step) => step.querySelectorAll('input, textarea').forEach((input) => input.value = saved[input.name] || ''));
  const showStep = () => {
    fields.forEach((step, index) => step.hidden = index !== current);
    document.getElementById('step-count').textContent = `Step ${current + 1} of ${fields.length}`;
    document.getElementById('progress-fill').style.width = `${((current + 1) / fields.length) * 100}%`;
    fields[current].querySelector('input, textarea')?.focus();
  };
  const save = () => {
    const data = Object.fromEntries(new FormData(form));
    localStorage.setItem('cyberSahayReport', JSON.stringify(data));
  };
  form.addEventListener('click', (event) => {
    if (event.target.matches('[data-next]')) {
      const field = fields[current].querySelector('[required]');
      if (field && !field.reportValidity()) return;
      save();
      if (current === fields.length - 1) {
        const report = JSON.parse(localStorage.getItem('cyberSahayReport'));
        report.complaintId = `CS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        localStorage.setItem('cyberSahayReport', JSON.stringify(report));
        window.location.href = 'confirmation.html';
      } else { current += 1; showStep(); }
    }
    if (event.target.matches('[data-back]') && current > 0) { save(); current -= 1; showStep(); }
  });
  showStep();
}

const confirmation = document.getElementById('confirmation-summary');
if (confirmation) {
  const report = JSON.parse(localStorage.getItem('cyberSahayReport') || '{}');
  document.getElementById('complaint-id').textContent = report.complaintId || 'CS-2026-482917';
  const entries = [['Amount lost', report.amount || 'Not provided'], ['When it happened', report.incidentTime || 'Not provided'], ['What happened', report.details || 'Not provided'], ['Fraudster details', report.fraudster || 'Not provided']];
  confirmation.innerHTML = entries.map(([label, value]) => `<li><strong>${label}</strong>${escapeHtml(value)}</li>`).join('');
}
function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
