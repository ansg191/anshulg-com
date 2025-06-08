import { KUMA_API_KEY, KUMA_URL } from "astro:env/server";
import { ServiceStatus } from "./index.ts";

const STATUS_MAP: Record<string, ServiceStatus> = {
  "0": ServiceStatus.DOWN,
  "1": ServiceStatus.UP,
  "2": ServiceStatus.PENDING,
  "3": ServiceStatus.MAINTENANCE,
};

async function kuma_status(name: string): Promise<ServiceStatus> {
  if (!KUMA_URL || !KUMA_API_KEY) {
    console.warn(
      "Uptime Kuma URL or API Key is not set. Skipping Uptime component.",
    );
    return ServiceStatus.UNKNOWN;
  }

  // Fetch the metrics from Uptime Kuma
  const response = await fetch(`${KUMA_URL}/metrics`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`:${KUMA_API_KEY}`).toString("base64")}`,
    },
  });

  if (!response.ok) {
    console.error(
      `Failed to fetch metrics from Uptime Kuma: ${response.statusText}`,
    );
    return ServiceStatus.UNKNOWN;
  }

  // Parse the metrics to find the status of the monitor with the given name
  const metrics = await response.text();
  const statusStr = metrics
    .split("\n")
    .filter((line) => line.startsWith("monitor_status"))
    .map((l) => {
      return {
        status: l.substring(l.length - 1),
        name: l
          .substring("monitor_status{".length, l.length - 3)
          .split(",")
          .map((kv) => kv.split("=", 2))
          .filter((kv) => kv[0] === "monitor_name")
          .map((kv) => kv[1]?.replace(/"/g, ""))[0],
      };
    })
    .filter((m) => m.name === name)
    .map((m) => m.status)[0];

  if (statusStr == null) {
    console.warn(
      `Monitor with name "${name}" not found in Uptime Kuma metrics.`,
    );
    return ServiceStatus.UNKNOWN;
  }

  return STATUS_MAP[statusStr] ?? ServiceStatus.UNKNOWN;
}

export default kuma_status;
