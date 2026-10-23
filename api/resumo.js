// Vercel Function: entrega o resumo do coletor com cache na CDN da Vercel.
// Assim, mil pessoas olhando o site geram ~1 leitura no Supabase a cada 2 segundos (e não mil).
const SUPABASE_URL = "https://hvabmapxzgdadjnruycj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YWJtYXB4emdkYWRqbnJ1eWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1NDMxMzcsImV4cCI6MjEwODExOTEzN30.ax3AWhs7hX4Esfgs6NbfMJCFaV99ITcJvMq97PNljfc"; // chave pública (anon)
const ROTAS = {
  resumo: { q: "snapshot?id=eq.resumo&select=data", cache: 2 },
  exterior: { q: "snapshot?id=eq.exterior&select=data", cache: 30 },
  ranking: { q: "ranking?select=apelido,br,ufs,govs,criado&order=criado.asc&limit=5000", cache: 30 },
};
module.exports = async (req, res) => {
  const id = String((req.query && req.query.id) || "resumo");
  const rota = ROTAS[id];
  if (!rota) { res.status(404).json({ erro: "rota desconhecida" }); return; }
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${rota.q}`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY } });
    const corpo = await r.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", r.ok ? `public, max-age=0, s-maxage=${rota.cache}, stale-while-revalidate=${rota.cache * 3}` : "no-store");
    res.status(r.status).send(corpo);
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ erro: "falha ao ler o Supabase" });
  }
};
