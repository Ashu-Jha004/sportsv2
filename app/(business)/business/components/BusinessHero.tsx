// components/business/BusinessHero.tsx
"use Client";
import React from "react";

export const BusinessHero: React.FC = () => {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
                🚀 Welcome to Sparta Business Hub
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Turn Your Athletic
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                Passion Into Profit
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join thousands of athletes who have transformed their expertise,
              facilities, and knowledge into thriving businesses within the
              Sparta ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
                <div className="text-2xl font-bold text-white">15,000+</div>
                <div className="text-blue-200 text-sm">
                  Active Business Partners
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
                <div className="text-2xl font-bold text-white">$2.3M+</div>
                <div className="text-blue-200 text-sm">
                  Total Earnings Generated
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
                <div className="text-2xl font-bold text-white">87%</div>
                <div className="text-blue-200 text-sm">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            What is Sparta Business Hub?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            The Sparta Business Hub is your gateway to monetizing your athletic
            expertise. Whether you're a retired athlete, current competitor, or
            fitness enthusiast, we provide the platform to turn your knowledge
            and resources into sustainable income.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                For Athletes
              </h3>
              <p className="text-gray-600 text-sm">
                Current and former athletes looking to monetize their expertise
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                For Entrepreneurs
              </h3>
              <p className="text-gray-600 text-sm">
                Sports enthusiasts wanting to build businesses in athletics
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                For Facility Owners
              </h3>
              <p className="text-gray-600 text-sm">
                Gym and facility owners looking to maximize their space
                utilization
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
