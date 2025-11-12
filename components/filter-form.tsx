"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { useState } from "react";
import type { Filter, FilterCriteria } from "@/types/feed";

interface FilterFormProps {
	onSave: (filter: Filter) => void;
	onCancel: () => void;
	initialFilter?: Filter;
}

export function FilterForm({
	onSave,
	onCancel,
	initialFilter,
}: FilterFormProps) {
	const [name, setName] = useState(initialFilter?.name || "");
	const [titleInclude, setTitleInclude] = useState("");
	const [titleExclude, setTitleExclude] = useState("");
	const [descInclude, setDescInclude] = useState("");
	const [descExclude, setDescExclude] = useState("");

	const [criteria, setCriteria] = useState<FilterCriteria>(
		initialFilter?.criteria || {
			titleIncludes: [],
			titleExcludes: [],
			descriptionIncludes: [],
			descriptionExcludes: [],
		},
	);

	const addKeyword = (
		field: keyof FilterCriteria,
		value: string,
		setter: (val: string) => void,
	) => {
		if (!value.trim()) return;

		const current = (criteria[field] as string[]) || [];

		setCriteria({
			...criteria,
			[field]: [...current, value.trim()],
		});
		setter("");
	};

	const removeKeyword = (field: keyof FilterCriteria, index: number) => {
		const current = (criteria[field] as string[]) || [];

		setCriteria({
			...criteria,
			[field]: current.filter((_, i) => i !== index),
		});
	};

	const handleSave = () => {
		if (!name.trim()) return;

		const filter: Filter = {
			id: initialFilter?.id || crypto.randomUUID(),
			name: name.trim(),
			enabled: initialFilter?.enabled ?? true,
			criteria,
		};

		onSave(filter);
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<h3 className="font-semibold text-lg">
					{initialFilter ? "Edit Filter" : "New Filter"}
				</h3>
			</CardHeader>
			<CardBody className="gap-4">
				<Input
					label="Filter Name"
					placeholder="e.g., 1080p Movies"
					value={name}
					onValueChange={setName}
				/>

				<div className="space-y-2">
					<div className="font-medium text-sm">Title Must Include</div>
					<div className="flex gap-2">
						<Input
							placeholder="Add keyword..."
							value={titleInclude}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									addKeyword("titleIncludes", titleInclude, setTitleInclude);
								}
							}}
							onValueChange={setTitleInclude}
						/>
						<Button
							color="primary"
							onPress={() =>
								addKeyword("titleIncludes", titleInclude, setTitleInclude)
							}
						>
							Add
						</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						{criteria.titleIncludes?.map((keyword, i) => (
							<Chip
								key={i}
								color="primary"
								variant="flat"
								onClose={() => removeKeyword("titleIncludes", i)}
							>
								{keyword}
							</Chip>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<div className="font-medium text-sm">Title Must Exclude</div>
					<div className="flex gap-2">
						<Input
							placeholder="Add keyword..."
							value={titleExclude}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									addKeyword("titleExcludes", titleExclude, setTitleExclude);
								}
							}}
							onValueChange={setTitleExclude}
						/>
						<Button
							color="danger"
							onPress={() =>
								addKeyword("titleExcludes", titleExclude, setTitleExclude)
							}
						>
							Add
						</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						{criteria.titleExcludes?.map((keyword, i) => (
							<Chip
								key={i}
								color="danger"
								variant="flat"
								onClose={() => removeKeyword("titleExcludes", i)}
							>
								{keyword}
							</Chip>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<div className="font-medium text-sm">Description Must Include</div>
					<div className="flex gap-2">
						<Input
							placeholder="Add keyword..."
							value={descInclude}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									addKeyword(
										"descriptionIncludes",
										descInclude,
										setDescInclude,
									);
								}
							}}
							onValueChange={setDescInclude}
						/>
						<Button
							color="primary"
							onPress={() =>
								addKeyword("descriptionIncludes", descInclude, setDescInclude)
							}
						>
							Add
						</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						{criteria.descriptionIncludes?.map((keyword, i) => (
							<Chip
								key={i}
								color="primary"
								variant="flat"
								onClose={() => removeKeyword("descriptionIncludes", i)}
							>
								{keyword}
							</Chip>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<div className="font-medium text-sm">Description Must Exclude</div>
					<div className="flex gap-2">
						<Input
							placeholder="Add keyword..."
							value={descExclude}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									addKeyword(
										"descriptionExcludes",
										descExclude,
										setDescExclude,
									);
								}
							}}
							onValueChange={setDescExclude}
						/>
						<Button
							color="danger"
							onPress={() =>
								addKeyword("descriptionExcludes", descExclude, setDescExclude)
							}
						>
							Add
						</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						{criteria.descriptionExcludes?.map((keyword, i) => (
							<Chip
								key={i}
								color="danger"
								variant="flat"
								onClose={() => removeKeyword("descriptionExcludes", i)}
							>
								{keyword}
							</Chip>
						))}
					</div>
				</div>

				<div className="flex justify-end gap-2">
					<Button variant="flat" onPress={onCancel}>
						Cancel
					</Button>
					<Button color="primary" onPress={handleSave}>
						Save Filter
					</Button>
				</div>
			</CardBody>
		</Card>
	);
}
