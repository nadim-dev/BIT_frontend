import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import beADonorImage from "../assets/be_a_donor_image.png";

export default function BecomeDonorCta() {
  return (
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
  );
}
