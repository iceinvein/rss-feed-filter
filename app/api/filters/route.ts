import { NextResponse } from "next/server";

import { filtersDb } from "@/lib/db";

export async function GET() {
	try {
		const filters = filtersDb.getAll();

		return NextResponse.json({ filters });
	} catch (error) {
		console.error("Error getting filters:", error);

		return NextResponse.json(
			{ error: "Failed to get filters" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { action, filter, id, updates } = body;

		switch (action) {
			case "add":
				if (!filter) {
					return NextResponse.json(
						{ error: "Filter is required" },
						{ status: 400 },
					);
				}
				filtersDb.create({
					id: filter.id,
					name: filter.name,
					enabled: filter.enabled,
					criteria: {
						titleIncludes: filter.criteria.titleIncludes || [],
						titleExcludes: filter.criteria.titleExcludes || [],
						descriptionIncludes: filter.criteria.descriptionIncludes || [],
						descriptionExcludes: filter.criteria.descriptionExcludes || [],
					},
				});
				break;

			case "update": {
				if (!id || !updates) {
					return NextResponse.json(
						{ error: "ID and updates are required" },
						{ status: 400 },
					);
				}
				const normalizedUpdates = {
					...updates,
					criteria: updates.criteria
						? {
								titleIncludes: updates.criteria.titleIncludes || [],
								titleExcludes: updates.criteria.titleExcludes || [],
								descriptionIncludes: updates.criteria.descriptionIncludes || [],
								descriptionExcludes: updates.criteria.descriptionExcludes || [],
							}
						: undefined,
				};

				filtersDb.update(id, normalizedUpdates);
				break;
			}

			case "delete":
				if (!id) {
					return NextResponse.json(
						{ error: "ID is required" },
						{ status: 400 },
					);
				}
				filtersDb.delete(id);
				break;

			case "toggle": {
				if (!id) {
					return NextResponse.json(
						{ error: "ID is required" },
						{ status: 400 },
					);
				}
				const existingFilter = filtersDb.get(id);

				if (existingFilter) {
					filtersDb.update(id, {
						...existingFilter,
						enabled: !existingFilter.enabled,
					});
				}
				break;
			}

			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}

		const filters = filtersDb.getAll();

		return NextResponse.json({ success: true, filters });
	} catch (error) {
		console.error("Error managing filters:", error);

		return NextResponse.json(
			{ error: "Failed to manage filters" },
			{ status: 500 },
		);
	}
}
