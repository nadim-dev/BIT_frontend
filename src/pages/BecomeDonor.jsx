import { motion } from "framer-motion";
import {
  HeartHandshake,
  ShieldCheck,
  Activity,
  Bell,
  Heart,
  MapPin,
  Headphones,
} from "lucide-react";

export default function BecomeDonor() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-red-100 overflow-hidden relative">

      {/* Background Blur */}
      <div className="absolute w-96 h-96 bg-red-200 rounded-full blur-[180px] opacity-40 -top-32 -left-20"></div>

      <div className="absolute w-80 h-80 bg-pink-200 rounded-full blur-[160px] opacity-30 bottom-0 right-0"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* ========================================= */}
          {/* LEFT SIDE */}
          {/* ========================================= */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .6 }}
          >

            {/* Logo */}

            <div className="flex items-center gap-3 mb-10">

              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center shadow-lg">

                <Heart className="text-white" />

              </div>

              <div>

                <h2 className="font-bold text-2xl">
                  BloodConnect
                </h2>

                <p className="text-gray-500 text-sm">
                  Save Lives Together
                </p>

              </div>

            </div>

            {/* Heading */}

            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">

              Your Blood.

              <br />

              <span className="bg-gradient-to-r from-red-700 to-rose-500 bg-clip-text text-transparent">

                Their Tomorrow.

              </span>

            </h1>

            <p className="text-gray-600 text-lg mt-7 leading-8 max-w-xl">

              Become a verified blood donor and help hospitals
              respond faster during emergencies. One donation
              can save up to three lives.

            </p>

            {/* Stats */}

            <div className="grid grid-cols-3 gap-4 mt-10">

              <StatCard
                icon={<HeartHandshake />}
                title="50K+"
                subtitle="Registered Donors"
              />

              <StatCard
                icon={<Activity />}
                title="10K+"
                subtitle="Lives Saved"
              />

              <StatCard
                icon={<ShieldCheck />}
                title="98%"
                subtitle="Success Rate"
              />

            </div>

            {/* Illustration */}

            <motion.div
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
              }}
              className="mt-12"
            >

              <img
                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=900&q=80"
                alt=""
                className="rounded-[35px] shadow-2xl border border-white"
              />

            </motion.div>

            {/* Why Donate */}

            <div className="mt-12">

              <h3 className="text-2xl font-bold mb-6">

                Why Donate With Us?

              </h3>

              <div className="space-y-5">

                <Feature
                  icon={<Bell />}
                  title="Instant Emergency Alerts"
                  desc="Receive nearby blood requests immediately."
                />

                <Feature
                  icon={<ShieldCheck />}
                  title="Verified & Secure"
                  desc="Your donor profile remains protected."
                />

                <Feature
                  icon={<MapPin />}
                  title="Save Lives Nearby"
                  desc="Hospitals can reach verified donors quickly."
                />

                <Feature
                  icon={<Headphones />}
                  title="24/7 Support"
                  desc="Our team is always ready to assist you."
                />

              </div>

            </div>

          </motion.div>

          {/* ====================================== */}
          {/* RIGHT SIDE */}
          {/* ====================================== */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .7 }}
          >

            <div className="backdrop-blur-xl bg-white/70 rounded-[32px] border border-white shadow-2xl p-9">

              <div className="flex justify-between items-center">

                <div>

                  <h2 className="text-3xl font-bold">

                    Become a Blood Donor

                  </h2>

                  <p className="text-gray-500 mt-2">

                    Complete your donor profile to start saving lives.

                  </p>

                </div>

                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">

                  Secure

                </div>

              </div>

              {/* FORM START */}

              <div className="mt-10 space-y-6">

                {/* We'll build this in Part 2 */}

                <div className="h-16 rounded-2xl bg-gray-100 animate-pulse"></div>

                <div className="h-16 rounded-2xl bg-gray-100 animate-pulse"></div>

                <div className="h-16 rounded-2xl bg-gray-100 animate-pulse"></div>

                <div className="h-16 rounded-2xl bg-gray-100 animate-pulse"></div>

                <div className="h-16 rounded-2xl bg-gray-100 animate-pulse"></div>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </div>
  );
}

/* ======================================= */

function StatCard({ icon, title, subtitle }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white shadow-xl">

      <div className="text-red-600">

        {icon}

      </div>

      <h2 className="font-bold text-2xl mt-3">

        {title}

      </h2>

      <p className="text-sm text-gray-500 mt-1">

        {subtitle}

      </p>

    </div>
  );
}

/* ======================================= */

function Feature({ icon, title, desc }) {
  return (
    <div className="flex gap-5 items-start bg-white/70 rounded-3xl border border-white shadow-lg p-5">

      <div className="bg-red-100 h-12 w-12 rounded-2xl flex items-center justify-center text-red-600">

        {icon}

      </div>

      <div>

        <h4 className="font-semibold text-lg">

          {title}

        </h4>

        <p className="text-gray-500">

          {desc}

        </p>

      </div>

    </div>
  );
}