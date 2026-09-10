import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import useContactForm from './useContactform';

function ContactForm() {
  const { formData, errors, handleChange, handleSubmit } = useContactForm();

  const inputClasses = (hasError) =>
    `w-full px-4 py-2.5 border rounded-haven focus:ring-2 focus:ring-accent-400/50 focus:border-accent-400 bg-cream-50 dark:bg-haven-800 text-haven-900 dark:text-cream-100 border-cream-400 dark:border-haven-600 placeholder:text-haven-400/60 dark:placeholder:text-cream-200/40 transition-colors duration-200 ${
      hasError ? 'border-red-500 dark:border-red-500' : ''
    }`;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-haven-900 p-8 rounded-2xl shadow-haven border border-cream-400 dark:border-haven-700 transition-colors duration-200"
    >
      <p className="section-eyebrow mb-2">Get in Touch</p>
      <h2 className="font-display text-2xl text-haven-900 dark:text-cream-100 mb-6">Send Us a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-haven-800 dark:text-cream-200 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={inputClasses(errors.name)}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-haven-800 dark:text-cream-200 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClasses(errors.email)}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-haven-800 dark:text-cream-200 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClasses(false)}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-haven-800 dark:text-cream-200 mb-1">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className={inputClasses(errors.message)}
          />
          {errors.message && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full btn-haven !py-3.5"
        >
          <Send className="w-4 h-4" />
          Send Message
        </button>
      </form>
    </motion.div>
  );
}

export default ContactForm;
