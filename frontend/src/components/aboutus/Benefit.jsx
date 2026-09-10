import React from 'react';
import { motion } from 'framer-motion';
import { Home, Globe, Headphones, List } from 'lucide-react';

const benefits = [
  {
    icon: Home,
    title: 'Verified Properties',
    description: 'Every property is thoroughly verified for quality and security.',
  },
  {
    icon: Globe,
    title: 'User-Friendly Platform',
    description: 'Intuitive navigation and seamless property management.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock assistance for all your queries.',
  },
  {
    icon: List,
    title: 'Comprehensive Listings',
    description: 'Wide range of properties to match every need and budget.',
  },
];

export default function Benefits() {
  return (
    <section className="py-24 bg-white dark:bg-haven-950 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">The Ngenzi Difference</p>
          <h2 className="section-title mt-3 mb-2">Why Choose NGENZI REALESTATE?</h2>
          <div className="section-divider" />
          <p className="text-haven-700/70 dark:text-cream-200/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Experience the difference with our comprehensive property solutions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-cream-100 dark:bg-haven-900 p-8 rounded-2xl shadow-haven hover:shadow-lg transition-all duration-300 border border-cream-400 dark:border-haven-700"
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-white dark:bg-haven-800 border border-cream-400 dark:border-haven-600 rounded-2xl flex items-center justify-center mb-6 transform transition-transform duration-300 hover:border-accent-400 hover:rotate-3">
                  <Icon className="w-8 h-8 text-accent-500 stroke-[1.25]" strokeWidth={1.25} />
                </div>
                <h3 className="font-display text-xl text-haven-900 dark:text-cream-100 mb-4">{benefit.title}</h3>
                <p className="text-haven-700/70 dark:text-cream-200/60 text-lg leading-relaxed">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
