import { readFile } from "fs/promises";
import { serve } from "bun";

const PORT = Number(process.env.MOCK_PORT ?? 4001);

serve({
  port: PORT,
  async fetch(req) {
    const body = await readFile(
      "./tests/fixtures/upptime/summary.json",
      "utf-8",
    );
    return new Response(body, {
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`Mock server running at http://localhost:${PORT}`);
