import React from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Properties from '../components/propertiesshow'
import Plots from '../components/PlotsShow'
import Steps from '../components/Steps'
import Testimonials from '../components/testimonial'
import Blog from '../components/Blog'
import SEOHead from '../components/SEO/SEOHead'

const Home = () => {
  return (
    <div className="bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
      <SEOHead
        title="Premium Real Estate in Rwanda"
        description="Discover verified properties, land plots, and cars across Rwanda with NGENZI REALESTATE. Browse homes in Kigali and beyond — buy, rent, and invest with confidence."
        keywords="real estate Rwanda, property Kigali, buy house Kigali, land for sale Rwanda, NGENZI REALESTATE"
        canonicalPath="/"
      />
      <Hero />
      <Features />
      <Properties />
      <Plots />
      <Steps />
      <Testimonials />
      <Blog />
    </div>
  )
}

export default Home
