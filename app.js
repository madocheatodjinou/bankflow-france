/* BankFlow France — simulation front-end uniquement.
   Les données sont stockées localement et ne déclenchent aucun vrai virement. */
(() => {
  "use strict";
  const ALLOWED_EMAIL = "janujacqvirement@gmail.com";
  const ALLOWED_PASSWORD = "COESY@1basse-terre"; // Mot de passe fictif pour la démo locale.
  const INITIAL_BALANCE = 387721.62;
  const KEYS = {
    session: "bankflow_demo_session",
    balance: "bankflow_demo_balance",
    history: "bankflow_demo_history"
  };

  const $ = (selector) => document.querySelector(selector);
  const loginView = $("#loginView");
  const appView = $("#appView");
  const loginForm = $("#loginForm");
  const transferForm = $("#transferForm");
  const loginError = $("#loginError");
  const transferError = $("#transferError");
  const toast = $("#toast");
  let toastTimer;

  // Initialise le solde uniquement lors de la première ouverture.
  function getBalance() {
    const stored = localStorage.getItem(KEYS.balance);
    if (stored === null || !Number.isFinite(Number(stored))) {
      localStorage.setItem(KEYS.balance, String(INITIAL_BALANCE));
      return INITIAL_BALANCE;
    }
    return Number(stored);
  }
  function setBalance(value) {
    localStorage.setItem(KEYS.balance, value.toFixed(2));
  }
  function getHistory() {
    try {
      const data = JSON.parse(localStorage.getItem(KEYS.history) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
  function setHistory(history) {
    localStorage.setItem(KEYS.history, JSON.stringify(history));
  }
  function euro(value) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency", currency: "EUR", minimumFractionDigits: 2
    }).format(value);
  }
  function dateTime(iso) {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short", timeStyle: "medium"
    }).format(new Date(iso));
  }
  function showToast(message, type = "success") {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `toast show ${type === "error" ? "error-toast" : "success"}`;
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }
  function showApp() {
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
    $("#userEmail").textContent = localStorage.getItem(KEYS.session) || "";
    renderDashboard();
  }
  function showLogin() {
    appView.classList.add("hidden");
    loginView.classList.remove("hidden");
  }
  function renderDashboard() {
    const balance = getBalance();
    const history = getHistory();
    $("#balance").innerHTML = `${euro(balance).replace(" €", "")} <small>€</small>`;
    $("#availableSmall").textContent = euro(balance);
    $("#transferCount").textContent = String(history.length);
    $("#historyCount").textContent = `${history.length} opération${history.length > 1 ? "s" : ""}`;
    $("#emptyState").classList.toggle("hidden", history.length > 0);
    $("#historyTableWrap").classList.toggle("hidden", history.length === 0);
    $("#clearHistoryBtn").classList.toggle("hidden", history.length === 0);
    const rows = $("#historyRows");
    rows.replaceChildren();

    history.slice().reverse().forEach((tx) => {
      const tr = document.createElement("tr");
      const beneficiary = document.createElement("td");
      const name = document.createElement("strong");
      name.textContent = tx.beneficiary;
      const iban = document.createElement("small");
      iban.textContent = tx.iban;
      beneficiary.append(name, iban);

      const date = document.createElement("td");
      date.textContent = dateTime(tx.date);

      const amount = document.createElement("td");
      amount.className = "debit";
      amount.textContent = `− ${euro(tx.amount)}`;

      const balanceCell = document.createElement("td");
      balanceCell.textContent = euro(tx.balanceAfter);
      tr.append(beneficiary, date, amount, balanceCell);
      rows.append(tr);
    });
    $("#amount").max = balance.toFixed(2);
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loginError.textContent = "";
    const email = $("#email").value.trim().toLowerCase();
    if (email !== ALLOWED_EMAIL) {
      loginError.textContent = "Adresse non autorisée.";
      showToast("Connexion refusée : adresse e-mail non autorisée.", "error");
      return;
    }
    // Le mot de passe est volontairement fictif dans cette démo locale.
    const password = $("#password").value;
    if (password !== ALLOWED_PASSWORD) {
      loginError.textContent = "Mot de passe incorrect.";
      showToast("Connexion refusée : mot de passe incorrect.", "error");
      return;
    }
    localStorage.setItem(KEYS.session, ALLOWED_EMAIL);
    showApp();
    showToast("Connexion réussie.");
  });

  transferForm.addEventListener("submit", (event) => {
    event.preventDefault();
    transferError.textContent = "";
    const beneficiary = $("#beneficiary").value.trim();
    const iban = $("#iban").value.trim().replace(/\s+/g, "").toUpperCase();
    const amount = Number($("#amount").value);
    const balance = getBalance();

    if (!beneficiary || !iban || !Number.isFinite(amount) || amount <= 0) {
      transferError.textContent = "Veuillez saisir un bénéficiaire, un RIB/IBAN et un montant valide.";
      return;
    }
    // Validation de format basique uniquement : ce n'est pas une vérification bancaire.
    if (iban.length < 14 || iban.length > 34) {
      transferError.textContent = "Vérifiez la longueur du RIB/IBAN (14 à 34 caractères).";
      return;
    }
    if (amount > balance) {
      transferError.textContent = "Solde insuffisant pour ce virement.";
      showToast("Solde insuffisant.", "error");
      return;
    }

    const newBalance = Math.round((balance - amount + Number.EPSILON) * 100) / 100;
    const history = getHistory();
    history.push({
      id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      date: new Date().toISOString(),
      beneficiary,
      iban,
      amount: Math.round(amount * 100) / 100,
      balanceAfter: newBalance
    });
    setBalance(newBalance);
    setHistory(history);
    transferForm.reset();
    renderDashboard();
    showToast(`Virement de ${euro(amount)} effectué avec succès.`);
  });

  $("#logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(KEYS.session);
    showLogin();
    showToast("Vous êtes déconnecté.");
  });

  $("#clearHistoryBtn").addEventListener("click", () => {
    if (!confirm("Effacer l'historique des virements ? Le solde actuel ne sera pas modifié.")) return;
    setHistory([]);
    renderDashboard();
    showToast("Historique effacé.");
  });

  // Une session locale peut être reprise après actualisation.
  if (localStorage.getItem(KEYS.session) === ALLOWED_EMAIL) showApp();
  else showLogin();
})();
