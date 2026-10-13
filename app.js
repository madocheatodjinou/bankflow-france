/* BankFlow France — aperçu de l’interface, sans connexion bancaire. */
(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const savedBalance = localStorage.getItem("bankflow_demo_balance");
  const balance = savedBalance !== null && Number.isFinite(Number(savedBalance)) ? Number(savedBalance) : 387721.62;
  let history = [];
  try {
    const stored = JSON.parse(localStorage.getItem("bankflow_demo_history") || "[]");
    if (Array.isArray(stored)) history = stored;
  } catch { /* conserve l’aperçu vide si l’historique local est illisible */ }
  const euro = (value) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(value);
  const dateTime = (value) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(value));
  $("#balance").innerHTML = euro(balance).replace(" €", "") + " <small>€</small>";
  $("#availableSmall").textContent = euro(balance);
  $("#transferCount").textContent = String(history.length);
  $("#historyCount").textContent = history.length + " opération" + (history.length > 1 ? "s" : "");
  $("#emptyState").classList.toggle("hidden", history.length > 0);
  $("#historyTableWrap").classList.toggle("hidden", history.length === 0);
  $("#clearHistoryBtn").classList.add("hidden");
  const rows = $("#historyRows");
  rows.replaceChildren();
  history.slice().reverse().forEach((tx) => {
    const tr = document.createElement("tr");
    [tx.beneficiary, dateTime(tx.date), "− " + euro(tx.amount), euro(tx.balanceAfter)].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.append(td);
    });
    rows.append(tr);
  });
})();
