import { NextResponse } from "next/server";

import { notificationsDb } from "@/lib/db";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = Number.parseInt(searchParams.get("limit") || "100", 10);
		const offset = Number.parseInt(searchParams.get("offset") || "0", 10);
		const search = searchParams.get("search") || undefined;

		const notifications = notificationsDb.getAll(limit, offset, search);
		const total = notificationsDb.getCount(search);

		// Parse matched_filters JSON string back to array
		const formattedNotifications = notifications.map((notification) => ({
			id: notification.id,
			guid: notification.guid,
			title: notification.title,
			link: notification.link,
			description: notification.description,
			pubDate: notification.pub_date,
			matchedFilters: JSON.parse(notification.matched_filters) as string[],
			sentAt: notification.sent_at,
		}));

		return NextResponse.json({
			notifications: formattedNotifications,
			total,
			limit,
			offset,
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);

		return NextResponse.json(
			{ error: "Failed to fetch notifications" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (id) {
			// Delete individual notification
			const deleted = notificationsDb.delete(Number.parseInt(id, 10));

			return NextResponse.json({ success: true, deleted });
		} else {
			// Delete all notifications
			const deleted = notificationsDb.deleteAll();

			return NextResponse.json({
				success: true,
				deleted,
			});
		}
	} catch (error) {
		console.error("Error deleting notifications:", error);

		return NextResponse.json(
			{ error: "Failed to delete notifications" },
			{ status: 500 },
		);
	}
}
