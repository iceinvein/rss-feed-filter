export interface AppSettings {
  feedUrl: string;
  cronSchedule: string;
  discordWebhookUrl: string;
  enableNotifications: boolean;
  enableScheduler: boolean;
}

export const defaultSettings: AppSettings = {
  feedUrl: "https://hdencode.org/feed/",
  cronSchedule: "*/5 * * * *",
  discordWebhookUrl: "",
  enableNotifications: true,
  enableScheduler: true,
};
