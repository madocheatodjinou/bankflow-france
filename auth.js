(() => {
  const login = document.querySelector('#loginView');
  const app = document.querySelector('#appView');
  const form = document.querySelector('#loginForm');
  const register = document.querySelector('#registerForm');
  const idsKey = 'bankflow_demo_registered_ids';
  const sessionKey = 'bankflow_demo_user';
  const ids = () => { try { const value = JSON.parse(localStorage.getItem(idsKey) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const showLogin = (id = '') => { register.classList.add('hidden'); form.classList.remove('hidden'); document.querySelector('#showRegister').classList.remove('hidden'); if (id) document.querySelector('#email').value = id; };
  const enter = id => { sessionStorage.setItem(sessionKey, id); document.querySelector('#userEmail').textContent = id; login.classList.add('hidden'); app.classList.remove('hidden'); document.querySelector('#password').value = ''; };
  document.querySelector('#logoutBtn').addEventListener('click', () => { sessionStorage.removeItem(sessionKey); app.classList.add('hidden'); login.classList.remove('hidden'); form.reset(); });
  document.querySelector('#showRegister').addEventListener('click', () => { form.classList.add('hidden'); document.querySelector('#showRegister').classList.add('hidden'); register.classList.remove('hidden'); });
  document.querySelector('#showLogin').addEventListener('click', () => showLogin());
  register.addEventListener('submit', event => { event.preventDefault(); const id = document.querySelector('#registerId').value.trim(); const error = document.querySelector('#registerError'); const saved = ids(); if (id.length < 3 || id.length > 80) { error.textContent = 'Choisissez un identifiant fictif de 3 à 80 caractères.'; return; } if (saved.includes(id.toLowerCase())) { error.textContent = 'Cet identifiant existe déjà sur cet appareil.'; return; } saved.push(id.toLowerCase()); localStorage.setItem(idsKey, JSON.stringify(saved)); register.reset(); showLogin(id); document.querySelector('#loginError').textContent = 'Identifiant enregistré. Saisissez un mot de passe fictif.'; });
  form.addEventListener('submit', event => { event.preventDefault(); const id = document.querySelector('#email').value.trim(); const error = document.querySelector('#loginError'); if (!ids().includes(id.toLowerCase())) { error.textContent = 'Identifiant inconnu. Créez un identifiant de démonstration.'; return; } if (!document.querySelector('#password').value) { error.textContent = 'Saisissez un mot de passe fictif.'; return; } enter(id); });
  const active = sessionStorage.getItem(sessionKey); if (active && ids().includes(active.toLowerCase())) enter(active); else { sessionStorage.removeItem(sessionKey); showLogin(); }
})();
