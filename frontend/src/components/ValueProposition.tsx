import React from 'react'

const ValueProposition: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-nyc-gray mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600">
              Transform your elevator modernization sales process with data-driven insights
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-nyc-blue mb-4">
                Increase Sales Efficiency by 300%
              </h3>
              <p className="text-gray-600 mb-6">
                Stop wasting time on cold calls and unqualified leads. Our platform identifies buildings 
                that are actively in need of modernization, allowing your sales team to focus on 
                high-probability opportunities.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-nyc-orange mr-2">✓</span>
                  <span className="text-gray-700">Pre-qualified leads based on building age and compliance status</span>
                </li>
                <li className="flex items-start">
                  <span className="text-nyc-orange mr-2">✓</span>
                  <span className="text-gray-700">Direct contact information for property managers and owners</span>
                </li>
                <li className="flex items-start">
                  <span className="text-nyc-orange mr-2">✓</span>
                  <span className="text-gray-700">Historical violation data to demonstrate urgency</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h4 className="text-xl font-semibold text-nyc-gray mb-6">ROI Calculator</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Average Deal Size</span>
                  <span className="font-bold text-nyc-blue">$250,000</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Leads per Month</span>
                  <span className="font-bold text-nyc-blue">50+</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Conversion Rate Increase</span>
                  <span className="font-bold text-nyc-blue">40%</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-xl font-semibold text-gray-800">Potential Revenue Increase</span>
                  <span className="text-2xl font-bold text-nyc-orange">$5M+</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-nyc-blue text-white rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Sales Process?</h3>
            <p className="text-lg mb-6">
              Join leading elevator companies already using our platform to dominate the NYC market
            </p>
            <button className="px-8 py-4 bg-nyc-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-300 shadow-lg">
              Schedule a Demo Today
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ValueProposition