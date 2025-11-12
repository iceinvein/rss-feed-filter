"use client";

import { Button } from "@heroui/button";
import {
	Navbar as HeroUINavbar,
	NavbarBrand,
	NavbarContent,
} from "@heroui/navbar";
import NextLink from "next/link";
import { useState } from "react";
import { SettingsPanel } from "@/components/settings-panel";
import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/config/site";

export const Navbar = () => {
	const [showSettings, setShowSettings] = useState(false);

	return (
		<>
			<HeroUINavbar maxWidth="xl" position="sticky">
				<NavbarContent justify="start">
					<NavbarBrand as="li" className="max-w-fit gap-3">
						<NextLink
							className="flex items-center justify-start gap-1"
							href="/"
						>
							<p className="font-bold text-inherit">{siteConfig.name}</p>
						</NextLink>
					</NavbarBrand>
				</NavbarContent>

				<NavbarContent justify="end">
					<Button
						size="sm"
						variant="flat"
						onPress={() => setShowSettings(true)}
					>
						Settings
					</Button>
					<ThemeSwitch />
				</NavbarContent>
			</HeroUINavbar>

			<SettingsPanel
				isOpen={showSettings}
				onClose={() => setShowSettings(false)}
			/>
		</>
	);
};
