import { useState } from "react";
import {
  FileText,
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../../context/theme-context";

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navItems = [
    { name: "Home", link: "#home" },
    { name: "Features", link: "#feature" },
    { name: "Tools", link: "#tools" },
    { name: "Privacy", link: "#privacy" },
  ];

  const handleMobileNavClick = (itemName) => {
    setActiveSection(itemName.toLowerCase());
    setIsMenuOpen(false);
  };

  const handleDesktopNavClick = (itemName) => {
    setActiveSection(itemName.toLowerCase());
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-7xl">
      <div
        className="
          h-[72px]
          px-6
          flex
          items-center
          justify-between
          rounded-3xl
          border
          border-white/20
          bg-white/70
          dark:bg-slate-900/70
          backdrop-blur-2xl
          shadow-[0_10px_40px_rgba(0,0,0,0.08)]
        "
      >
        {/* Logo */}
        <a href="#home" className="group flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 blur-xl opacity-50 group-hover:opacity-80 transition-all duration-300" />

            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="leading-none">
            <h1 className="font-black text-xl text-slate-900 dark:text-white">
                AllInOneConverter
                </h1>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                   Convert • Compress • Optimize
                    </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={() => handleDesktopNavClick(item.name)}
              className={`
                px-4 py-2.5
                rounded-full
                font-medium
                transition-all
                duration-300
                ${
                  activeSection === item.name.toLowerCase()
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }
              `}
            >
              {item.name}
            </a>
          ))}

          {/* CTA Button */}
          <a
            href="#tools"
            className="
              ml-2
              flex
              items-center
              gap-2
              px-5
              py-2.5
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-indigo-600
              text-white
              font-semibold
              shadow-lg
              hover:shadow-xl
              hover:scale-105
              transition-all
            "
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="
              ml-2
              w-11
              h-11
              flex
              items-center
              justify-center
              rounded-xl
              bg-white/70
              dark:bg-slate-800/70
              backdrop-blur-xl
              border
              border-slate-200
              dark:border-slate-700
              hover:scale-105
              transition-all
            "
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="
              w-10
              h-10
              flex
              items-center
              justify-center
              rounded-xl
              bg-white/70
              dark:bg-slate-800/70
              backdrop-blur-xl
              border
              border-slate-200
              dark:border-slate-700
            "
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
            className="
              w-10
              h-10
              flex
              items-center
              justify-center
              rounded-xl
              bg-white/70
              dark:bg-slate-800/70
              backdrop-blur-xl
              border
              border-slate-200
              dark:border-slate-700
            "
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          lg:hidden
          mt-3
          rounded-3xl
          backdrop-blur-2xl
          bg-white/90
          dark:bg-slate-900/90
          border
          border-white/20
          shadow-2xl
          overflow-hidden
          transition-all
          duration-300
          ${
            isMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }
        `}
      >
        <div className="p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={() => handleMobileNavClick(item.name)}
              className={`
                px-4
                py-3
                rounded-xl
                font-medium
                transition-all
                ${
                  activeSection === item.name.toLowerCase()
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }
              `}
            >
              {item.name}
            </a>
          ))}

          <a
            href="#tools"
            className="
              mt-2
              flex
              items-center
              justify-center
              gap-2
              py-3
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-indigo-600
              text-white
              font-semibold
            "
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;