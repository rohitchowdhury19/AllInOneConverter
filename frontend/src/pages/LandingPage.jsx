import React from "react";
import { lazy, Suspense } from "react";

import Navbar from "../components/Landing/Navbar";
import HeroSection from "../components/Landing/HeroSection";

const FeatureSection = lazy(() =>
  import("../components/Landing/FeatureSection")
);

const ToolsGrid = lazy(() =>
  import("../components/Landing/ToolsGrid")
);

const TrustBanner = lazy(() =>
  import("../components/Landing/TrustBanner")
);

const Footer = lazy(() =>
  import("../components/Landing/Footer")
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-950 dark:selection:text-blue-200 overflow-x-hidden relative">
      {/* Premium Dotted Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-80" />

      {/* Decorative Glow Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-blue-500/8 dark:bg-blue-500/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-indigo-500/8 dark:bg-indigo-500/4 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Row */}
        <Suspense fallback={null}>
          <FeatureSection />
          
          {/* Tools Grid Section */}
          <ToolsGrid />
          
          {/* Trust Banner */}
          <TrustBanner />
        </Suspense>
      </main>

      {/* Footer */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default LandingPage;
