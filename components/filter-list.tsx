"use client";

import { Button } from "@heroui/button";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Switch } from "@heroui/switch";
import { Target } from "lucide-react";
import type { Filter } from "@/types/feed";

interface FilterListProps {
	filters: Filter[];
	onToggle: (id: string) => void;
	onEdit: (filter: Filter) => void;
	onDelete: (id: string) => void;
	onAdd: () => void;
}

export function FilterList({
	filters,
	onToggle,
	onEdit,
	onDelete,
	onAdd,
}: FilterListProps) {
	const enabledCount = filters.filter((f) => f.enabled).length;

	return (
		<Card>
			<CardHeader className="flex flex-col gap-3 pb-4">
				<div className="flex w-full items-center justify-between">
					<h2 className="font-bold text-xl">Filters</h2>
					<Chip color="primary" size="sm" variant="flat">
						{enabledCount} / {filters.length} active
					</Chip>
				</div>
				<Button
					className="w-full"
					color="primary"
					size="lg"
					variant="shadow"
					onPress={onAdd}
				>
					+ Add New Filter
				</Button>
			</CardHeader>

			<CardBody className="max-h-[600px] gap-3 overflow-y-auto">
				{filters.length === 0 ? (
					<div className="py-8 text-center">
						<Target className="mx-auto mb-3 h-12 w-12 text-default-400" />
						<p className="text-default-500 text-sm">
							No filters yet. Create one to start filtering.
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{filters.map((filter) => (
							<Card
								key={filter.id}
								className={`border-l-4 ${filter.enabled ? "border-l-success" : "border-l-default-300"}`}
								shadow="sm"
							>
								<CardHeader className="flex-col items-start gap-3 pb-3">
									<div className="flex w-full items-center justify-between">
										<div className="flex items-center gap-3">
											<Switch
												color="success"
												isSelected={filter.enabled}
												size="sm"
												onValueChange={() => onToggle(filter.id)}
											/>
											<h3 className="font-semibold text-base">{filter.name}</h3>
										</div>
										<Chip
											color={filter.enabled ? "success" : "default"}
											size="sm"
											variant="dot"
										>
											{filter.enabled ? "Active" : "Inactive"}
										</Chip>
									</div>
								</CardHeader>

								<CardBody className="gap-3 pt-0">
									<div className="space-y-2 text-xs">
										{filter.criteria.titleIncludes &&
											filter.criteria.titleIncludes.length > 0 && (
												<div>
													<span className="font-medium text-default-700">
														Title includes:{" "}
													</span>
													<div className="mt-1 flex flex-wrap gap-1">
														{filter.criteria.titleIncludes.map((keyword) => (
															<Chip
																key={keyword}
																color="primary"
																size="sm"
																variant="flat"
															>
																{keyword}
															</Chip>
														))}
													</div>
												</div>
											)}
										{filter.criteria.titleExcludes &&
											filter.criteria.titleExcludes.length > 0 && (
												<div>
													<span className="font-medium text-default-700">
														Title excludes:{" "}
													</span>
													<div className="mt-1 flex flex-wrap gap-1">
														{filter.criteria.titleExcludes.map((keyword) => (
															<Chip
																key={keyword}
																color="danger"
																size="sm"
																variant="flat"
															>
																{keyword}
															</Chip>
														))}
													</div>
												</div>
											)}
										{filter.criteria.descriptionIncludes &&
											filter.criteria.descriptionIncludes.length > 0 && (
												<div>
													<span className="font-medium text-default-700">
														Description includes:{" "}
													</span>
													<div className="mt-1 flex flex-wrap gap-1">
														{filter.criteria.descriptionIncludes.map(
															(keyword) => (
																<Chip
																	key={keyword}
																	color="primary"
																	size="sm"
																	variant="flat"
																>
																	{keyword}
																</Chip>
															),
														)}
													</div>
												</div>
											)}
										{filter.criteria.descriptionExcludes &&
											filter.criteria.descriptionExcludes.length > 0 && (
												<div>
													<span className="font-medium text-default-700">
														Description excludes:{" "}
													</span>
													<div className="mt-1 flex flex-wrap gap-1">
														{filter.criteria.descriptionExcludes.map(
															(keyword) => (
																<Chip
																	key={keyword}
																	color="danger"
																	size="sm"
																	variant="flat"
																>
																	{keyword}
																</Chip>
															),
														)}
													</div>
												</div>
											)}
									</div>

									<div className="flex gap-2 pt-2">
										<Button
											className="flex-1"
											size="sm"
											variant="flat"
											onPress={() => onEdit(filter)}
										>
											Edit
										</Button>
										<Button
											className="flex-1"
											color="danger"
											size="sm"
											variant="flat"
											onPress={() => onDelete(filter.id)}
										>
											Delete
										</Button>
									</div>
								</CardBody>
							</Card>
						))}
					</div>
				)}
			</CardBody>
		</Card>
	);
}
