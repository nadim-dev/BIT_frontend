import { motion } from "framer-motion";

export default function ContactCard({
  icon: Icon,
  title,
  children,
  href,
  external = false,
  ariaLabel,
  delay = 0,
}) {
  const CardWrapper = href ? motion.a : motion.article;
  const linkProps = href
    ? {
        href,
        ...(external ? { target: "_blank", rel: "noreferrer" } : {}),
        "aria-label": ariaLabel || title,
      }
    : {};

  return (
    <CardWrapper
      {...linkProps}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="group block rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-all duration-300 hover:border-[#fb2c36]/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#fb2c36]/15"
    >
      <div className="flex items-start gap-4">
        <div className="size-11 shrink-0 rounded-full bg-[#fb2c36]/10 text-[#fb2c36] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-base leading-6 text-zinc-950">
            {title}
          </h3>
          <div className="mt-1 text-sm leading-6 text-[#71717b]">
            {children}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
