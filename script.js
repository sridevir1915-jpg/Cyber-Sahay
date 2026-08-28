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
if (form && !form.closest('[data-report-flow]')) {
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
  if (report.type === 'harassment') document.getElementById('confirmation-message').textContent = `Your complaint #${report.complaintId} has been filed. A support team will reach out within 24–48 hrs. If you are in immediate danger, please also call 112.`;
  if (report.type === 'other') document.getElementById('confirmation-message').textContent = `Your complaint #${report.complaintId} has been filed. The right team will review it within 24–48 hrs.`;
  const entries = report.type === 'harassment' ? [['Type of harassment', report.harassmentKind], ['Where it happened', report.location], ['What happened', report.details]] : report.type === 'other' ? [['Type of issue', report.issueType], ['When it happened', report.incidentDate], ['What happened', report.details]] : [['Amount lost', report.amount || 'Not provided'], ['When it happened', report.incidentTime || 'Not provided'], ['What happened', report.details || 'Not provided'], ['Fraudster details', report.fraudster || 'Not provided']];
  confirmation.innerHTML = entries.map(([label, value]) => `<li><strong>${label}</strong>${escapeHtml(value)}</li>`).join('');
}
function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }

const flow = document.querySelector('[data-report-flow]');
if (flow) {
  const type = flow.dataset.reportFlow;
  const phases = [...flow.querySelectorAll('[data-phase]')];
  const questions = [...form.querySelectorAll('.form-step')];
  let phase = 0, question = 0;
  const show = () => {
    phases.forEach((item, index) => item.hidden = index !== phase);
    questions.forEach((item, index) => item.hidden = index !== question);
    document.getElementById('step-count').textContent = `Step ${phase + 1} of 3${phase === 1 ? ` · Question ${question + 1} of ${questions.length}` : ''}`;
    document.getElementById('progress-fill').style.width = `${((phase + 1) / 3) * 100}%`;
    phases[phase].querySelector('input, textarea, select, button')?.focus();
  };
  flow.addEventListener('click', (event) => {
    if (event.target.matches('[data-next]')) {
      if (phase === 1) { const required = questions[question].querySelector('[required]'); if (!required.reportValidity()) return; if (question < questions.length - 1) { question++; show(); return; } }
      phase++; show();
    }
    if (event.target.matches('[data-back]')) { if (phase === 1 && question > 0) question--; else phase--; show(); }
    if (event.target.matches('[data-submit]')) {
      if (document.getElementById('otp').value !== '123456') { document.getElementById('otp-error').hidden = false; return; }
      const data = Object.fromEntries(new FormData(form));
      const saved = CyberSahayComplaints.post({ type, label: data.harassmentKind || data.issueType, ...data });
      localStorage.setItem('cyberSahayReport', JSON.stringify({ ...saved, complaintId: saved.id }));
      window.location.href = '../../confirmation.html';
    }
  });
  show();
}
