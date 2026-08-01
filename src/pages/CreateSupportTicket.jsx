import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import {AlertCircle,BadgeCheck,CalendarDays,ChevronDown,ClipboardList,FileUp,Info,LoaderCircle,RotateCcw,Send,Tag,Ticket,X} from "lucide-react";
import { createSupportTicket } from "../api/supportTicketApi";
import { formatTicketDate } from "../utils/dateCustomization";

const categories = [
  "Blood Services",
  "Medicine Services",
  "Ambulance Booking",
  "Hospital Services",
  "Account & Profile",
  "Login & Security",
  "AI Prediction",
  "Technical Issue",
  "Feature Request",
  "Other",
];

const supportedFileTypes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
];

const maxFileSize = 5 * 1024 * 1024;

const supportTicketSchema = z.object({
  category: z.string().min(1, "Category is required."),
  subject: z.string().trim().min(1, "Subject is required."),
  description: z.string().trim().min(1, "Description is required."),
  priority: z.string().optional(),
  screenshot: z
    .any()
    .optional()
    .refine((files) => !files?.[0] || files[0].size <= maxFileSize, {
      message: "File size must be 5MB or less.",
    })
    .refine((files) => !files?.[0] || supportedFileTypes.includes(files[0].type), {
      message: "Only PNG, JPG, or JPEG files are supported.",
    }),
});

const zodResolver = async (values) => {
  const result = supportTicketSchema.safeParse(values);

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


function SuccessInfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function SupportTicketSuccess({ ticket, onCreateAnother, onViewTickets }) {
  const infoRows = [
    {
      icon: Ticket,
      label: "Ticket ID",
      value: ticket?.ticketId || "SUP-000124",
    },
    {
      icon: Tag,
      label: "Category",
      value: ticket?.category || "Technical Issue",
    },
    {
      icon: ClipboardList,
      label: "Status",
      value: ticket?.status || "Open",
    },
    {
      icon: CalendarDays,
      label: "Created On",
      value: formatTicketDate(ticket?.createdAt),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto max-w-[680px] rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-[0_16px_48px_rgba(15,23,42,0.08)] sm:p-8"
    >
      <motion.div
        initial={{ scale: 0.72, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-50 text-green-600"
      >
        <BadgeCheck className="size-11" strokeWidth={2.2} />
      </motion.div>

      <h1 className="mt-6 text-2xl font-bold text-slate-950">
        Ticket Submitted Successfully
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
        Your support request has been received successfully. Our support team
        will review your request and respond as soon as possible.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.3, ease: "easeOut" }}
        className="mt-7 grid gap-3 text-left sm:grid-cols-2"
      >
        {infoRows.map((item) => (
          <SuccessInfoRow key={item.label} {...item} />
        ))}
      </motion.div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-left text-sm leading-6 text-green-800">
        <Info className="mt-0.5 size-5 shrink-0" />
        <p>
          You can track the progress of your request anytime from the "My
          Tickets" section.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.3, ease: "easeOut" }}
        className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center"
      >
        <button
          type="button"
          onClick={onViewTickets}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#EF4444] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#dc2626] focus:outline-none focus:ring-4 focus:ring-red-500/20"
        >
          <ClipboardList className="size-4" />
          View My Tickets
        </button>
        <button
          type="button"
          onClick={onCreateAnother}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] px-6 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          <RotateCcw className="size-4" />
          Create Another Ticket
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function CreateSupportTicket() {
  const navigate = useNavigate();
  const fileInputId = useId();
  const { setHeaderContent } = useOutletContext();
  const [toast, setToast] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver,
    defaultValues: {
      category: "",
      subject: "",
      description: "",
      priority: "Medium",
      screenshot: undefined,
    },
  });

  const screenshotRegister = register("screenshot");
  const inputClass =
    "mt-1.5 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#EF4444] focus:ring-4 focus:ring-red-500/10";
  const labelClass = "text-sm font-bold text-slate-900";
  const errorClass = "mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#EF4444]";

  useEffect(() => {
    setHeaderContent({
      title: "Create Support Ticket",
      subtitle: "Share your issue with the MediVerse support team.",
    });
  }, [setHeaderContent]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    screenshotRegister.onChange(event);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    if (!file) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);
    setValue("screenshot", transfer.files, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSelectedFile(file);
  };

  const removeFile = () => {
    setValue("screenshot", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSelectedFile(null);
  };

  const onSubmit = async (values) => {
    setToast(null);
    const formData = new FormData();
    formData.append("category", values.category);
    formData.append("subject", values.subject);
    formData.append("description", values.description);
    formData.append("priority", values.priority || "Medium");

    if (values.screenshot?.[0]) {
      formData.append("screenshot", values.screenshot[0]);
    }

    try {
      const response = await createSupportTicket(formData);
      setSubmittedTicket(
        response?.ticket || {
          ticketId: "SUP-000124",
          category: values.category,
          status: "Open",
          createdAt: new Date().toISOString(),
        },
      );
      setSelectedFile(null);
      reset();
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Unable to create support ticket.",
      });
    }
  };

  const handleCreateAnother = () => {
    setSubmittedTicket(null);
    setToast(null);
    setSelectedFile(null);
    reset();
  };

  if (submittedTicket) {
    return (
      <div className="px-3 py-6 font-[Poppins,var(--font-sans)] sm:px-5 lg:px-6">
        <SupportTicketSuccess
          ticket={submittedTicket}
          onCreateAnother={handleCreateAnother}
          onViewTickets={() => navigate("/support/my-tickets")}
        />
      </div>
    );
  }

  return (
    <div className="px-3 py-4 font-[Poppins,var(--font-sans)] sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[780px] rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold tracking-normal text-slate-950">
            Create Support Ticket
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-5 text-slate-500">
            Tell us about your issue and our support team will get back to you.
          </p>
        </div>

        {toast ? (
          <div
            className="mb-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700"
            role="status"
          >
            <AlertCircle className="size-5 shrink-0" />
            {toast.message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="ticket-category" className={labelClass}>
              Category <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <select
                id="ticket-category"
                className={`${inputClass} appearance-none pr-11`}
                aria-required="true"
                aria-invalid={Boolean(errors.category)}
                aria-describedby={
                  errors.category ? "ticket-category-error" : undefined
                }
                {...register("category")}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.category ? (
              <p id="ticket-category-error" className={errorClass}>
                <AlertCircle className="size-3.5" />
                {errors.category.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="ticket-subject" className={labelClass}>
              Subject <span className="text-[#EF4444]">*</span>
            </label>
            <input
              id="ticket-subject"
              type="text"
              placeholder="Briefly describe your issue"
              className={inputClass}
              aria-required="true"
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={
                errors.subject ? "ticket-subject-error" : undefined
              }
              {...register("subject")}
            />
            {errors.subject ? (
              <p id="ticket-subject-error" className={errorClass}>
                <AlertCircle className="size-3.5" />
                {errors.subject.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="ticket-description" className={labelClass}>
              Description <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              id="ticket-description"
              rows="4"
              placeholder="Please describe your issue in detail..."
              className={`${inputClass} resize-none`}
              aria-required="true"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "ticket-description-error" : undefined
              }
              {...register("description")}
            />
            {errors.description ? (
              <p id="ticket-description-error" className={errorClass}>
                <AlertCircle className="size-3.5" />
                {errors.description.message}
              </p>
            ) : null}
          </div>

         

          <div>
            <span className={labelClass}>
              Attach Screenshot <span className="text-slate-400">(Optional)</span>
            </span>
            <label
              htmlFor={fileInputId}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-5 py-5 text-center transition hover:border-[#EF4444] hover:bg-red-50/30 focus-within:border-[#EF4444] focus-within:ring-4 focus-within:ring-red-500/10"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-red-50 text-[#EF4444]">
                <FileUp className="size-5" />
              </span>
              <span className="mt-2 text-sm font-bold text-slate-900">
                Drop your file here or browse
              </span>
              <span className="mt-1 text-xs font-medium text-slate-500">
                PNG, JPG, or JPEG up to 5MB
              </span>
              <input
                id={fileInputId}
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
                className="sr-only"
                aria-invalid={Boolean(errors.screenshot)}
                aria-describedby={
                  errors.screenshot ? "ticket-screenshot-error" : undefined
                }
                {...screenshotRegister}
                onChange={handleFileChange}
              />
            </label>
            {selectedFile ? (
              <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-slate-700">
                <span className="min-w-0 truncate">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-[#EF4444]"
                  aria-label="Remove attached file"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : null}
            {errors.screenshot ? (
              <p id="ticket-screenshot-error" className={errorClass}>
                <AlertCircle className="size-3.5" />
                {errors.screenshot.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/support"
              className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-[#E5E7EB] px-6 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#EF4444] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#dc2626] focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
