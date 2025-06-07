import { readFile } from "fs/promises";
import { serve } from "bun";

const PORT = Number(process.env.MOCK_PORT ?? 4000);

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/metrics") {
      const body = await readFile("./tests/fixtures/uptime/metrics", "utf-8");
      return new Response(body, {
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Mock server running at http://localhost:${PORT}`);
