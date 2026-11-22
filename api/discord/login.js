// GET /api/discord/login?code=XXXX
// Manda o usuário para a tela de autorização do Discord.
// O "code" do app vai no parâmetro state, e volta no callback.

const { isValidCode } = require("../../lib/shared");

module.exports = (req, res) => {
  const code = String(req.query.code || "");
  if (!isValidCode(code)) {
    return res.status(400).send("Código inválido.");
  }

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify",
    state: code,
  });

  res.redirect(302, "https://discord.com/oauth2/authorize?" + params.toString());
};
