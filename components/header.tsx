import Link from "next/link";
import { DollarSign } from "lucide-react";
import messages from "@/locales/pt-BR/calculator.json";

const APP_NAME = messages.appName;

function t<K extends keyof typeof messages>(key: K) {
  return messages[key];
}

export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10">
              <DollarSign className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-base sm:text-lg text-slate-50">
                {APP_NAME}
              </span>
              <span className="hidden text-[11px] text-slate-400 sm:inline">
                {t("headerSubtitle")}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link
                href="/app/calculator"
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                {t("headerNavCalculator")}
              </Link>

              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1 text-[11px] text-slate-500 cursor-default">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                {t("headerNavPlaceholder")}
              </span>
            </nav>

          </div>
        </div>
      </div>
    </header>
  );
}
