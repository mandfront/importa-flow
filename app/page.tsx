"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, BarChart3, DollarSign } from "lucide-react";

import homeMessages from "@/locales/pt-BR/home.json";

const APP_NAME = "ImportaFlow";

type HomeMessages = typeof homeMessages;

function th<K extends keyof HomeMessages>(key: K): HomeMessages[K] {
  return homeMessages[key];
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(15,118,110,0.15),_transparent_55%)]" />
        </div>

        <section className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <div className="flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-1.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {th("heroBadgeLabel")}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-300">
                  {th("heroBetaBadge")}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-balance leading-tight">
                {APP_NAME}
              </h1>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-200 text-balance">
                {th("heroTitle")}
              </h2>
            </div>

            <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto text-balance leading-relaxed">
              {th("heroDescription")}
            </p>

            <div className="flex flex-col items-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-indigo-900/40"
              >
                <Link href="/pages/calculator">
                  {th("heroPrimaryCta")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <p className="text-xs text-slate-500">
                {th("heroSecondaryText")}
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 backdrop-blur">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-slate-50 text-lg">
                {th("feature1Title")}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {th("feature1Description")}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 backdrop-blur">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="font-semibold text-slate-50 text-lg">
                {th("feature2Title")}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {th("feature2Description")}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 backdrop-blur md:col-span-2">
              <h3 className="font-semibold text-slate-50 text-lg">
                {th("feature3Title")}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {th("feature3Description")}
              </p>
              <p className="text-[11px] text-slate-500">
                {th("feature3Disclaimer")}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
