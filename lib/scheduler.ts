import type { ScheduledTask } from "node-cron";

import cron from "node-cron";

import { appConfig } from "@/config/app";
import { FeedChecker } from "@/lib/feed-checker";

export class Scheduler {
  private task: ScheduledTask | null = null;
  private feedChecker: FeedChecker;

  constructor() {
    this.feedChecker = new FeedChecker();
  }

  start(): void {
    if (!appConfig.enableScheduler) {
      console.log("Scheduler is disabled");

      return;
    }

    if (this.task) {
      console.log("Scheduler is already running");

      return;
    }

    console.log(`Starting scheduler with cron: ${appConfig.cronSchedule}`);

    this.task = cron.schedule(appConfig.cronSchedule, async () => {
      await this.feedChecker.checkFeed();
    });

    console.log("Scheduler started successfully");

    // Run immediately on start
    this.feedChecker.checkFeed();
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log("Scheduler stopped");
    }
  }

  async runOnce(): Promise<void> {
    await this.feedChecker.checkFeedOnce();
  }
}
