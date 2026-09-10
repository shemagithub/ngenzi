import React from 'react';
import { motion } from 'framer-motion';
import { Home, Target } from 'lucide-react';
import CountUp from './Contup';

const milestones = [
  {
    icon: Home,
    title: 'Properties Listed',
    value: 5000,
    description: 'And growing daily',
  },
  {
    icon: Target,
    title: 'Happy Clients',
    value: 10000,
    description: 'Satisfied customers',
  },
];

export default function Milestones() {
  return (
    <section className="py-24 bg-cream-100 dark:bg-haven-950 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">Our Growth</p>
          <h2 className="section-title mt-3 mb-2">Our Journey So Far</h2>
          <div className="section-divider" />
          <p className="text-haven-700/70 dark:text-cream-200/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Milestones that mark our growth and success
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-[1400px] mx-auto">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            return (
              <motion.div
                key={milestone.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-haven-900 p-8 rounded-2xl shadow-haven hover:shadow-lg transition-all duration-300 border border-cream-400 dark:border-haven-700 text-center"
                whileHover={{ y: -5 }}
              >
                <div className="w-24 h-24 bg-cream-100 dark:bg-haven-800 border border-cream-400 dark:border-haven-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-12 h-12 text-accent-500 stroke-[1.25]" strokeWidth={1.25} />
                </div>
                <h3 className="font-display text-5xl text-accent-600 dark:text-accent-400 mb-4">
                  <CountUp from={0} to={milestone.value} duration={2} separator="," />
                </h3>
                <p className="font-display text-2xl text-haven-900 dark:text-cream-100 mb-3">{milestone.title}</p>
                <p className="text-haven-700/70 dark:text-cream-200/60 text-lg">{milestone.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
