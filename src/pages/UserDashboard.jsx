import { Link, useOutletContext } from "react-router-dom";
import { ArrowRight, BadgeCheck, CalendarDays, Droplet, ShieldCheck } from "lucide-react";
import beADonorImage from "../assets/be_a_donor_image.png";


export const UserDashBoard = () => {
  const { user } = useOutletContext();
  const dashboardHeaderCards = [
    {
      label: "Blood Group",
      value: user.bloodGroup || "O+",
      note: "Positive",
      icon: Droplet,
      wrapperClass: "border-red-100 bg-red-50/70",
      iconClass: "bg-red-100 text-red-600",
      labelClass: "text-red-600",
      valueClass: "text-red-600",
    },
    {
      label: "Donor Status",
      value: user.isDonor ? "Available Donor" : "Not a Donor Yet",
      note: user.isDonor ? "Ready to help nearby" : "Join our community",
      icon: ShieldCheck,
      wrapperClass: "border-blue-100 bg-blue-50/80",
      iconClass: "bg-blue-100 text-blue-600",
      labelClass: "text-blue-900",
      valueClass: "text-blue-700",
    },
    {
      label: "Become a Donor",
      value: "Save Lives",
      note: "Complete your profile in a few steps",
      icon: BadgeCheck,
      wrapperClass: "border-emerald-100 bg-emerald-50/75",
      iconClass: "bg-emerald-100 text-emerald-600",
      labelClass: "text-zinc-700",
      valueClass: "text-emerald-700",
    },
    {
      label: "Nearby Hospitals",
      value: "12 Nearby",
      note: "Hospitals ready to help you",
      icon: CalendarDays,
      wrapperClass: "border-purple-100 bg-purple-50/75",
      iconClass: "bg-purple-100 text-purple-600",
      labelClass: "text-purple-900",
      valueClass: "text-purple-700",
    },
  ];

  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardHeaderCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className={`flex min-h-[126px] items-center gap-4 rounded-lg border p-5 shadow-sm ${card.wrapperClass}`}
            >
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${card.iconClass}`}>
                <Icon className="h-6 w-6" strokeWidth={2.6} />
              </div>

              <div className="min-w-0">
                <p className={`text-xs font-bold ${card.labelClass}`}>
                  {card.label}
                </p>
                <p className={`mt-2 text-2xl font-extrabold leading-tight ${card.valueClass}`}>
                  {card.value}
                </p>
                <p className="mt-2 text-xs font-semibold leading-snug text-zinc-700">
                  {card.note}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <section className="relative overflow-hidden rounded-lg border border-red-100 bg-red-50/60 px-5 py-6 shadow-sm sm:px-7">
        <div className="relative z-10 max-w-md">
          <h2 className="text-sm font-extrabold text-zinc-950">
            Be the reason someone lives.
          </h2>
          <p className="mt-4 max-w-sm text-xs font-semibold leading-relaxed text-zinc-600">
            Become a verified blood donor and help save precious lives in your community.
          </p>
          <Link
            to="/become-donor"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700"
          >
            Complete Donor Profile
            <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
          </Link>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-8 hidden w-1/2 items-center justify-center sm:flex">
          <img
            src={beADonorImage}
            alt=""
            className="h-40 w-auto max-w-full object-contain"
          />
        </div>
      </section>
    </div>
  );
};
