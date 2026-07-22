import React from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Properties from '../components/propertiesshow'
import Plots from '../components/PlotsShow'
import Steps from '../components/Steps'
import Testimonials from '../components/testimonial'
import Blog from '../components/Blog'

const Home = () => {
  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-200">
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
