// components/business/BusinessCard.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export const BusinessCard = () => {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleServiceClick = (serviceId: string, route: string) => {
    setSelectedService(serviceId);
    setTimeout(() => {
      router.push(route);
    }, 300);
  };
  const services = [
    {
      id: "marketplace",
      title: "Sell Products",
      subtitle: "Sports Equipment & Supplements",
      description:
        "Turn your sports knowledge into profit by selling equipment, supplements, gear, and training accessories to fellow athletes.",
      icon: "🛒",
      features: [
        "Product listings",
        "Inventory management",
        "Order processing",
        "Customer reviews",
      ],
      route: "/business/marketplace",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      id: "moderator",
      title: "Become a Guide",
      subtitle: "Coach, Evaluate & Oversee",
      description:
        "Share your expertise as a certified guide. Conduct physical evaluations, provide coaching, and oversee athlete matches.",
      icon: "👨‍🏫",
      features: [
        "Physical evaluations",
        "Coaching sessions",
        "Match oversight",
        "Performance tracking",
      ],
      route: "/business/features/guide/onboarding",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      id: "facilities",
      title: "Rent Facilities",
      subtitle: "Gyms, Courts & Training Spaces",
      description:
        "Monetize your facilities by renting out gyms, courts, fields, and training spaces to athletes in your area.",
      icon: "🏟️",
      features: [
        "Facility listings",
        "Booking management",
        "Pricing control",
        "Revenue tracking",
      ],
      route: "/business/facilities",
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ];
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Choose Your Business Path
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select the service that aligns with your skills, resources, and
            goals. Each path offers unique opportunities to serve the athletic
            community while building your income.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`
                    group relative bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden
                    transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-transparent
                    cursor-pointer ${
                      selectedService === service.id
                        ? "scale-95 opacity-75"
                        : ""
                    }
                  `}
              onClick={() => handleServiceClick(service.id, service.route)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${service.color}`}
              />

              <div className="p-8">
                {/* Icon & Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${service.bgColor} ${service.textColor}`}
                  >
                    Popular Choice
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm font-medium text-gray-500 mb-4">
                  {service.subtitle}
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    What you'll do:
                  </h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <svg
                          className="w-4 h-4 text-green-500 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div
                  className={`
                      bg-linear-to-r ${service.color} text-white rounded-xl p-4 
                      group-hover:shadow-lg transition-all duration-300
                    `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Get Started</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Loading Overlay */}
              {selectedService === service.id && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
