import React, { useState } from "react";
import ToolCard from "./ToolCard";
import tools from "../../data/toolsData";
import { Sparkles, Search, Zap, Shield, Globe } from "lucide-react";

const CATEGORIES = [
  "All",
  "PDF Tools",
  "Image Tools",
  "Conversion Tools",
  "AI Tools",
];

const ToolsGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTools = tools.filter((tool) => {
    const query = searchQuery
      .toLowerCase()
      .trim()
      .replace(/[-_\s]+/g, "");

    const toolName = tool.name
      .toLowerCase()
      .replace(/[-_\s]+/g, "");

    const toolDescription = tool.description
      .toLowerCase()
      .replace(/[-_\s]+/g, "");

    const matchesCategory =
      activeCategory === "All" || tool.category === activeCategory;

    const matchesSearch =
      toolName.includes(query) || toolDescription.includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <section
      id="tools"
      className="relative max-w-7xl mx-auto px-6 py-32"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-16">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-200 dark:border-blue-900 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg mb-6">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Professional Tool Suite
          </span>
        </div>

        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
          Powerful Tools.
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            One Platform.
          </span>
        </h2>

        <p className="max-w-3xl mx-auto mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Convert, compress, optimize and transform files with
          blazing-fast browser-powered tools.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 text-center">
          <Zap className="w-6 h-6 mx-auto mb-3 text-blue-500" />
          <h3 className="font-bold text-2xl">{tools.length}+</h3>
          <p className="text-slate-500">Available Tools</p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 text-center">
          <Shield className="w-6 h-6 mx-auto mb-3 text-emerald-500" />
          <h3 className="font-bold text-2xl">100%</h3>
          <p className="text-slate-500">Privacy Focused</p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 text-center">
          <Globe className="w-6 h-6 mx-auto mb-3 text-indigo-500" />
          <h3 className="font-bold text-2xl">24/7</h3>
          <p className="text-slate-500">Always Available</p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full
              pl-14
              pr-4
              py-4
              rounded-2xl
              border
              border-slate-200
              dark:border-slate-800
              bg-white/70
              dark:bg-slate-900/70
              backdrop-blur-xl
              shadow-lg
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500/20
            "
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              px-5 py-2.5 rounded-full font-medium transition-all
              ${
                activeCategory === category
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                  : "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105"
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTools.map((tool, idx) => (
            <ToolCard key={tool.id} tool={tool} index={idx} />
          ))}
        </div>
      ) : (
        <div className="max-w-xl mx-auto text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <h3 className="text-xl font-bold mb-2">
            No matching tools found
          </h3>

          <p className="text-slate-500 mb-6">
            Try a different search term or category.
          </p>

          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("All");
            }}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};

export default ToolsGrid;