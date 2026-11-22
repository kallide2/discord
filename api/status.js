// GET /api/status?code=XXXX
// Responde para o app (e para o site): {"hasRole": true|false, "done": true|false}
// done = false significa que o usuário ainda não conectou o Discord com esse código.

const { isValidCode, firebaseGet } = require("../lib/shared");

module.exports = async (req, res) => {
  const code = String(req.query.code || "");
  res.setHeader("Cache-Control", "no-store");

  if (!isValidCode(code)) {
    return res.status(400).json({ error: "código inválido" });
  }

  try {
    const data = await firebaseGet(`discordGate/${code}`);
    res.status(200).json({
      hasRole: !!(data && data.hasRole === true),
      done: !!data,
    });
  } catch (e) {
    console.error("Falha ao ler o status:", e);
    res.status(500).json({ error: "falha ao verificar" });
  }
};
