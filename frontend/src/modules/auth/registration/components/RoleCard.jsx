import React from "react";
import { AppCard } from "@/shared/components/ui/AppCard";
import { cn } from "@/shared/lib/utils";
export function RoleCard({ roleKey, icon, title, isSelected, onClick }) {
    return (<button type="button" onClick={onClick} aria-pressed={isSelected} className="w-full text-start cursor-pointer focus:outline-hidden">
      <AppCard hoverEffect={true} animateIn={false} className={cn("relative rounded-[16px] p-5 flex flex-col items-center gap-2 border-2 text-center transition-all shadow-2xs", isSelected
            ? "border-primary bg-primary/10 text-primary font-bold"
            : "border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 text-on-surface-variant hover:text-on-surface")}>
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
        <span className="font-['Inter'] text-sm md:text-base font-semibold">
          {title}
        </span>
        {isSelected && (<div className="absolute top-3 end-3 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xs">
            <span className="material-symbols-outlined text-[14px] font-bold">check</span>
          </div>)}
      </AppCard>
    </button>);
}
