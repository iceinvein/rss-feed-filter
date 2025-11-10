"use client";

import { useState } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import NextLink from "next/link";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SettingsPanel } from "@/components/settings-panel";

export const Navbar = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <HeroUINavbar maxWidth="xl" position="sticky">
        <NavbarContent justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <NextLink
              className="flex justify-start items-center gap-1"
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
