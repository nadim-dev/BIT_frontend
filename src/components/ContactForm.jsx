import { motion, AnimatePresence } from "framer-motion";
import { Check, LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createEnquiry } from "../api/enquiryApi";

const contactSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(1, "Please select a subject."),
  message: z.string().min(15, "Message must be at least 15 characters."),
});

const subjectOptions = [
  "General Inquiry",
  "Bug Report",
  "Feature Request",
  "Partnership",
  "Technical Support",
  "Feedback",
];

const zodResolver = async (values) => {
  const result = contactSchema.safeParse(values);

  if (result.success) {
    return {
      values: result.data,
      errors: {},
    };
  }

  const errors = {};

  result.error.issues.forEach((issue) => {
    const fieldName = issue.path[0];

    errors[fieldName] = {
      type: issue.code,
      message: issue.message,
    };
  });

  return {
    values: {},
    errors,
  };
};

export default function ContactForm() {
  const [toast, setToast] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver,
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (payload) => {
    try {
      await createEnquiry(payload);

      reset();
      setToast({
        type: "success",
        message: "Thank you! We've received your message.",
      });
    } catch {
      setToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-zinc-950 shadow-sm outline-none transition-all duration-300 placeholder:text-[#71717b]/70 focus:border-[#fb2c36] focus:ring-4 focus:ring-[#fb2c36]/10";

  return (
    <motion.div
      initial={{ opacity: 0, x: 36 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4">
        <h3 className="font-extrabold text-2xl leading-8 tracking-tight text-zinc-950">
          Send us a message
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#71717b]">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
              toast.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
            role="status"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <div>
          <label
            htmlFor="contact-name"
            className="font-semibold text-sm text-zinc-950"
          >
            Name *
          </label>
          <input
            id="contact-name"
            type="text"
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={inputClass}
            placeholder="Enter your name"
            {...register("name")}
          />
          {errors.name && (
            <p
              id="contact-name-error"
              className="mt-2 text-xs font-medium text-[#fb2c36]"
            >
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="font-semibold text-sm text-zinc-950"
          >
            Email *
          </label>
          <input
            id="contact-email"
            type="email"
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={inputClass}
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p
              id="contact-email-error"
              className="mt-2 text-xs font-medium text-[#fb2c36]"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-subject"
            className="font-semibold text-sm text-zinc-950"
          >
            Subject *
          </label>
          <select
            id="contact-subject"
            aria-required="true"
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={
              errors.subject ? "contact-subject-error" : undefined
            }
            className={inputClass}
            {...register("subject")}
          >
            <option value="">Select a subject</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p
              id="contact-subject-error"
              className="mt-2 text-xs font-medium text-[#fb2c36]"
            >
              {errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="font-semibold text-sm text-zinc-950"
          >
            Message *
          </label>
          <textarea
            id="contact-message"
            rows="3"
            aria-required="true"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={
              errors.message ? "contact-message-error" : "contact-privacy-note"
            }
            className={`${inputClass} resize-none`}
            placeholder="Tell us how we can help"
            {...register("message")}
          />
          {errors.message && (
            <p
              id="contact-message-error"
              className="mt-2 text-xs font-medium text-[#fb2c36]"
            >
              {errors.message.message}
            </p>
          )}
        </div>

        <p
          id="contact-privacy-note"
          className="text-left text-xs leading-5 text-[#71717b]"
        >
          We respect your privacy. Your information will only be used to respond
          to your enquiry.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            <Check className="size-3.5" aria-hidden="true" />
            Usually replies within 24 hours
          </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="w-full cursor-pointer rounded-2xl bg-[#fb2c36] px-6 py-3 font-bold text-white shadow-lg shadow-red-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/25 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:w-auto sm:min-w-44 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="size-5" />
              Send Message
            </>
          )}
        </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
