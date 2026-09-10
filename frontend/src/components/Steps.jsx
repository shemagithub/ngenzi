import React, { useState } from 'react';
import { steps } from '../assets/stepsdata';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.15, staggerChildren: 0.12 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" }
  }
};

function Step({ icon: Icon, title, description, stepNumber }) {
  return (
    <motion.div 
      variants={itemVariants}
      className="relative flex flex-col items-center text-center group px-4"
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-accent-400 text-haven-900 flex items-center justify-center text-xs font-bold z-10">
        {stepNumber}
      </div>

      <div className="w-20 h-20 bg-cream-100 dark:bg-haven-900 border border-cream-400 dark:border-haven-700 flex items-center justify-center mb-6 mt-4 group-hover:border-accent-400 transition-colors duration-300">
        <Icon className="h-9 w-9 text-accent-500 stroke-[1.25]" strokeWidth={1.25} />
      </div>
      
      <h3 className="font-display text-2xl text-haven-900 dark:text-cream-100 mb-3">
        {title}
      </h3>
      
      <p className="text-haven-700/70 dark:text-cream-200/60 leading-relaxed max-w-sm text-sm">
        {description}
      </p>
    </motion.div>
  );
}

Step.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  stepNumber: PropTypes.number.isRequired,
};

export default function HowItWorks() {
  return (
    <section className="relative py-24 bg-cream-100 dark:bg-haven-950 overflow-hidden">
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="section-eyebrow">Simple Process</p>
          <h2 className="section-title mt-3 mb-2">How It Works</h2>
          <div className="section-divider" />
          <p className="text-haven-700/70 dark:text-cream-200/60 max-w-2xl mx-auto leading-relaxed">
            Finding your perfect property is easy with our refined three-step process
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-10 relative"
        >
          <div className="hidden lg:block absolute top-14 left-[18%] right-[18%] h-px bg-cream-400 dark:bg-haven-700" />

          {steps.map((step, index) => (
            <Step
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              stepNumber={index + 1}
            />
          ))}
        </motion.div>

        <div className="flex flex-col items-center mt-16">
          <a href="/properties" className="btn-accent">
            Start Your Journey
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-haven-700/60 dark:text-cream-200/50 text-sm mt-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent-500" />
            No registration required · Free to start
          </p>
        </div>
      </div>
    </section>
  );
}
