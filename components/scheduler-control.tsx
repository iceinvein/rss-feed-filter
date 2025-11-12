"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useState } from "react";

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
			<CardHeader className="flex-col items-start gap-3 pb-3">
				<div className="flex w-full items-center justify-between">
					<h3 className="font-semibold text-lg">Scheduler</h3>
					<Chip
						color="success"
						size="sm"
						startContent={
							<div className="h-2 w-2 animate-pulse rounded-full bg-success" />
						}
						variant="flat"
					>
						Running
					</Chip>
				</div>
				<p className="text-default-600 text-xs">
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
						className={`rounded-lg p-2 text-xs ${
							messageType === "success"
								? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-300"
								: "bg-danger-100 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300"
						}`}
					>
						{message}
					</div>
				)}
			</CardBody>
		</Card>
	);
}
