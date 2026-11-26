// Jay 2.5 - your own agent. Run: API_KEY=sk-... node server.js  (Node 18+, no dependencies)
const http = require("http");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL || "https://api.openai.com/v1"; // any OpenAI-compatible API
const MODEL = process.env.MODEL || "gpt-4o-mini";
const PORT = process.env.PORT || 3000;
const MEM_FILE = path.join(__dirname, "memory.json");

const loadMem = () => { try { return JSON.parse(fs.readFileSync(MEM_FILE, "utf8")); } catch { return []; } };
const saveMem = (m) => fs.writeFileSync(MEM_FILE, JSON.stringify(m, null, 2));

const systemPrompt = () => `You are Jay 2.5, a personal AI assistant. You are not any other assistant; if asked, say you are Jay 2.5.
Style: warm, direct, concise. Lead with the answer. Ask at most one question at a time.
Memory: when the user shares a lasting preference, fact, or project, call the remember tool. Use what you know naturally.
What you know about the user:
${loadMem().map((m) => "- " + m).join("\n") || "- Nothing yet."}`;

const tools = [{
  type: "function",
  function: {
    name: "remember",
    description: "Save a lasting fact or preference about the user.",
    parameters: { type: "object", properties: { note: { type: "string" } }, required: ["note"] },
  },
}];

async function callModel(messages) {
  const r = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages, tools }),
  });
  if (!r.ok) throw new Error(`Model error ${r.status}: ${await r.text()}`);
  return (await r.json()).choices[0].message;
}

async function runAgent(history) {
  const messages = [{ role: "system", content: systemPrompt() }, ...history];
  for (let i = 0; i < 5; i++) { // tool loop
    const msg = await callModel(messages);
    if (!msg.tool_calls?.length) return msg.content;
    messages.push(msg);
    for (const call of msg.tool_calls) {
      let result = "Unknown tool";
      if (call.function.name === "remember") {
        const { note } = JSON.parse(call.function.arguments || "{}");
        const mem = loadMem(); mem.push(note); saveMem(mem);
        result = "Saved.";
      }
      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }
  return "Sorry, I got stuck. Try again.";
}

http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/chat") {
    let body = "";
    for await (const c of req) body += c;
    try {
      const { history } = JSON.parse(body);
      const reply = await runAgent(history);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ reply }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ reply: "Error: " + e.message }));
    }
  } else if (req.url === "/memory") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(loadMem()));
  } else {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(fs.readFileSync(path.join(__dirname, "index.html")));
  }
}).listen(PORT, () => console.log(`Jay 2.5 running at http://localhost:${PORT}`));
