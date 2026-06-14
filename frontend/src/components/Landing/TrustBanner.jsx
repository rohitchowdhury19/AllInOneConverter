import React from "react";
import { Globe, Star } from "lucide-react";

const TrustBanner = () => {
  return (
    <section id="privacy" className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900/40 backdrop-blur-md shadow-xl border border-slate-200/85 dark:border-slate-800/80 p-8 md:p-12">
        {/* Subtle decorative glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[80px] -z-10" />

        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Globe className="w-5 h-5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-450 text-sm font-bold tracking-wide uppercase">
                Privacy-First Processing
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              Your privacy is our priority
            </h3>
            <p className="text-slate-600 dark:text-slate-450 font-medium">
              Open source, auditable, and designed to avoid persistent storage
              of your files.
            </p>
          </div>
          
          {/* Star Rating Badge */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-950/60 px-6 py-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shrink-0">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-4.5 h-4.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="text-slate-900 dark:text-slate-100 font-black ml-2 text-lg">
              4.9
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-bold">/5</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
