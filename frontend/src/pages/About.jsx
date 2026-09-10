import React from 'react'
import Hero from '../components/aboutus/Hero'
import Mission from '../components/aboutus/Mission'
import Values from '../components/aboutus/Values'
import Team from '../components/aboutus/Team'
import Benefits from '../components/aboutus/Benefit'
import Milestones from '../components/aboutus/Milestone'
import SEOHead from '../components/SEO/SEOHead'
import StructuredData from '../components/SEO/StructuredData'

const About = () => {
  return (
    <div className="overflow-hidden bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
      <SEOHead
        title="About Us"
        description="Learn about NGENZI REALESTATE — Rwanda's trusted partner for properties, plots, and cars. Our mission, values, and team serving buyers and investors."
        keywords="about NGENZI REALESTATE, Rwanda real estate agency, Kigali property experts"
        canonicalPath="/about"
      />
      <StructuredData type="about" />
      <Hero />
      <Mission />
      <Values />
      <Team />
      <Benefits />
      <Milestones />
    </div>
  )
}

export default About
