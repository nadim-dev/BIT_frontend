import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {ChevronRight,Clock,Edit3,Headphones,HelpCircle,Mail,MapPin,Phone} from "lucide-react";  

const faqs = [
    {
        question: "How do I request for blood?",
        answer:
            "Go to Emergency Help, enter the required details, and submit your request. We'll connect you with nearby donors and blood banks.",
    },
    {
        question: "How do I book an ambulance?",
        answer:
            "Open the Ambulance section, select your location and destination, then confirm your booking.",
    },
    {
        question: "How can I compare medicine prices?",
        answer:
            "Search for a medicine to compare prices from multiple pharmacies and view available generic alternatives.",
    },
    {
        question: "How do I become a blood donor?",
        answer:
            "Go to your profile and select Become a Donor. Complete the required information to activate your donor status.",
    },
    {
        question: "How can I track my request?",
        answer:
            "Open My Requests to view the real-time status and updates of your blood or ambulance request.",
    },
    {
        question: "Why is my request taking longer?",
        answer:
            "Delays may occur due to limited availability, high demand, or location. We'll notify you as soon as a match is found.",
    },
];

const contactDetails = [
    {
        icon: Mail,
        title: "Email",
        content: "support@bitcare.com",
    },
    {
        icon: Phone,
        title: "Phone",
        content: "+91 98765 43210",
    },
    {
        icon: Clock,
        title: "Support Hours",
        content: "Mon - Sat - 9:00 AM - 6:00 PM",
    },
    {
        icon: MapPin,
        title: "Address",
        content: "Aampada Road, Narpoli, Bhiwandi, Maharashtra 421302",
    },
];

export const ContactUs=()=>{
    const { setHeaderContent,user } = useOutletContext();
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        setHeaderContent({
            title: "Help & Support",
            subtitle: "We're here to help you. Find answers or contact our team.",
        });
    }, [setHeaderContent]);

    const subject = encodeURIComponent("BIT Support Request");

    const body = encodeURIComponent(`Hello BIT Support Team,
    
    Name: ${user.username}
    Email: ${user.email}
    
    Issue Category:
    
    Description:
    --------------------------------------------------
    
    
    Thank you,
    ${user.username}
    `);
    
    const mailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=khanm99098@gmail.com&su=${subject}&body=${body}`;
    
    return (
        <div className="px-3 py-4 sm:px-5 lg:px-6">
            <section className="rounded-xl border border-red-100 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8">
                    <div className="flex items-center gap-4">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#fb2c36]">
                            <Headphones className="size-8" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-950">
                                Contact Support
                            </h2>
                            <p className="mt-1.5 text-sm font-medium text-slate-500">
                                Facing an issue or have a question?
                            </p>
                            <p className="mt-0.5 max-w-sm text-sm leading-5 text-slate-500">
                                Create a support ticket and our team will get
                                back to you.
                            </p>
                        </div>
                    </div>

                    <div className="hidden h-16 w-px bg-red-100 lg:block" />

                    <div className="flex justify-start lg:justify-center">
                        <Link
                            to="/support/create-ticket"
                            className="inline-flex min-h-10 w-full max-w-48 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#e50914] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#c90812] sm:w-auto"
                        >
                            <Edit3 className="size-4" />
                            Create Ticket
                        </Link>
                    </div>
                </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-full bg-red-50 text-[#fb2c36]">
                                <HelpCircle className="size-4" />
                            </span>
                            <h2 className="text-base font-bold text-slate-950">
                                Frequently Asked Questions
                            </h2>
                        </div>
                        <button
                            type="button"
                            className="shrink-0 cursor-pointer text-xs font-bold text-[#fb2c36] transition hover:text-[#c90812]"
                        >
                            View All
                        </button>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;

                            return (
                            <article
                                key={faq.question}
                                className="rounded-md border border-slate-200 bg-white px-4 py-3 transition hover:border-red-200 hover:bg-red-50/40"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenFaq(isOpen ? null : index)
                                    }
                                    className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        {faq.question}
                                    </h3>
                                    <ChevronRight
                                        className={`size-4 shrink-0 text-slate-500 transition-transform ${
                                            isOpen ? "rotate-90" : ""
                                        }`}
                                    />
                                </button>
                                {isOpen ? (
                                    <p className="mt-2 text-sm leading-5 text-slate-500">
                                        {faq.answer}
                                    </p>
                                ) : null}
                            </article>
                            );
                        })}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-full bg-red-50 text-[#fb2c36]">
                            <Phone className="size-4" />
                        </span>
                        <h2 className="text-base font-bold text-slate-950">
                            Contact Information
                        </h2>
                    </div>

                    <div className="space-y-5">
                        {contactDetails.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.title}
                                    className="flex items-start gap-4"
                                >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-red-50 text-[#fb2c36]">
                                        <Icon className="size-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-slate-950">
                                            {item.title}
                                        </h3>
                                        <p className="mt-1 text-sm leading-5 text-slate-500">
                                            {item.content}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <a
                       href={mailUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#fb2c36] px-4 text-sm font-bold text-[#fb2c36] transition hover:bg-red-50"
                    >
                      <Mail className="size-4" />
                      Email Support
                    </a>
                </section>
            </div>
        </div>
    )
}
