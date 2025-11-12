import { Scheduler } from "@/lib/scheduler";

let scheduler: Scheduler | null = null;

export function initScheduler(): void {
	if (scheduler) {
		console.log("Scheduler already initialized");

		return;
	}

	scheduler = new Scheduler();
	scheduler.start();

	console.log("Scheduler initialized and started");
}

export function getScheduler(): Scheduler | null {
	return scheduler;
}
