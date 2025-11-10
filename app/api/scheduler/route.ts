import { NextResponse } from "next/server";

import { Scheduler } from "@/lib/scheduler";

// Global scheduler instance
let scheduler: Scheduler | null = null;

function getScheduler(): Scheduler {
  if (!scheduler) {
    scheduler = new Scheduler();
  }

  return scheduler;
}

export async function GET() {
  try {
    return NextResponse.json({
      status: "Scheduler API is available",
      endpoints: {
        start: "POST /api/scheduler with action: start",
        stop: "POST /api/scheduler with action: stop",
        runOnce: "POST /api/scheduler with action: runOnce",
      },
    });
  } catch (error) {
    console.error("Error in scheduler API:", error);

    return NextResponse.json(
      { error: "Failed to get scheduler status" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    const schedulerInstance = getScheduler();

    switch (action) {
      case "start":
        schedulerInstance.start();

        return NextResponse.json({
          success: true,
          message: "Scheduler started",
        });

      case "stop":
        schedulerInstance.stop();

        return NextResponse.json({
          success: true,
          message: "Scheduler stopped",
        });

      case "runOnce":
        await schedulerInstance.runOnce();

        return NextResponse.json({
          success: true,
          message: "Feed check completed",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: start, stop, or runOnce" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error managing scheduler:", error);

    return NextResponse.json(
      { error: "Failed to manage scheduler" },
      { status: 500 },
    );
  }
}
