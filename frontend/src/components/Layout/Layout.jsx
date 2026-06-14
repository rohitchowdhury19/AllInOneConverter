import React, { useState, useEffect } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { Menu, Sun, Moon, Home } from "lucide-react";
import { useTheme } from "../../context/theme-context";

const Layout = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const isLandingPage = location.pathname === "/";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100">
      <Sidebar
        activeTab={location.pathname.substring(1)}
        isMobileMenuOpen={isMobileMenuOpen}
        isMobile={isMobile}
        onClose={closeMobileMenu}
      />
      <main className="flex-1 overflow-y-auto relative">
        {/* Floating Theme Toggle - Desktop only */}
        {!isMobile && (
          <button
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        )}

        {/* Floating Home Button - Desktop only */}
        {!isLandingPage && !isMobile && (
          <button
            onClick={() => navigate("/")}
            className="fixed top-4 right-16 z-40 flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(37,99,235,0.35)] cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </button>
        )}

        {/* Mobile Header */}
        {isMobile && (
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </button>
                <h1 className="text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">AllInOneConverter</h1>
              </div>

              {/* Action Buttons grouped together */}
              <div className="flex items-center gap-2 shrink-0">
                {!isLandingPage && (
                  <button
                    onClick={() => navigate("/")}
                    className="p-2 rounded-lg bg-blue-50 text-blue-650 dark:bg-blue-950/40 dark:text-blue-350 hover:bg-blue-100 transition-colors cursor-pointer"
                    aria-label="Go home"
                  >
                    <Home className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Adjusted padding top for mobile */}
        <div className={`min-h-full flex justify-center items-center pb-8 ${isMobile ? 'pt-4' : 'py-8'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;