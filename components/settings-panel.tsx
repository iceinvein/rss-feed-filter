"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@heroui/modal";
import { Switch } from "@heroui/switch";
import { useCallback, useEffect, useState } from "react";
import type { AppSettings } from "@/types/settings";

interface SettingsPanelProps {
	isOpen: boolean;
	onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const loadSettings = useCallback(async () => {
		setLoading(true);
		setMessage(null);

		try {
			const response = await fetch("/api/settings");
			const data = await response.json();

			if (data.settings) {
				setSettings(data.settings);
			}
		} catch (error) {
			console.error("Error loading settings:", error);
			setMessage("Failed to load settings");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (isOpen) {
			loadSettings();
		}
	}, [isOpen, loadSettings]);

	const handleSave = async () => {
		if (!settings) return;

		setSaving(true);
		setMessage(null);

		try {
			const response = await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ updates: settings }),
			});

			const data = await response.json();

			if (data.success) {
				setMessage(
					"Settings saved successfully! Restart may be required for some changes.",
				);
				setTimeout(() => {
					onClose();
				}, 2000);
			} else {
				setMessage(data.error || "Failed to save settings");
			}
		} catch (error) {
			console.error("Error saving settings:", error);
			setMessage("Failed to save settings");
		} finally {
			setSaving(false);
		}
	};

	const updateSetting = <K extends keyof AppSettings>(
		key: K,
		value: AppSettings[K],
	) => {
		if (!settings) return;
		setSettings({ ...settings, [key]: value });
	};

	if (!settings) {
		return (
			<Modal isOpen={isOpen} size="2xl" onClose={onClose}>
				<ModalContent>
					<ModalHeader>Settings</ModalHeader>
					<ModalBody>
						<div className="py-8 text-center">
							{loading ? "Loading settings..." : "No settings available"}
						</div>
					</ModalBody>
				</ModalContent>
			</Modal>
		);
	}

	return (
		<Modal isOpen={isOpen} size="2xl" onClose={onClose}>
			<ModalContent>
				<ModalHeader>Application Settings</ModalHeader>
				<ModalBody className="gap-4">
					<div className="space-y-4">
						<div>
							<Input
								label="RSS Feed URL"
								placeholder="https://example.com/feed/"
								value={settings.feedUrl}
								onChange={(e) => updateSetting("feedUrl", e.target.value)}
							/>
							<p className="mt-1 text-default-500 text-xs">
								The RSS feed to monitor for new items
							</p>
						</div>

						<div>
							<Input
								label="Cron Schedule"
								placeholder="*/5 * * * *"
								value={settings.cronSchedule}
								onChange={(e) => updateSetting("cronSchedule", e.target.value)}
							/>
							<p className="mt-1 text-default-500 text-xs">
								How often to check the feed (cron syntax). Examples: */5 * * * *
								(every 5 min), 0 * * * * (hourly)
							</p>
						</div>

						<div>
							<Input
								label="Discord Webhook URL"
								placeholder="https://discord.com/api/webhooks/..."
								type="password"
								value={settings.discordWebhookUrl}
								onChange={(e) =>
									updateSetting("discordWebhookUrl", e.target.value)
								}
							/>
							<p className="mt-1 text-default-500 text-xs">
								Discord webhook URL for notifications
							</p>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-sm">Enable Notifications</p>
								<p className="text-default-500 text-xs">
									Send Discord messages when items match filters
								</p>
							</div>
							<Switch
								isSelected={settings.enableNotifications}
								onValueChange={(value) =>
									updateSetting("enableNotifications", value)
								}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-sm">Enable Scheduler</p>
								<p className="text-default-500 text-xs">
									Automatically check feed on schedule
								</p>
							</div>
							<Switch
								isSelected={settings.enableScheduler}
								onValueChange={(value) =>
									updateSetting("enableScheduler", value)
								}
							/>
						</div>
					</div>

					{message && (
						<div
							className={`rounded p-3 text-sm ${
								message.includes("success")
									? "bg-success-50 text-success-700"
									: "bg-danger-50 text-danger-700"
							}`}
						>
							{message}
						</div>
					)}
				</ModalBody>
				<ModalFooter>
					<Button variant="flat" onPress={onClose}>
						Cancel
					</Button>
					<Button color="primary" isLoading={saving} onPress={handleSave}>
						Save Settings
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
