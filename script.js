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
        const saved = CyberSahayComplaints.post({ type: 'financial_fraud', label: 'Financial fraud', ...report });
        localStorage.setItem('cyberSahayReport', JSON.stringify({ ...saved, complaintId: saved.id }));
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


const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const identifier = data.get('identifier').trim();
    const pin = data.get('pin').trim();
    if (CyberSahayComplaints.login(identifier, pin)) window.location.href = 'status.html';
    else document.getElementById('login-error').hidden = false;
  });
}

document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', () => {
  CyberSahayComplaints.logout();
  window.location.href = 'index.html';
}));

const complaintsContainer = document.getElementById('complaints');
if (complaintsContainer) {
  const account = CyberSahayComplaints.getAccount();
  if (!account) window.location.href = 'login.html';
  else {
    document.getElementById('status-intro').textContent = `${account.name}'s demo complaints, saved in this browser.`;
    const stages = [
      ['Filed', 'Your report was received.'],
      ['Under Review', 'A team is checking the details you shared.'],
      ['Forwarded to Bank/Police', 'The right team has been asked to look into it.'],
      ['Action Taken', 'You can see the outcome or next steps here.']
    ];
    complaintsContainer.replaceChildren(...CyberSahayComplaints.get().map((complaint) => {
      const card = document.createElement('article'); card.className = 'card complaint';
      const title = document.createElement('h2'); title.textContent = complaint.id;
      const meta = document.createElement('p'); meta.className = 'complaint-meta'; meta.textContent = `${complaint.label} · Filed ${complaint.filed}`;
      const tracker = document.createElement('div'); tracker.className = 'tracker';
      stages.forEach(([titleText, detail], index) => {
        const isDone = index < complaint.status || complaint.status === 3 && index === 3;
        const stage = document.createElement('div'); stage.className = `stage ${isDone ? 'done' : index === complaint.status ? 'current' : ''}`;
        stage.innerHTML = `<span class="dot">${isDone ? '✓' : ''}</span><div><div class="stage-title"></div><p></p></div>`;
        stage.querySelector('.stage-title').textContent = titleText;
        stage.querySelector('p').textContent = detail;
        tracker.append(stage);
      });
      card.append(title, meta, tracker); return card;
    }));
  }
}
