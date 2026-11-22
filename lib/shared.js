// Funções usadas pelos três endpoints (login, callback e status).

const FIREBASE_URL =
  process.env.FIREBASE_DB_URL || "https://revolux-32964-default-rtdb.firebaseio.com";

// Monta a URL do Firebase; se FIREBASE_SECRET existir, usa como autenticação.
function firebaseUrl(path) {
  const base = `${FIREBASE_URL}/${path}.json`;
  if (!process.env.FIREBASE_SECRET) return base;
  return `${base}?auth=${encodeURIComponent(process.env.FIREBASE_SECRET)}`;
}

async function firebaseSet(path, value) {
  const r = await fetch(firebaseUrl(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  if (!r.ok) throw new Error("Firebase PUT HTTP " + r.status);
}

async function firebaseGet(path) {
  const r = await fetch(firebaseUrl(path), { cache: "no-store" });
  if (!r.ok) throw new Error("Firebase GET HTTP " + r.status);
  return r.json();
}

// O código vem do app ou do navegador: 16 a 64 letras, números, _ ou -.
function isValidCode(code) {
  return typeof code === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(code);
}

module.exports = { firebaseSet, firebaseGet, isValidCode };

