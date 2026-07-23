import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactCard from "./ContactCard";
import ContactForm from "./ContactForm";

const contactItems = [
  {
    icon: Mail,
    title: "Email",
    content: "support@bit.com",
    href: "mailto:support@bit.com",
    ariaLabel: "Email BIT support",
  },
  {
    icon: Phone,
    title: "Phone",
    content: "+91 XXXXX XXXXX",
    href: "tel:+91XXXXXXXXXX",
    ariaLabel: "Call BIT support",
  },
  {
    icon: MapPin,
    title: "Location",
    content: "Mumbai, Maharashtra, India",
    href: "https://www.google.com/maps/search/?api=1&query=Mumbai%2C%20Maharashtra%2C%20India",
    external: true,
    ariaLabel: "Open BIT location in Google Maps",
  },
  {
    icon: Clock,
    title: "Support",
    content: (
      <>
        Monday - Saturday
        <br />
        9:00 AM - 6:00 PM
      </>
    ),
  },
];

export default function ContactSection() {
  return (
    <motion.section
      id="contact"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-8 pb-20"
    >
      <div className="mx-auto max-w-2xl text-center mb-10">
        <h2 className="font-extrabold text-4xl leading-10 tracking-tight text-zinc-950">
          Get in Touch
        </h2>
        <p className="mt-3 text-base leading-7 text-[#71717b]">
          Have a question, suggestion, or partnership inquiry? We'd love to hear
          from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <motion.div
          className="flex flex-col gap-5"
        >
          <div className="max-w-xl">
            <h3 className="font-extrabold text-2xl leading-8 tracking-tight text-zinc-950">
              We're here to help
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#71717b]">
              Whether you have a question, found a bug, have a feature request,
              or want to partner with us, we'd love to hear from you. We
              typically respond within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {contactItems.map((item, index) => (
              <ContactCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                href={item.href}
                external={item.external}
                ariaLabel={item.ariaLabel}
                delay={index * 0.06}
              >
                {item.content}
              </ContactCard>
            ))}
          </div>
        </motion.div>

        <ContactForm />
      </div>
    </motion.section>
  );
}
