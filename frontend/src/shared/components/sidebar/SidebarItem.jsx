import React from 'react';
import Link from 'next/link';
export const SidebarItem = ({ icon: Icon, label, href = '#', active = false, badge, onClick, }) => {
    const content = (<div onClick={onClick} className={`group flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 ${active
            ? 'bg-primary-container/20 text-primary font-semibold shadow-2xs'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'}`}>
      <div className="flex items-center gap-3.5">
        <Icon className={`w-5 h-5 transition-colors duration-200 ${active
            ? 'text-primary'
            : 'text-on-surface-variant/70 group-hover:text-on-surface'}`}/>
        <span className="text-sm tracking-tight">{label}</span>
      </div>
      {badge !== undefined && (<span className={`px-2 py-0.5 text-xs font-bold rounded-full ${active
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant'}`}>
          {badge}
        </span>)}
    </div>);
    if (href && href !== '#') {
        return <Link href={href}>{content}</Link>;
    }
    return content;
};
