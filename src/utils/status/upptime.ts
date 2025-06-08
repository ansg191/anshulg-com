import { UPPTIME_URL } from "astro:env/server";
import { z, ZodType } from "zod/v4";
import { ServiceStatus } from "./index.ts";

/**
 * Represents the status of a site monitored by Upptime.
 * Copied from: https://github.com/upptime/uptime-monitor/blob/6996123d80fe861b66994b257d4e0eb99d9d7db6/src/interfaces.ts#L112-L137
 */
interface SiteStatus {
  /** Name of site */
  name: string;
  /** Short slug of the site */
  slug: string;
  /** Full URL of the site */
  url: string;
  /** Favicon URL of the site */
  icon: string;
  /** Current status, up or down */
  status: "up" | "down" | "degraded";
  /** Current response time (ms) */
  time: number;
  timeDay: number;
  timeWeek: number;
  timeMonth: number;
  timeYear: number;
  /** Total uptime percentage */
  uptime: string;
  uptimeDay: string;
  uptimeWeek: string;
  uptimeMonth: string;
  uptimeYear: string;
  /** Summary for downtimes */
  dailyMinutesDown: Record<string, number>;
}

const siteStatusScheme = z.object({
  name: z.string(),
  slug: z.string(),
  url: z.url(),
  icon: z.url(),
  status: z.enum(["up", "down", "degraded"]),
  time: z.number().int(),
  timeDay: z.number().int(),
  timeWeek: z.number().int(),
  timeMonth: z.number().int(),
  timeYear: z.number().int(),
  uptime: z.string(),
  uptimeDay: z.string(),
  uptimeWeek: z.string(),
  uptimeMonth: z.string(),
  uptimeYear: z.string(),
  dailyMinutesDown: z.record(z.string(), z.number()),
}) satisfies ZodType<SiteStatus>;

const resScheme = z.array(siteStatusScheme);

async function upptime_status(name: string): Promise<ServiceStatus> {
  if (!UPPTIME_URL) {
    console.warn("Upptime URL is not set. Skipping Uptime component.");
    return ServiceStatus.UNKNOWN;
  }

  // Fetch the status from Upptime
  const response = await fetch(UPPTIME_URL);
  if (!response.ok) {
    console.error(
      `Failed to fetch status from Upptime: ${response.statusText}`,
    );
    return ServiceStatus.UNKNOWN;
  }

  // Parse the JSON response to find the status of the monitor with the given name
  const data: SiteStatus[] = resScheme.parse(await response.json());
  const site = data.find((site) => site.name === name);
  if (!site) {
    console.warn(`No Upptime monitor found for site: ${name}`);
    return ServiceStatus.UNKNOWN;
  }

  switch (site.status) {
    case "up":
      return ServiceStatus.UP;
    case "down":
      return ServiceStatus.DOWN;
    case "degraded":
      return ServiceStatus.DOWN;
  }
}
export default upptime_status;
