import React from 'react';

export default function ContactInfoItem({ icon: Icon, title, content, link }) {
  const ContentWrapper = link ? 'a' : 'div';
  const props = link ? { href: link } : {};

  return (
    <ContentWrapper
      {...props}
      className={`flex items-start ${link ? 'hover:text-accent-600 dark:hover:text-accent-400 transition-colors group' : ''}`}
    >
      <div className="w-12 h-12 bg-cream-100 dark:bg-haven-800 border border-cream-400 dark:border-haven-600 rounded-lg flex items-center justify-center mr-4 shrink-0 group-hover:border-accent-400 transition-colors duration-300">
        <Icon className="w-6 h-6 text-accent-500 stroke-[1.25]" strokeWidth={1.25} />
      </div>
      <div>
        <h3 className="font-display text-base text-haven-900 dark:text-cream-100 mb-1">{title}</h3>
        <p className="text-haven-700/70 dark:text-cream-200/60">{content}</p>
      </div>
    </ContentWrapper>
  );
}
