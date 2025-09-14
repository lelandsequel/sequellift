import React from 'react'

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-nyc-blue to-blue-800 text-white">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            NYC Elevator Modernization
            <span className="block text-nyc-orange mt-2">Opportunity Finder</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-blue-100">
            Streamline your sales process with AI-powered insights into New York City's elevator modernization opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-nyc-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-300 shadow-lg">
              Get Started
            </button>
            <button className="px-8 py-4 bg-white text-nyc-blue font-semibold rounded-lg hover:bg-gray-100 transition duration-300 shadow-lg">
              View Demo
            </button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-nyc-orange">50,000+</p>
              <p className="text-blue-100">Elevators in NYC</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-nyc-orange">$2.5B</p>
              <p className="text-blue-100">Market Opportunity</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-nyc-orange">30%</p>
              <p className="text-blue-100">Need Modernization</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero