// pages/business/index.tsx
"use client";
import React, { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { BusinessHero } from "./components/BusinessHero";
import { BusinessCard } from "./components/BusinessCard";

const BusinessPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Business Hub | Sparta - Monetize Your Athletic Expertise</title>
        <meta
          name="description"
          content="Join Sparta Business Hub. Sell products, provide coaching services, or rent out facilities to fellow athletes. Turn your expertise into income."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
        {/* Hero Welcome Section */}
        <BusinessHero />

        {/* Services Section */}
        <BusinessCard />

        {/* Call to Action */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Start Your Athletic Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join the community of successful athletic entrepreneurs and start
              earning from your passion today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Browse All Options
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BusinessPage;
