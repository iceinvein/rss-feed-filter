"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@heroui/modal";
import { Bell, CheckCircle, Radio } from "lucide-react";
import { useState } from "react";

interface OnboardingModalProps {
	isOpen: boolean;
	onComplete: () => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Form state
	const [discordWebhook, setDiscordWebhook] = useState("");
	const [feedUrl, setFeedUrl] = useState("https://hdencode.org/feed/");
	const [cronSchedule, setCronSchedule] = useState("*/5 * * * *");

	const totalSteps = 3;

	const handleNext = () => {
		setError("");
		if (step === 1 && !discordWebhook.trim()) {
			setError("Discord webhook URL is required");
			return;
		}
		if (step < totalSteps) {
			setStep(step + 1);
		}
	};

	const handleBack = () => {
		setError("");
		if (step > 1) {
			setStep(step - 1);
		}
	};

	const handleComplete = async () => {
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/onboarding", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					discordWebhookUrl: discordWebhook,
					feedUrl,
					cronSchedule,
					enableNotifications: true,
					enableScheduler: true,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save settings");
			}

			onComplete();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save settings");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			isDismissable={false}
			hideCloseButton
			size="2xl"
			backdrop="blur"
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					<h2 className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-bold text-2xl text-transparent">
						Welcome to RSS Feed Filter
					</h2>
					<p className="text-default-500 text-sm">
						Step {step} of {totalSteps}
					</p>
				</ModalHeader>

				<ModalBody>
					{/* Step 1: Discord Webhook */}
					{step === 1 && (
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-3 rounded-lg bg-primary-50 p-4 dark:bg-primary-900/10">
								<Bell className="h-10 w-10 text-primary" />
								<div>
									<h3 className="font-semibold">Discord Notifications</h3>
									<p className="text-default-600 text-sm">
										Get notified when new items match your filters
									</p>
								</div>
							</div>

							<Input
								label="Discord Webhook URL"
								placeholder="https://discord.com/api/webhooks/..."
								value={discordWebhook}
								onChange={(e) => setDiscordWebhook(e.target.value)}
								isRequired
								description="Required to receive notifications"
								errorMessage={error}
								isInvalid={!!error}
							/>

							<Card className="bg-default-50">
								<CardBody className="gap-2">
									<p className="font-semibold text-sm">
										How to get your webhook URL:
									</p>
									<ol className="list-inside list-decimal space-y-1 text-default-600 text-sm">
										<li>Open Discord and go to your server</li>
										<li>Right-click the channel → Edit Channel</li>
										<li>Go to Integrations → Webhooks</li>
										<li>
											Click &ldquo;New Webhook&rdquo; or &ldquo;Create
											Webhook&rdquo;
										</li>
										<li>Copy the webhook URL and paste it above</li>
									</ol>
								</CardBody>
							</Card>
						</div>
					)}

					{/* Step 2: RSS Feed */}
					{step === 2 && (
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-3 rounded-lg bg-success-50 p-4 dark:bg-success-900/10">
								<Radio className="h-10 w-10 text-success" />
								<div>
									<h3 className="font-semibold">RSS Feed Configuration</h3>
									<p className="text-default-600 text-sm">
										Choose which feed to monitor
									</p>
								</div>
							</div>

							<Input
								label="RSS Feed URL"
								placeholder="https://example.com/feed/"
								value={feedUrl}
								onChange={(e) => setFeedUrl(e.target.value)}
								description="The RSS feed you want to monitor"
							/>

							<Input
								label="Check Schedule (Cron)"
								placeholder="*/5 * * * *"
								value={cronSchedule}
								onChange={(e) => setCronSchedule(e.target.value)}
								description="How often to check the feed (default: every 5 minutes)"
							/>

							<Card className="bg-default-50">
								<CardBody className="gap-2">
									<p className="font-semibold text-sm">Common schedules:</p>
									<ul className="space-y-1 text-default-600 text-sm">
										<li>
											<code className="rounded bg-default-200 px-1 text-xs">
												*/5 * * * *
											</code>{" "}
											- Every 5 minutes
										</li>
										<li>
											<code className="rounded bg-default-200 px-1 text-xs">
												*/15 * * * *
											</code>{" "}
											- Every 15 minutes
										</li>
										<li>
											<code className="rounded bg-default-200 px-1 text-xs">
												0 * * * *
											</code>{" "}
											- Every hour
										</li>
									</ul>
								</CardBody>
							</Card>
						</div>
					)}

					{/* Step 3: Summary */}
					{step === 3 && (
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-3 rounded-lg bg-secondary-50 p-4 dark:bg-secondary-900/10">
								<CheckCircle className="h-10 w-10 text-secondary" />
								<div>
									<h3 className="font-semibold">Ready to Go!</h3>
									<p className="text-default-600 text-sm">
										Review your settings and start monitoring
									</p>
								</div>
							</div>

							<Card>
								<CardBody className="gap-3">
									<div>
										<p className="text-default-500 text-sm">Discord Webhook</p>
										<p className="truncate font-mono text-sm">
											{discordWebhook.substring(0, 50)}...
										</p>
									</div>
									<div>
										<p className="text-default-500 text-sm">RSS Feed</p>
										<p className="font-mono text-sm">{feedUrl}</p>
									</div>
									<div>
										<p className="text-default-500 text-sm">Check Schedule</p>
										<p className="font-mono text-sm">{cronSchedule}</p>
									</div>
								</CardBody>
							</Card>

							<Card className="bg-primary-50 dark:bg-primary-900/10">
								<CardBody>
									<p className="text-sm">
										<strong>Next steps:</strong> After setup, you can create
										filters to specify which feed items you want to be notified
										about. The scheduler will automatically check the feed and
										send Discord notifications for matching items.
									</p>
								</CardBody>
							</Card>

							{error && (
								<Card className="bg-danger-50 dark:bg-danger-900/10">
									<CardBody>
										<p className="text-danger text-sm">{error}</p>
									</CardBody>
								</Card>
							)}
						</div>
					)}
				</ModalBody>

				<ModalFooter>
					{step > 1 && (
						<Button variant="flat" onPress={handleBack} isDisabled={loading}>
							Back
						</Button>
					)}
					{step < totalSteps ? (
						<Button color="primary" onPress={handleNext}>
							Next
						</Button>
					) : (
						<Button
							color="success"
							onPress={handleComplete}
							isLoading={loading}
							className="font-semibold"
						>
							Complete Setup
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
