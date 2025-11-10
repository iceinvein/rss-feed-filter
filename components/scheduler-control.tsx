"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";

export function SchedulerControl() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const handleAction = async (action: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setMessageType("success");
      } else {
        setMessage(data.error || "Action failed");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error managing scheduler:", error);
      setMessage("Failed to perform action");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/10 dark:to-success-800/10">
      <CardHeader className="flex-col gap-3 items-start pb-3">
        <div className="flex justify-between items-center w-full">
          <h3 className="text-lg font-semibold">Scheduler</h3>
          <Chip
            color="success"
            size="sm"
            startContent={
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            }
            variant="flat"
          >
            Running
          </Chip>
        </div>
        <p className="text-xs text-default-600">
          Automatically checks feed every 5 minutes and sends Discord
          notifications
        </p>
      </CardHeader>

      <CardBody className="gap-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <Button
            color="primary"
            isLoading={loading}
            size="sm"
            variant="shadow"
            onPress={() => handleAction("runOnce")}
          >
            Check Now
          </Button>
          <Button
            isLoading={loading}
            size="sm"
            variant="bordered"
            onPress={() => handleAction("start")}
          >
            Restart
          </Button>
        </div>

        {message && (
          <div
            className={`text-xs p-2 rounded-lg ${
              messageType === "success"
                ? "bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300"
                : "bg-danger-100 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300"
            }`}
          >
            {message}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
