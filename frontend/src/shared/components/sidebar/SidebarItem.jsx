import React from 'react';
import Link from 'next/link';
export const SidebarItem = ({ icon: Icon, label, href = '#', active = false, badge, onClick, isSidebarSlim = false }) => {
    const content = (<div
        onClick={onClick}
        title={isSidebarSlim ? label : undefined}
        className={`group flex items-center ${isSidebarSlim ? 'justify-center px-0 w-12 h-12 mx-auto' : 'justify-between px-4 py-3 w-full'} rounded-2xl cursor-pointer transition-all duration-300 ease-in-out ${active
            ? 'bg-primary-container/20 text-primary font-semibold shadow-2xs'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'}`}
    >
      <div className={`flex items-center ${isSidebarSlim ? 'justify-center' : 'gap-3.5'} overflow-hidden transition-all duration-300`}>
        <Icon className={`w-5 h-5 shrink-0 transition-colors duration-200 ${active
            ? 'text-primary'
            : 'text-on-surface-variant/70 group-hover:text-on-surface'}`}/>
        {!isSidebarSlim && <span className="text-sm tracking-tight whitespace-nowrap transition-all duration-300 ease-in-out">{label}</span>}
      </div>
      {!isSidebarSlim && badge !== undefined && (<span className={`px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-300 ${active
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant'}`}>
          {badge}
        </span>)}
    </div>);
    if (href && href !== '#') {
        return <Link href={href} title={isSidebarSlim ? label : undefined}>{content}</Link>;
    }
    return content;
};
