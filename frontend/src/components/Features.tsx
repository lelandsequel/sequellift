import React from 'react'

const Features: React.FC = () => {
  const features = [
    {
      title: "AI-Powered Analysis",
      description: "Leverage machine learning to identify buildings with the highest modernization potential based on age, usage, and compliance requirements.",
      icon: "🤖"
    },
    {
      title: "Real-Time DOB Integration",
      description: "Direct integration with NYC Department of Buildings data for up-to-date elevator information and violation history.",
      icon: "🏢"
    },
    {
      title: "Priority Scoring",
      description: "Automated scoring system that ranks opportunities based on modernization urgency, building size, and potential contract value.",
      icon: "📊"
    },
    {
      title: "Lead Management",
      description: "Built-in CRM features to track opportunities, manage contacts, and monitor sales pipeline progress.",
      icon: "📋"
    },
    {
      title: "Market Intelligence",
      description: "Comprehensive insights into building ownership, management companies, and historical modernization patterns.",
      icon: "💡"
    },
    {
      title: "Compliance Tracking",
      description: "Monitor Local Law 97 requirements and other regulations affecting elevator modernization timelines.",
      icon: "✅"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-nyc-gray mb-4">
            Powerful Features for Sales Success
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to identify, qualify, and convert elevator modernization opportunities in New York City
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-nyc-blue mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features