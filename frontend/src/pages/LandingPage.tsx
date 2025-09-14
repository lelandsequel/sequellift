import React from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import ValueProposition from '../components/ValueProposition'

const LandingPage: React.FC = () => {
  return (
    <div className="w-full">
      <Hero />
      <Features />
      <ValueProposition />
    </div>
  )
}

export default LandingPage