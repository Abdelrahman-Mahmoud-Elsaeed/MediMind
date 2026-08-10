"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { LanguageToggler } from "@/shared/components/LanguageToggler";
import { AppButton } from "@/shared/components/ui/AppButton";
import Link from "next/link";
export default function AuthHeader() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    return (<header className="flex items-center justify-between mb-8 md:mb-10">
      {/* Brand / Logo */}
      <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
        <img
          src="/images/logo.png"
          alt="MediMind Logo"
          className="h-10 w-auto object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform"
        />
        <span className="font-black text-[22px] md:text-[26px] tracking-tight">
          <span className="text-[#0047ba] dark:text-[#3b82f6]">Medi</span>
          <span className="text-[#00a396] dark:text-[#14b8a6]">Mind</span>
        </span>
      </Link>

      {/* Actions (Language & Theme Controls) */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Language Toggle Pill */}
        <LanguageToggler />

        {/* Dark Mode Toggle */}
        <AppButton type="button" variant="outline" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          <span className="material-symbols-outlined !text-[22px]">
            {mounted && resolvedTheme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </AppButton>
      </div>
    </header>);
}
