import Link from "next/link";

const steps = [
  { href: "/merchant", label: "Merchant" },
  { href: "/merchant/predictions", label: "Predictions" },
  { href: "/merchant/recommendations", label: "Recommendations" },
  { href: "/rescue", label: "Resident" },
  { href: "/merchant/analytics", label: "Impact" },
];

export function DemoNav() {
  return (
    <nav
      aria-label="FoodRescue demo"
      className="flex flex-wrap gap-1 rounded-xl border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-900 dark:bg-emerald-950/30"
    >
      {steps.map((step) => (
          <Link
            key={step.href}
            href={step.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-emerald-100 dark:hover:bg-emerald-900"
          >
            {step.label}
          </Link>
      ))}
    </nav>
  );
}
