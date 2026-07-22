import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactInfoItem({ icon: Icon, title, content, link }) {
  const ContentWrapper = link ? 'a' : 'div';
  const props = link ? { href: link } : {};

  return (
    <ContentWrapper
      {...props}
      className={`flex items-start ${link ? 'hover:text-blue-600 dark:hover:text-blue-400 transition-colors' : ''}`}
    >
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h3 className="font-semibold mb-1 text-gray-900 dark:text-gray-200">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{content}</p>
      </div>
    </ContentWrapper>
  );
}