// GET /api/discord/callback
// Discord volta para cá depois que o usuário autoriza.
// 1) troca o código pelo token do usuário
// 2) descobre o ID do usuário
// 3) confere o cargo no servidor, usando o bot
// 4) grava o resultado com o "code" do app, e volta para o site

const { isValidCode, firebaseSet } = require("../../lib/shared");

module.exports = async (req, res) => {
  const code = String(req.query.code || "");
  const state = String(req.query.state || "");

  if (req.query.error || !code || !isValidCode(state)) {
    return res.redirect(302, isValidCode(state) ? `/?code=${state}&erro=1` : "/");
  }

  try {
    // 1) troca o código por um token de acesso
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });
    if (!tokenRes.ok) throw new Error("token HTTP " + tokenRes.status);
    const token = await tokenRes.json();

    // 2) quem é o usuário
    const meRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: "Bearer " + token.access_token },
    });
    if (!meRes.ok) throw new Error("users/@me HTTP " + meRes.status);
    const me = await meRes.json();

    // 3) o usuário tem o cargo no servidor?
    const memberRes = await fetch(
      `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${me.id}`,
      { headers: { Authorization: "Bot " + process.env.DISCORD_BOT_TOKEN } }
    );
    let hasRole = false;
    if (memberRes.ok) {
      const member = await memberRes.json();
      hasRole = Array.isArray(member.roles) && member.roles.includes(process.env.DISCORD_ROLE_ID);
    } else if (memberRes.status !== 404) {
      // 404 = o usuário nem está no servidor, então hasRole continua false
      throw new Error("guild member HTTP " + memberRes.status);
    }

    // 4) guarda o resultado para o app ler pelo código
    await firebaseSet(`discordGate/${state}`, { hasRole, userId: me.id, at: Date.now() });

    res.redirect(302, `/?code=${state}`);
  } catch (e) {
    console.error("Falha no callback do Discord:", e);
    res.redirect(302, `/?code=${state}&erro=1`);
  }
};
