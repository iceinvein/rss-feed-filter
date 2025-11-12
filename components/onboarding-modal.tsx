"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Bell, Radio, CheckCircle } from "lucide-react";
import { Card, CardBody } from "@heroui/card";

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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to RSS Feed Filter
          </h2>
          <p className="text-sm text-default-500">
            Step {step} of {totalSteps}
          </p>
        </ModalHeader>

        <ModalBody>
          {/* Step 1: Discord Webhook */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-lg">
                <Bell className="w-10 h-10 text-primary" />
                <div>
                  <h3 className="font-semibold">Discord Notifications</h3>
                  <p className="text-sm text-default-600">
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
                  <p className="text-sm font-semibold">How to get your webhook URL:</p>
                  <ol className="text-sm text-default-600 list-decimal list-inside space-y-1">
                    <li>Open Discord and go to your server</li>
                    <li>Right-click the channel → Edit Channel</li>
                    <li>Go to Integrations → Webhooks</li>
                    <li>Click &ldquo;New Webhook&rdquo; or &ldquo;Create Webhook&rdquo;</li>
                    <li>Copy the webhook URL and paste it above</li>
                  </ol>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Step 2: RSS Feed */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 bg-success-50 dark:bg-success-900/10 rounded-lg">
                <Radio className="w-10 h-10 text-success" />
                <div>
                  <h3 className="font-semibold">RSS Feed Configuration</h3>
                  <p className="text-sm text-default-600">
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
                  <p className="text-sm font-semibold">Common schedules:</p>
                  <ul className="text-sm text-default-600 space-y-1">
                    <li>
                      <code className="text-xs bg-default-200 px-1 rounded">
                        */5 * * * *
                      </code>{" "}
                      - Every 5 minutes
                    </li>
                    <li>
                      <code className="text-xs bg-default-200 px-1 rounded">
                        */15 * * * *
                      </code>{" "}
                      - Every 15 minutes
                    </li>
                    <li>
                      <code className="text-xs bg-default-200 px-1 rounded">
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
              <div className="flex items-center gap-3 p-4 bg-secondary-50 dark:bg-secondary-900/10 rounded-lg">
                <CheckCircle className="w-10 h-10 text-secondary" />
                <div>
                  <h3 className="font-semibold">Ready to Go!</h3>
                  <p className="text-sm text-default-600">
                    Review your settings and start monitoring
                  </p>
                </div>
              </div>

              <Card>
                <CardBody className="gap-3">
                  <div>
                    <p className="text-sm text-default-500">Discord Webhook</p>
                    <p className="text-sm font-mono truncate">
                      {discordWebhook.substring(0, 50)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">RSS Feed</p>
                    <p className="text-sm font-mono">{feedUrl}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Check Schedule</p>
                    <p className="text-sm font-mono">{cronSchedule}</p>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-primary-50 dark:bg-primary-900/10">
                <CardBody>
                  <p className="text-sm">
                    <strong>Next steps:</strong> After setup, you can create filters to
                    specify which feed items you want to be notified about. The scheduler
                    will automatically check the feed and send Discord notifications for
                    matching items.
                  </p>
                </CardBody>
              </Card>

              {error && (
                <Card className="bg-danger-50 dark:bg-danger-900/10">
                  <CardBody>
                    <p className="text-sm text-danger">{error}</p>
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

