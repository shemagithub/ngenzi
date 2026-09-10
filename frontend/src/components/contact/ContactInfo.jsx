import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ContactInfoItem from './InfoItem';
import { useSettings } from '../../context/SettingsContext';

export default function ContactInfo() {
  const { settings } = useSettings();
  
  const contactInfo = [
    settings?.companyPhone && {
      icon: Phone,
      title: 'Phone',
      content: settings.companyPhone,
      link: `tel:${settings.companyPhone.replace(/\s/g, '')}`,
    },
    settings?.companyEmail && {
      icon: Mail,
      title: 'Email',
      content: settings.companyEmail,
      link: `mailto:${settings.companyEmail}`,
    },
    settings?.companyAddress && {
      icon: MapPin,
      title: 'Address',
      content: settings.companyAddress,
      link: `https://maps.google.com/?q=${encodeURIComponent(settings.companyAddress)}`,
    },
    {
      icon: Clock,
      title: 'Working Hours',
      content: 'Mon-Fri: 9 AM - 6 PM',
    },
  ].filter(Boolean);
  
  // Use defaults if no settings
  const defaultContactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      content: settings?.companyPhone || '+1 (234) 567-890',
      link: settings?.companyPhone ? `tel:${settings.companyPhone.replace(/\s/g, '')}` : 'tel:+1234567890',
    },
    {
      icon: Mail,
      title: 'Email',
      content: settings?.companyEmail || 'support@ngenzirealestate.com',
      link: settings?.companyEmail ? `mailto:${settings.companyEmail}` : 'mailto:support@ngenzirealestate.com',
    },
    {
      icon: MapPin,
      title: 'Address',
      content: settings?.companyAddress || '123 Main Street, City, Country',
      link: settings?.companyAddress ? `https://maps.google.com/?q=${encodeURIComponent(settings.companyAddress)}` : '#map',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      content: 'Mon-Fri: 9 AM - 6 PM',
    },
  ];
  
  const displayContactInfo = contactInfo.length > 0 ? contactInfo : defaultContactInfo;
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-haven-900 p-8 rounded-2xl shadow-haven border border-cream-400 dark:border-haven-700 transition-colors duration-200"
    >
      <p className="section-eyebrow mb-2">Visit Us</p>
      <h2 className="font-display text-2xl text-haven-900 dark:text-cream-100 mb-8">Our Office</h2>
      <div className="space-y-6">
        {displayContactInfo.map((info, index) => (
          <ContactInfoItem key={index} {...info} />
        ))}
      </div>
    </motion.div>
  );
}
