import React from "react";
import {
  Shield,
  Globe,
  ArrowRight,
  Sparkles,
  FileText,
  Image,
  ScanText,
} from "lucide-react";

const HeroSection = () => {
  const tools = [
    {
      icon: <FileText className="w-4 h-4" />,
      label: "PDF → PNG",
    },
    {
      icon: <Image className="w-4 h-4" />,
      label: "Remove Background",
    },
    {
      icon: <ScanText className="w-4 h-4" />,
      label: "Image OCR",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "PDF Merge",
    },
  ];

  const stats = [
    { value: "25+", label: "Tools" },
    { value: "100%", label: "Privacy Focused" },
    { value: "<5s", label: "Processing" },
    { value: "24/7", label: "Available" },
  ];

  const trustItems = [
    "Client-side processing",
    "No file retention",
    "Open Source",
  ];

  return (
    <section
      id="home"
      className="relative max-w-7xl mx-auto px-6 pt-36 pb-32 overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute right-0 top-40 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-200 dark:border-blue-900 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg mb-10">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Fast • Secure • Privacy First
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-7xl lg:text-[92px] font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white">
          The Modern Toolkit
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            For Every File
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-3xl mx-auto mt-8 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
          Convert PDFs, images, documents and more with blazing-fast tools
          designed for privacy. Most operations run directly in your browser.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mt-12">
          <a
            href="#tools"
            className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <span className="flex items-center gap-2">
              Explore Tools
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          <div className="px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span className="font-medium text-slate-800 dark:text-slate-100">
                Free • No Registration • Unlimited
              </span>
            </div>
          </div>
        </div>

        {/* Tool Cards */}
        <div className="hidden lg:flex justify-center gap-4 flex-wrap mt-16">
          {tools.map((tool) => (
            <div
              key={tool.label}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-lg hover:scale-105 transition-all text-slate-800 dark:text-slate-100"
            >
              {tool.icon}
              <span className="font-medium text-sm">{tool.label}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-lg"
            >
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </h3>

              <p className="text-slate-500 dark:text-slate-400 mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Row */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm">
          {trustItems.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400"
            >
              <Shield className="w-4 h-4 text-emerald-500" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;