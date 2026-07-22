import React from 'react'
import Hero from '../components/aboutus/Hero';
import Mission from '../components/aboutus/Mission';
import Values from '../components/aboutus/Values';
import Team from '../components/aboutus/Team';
import Benefits from '../components/aboutus/Benefit';
import Milestones from '../components/aboutus/Milestone'; 

const About = () => {
  return (
    <div className="overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-200">
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
