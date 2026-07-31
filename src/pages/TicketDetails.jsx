import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";

export const TicketDetails = () => {
  const { setHeaderContent } = useOutletContext();
  const { ticketId } = useParams();

  useEffect(() => {
    setHeaderContent({
      title: undefined,
      subtitle: undefined,
      action: {
        to: "/my-tickets",
        label: "Back to My Tickets",
        icon: ArrowLeft,
      },
    });
  }, [setHeaderContent, ticketId]);

  return (
    <div className="px-3 py-4 sm:px-5 lg:px-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-semibold text-slate-500">
          Ticket details page will be designed here.
        </p>
      </section>
    </div>
  );
};
