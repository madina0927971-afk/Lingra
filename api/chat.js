// Serverless-функция Vercel: /api/chat
// Держит ANTHROPIC_API_KEY на сервере — ключ никогда не попадает в браузер.
// Настройка: в Vercel Dashboard → Project → Settings → Environment Variables
// добавить ANTHROPIC_API_KEY = sk-ant-...

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY не настроен на сервере" });
    return;
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Нужно передать messages (массив)" });
    return;
  }

  const systemPrompt =
    "You are a friendly, patient English tutor for Russian- and Uzbek-speaking learners (levels A1 to C1). " +
    "Keep replies short (2-4 sentences). Gently correct mistakes, explain briefly in Russian if the learner seems confused, " +
    "and always end with a follow-up question in English to keep the conversation going.";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: errText });
      return;
    }

    const data = await response.json();
    const text = data.content
      ?.map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    res.status(200).json({ text: text || "..." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
