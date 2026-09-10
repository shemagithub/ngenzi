import React from 'react'
import { motion } from 'framer-motion'
import ContactHero from '../components/contact/ContactHero'
import ContactForm from '../components/contact/contactForm'
import ContactInfo from '../components/contact/ContactInfo'
import SEOHead from '../components/SEO/SEOHead'
import StructuredData from '../components/SEO/StructuredData'

const Contact = () => {
  return (
    <div className="bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
      <SEOHead
        title="Contact Us"
        description="Get in touch with NGENZI REALESTATE in Kigali. Ask about properties, plots, cars, or book a viewing — we respond quickly."
        keywords="contact NGENZI REALESTATE, Kigali real estate contact, book property viewing Rwanda"
        canonicalPath="/contact"
      />
      <StructuredData type="contact" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ContactHero />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Contact
