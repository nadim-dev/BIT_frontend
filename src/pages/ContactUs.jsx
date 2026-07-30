import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export const ContactUs=()=>{
    const { setHeaderContent } = useOutletContext();

    useEffect(() => {
        setHeaderContent({
            title: "Help & Support",
            subtitle: "We're here to help you. Find answers or contact our team.",
        });
    }, [setHeaderContent]);

    return (
        <div className="py-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-extrabold text-zinc-950">
                    Contact Us
                </h2>
                <p className="mt-2 text-sm font-semibold text-zinc-500">
                    Tell us what you need help with and our team will get back to you.
                </p>
            </div>
        </div>
    )
}
