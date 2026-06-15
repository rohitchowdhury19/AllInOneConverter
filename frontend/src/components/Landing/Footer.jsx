import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Lock,
  Linkedin,
  Mail,
  Github,
  Heart,
  Shield,
  Globe,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 border-t border-slate-200 dark:border-gray-700">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
           <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-xl group-hover:shadow-lg transition-all duration-300">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>

                <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-white dark:via-slate-200 dark:to-purple-300 bg-clip-text text-transparent">
                 AllInOneConverter
                  </span>
                  </Link>

            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              All-in-one toolkit for PDF, image and document conversion.
              Fast, secure, privacy-focused and completely free to use.
            </p>

            <div className="flex gap-3 pt-2">
              <a
                href="https://www.linkedin.com/in/rohit-chowdhury-7a965a191/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-100 hover:bg-purple-100 rounded-lg transition-all"
              >
                <Linkedin className="w-4 h-4 text-slate-600 hover:text-purple-600" />
              </a>

              <a
                href="mailto:rohita3648@gmail.com"
                className="p-2 bg-slate-100 hover:bg-purple-100 rounded-lg transition-all"
              >
                <Mail className="w-4 h-4 text-slate-600 hover:text-purple-600" />
              </a>

              <a
                href="https://github.com/rohitchowdhury19"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-100 hover:bg-purple-100 rounded-lg transition-all"
              >
                <Github className="w-4 h-4 text-slate-600 hover:text-purple-600" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-lg">
              Quick Links
            </h3>

            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-slate-500 hover:text-purple-600 text-sm"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="text-slate-500 hover:text-purple-600 text-sm"
                >
                  About Us
                </Link>
              </li>

              <li>
                <a
                  href="/#tools"
                  className="text-slate-500 hover:text-purple-600 text-sm"
                >
                  How it Works
                </a>
              </li>

              <li>
                <a
                  href="/#feature"
                  className="text-slate-500 hover:text-purple-600 text-sm"
                >
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-lg">
              Legal
            </h3>

            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-500 hover:text-purple-600 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/terms"
                  className="text-slate-500 hover:text-purple-600 text-sm"
                >
                  Terms of Service
                </Link>
              </li>

              <li>
                <Link
                  to="/cookies"
                  className="text-slate-500 hover:text-purple-600 text-sm"
                >
                  Cookie Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/gdpr"
                  className="text-slate-500 hover:text-purple-600 text-sm"
                >
                  GDPR Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-slate-500">
                <Lock className="w-3.5 h-3.5 text-green-600" />
                Zero Storage
              </div>

              <div className="flex items-center gap-1 text-slate-500">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                SSL Encrypted
              </div>

              <div className="flex items-center gap-1 text-slate-500">
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                100% Free
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>© {currentYear} AllInOneConverter</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3.5 h-3.5 text-red-500" />
                for the dev community
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;