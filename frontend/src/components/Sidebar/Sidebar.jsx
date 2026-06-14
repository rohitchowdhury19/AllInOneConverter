import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, X, ChevronLeft, ChevronRight } from "lucide-react";
import tools from "../../data/toolsData";

const Sidebar = ({ activeTab, isMobileMenuOpen, isMobile, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
   
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
 
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

    return (
      toolName.includes(query) ||
      toolDescription.includes(query)
    );
  });

  const menuItems = filteredTools.map((t) => ({
    id: t.id,
    label: t.name,
    icon: t.icon, // Pass the raw icon
    description: t.description,
    category: t.category || "Utilities", // Default to an existing category
  }));

  const groupedTools = menuItems.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  const categoryOrder = [
    "PDF Tools",
    "Image Tools",
    "AI Tools",
    "Conversion Tools",
    "Utilities",
  ];

  const visibleCategories = categoryOrder.filter((category) => groupedTools[category]);

  const handleNavigation = (id) => {
    navigate(`/${id}`);
    if (isMobile) onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9998]"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`
          ${isMobile ? "fixed" : "sticky"} 
          top-0 left-0 h-screen bg-white dark:bg-slate-900
          text-slate-900 dark:text-slate-100 transition-all duration-300 ease-in-out z-[10000]
          ${isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}
          ${!isMobile && isCollapsed ? "w-20" : "w-80"}
          flex flex-col shadow-2xl border-r border-slate-200/50 dark:border-slate-800/50
        `}
      >
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            {(!isCollapsed || isMobile) && (
              <Link
                to="/"
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              >
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">
                  AllInOneConverter
                </span>
              </Link>
            )}
            <button
              onClick={isMobile ? onClose : toggleSidebar}
              aria-label={
                isMobile
                  ? "Close sidebar"
                  : isCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ${
                isCollapsed && !isMobile ? "mx-auto" : ""
              }`}
            >
              {isMobile ? (
                <X className="w-5 h-5" />
              ) : isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {!isCollapsed && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all"
              />
            </div>
          )}

          {visibleCategories.length > 0 ? (
            visibleCategories.map((category) => {
              const items = groupedTools[category];

              return (
                <div key={category} className="mb-6 animate-in fade-in duration-300">
                  {!isCollapsed && (
                    <h3 className="px-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {category}
                    </h3>
                  )}

                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleNavigation(item.id)}
                          className={`
                            w-full flex ${
                              isCollapsed ? "flex-col" : "flex-row"
                            } items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer
                            ${
                              activeTab === item.id
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] font-semibold"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-350"
                            }
                            ${isCollapsed ? "justify-center" : ""}
                          `}
                          title={isCollapsed ? item.label : ""}
                        >
                          <span className={`flex-shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                            {typeof item.icon === "function" ? (
                              <item.icon className="w-5 h-5" />
                            ) : React.isValidElement(item.icon) ? (
                              React.cloneElement(item.icon, { className: "w-5 h-5" })
                            ) : null}
                          </span>

                          {!isCollapsed && (
                            <div className="flex-1 text-left">
                              <div className={`font-semibold text-sm ${activeTab === item.id ? 'text-white' : 'text-slate-850 dark:text-slate-200'}`}>{item.label}</div>
                              <div className={`text-xs mt-0.5 ${activeTab === item.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-450'}`}>
                                {item.description}
                              </div>
                            </div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ); 
            })
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-600 py-6">
              No tools found
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
