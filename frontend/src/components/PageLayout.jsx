import React, { lazy, Suspense } from "react";
import Navbar from "./Landing/Navbar";

const Footer = lazy(() => import("./Landing/Footer"));

const PageLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-x-hidden transition-colors duration-300 selection:bg-purple-200 selection:text-purple-900 dark:selection:bg-purple-600 dark:selection:text-white">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-72 h-72 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl" />

        <div className="absolute bottom-0 -right-40 w-72 h-72 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Header */}
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-purple-300 bg-clip-text text-transparent">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </header>

          {children}
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

// Shared Section Component
export const Section = ({ title, children }) => (
  <section className="mb-8">
    {title && (
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3">
        {title}
      </h2>
    )}

    <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
      {children}
    </div>
  </section>
);

export default PageLayout;