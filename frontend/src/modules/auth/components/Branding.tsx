"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/shared/lib/i18nContext";

function ButterflyWing({ side, dir }) {
  // Flip layout based on direction to keep wing orientation correct
  const isRightSide = side === 'right';
  const shouldFlip = dir === 'rtl' ? !isRightSide : isRightSide;
  const flip = shouldFlip ? 'scaleX(-1)' : undefined;

  return (
    <svg width="220" height="280" viewBox="0 0 220 280" fill="none" style={{ transform: flip, opacity: 0.18 }}>
      <path d="M110 140 Q20 80 10 20 Q80 0 140 60 Q180 100 110 140Z" fill="#4F9DFF" />
      <path d="M110 140 Q0 160 10 240 Q80 280 140 220 Q180 180 110 140Z" fill="#F7A8C4" />
      <path d="M110 140 Q40 90 50 30 Q110 10 150 70 Q170 110 110 140Z" fill="#37B7A5" opacity="0.6" />
      <path d="M110 140 Q20 180 30 250 Q100 280 150 210 Q170 170 110 140Z" fill="#8BCF8A" opacity="0.5" />
    </svg>
  );
}

function FloatingParticle({ style }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.4)',
        ...style
      }}
      className="animate-float"
    />
  );
}

export default function Branding({ title, description, features = [], variant = "login" }) {
  const [mounted, setMounted] = useState(false);
  const { dir } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEmoji = (str) => {
    if (!str) return false;
    return /[\uD800-\uDFFF\u2600-\u27BF]/.test(str) || str.length <= 2;
  };

  const isRtl = dir === 'rtl';

  const particles = [
    { top: '15%', [isRtl ? 'right' : 'left']: '20%', animationDelay: '0s' },
    { top: '25%', [isRtl ? 'left' : 'right']: '30%', animationDelay: '1.5s' },
    { top: '60%', [isRtl ? 'right' : 'left']: '15%', animationDelay: '0.8s' },
    { top: '70%', [isRtl ? 'left' : 'right']: '20%', animationDelay: '2s' },
    { top: '40%', [isRtl ? 'right' : 'left']: '60%', animationDelay: '0.4s' },
    { top: '80%', [isRtl ? 'right' : 'left']: '45%', animationDelay: '1.2s' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center min-h-[60vh] lg:min-h-screen px-8 lg:px-12 py-16 overflow-hidden select-none bg-[linear-gradient(160deg,#4f9dff_0%,#f7a8c4_55%,#37b7a5_100%)] dark:bg-[linear-gradient(160deg,#090d16_0%,#0f172a_50%,#062e24_100%)] transition-colors duration-300">
      {/* Butterfly wing shapes (abstract) */}
      <div className="absolute top-0 start-0">
        <ButterflyWing side="left" dir={dir} />
      </div>
      <div className="absolute bottom-0 end-0 rotate-180">
        <ButterflyWing side="right" dir={dir} />
      </div>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} style={{ ...p }} />
      ))}

      {/* Subtle dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:28px_28px] opacity-60 dark:opacity-40" />

      {/* Content Box */}
      <div className="relative z-10 max-w-md w-full text-start text-white flex flex-col items-start">
        {/* Heading */}
        <h2 className="font-headline-lg text-[32px] lg:text-[34px] font-extrabold text-white mb-4 leading-[1.2] drop-shadow-sm select-none tracking-tight">
          {title}
        </h2>

        {/* Description */}
        <p className="text-base lg:text-[16px] text-white/90 dark:text-white/80 mb-7 leading-relaxed max-w-sm drop-shadow-sm">
          {description}
        </p>

        {/* Reusable premium features list */}
        <div className="flex flex-col gap-3.5 w-full mb-8">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 text-start bg-white/15 dark:bg-black/35 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 dark:border-white/5 hover:bg-white/25 dark:hover:bg-black/45 hover:border-white/30 transition-all duration-300 shadow-md group hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 dark:bg-white/5 text-white shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                {isEmoji(item.icon) ? (
                  <span className="text-2xl leading-none">{item.icon}</span>
                ) : (
                  <span className="material-symbols-outlined text-[22px] leading-none text-white dark:text-teal-400">
                    {item.icon}
                  </span>
                )}
              </div>
              <span className="text-[14px] lg:text-[15px] text-white dark:text-slate-100 font-semibold leading-snug">
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Main Butterfly Hero Illustration - moved below the content */}
        <div className="flex justify-center w-full mt-2 opacity-80 dark:opacity-70">
          <svg width="130" height="98" viewBox="0 0 160 120" fill="none" className="animate-[float_6s_ease-in-out_infinite] drop-shadow-lg">
            {/* Left upper wing */}
            <path d="M80 60 Q30 20 10 5 Q5 40 30 55 Q55 65 80 60Z" fill="rgba(255,255,255,0.35)"/>
            {/* Left lower wing */}
            <path d="M80 60 Q20 70 8 100 Q40 115 65 90 Q75 75 80 60Z" fill="rgba(255,255,255,0.25)"/>
            {/* Right upper wing */}
            <path d="M80 60 Q130 20 150 5 Q155 40 130 55 Q105 65 80 60Z" fill="rgba(255,255,255,0.35)"/>
            {/* Right lower wing */}
            <path d="M80 60 Q140 70 152 100 Q120 115 95 90 Q85 75 80 60Z" fill="rgba(255,255,255,0.25)"/>
            {/* Body */}
            <ellipse cx="80" cy="60" rx="5" ry="16" fill="rgba(255,255,255,0.6)"/>
            {/* Antennae */}
            <path d="M78 44 Q70 28 72 18" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M82 44 Q90 28 88 18" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="72" cy="17" r="3" fill="rgba(255,255,255,0.8)"/>
            <circle cx="88" cy="17" r="3" fill="rgba(255,255,255,0.8)"/>
            {/* Inner wing pattern */}
            <path d="M80 60 Q55 40 40 25" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <path d="M80 60 Q105 40 120 25" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          </svg>
        </div>

        {/* Premium Floating Leaf decorations */}
        <div className="absolute bottom-[-10px] start-[20px] text-5xl opacity-25 hover:opacity-40 transition-opacity duration-300 rotate-[-30deg] animate-[float_8s_ease-in-out_infinite] select-none">
          🍃
        </div>
        <div className="absolute top-[10px] end-[20px] text-4xl opacity-25 hover:opacity-40 transition-opacity duration-300 rotate-[20deg] animate-[float_7s_ease-in-out_infinite] select-none">
          🌿
        </div>
      </div>
    </div>
  );
}
