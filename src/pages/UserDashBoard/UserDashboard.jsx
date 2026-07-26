import { useOutletContext } from "react-router-dom";


export const UserDashBoard = () => {
  const { user } = useOutletContext();

  return (  
    <div className="grid gap-3 py-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["Blood Group", user.bloodGroup],
        ["Donor Status", user.isDonor ? "Available" : "Not a Donor Yet"],
        ["Nearby Hospitals", "12 Nearby"],
        ["Active Requests", "0 Open"],
      ].map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[#fb2c36]">
            {label}
          </p>
          <p className="mt-2 text-xl font-extrabold text-zinc-950">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
};
