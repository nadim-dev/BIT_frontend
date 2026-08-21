import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  Droplet,
  Lightbulb,
  LoaderCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { bloodDemandPredictionAPI } from "../../api/bloodBankApi.js";

const riskStyles = {
  LOW: {
    badge: "bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
  },
  MEDIUM: {
    badge: "bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
    icon: AlertTriangle,
  },
  HIGH: {
    badge: "bg-orange-50 text-orange-700",
    bar: "bg-orange-500",
    icon: CircleAlert,
  },
  CRITICAL: {
    badge: "bg-red-50 text-red-700",
    bar: "bg-red-500",
    icon: CircleAlert,
  },
};
const emptyPrediction = { summary: {}, predictions: [], insights: [] };
const valueOf = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const componentLabels = {
  PRBC: "Red cells (PRBC)",
  Platelets: "Platelets",
  Plasma: "Plasma",
};
const riskLabels = {
  LOW: "Enough stock",
  MEDIUM: "Watch closely",
  HIGH: "Likely shortage",
  CRITICAL: "Shortage now",
};
const getComponentLabel = (component) => componentLabels[component] || component;

export const AIdemandPrediction = () => {
  const { setHeaderContent } = useOutletContext();
  const [prediction, setPrediction] = useState(emptyPrediction);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("PRBC");

  useEffect(() => {
    setHeaderContent({
      title: "AI Blood Need Forecast",
      subtitle:
        "See which blood items may be needed in the next 7 days.",
      action: undefined,
    });
  }, [setHeaderContent]);

  const loadPrediction = async () => {
    try {
      setIsLoading(true);
      setError("");
        const response = await bloodDemandPredictionAPI();
        setPrediction(response?.data?.data || response?.data || emptyPrediction);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to generate demand prediction.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadPrediction();
  }, []);

  const predictions = prediction.predictions || [];
  const summary = prediction.summary || {};
  const riskCounts = useMemo(
    () =>
      predictions.reduce(
        (counts, item) => {
          const risk = item.riskLevel || "LOW";
          counts[risk] = (counts[risk] || 0) + 1;
          return counts;
        },
        { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      ),
    [predictions],
  );
  const componentData = useMemo(() => {
    const grouped = new Map();
    predictions.forEach((item) => {
      const row = grouped.get(item.component) || {
        component: item.component,
        demand: 0,
        recommendations: 0,
      };
      row.demand += valueOf(item.predictedDemand);
      row.recommendations += valueOf(item.recommendedUnits);
      grouped.set(item.component, row);
    });
    return [...grouped.values()];
  }, [predictions]);
  const bloodGroupData = useMemo(() => {
    const grouped = new Map();
    predictions.forEach((item) => {
      const row = grouped.get(item.bloodGroup) || {
        bloodGroup: item.bloodGroup,
        demand: 0,
        extra: 0,
      };
      row.demand += valueOf(item.predictedDemand);
      row.extra += valueOf(item.recommendedUnits);
      grouped.set(item.bloodGroup, row);
    });
    return [...grouped.values()].sort((first, second) =>
      first.bloodGroup.localeCompare(second.bloodGroup),
    );
  }, [predictions]);
  const priorityData = useMemo(
    () =>
      [...predictions]
        .filter((item) => valueOf(item.recommendedUnits) > 0)
        .sort(
          (first, second) =>
            valueOf(second.recommendedUnits) - valueOf(first.recommendedUnits),
        )
        .slice(0, 5),
    [predictions],
  );
  const filterOptions = useMemo(
    () =>
      ["PRBC", "Platelets", "Plasma"].map((component) => ({
        component,
        label: getComponentLabel(component),
      })),
    [],
  );
  const filteredPredictions = useMemo(
    () =>
      predictions.filter((item) => item.component === selectedComponent),
    [predictions, selectedComponent],
  );
  const maxDemand = Math.max(...componentData.map((item) => item.demand), 1);
  const maxBloodGroupDemand = Math.max(
    ...bloodGroupData.map((item) => item.demand),
    1,
  );
  const maxPriorityUnits = Math.max(
    ...priorityData.map((item) => valueOf(item.recommendedUnits)),
    1,
  );
  const totalSignals =
    Object.values(riskCounts).reduce((sum, count) => sum + count, 0) || 1;
  const atRisk =
    valueOf(summary.groupsAtRisk) ||
    riskCounts.MEDIUM + riskCounts.HIGH + riskCounts.CRITICAL;
  const critical = valueOf(summary.criticalGroups) || riskCounts.CRITICAL;
  const donutStops = `conic-gradient(#ef4444 0% ${(riskCounts.CRITICAL / totalSignals) * 100}%, #f97316 ${(riskCounts.CRITICAL / totalSignals) * 100}% ${((riskCounts.CRITICAL + riskCounts.HIGH) / totalSignals) * 100}%, #f59e0b ${((riskCounts.CRITICAL + riskCounts.HIGH) / totalSignals) * 100}% ${((riskCounts.CRITICAL + riskCounts.HIGH + riskCounts.MEDIUM) / totalSignals) * 100}%, #10b981 ${((riskCounts.CRITICAL + riskCounts.HIGH + riskCounts.MEDIUM) / totalSignals) * 100}% 100%)`;

  return (
    <main className="space-y-4 py-4">
      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          <CircleAlert className="size-4" />
          {error}
        </div>
      ) : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Expected need",
            valueOf(summary.totalPredictedDemand),
            "units needed next 7 days",
            "bg-red-50 text-red-600",
            TrendingUp,
          ],
          [
            "Groups to watch",
            atRisk,
            "need closer attention",
            "bg-amber-50 text-amber-600",
            AlertTriangle,
          ],
          [
            "Urgent items",
            critical,
            "need immediate action",
            "bg-rose-50 text-rose-600",
            CircleAlert,
          ],
          [
            "Items checked",
            predictions.length,
            "blood type and item pairs",
            "bg-violet-50 text-violet-600",
            BrainCircuit,
          ],
        ].map(([label, value, helper, iconWrap, Icon]) => (
          <div
            key={label}
            className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {isLoading ? (
                    <LoaderCircle className="size-7 animate-spin text-slate-300" />
                  ) : (
                    value
                  )}
                </p>
              </div>
              <span
                className={`grid size-10 place-items-center rounded-lg ${iconWrap}`}
              >
                <Icon className="size-5" />
              </span>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">{helper}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-black text-slate-950">
                Expected need by blood item
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Red bars show how many units may be needed in the next 7 days.
              </p>
            </div>
            <Droplet className="size-5 fill-red-500 text-red-500" />
          </div>
          <div className="mt-6 space-y-5">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoaderCircle className="size-6 animate-spin text-red-500" />
              </div>
            ) : null}
            {!isLoading && !componentData.length ? (
              <p className="py-8 text-center text-sm font-bold text-slate-400">
                No blood items need review right now.
              </p>
            ) : null}
            {componentData.map((item) => (
              <div key={item.component}>
                <div className="mb-2 flex justify-between text-xs font-black">
                  <span className="text-slate-800">{getComponentLabel(item.component)}</span>
                  <span className="text-slate-500">
                    {item.demand} expected units
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-red-50">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{
                        width: `${Math.max(4, (item.demand / maxDemand) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-black text-slate-800">
                    {item.demand}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-black text-slate-950">
                Shortage level
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                How serious the expected stock gap is
              </p>
            </div>
            <ShieldCheck className="size-5 text-emerald-600" />
          </div>
          <div className="mt-6 flex items-center gap-6">
            <div
              className="relative grid size-36 shrink-0 place-items-center rounded-full"
              style={{ background: donutStops }}
            >
              <div className="grid size-24 place-items-center rounded-full bg-white text-center">
                <p className="text-2xl font-black text-slate-950">
                  {predictions.length}
                </p>
                <p className="text-[10px] font-black uppercase text-slate-400">
                  checked
                </p>
              </div>
            </div>
            <div className="w-full space-y-2.5">
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((risk) => (
                <div
                  key={risk}
                  className="flex items-center gap-2 text-xs font-black text-slate-600"
                >
                  <span
                    className={`size-2.5 rounded-full ${riskStyles[risk].bar}`}
                  />
                  {riskLabels[risk] || risk}
                  <span className="ml-auto text-slate-900">
                    {riskCounts[risk]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-black text-slate-950">
                Need by blood group
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Taller bars mean more units may be needed next week.
              </p>
            </div>
            <TrendingUp className="size-5 text-red-500" />
          </div>
          <div className="mt-5 flex h-60 items-end gap-2 border-b border-l border-slate-100 px-2 pb-2">
            {isLoading ? (
              <div className="flex w-full justify-center self-center">
                <LoaderCircle className="size-6 animate-spin text-red-500" />
              </div>
            ) : null}
            {!isLoading && !bloodGroupData.length ? (
              <p className="w-full self-center text-center text-sm font-bold text-slate-400">
                No blood group needs to show right now.
              </p>
            ) : null}
            {!isLoading &&
              bloodGroupData.map((item) => {
                const height = Math.max(
                  8,
                  (item.demand / maxBloodGroupDemand) * 100,
                );
                return (
                  <div
                    key={item.bloodGroup}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-xs font-black text-slate-700">
                      {item.demand}
                    </span>
                    <div className="flex h-40 w-full items-end justify-center">
                      <div
                        className="w-full max-w-10 rounded-t-lg bg-red-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-black text-slate-500">
                      {item.bloodGroup}
                    </span>
                  </div>
                );
              })}
          </div>
          <p className="mt-3 text-[11px] font-bold text-slate-400">
            Values show estimated units across all blood items.
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-black text-slate-950">
                Top collection priorities
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Start with the items needing the most extra units.
              </p>
            </div>
            <AlertTriangle className="size-5 text-amber-500" />
          </div>
          <div className="mt-5 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoaderCircle className="size-6 animate-spin text-red-500" />
              </div>
            ) : null}
            {!isLoading && !priorityData.length ? (
              <p className="py-8 text-center text-sm font-bold text-slate-400">
                No extra collection is suggested right now.
              </p>
            ) : null}
            {!isLoading &&
              priorityData.map((item, index) => {
                const risk = riskStyles[item.riskLevel] || riskStyles.LOW;
                const width = Math.max(
                  8,
                  (valueOf(item.recommendedUnits) / maxPriorityUnits) * 100,
                );
                return (
                  <div key={`${item.component}-${item.bloodGroup}-priority`}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-md bg-slate-100 text-[11px] font-black text-slate-700">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-slate-900">
                          {item.bloodGroup} {getComponentLabel(item.component)}
                        </p>
                        <p className="text-[11px] font-bold text-slate-500">
                          {riskLabels[item.riskLevel] || item.riskLevel}
                        </p>
                      </div>
                      <span className="ml-auto text-xs font-black text-red-600">
                        {valueOf(item.recommendedUnits)} units
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-red-50">
                      <div
                        className={`h-full rounded-full ${risk.bar}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-black text-slate-950">
              Blood items to review
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Suggested action by blood type and blood item
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedComponent}
              onChange={(event) => setSelectedComponent(event.target.value)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 outline-none transition hover:border-red-200 focus:border-red-300 focus:ring-2 focus:ring-red-100"
              aria-label="Select blood item type"
            >
              {filterOptions.map((option) => (
                <option key={option.component} value={option.component}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="text-xs font-black text-slate-400">
              {filteredPredictions.length} results
            </span>
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
          {!isLoading && !filteredPredictions.length ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-400 sm:col-span-2 xl:col-span-3">
              No cards found for this blood item.
            </div>
          ) : null}
          {filteredPredictions.map((item, index) => {
            const risk = riskStyles[item.riskLevel] || riskStyles.LOW;
            const Icon = risk.icon;
            return (
              <article
                key={`${item.component}-${item.bloodGroup}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)]"
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${risk.bar}`} />
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100 transition group-hover:bg-red-600 group-hover:text-white">
                      <Droplet className="size-4 fill-current" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-950">
                        {item.bloodGroup}
                      </h3>
                      <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                        {getComponentLabel(item.component)}{" "}
                        <span className="mx-1 text-slate-300">/</span> next 7
                        days
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ring-inset ring-current/10 ${risk.badge}`}
                  >
                    <Icon className="size-3" />
                    {riskLabels[item.riskLevel] ||
                      item.riskLevel ||
                      "Enough stock"}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                      Estimated need
                    </p>
                    <p className="mt-1 text-xl font-black text-slate-950">
                      {valueOf(item.predictedDemand)}{" "}
                      <span className="text-[10px] text-slate-400">units</span>
                    </p>
                  </div>
                  <div
                    className={`rounded-lg border px-3 py-2.5 ${
                      valueOf(item.recommendedUnits) > 0
                        ? "border-red-100 bg-red-50/70"
                        : "border-emerald-100 bg-emerald-50/60"
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                      Extra to collect
                    </p>
                    <p
                      className={`mt-1 text-xl font-black ${
                        valueOf(item.recommendedUnits) > 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {valueOf(item.recommendedUnits)}{" "}
                      <span className="text-[10px] text-slate-400">units</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Simple reason
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                    {item.reason || "No explanation provided."}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="rounded-lg border border-amber-100 bg-amber-50/60 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-white text-amber-600 shadow-sm">
            <Lightbulb className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-black text-slate-950">
              Forecast notes
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              What this means for your current stock
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {(prediction.insights || []).map((insight, index) => (
            <div
              key={`${insight}-${index}`}
              className="rounded-md bg-white/80 px-3 py-3 text-xs font-bold leading-5 text-slate-700"
            >
              {insight}
            </div>
          ))}
          {!isLoading && !(prediction.insights || []).length ? (
            <div className="rounded-md bg-white/80 px-3 py-3 text-xs font-bold leading-5 text-slate-600">
              No additional insights for this forecast. Your current inventory
              appears sufficient for the detected demand.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
};
