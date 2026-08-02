import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  Droplet,
  Heart,
  Hospital,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import BecomeDonorCta from "../components/BecomeDonorCta";

const nearbyBloodBanks = [
  {
    name: "City Blood Bank",
    distance: "2.3 km away",
    availability: "O+ 15 Units",
  },
  {
    name: "Life Care Blood Bank",
    distance: "3.1 km away",
    availability: "O+ 8 Units",
  },
  {
    name: "Hope Foundation Blood Bank",
    distance: "4.7 km away",
    availability: "O+ 12 Units",
  },
];

const nearbyHospitals = [
  {
    name: "Sunrise Multispeciality",
    distance: "1.8 km away",
    status: "Emergency Ready",
  },
  {
    name: "Apex Care Hospital",
    distance: "2.9 km away",
    status: "Blood Support",
  },
  {
    name: "Metro City Hospital",
    distance: "4.2 km away",
    status: "24/7 Open",
  },
];

const donationFacts = [
  {
    title: "One donation can save up to three lives.",
    note: "Be a part of something bigger.",
  },
  {
    title: "Blood cannot be manufactured.",
    note: "Every unit comes from a generous donor.",
  },
  {
    title: "Regular donors help during emergencies.",
    note: "Your consistency can keep care moving.",
  },
];

function NearbyResourceCard({
  title,
  viewAllLabel,
  actionLabel,
  actionHref,
  items,
  type,
}) {
  const isBloodBank = type === "bloodBank";
  const Icon = isBloodBank ? Droplet : Hospital;
  const itemTone = isBloodBank
    ? "bg-red-100 text-red-600"
    : "bg-blue-100 text-blue-600";
  const badgeTone = isBloodBank
    ? "bg-emerald-50 text-emerald-700"
    : "bg-sky-50 text-sky-700";

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-zinc-950">{title}</h2>
        <Link
          to={actionHref}
          className="text-xs font-extrabold text-[#fb2c36] transition hover:text-red-700"
        >
          {viewAllLabel}
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${itemTone}`}
            >
              <Icon className="h-5 w-5 fill-current" strokeWidth={2.4} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-zinc-950">
                {item.name}
              </p>
              <p className="mt-1 text-xs font-semibold text-zinc-500">
                {item.distance}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold ${badgeTone}`}
            >
              {item.availability || item.status}
            </span>
          </div>
        ))}
      </div>

      <Link
        to={actionHref}
        className="mt-5 flex h-12 items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50/45 px-4 text-sm font-extrabold text-[#fb2c36] transition hover:border-red-200 hover:bg-red-50"
      >
        {actionLabel}
        <MapPin className="h-5 w-5" strokeWidth={2.5} />
      </Link>
    </div>
  );
}

function DidYouKnowCard() {
  const [activeFact, setActiveFact] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  const showFact = (direction) => {
    setActiveFact((current) => {
      if (direction === "next") {
        return (current + 1) % donationFacts.length;
      }

      return (current - 1 + donationFacts.length) % donationFacts.length;
    });
  };

  const handleTouchEnd = (event) => {
    if (touchStart === null) return;

    const touchEnd = event.changedTouches[0].clientX;
    const swipeDistance = touchStart - touchEnd;

    if (Math.abs(swipeDistance) > 36) {
      showFact(swipeDistance > 0 ? "next" : "previous");
    }

    setTouchStart(null);
  };

  return (
    <div className="mx-auto w-full max-w-[290px] xl:mx-0">
      <div
        className="overflow-hidden rounded-xl"
        onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeFact * 100}%)` }}
        >
          {donationFacts.map((fact) => (
            <div
              key={fact.title}
              className="flex min-h-[278px] w-full shrink-0 touch-pan-y flex-col items-center rounded-xl border border-zinc-100 bg-white p-5 text-center shadow-sm"
            >
              <h2 className="text-sm font-extrabold text-zinc-950">
                Did You Know?
              </h2>

              <div className="relative mt-5 grid h-24 w-28 place-items-center">
                <div className="absolute bottom-2 left-2 h-12 w-5 rotate-[-18deg] rounded-full bg-red-100" />
                <div className="absolute bottom-2 right-2 h-12 w-5 rotate-[18deg] rounded-full bg-red-100" />
                <div className="absolute bottom-0 left-6 h-7 w-8 rounded-b-full rounded-t-sm bg-red-100" />
                <div className="absolute bottom-0 right-6 h-7 w-8 rounded-b-full rounded-t-sm bg-red-100" />
                <div className="absolute top-1 right-5">
                  <Heart className="h-4 w-4 fill-[#fb2c36] text-[#fb2c36]" />
                </div>
                <div className="absolute top-8 right-3 h-1.5 w-1.5 rounded-full bg-red-100" />
                <div className="absolute top-5 left-5 h-1.5 w-1.5 rounded-full bg-red-100" />
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#fb2c36] text-white shadow-sm">
                  <Droplet className="h-10 w-10 fill-current" strokeWidth={2.4} />
                </div>
              </div>

              <p className="mt-5 max-w-[210px] text-sm font-extrabold leading-6 text-zinc-950">
                {fact.title}
              </p>
              <p className="mt-4 text-xs font-semibold text-zinc-500">
                {fact.note}
              </p>

              <div className="mt-auto flex items-center justify-center gap-2 pt-6">
                {donationFacts.map((indicatorFact, index) => (
                  <button
                    key={indicatorFact.title}
                    type="button"
                    aria-label={`Show donation fact ${index + 1}`}
                    onClick={() => setActiveFact(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === activeFact
                        ? "w-2 bg-[#fb2c36]"
                        : "w-2 bg-zinc-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


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

      <BecomeDonorCta />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_290px]">
        <NearbyResourceCard
          title="Nearby Blood Banks"
          viewAllLabel="View All"
          actionLabel="View All Blood Banks"
          actionHref="/nearby-blood-banks"
          items={nearbyBloodBanks}
          type="bloodBank"
        />
        <NearbyResourceCard
          title="Nearby Hospitals"
          viewAllLabel="View All"
          actionLabel="View All Hospitals"
          actionHref="/nearby-hospitals"
          items={nearbyHospitals}
          type="hospital"
        />
        <DidYouKnowCard />
      </div>
    </div>
  );
};
