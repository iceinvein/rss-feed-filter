import clsx from "clsx";
import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";

import { Navbar } from "@/components/navbar";
import { fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { initScheduler } from "@/lib/init-scheduler";
import { Providers } from "./providers";

// Initialize scheduler on server startup
if (typeof window === "undefined") {
	initScheduler();
}

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s - ${siteConfig.name}`,
	},
	description: siteConfig.description,
	icons: {
		icon: "/favicon.ico",
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html suppressHydrationWarning lang="en">
			<head />
			<body
				className={clsx(
					"min-h-screen bg-background font-sans text-foreground antialiased",
					fontSans.variable,
				)}
			>
				<Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
					<div className="relative flex h-screen flex-col">
						<Navbar />
						<main className="container mx-auto max-w-7xl flex-grow px-6 pt-16">
							{children}
						</main>
						<footer className="flex w-full items-center justify-center py-3">
							<span className="text-default-600 text-sm">
								© {new Date().getFullYear()} RSS Feed Filter
							</span>
						</footer>
					</div>
				</Providers>
			</body>
		</html>
	);
}
