export default function DashboardPlaceholder({ title, description }) {
  return (
    <div className="py-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-[#fb2c36]">
          {title}
        </p>
        <h2 className="mt-2 text-xl font-extrabold text-zinc-950">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71717b]">
          {description}
        </p>
      </div>
    </div>
  );
}
