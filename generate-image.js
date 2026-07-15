module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-App-Secret");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const providedSecret = req.headers["x-app-secret"];
  if (!process.env.APP_SECRET || providedSecret !== process.env.APP_SECRET) {
    return res.status(401).json({ error: "Unauthorized. Cek APP_SECRET kamu." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY belum di-set di server." });
  }

  const { prompt, size } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt wajib diisi." });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt.slice(0, 900),
        size: size || "1024x1024",
        n: 1,
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      return res.status(openaiRes.status).json({
        error: (data && data.error && data.error.message) || "OpenAI menolak permintaan ini.",
      });
    }

    const item = data && data.data && data.data[0];
    const b64 = item && item.b64_json;
    const url = item && item.url;

    if (!b64 && !url) {
      return res.status(502).json({ error: "OpenAI tidak mengembalikan gambar." });
    }

    return res.status(200).json({ b64: b64 || null, url: url || null });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Terjadi kesalahan di server." });
  }
};
