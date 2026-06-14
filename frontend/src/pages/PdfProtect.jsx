import React, { useState, useCallback } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { FileText, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

function PdfProtect() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Error: Please select a PDF file",
    };
  }, []);

  const handleClear = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const validatePassword = () => {
    if (!password) {
      return "Password is required.";
    }
    if (password.length < 4) {
      return "Password must be at least 4 characters long.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleCustomSubmit = async ({ file, setStatusMessage, setLoading, setStatusType }) => {
    const passwordError = validatePassword();
    if (passwordError) {
      setStatusMessage(passwordError);
      setStatusType("error");
      setTimeout(() => setStatusMessage(""), 4000);
      return;
    }

    setLoading(true);
    setStatusMessage("Protecting PDF...");
    setStatusType("info");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      const response = await fetch(`${BACKEND_URL}/protect-pdf`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const baseName = file.name.replace(/\.pdf$/i, "");
        a.download = `${baseName}_protected.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setStatusMessage("Success! Your protected PDF is downloading.");
        setStatusType("success");
        // Clear passwords for safety
        setPassword("");
        setConfirmPassword("");
      } else {
        const error = await response.json();
        setStatusMessage(`Error: ${error.error || "Failed to encrypt PDF"}`);
        setStatusType("error");
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message || "Failed to contact server"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  const extraFields = ({ file }) => {
    if (!file) return null;
    return (
      <div className="w-full mb-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-left animate-in fade-in slide-in-from-top-4 duration-300">
        <p className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Lock className="w-4.5 h-4.5 text-blue-500 dark:text-blue-400" />
          Encryption Options
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Password Field */}
          <label className="flex flex-col gap-1.5 relative">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider">
              Choose Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          {/* Confirm Password Field */}
          <label className="flex flex-col gap-1.5 relative">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider">
              Confirm Password
            </span>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>
        </div>

        {/* Warning Box */}
        <div className="flex gap-2.5 items-start bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-amber-800 dark:text-amber-350 text-xs font-medium">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-250">Important security warning:</span> We do not store your password and cannot recover it. Make sure to keep it in a safe place.
          </div>
        </div>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Protect PDF"
      description="Encrypt and password-protect your PDF files."
      accept=".pdf,application/pdf"
      validateFile={validateFile}
      onSubmit={handleCustomSubmit}
      onClear={handleClear}
      submitButtonText="Protect PDF"
      loadingButtonText="Protecting..."
      extraFields={extraFields}
      maxWidthClass="max-w-[600px]"
      inputId="pdf-protect-input"
      defaultIcon={<FileText className="w-16 h-16" />}
      defaultText="Choose PDF file or drag & drop here"
      supportText="Click to browse or drop your PDF file"
    />
  );
}

export default PdfProtect;
