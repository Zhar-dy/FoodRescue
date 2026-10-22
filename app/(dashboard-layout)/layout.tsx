import Link from "next/link";
import { Leaf } from "lucide-react";
import { DemoNav } from "@/components/foodrescue/demo-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8f2] text-[#1e2b24]">
      <header className="border-b border-[#dce3d8] bg-white">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold">
              <Leaf className="size-7 text-emerald-800" aria-hidden="true" /> FoodRescue AI
            </Link>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">Township prototype · ABC Bakery</span>
          </div>
          <DemoNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      <footer className="mx-auto max-w-6xl border-t border-[#dce3d8] px-4 py-5 text-xs leading-5 text-[#647269] sm:px-6">
        Demonstration only · Fixed time 7:30 PM, closing 9 PM · Data stays in this browser.
      </footer>
    </div>
  );
}

