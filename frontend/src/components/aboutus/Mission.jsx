import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye } from 'lucide-react';

export default function MissionVision() {
  return (
    <section className="py-24 bg-cream-100 dark:bg-haven-950 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">Our Purpose</p>
          <h2 className="section-title mt-3 mb-2">Mission &amp; Vision</h2>
          <div className="section-divider" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-haven-900 rounded-2xl p-8 shadow-haven hover:shadow-lg transition-shadow duration-300 border border-cream-400 dark:border-haven-700"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-cream-100 dark:bg-haven-800 border border-cream-400 dark:border-haven-600 rounded-xl flex items-center justify-center mr-4">
                <Target className="w-6 h-6 text-accent-500 stroke-[1.25]" strokeWidth={1.25} />
              </div>
              <h2 className="font-display text-2xl text-haven-900 dark:text-cream-100">Our Mission</h2>
            </div>
            <p className="text-haven-700/70 dark:text-cream-200/60 leading-relaxed">
              To provide a transparent and efficient property rental experience for all users. 
              We strive to make the process of finding your perfect home as seamless as possible, 
              while maintaining the highest standards of service and integrity.
            </p>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-haven-900 rounded-2xl p-8 shadow-haven hover:shadow-lg transition-shadow duration-300 border border-cream-400 dark:border-haven-700"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-cream-100 dark:bg-haven-800 border border-cream-400 dark:border-haven-600 rounded-xl flex items-center justify-center mr-4">
                <Eye className="w-6 h-6 text-accent-500 stroke-[1.25]" strokeWidth={1.25} />
              </div>
              <h2 className="font-display text-2xl text-haven-900 dark:text-cream-100">Our Vision</h2>
            </div>
            <p className="text-haven-700/70 dark:text-cream-200/60 leading-relaxed">
              Empowering millions of users to find their perfect home with ease and trust. 
              We envision a future where property search is not just about finding a place to live, 
              but about discovering a community to belong to.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
