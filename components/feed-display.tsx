"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Search } from "lucide-react";
import type { FeedItem } from "@/types/feed";

interface FeedDisplayProps {
	items: FeedItem[];
	totalItems: number;
	lastUpdated: string | null;
}

export function FeedDisplay({
	items,
	totalItems,
	lastUpdated,
}: FeedDisplayProps) {
	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);

			return date.toLocaleString();
		} catch {
			return dateString;
		}
	};

	const stripHtml = (html: string) => {
		return html.replace(/<[^>]*>/g, "");
	};

	return (
		<Card className="h-full">
			<CardHeader className="flex flex-col gap-3 pb-4">
				<div className="flex w-full items-center justify-between">
					<h2 className="font-bold text-2xl">Matched Feed Items</h2>
					<Chip
						color={items.length > 0 ? "success" : "default"}
						size="lg"
						variant="flat"
					>
						{items.length} / {totalItems}
					</Chip>
				</div>
				{lastUpdated && (
					<div className="flex w-full items-center gap-2 text-default-500 text-sm">
						<span className="font-medium">Last updated:</span>
						<span>{formatDate(lastUpdated)}</span>
					</div>
				)}
			</CardHeader>

			<CardBody className="max-h-[calc(100vh-300px)] gap-3 overflow-y-auto">
				{items.length === 0 ? (
					<div className="py-12 text-center">
						<Search className="mx-auto mb-4 h-16 w-16 text-default-400" />
						<p className="mb-2 font-medium text-default-700 text-lg">
							No matches found
						</p>
						<p className="text-default-500 text-sm">
							Try adjusting your filter criteria or add new filters
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{items.map((item, index) => (
							<Card
								key={item.guid || index}
								className="border-l-4 border-l-primary transition-shadow hover:shadow-lg"
								shadow="sm"
							>
								<CardBody className="gap-3">
									<div className="flex items-start justify-between gap-3">
										<Link
											isExternal
											showAnchorIcon
											className="flex-1 font-semibold text-lg transition-colors hover:text-primary"
											href={item.link}
										>
											{item.title}
										</Link>
									</div>

									<div className="flex items-center gap-2 text-default-500 text-xs">
										<Chip size="sm" variant="flat">
											{formatDate(item.pubDate)}
										</Chip>
									</div>

									{item.description && (
										<p className="line-clamp-2 text-default-600 text-sm">
											{stripHtml(item.description)}
										</p>
									)}
								</CardBody>
							</Card>
						))}
					</div>
				)}
			</CardBody>
		</Card>
	);
}
