import React from "react";

const FeatureCard = ({ icon, title, description, gradient, index }) => (
  <div
    className="group relative p-8 rounded-2xl bg-white dark:bg-slate-900/40 shadow-[0_2px_12px_rgba(0,0,0,0.01)] border border-slate-200/85 dark:border-slate-800/80 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/35 dark:hover:border-blue-500/35 animate-fade-in-up"
    style={{ animationDelay: `${800 + index * 100}ms` }}
  >
    {/* Subtle gradient hover glow overlay */}
    <div
      className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10"
      style={{
        background: `linear-gradient(135deg, ${gradient?.split(" ")?.[1] || "rgba(59,130,246,0.1)"}, transparent)`,
      }}
    />

    {/* Icon Container */}
    <div
      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-[1px] mb-6 shadow-xs group-hover:scale-105 transition-transform duration-300`}
    >
      <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-950 flex items-center justify-center">
        {icon}
      </div>
    </div>

    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">{description}</p>
  </div>
);

export default FeatureCard;