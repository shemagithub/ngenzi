import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, CheckCircle } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Trust',
    description: 'We verify all property owners and renters to ensure a safe and reliable experience for everyone.',
  },
  {
    icon: CheckCircle,
    title: 'Transparency',
    description: 'Clear and honest property listings with accurate information and no hidden fees.',
  },
  {
    icon: Clock,
    title: 'Efficiency',
    description: 'Streamlined property search and listing process to save you time and effort.',
  },
];

export default function Values() {
  return (
    <section className="py-24 bg-cream-200/70 dark:bg-haven-900 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">Core Principles</p>
          <h2 className="section-title mt-3 mb-2">Our Values</h2>
          <div className="section-divider" />
          <p className="text-haven-700/70 dark:text-cream-200/60 max-w-2xl mx-auto text-lg leading-relaxed">
            These core values guide everything we do at NGENZI REALESTATE
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-haven-900 p-8 rounded-2xl shadow-haven hover:shadow-lg transition-all duration-300 border border-cream-400 dark:border-haven-700"
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-cream-100 dark:bg-haven-800 border border-cream-400 dark:border-haven-600 rounded-2xl flex items-center justify-center mb-6 transform transition-transform duration-300 hover:border-accent-400 hover:rotate-3">
                  <Icon className="w-8 h-8 text-accent-500 stroke-[1.25]" strokeWidth={1.25} />
                </div>
                <h3 className="font-display text-2xl text-haven-900 dark:text-cream-100 mb-4">{value.title}</h3>
                <p className="text-haven-700/70 dark:text-cream-200/60 leading-relaxed text-lg">{value.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
