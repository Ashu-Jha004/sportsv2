"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, Users, Activity } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white text-gray-900 flex flex-col">
      {/* HERO SECTION */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-16 md:py-24 gap-10">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center md:text-left flex-1"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900 mb-6">
            Unleash Your <span className="text-blue-600">Athletic Power</span>{" "}
            with <span className="text-blue-500">Sparta</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0">
            Sparta is the home for athletes, coaches, and sports communities to
            connect, grow, and thrive — all in one performance-driven ecosystem.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <Link href="/sign-up">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg">
                Get Started <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/sign-in">
              <button className="border border-gray-300 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
                Sign In
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex justify-center"
        >
          <Image
            src="/hero-athletes.png"
            alt="Athletes working together"
            width={550}
            height={450}
            priority
            className="drop-shadow-2xl rounded-3xl"
          />
        </motion.div>
      </section>

      {/* FEATURE SECTION */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Why Choose Sparta?</h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            A connected space designed for those who live and breathe sports.
            Build your journey, track progress, and grow with your team.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <Trophy size={42} className="text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">For Athletes</h3>
              <p className="text-gray-600">
                Create your athletic identity, track your achievements, and get
                noticed by coaches and teams.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <Users size={42} className="text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">For Coaches</h3>
              <p className="text-gray-600">
                Discover and mentor emerging talent, manage players, and build
                stronger sports communities.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <Activity size={42} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">For Communities</h3>
              <p className="text-gray-600">
                Organize tournaments, recruit players, and grow your network in
                a unified digital sports ecosystem.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VISUAL / CTA SECTION */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-24 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          The Future of Sports Networking Starts Here
        </motion.h2>
        <p className="max-w-2xl mx-auto text-lg text-blue-100 mb-8">
          Join thousands of athletes and coaches redefining how sports
          communities connect and grow.
        </p>
        <Link href="/sign-up">
          <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-blue-50 transition text-lg">
            Join Now
          </button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Sparta — Built for Athletes, Coaches &
        Communities 🏅
      </footer>
    </main>
  );
}
