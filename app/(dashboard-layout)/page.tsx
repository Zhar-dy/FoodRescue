import Link from "next/link";
import { ArrowRight, Leaf, ShoppingBag, Store } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-[#163d2c] px-6 py-10 text-white sm:p-12">
        <p className="text-sm font-semibold text-[#b9edaa]">GOOD FOOD. A SECOND CHANCE.</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Predict surplus. Rescue it before closing.</h1>
        <p className="mt-5 max-w-2xl leading-7 text-emerald-50/90">FoodRescue AI helps township bakeries estimate unsold food, publish a rescue offer, and connect with nearby residents who can collect it.</p>
        <p className="mt-5 text-sm text-emerald-100">Machine-learning forecasting trained on synthetic bakery history, connected to a working rescue flow.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: "Merchant workspace", href: "/merchant", icon: Store, text: "Update stock, check the forecast, publish an offer and confirm collection.", action: "Open merchant" },
          { title: "Resident offers", href: "/rescue", icon: ShoppingBag, text: "Find the bakery’s published offer, reserve food and view pickup status.", action: "Open resident" },
        ].map(({ title, href, icon: Icon, text, action }) => (
          <section key={href} className="space-y-4 rounded-2xl border border-[#dce3d8] bg-white p-6">
            <Icon className="size-7 text-emerald-800" aria-hidden="true" />
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="leading-6 text-[#647269]">{text}</p>
            <Link href={href} className="inline-flex items-center gap-2 font-semibold text-emerald-800 underline underline-offset-4">{action} <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </section>
        ))}
      </div>
      <section className="space-y-4 rounded-2xl border border-[#dce3d8] bg-white p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold"><Leaf className="size-5 text-emerald-800" aria-hidden="true" /> A small township loop</h2>
        <p className="leading-7 text-[#647269]">Inventory → prediction → rescue offer → reservation → collection → measured impact.</p>
        <div className="grid gap-4 text-sm sm:grid-cols-3">
          <p><strong>Residents:</strong> access lower-priced food close to home.</p>
          <p><strong>Merchants:</strong> recover revenue from food at risk of going unsold.</p>
          <p><strong>Planet:</strong> track food collected instead of counting reservations as waste saved.</p>
        </div>
        <p className="border-t pt-4 text-sm leading-6 text-[#647269]">Use merchant and resident views in the same browser. Distance is illustrative; there are no payments, real notifications or separate user accounts in this prototype.</p>
      </section>
    </div>
  );
}
