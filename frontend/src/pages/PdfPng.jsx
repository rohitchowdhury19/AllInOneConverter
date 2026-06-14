import React, { useCallback, useState } from "react";

import JSZip from "jszip";

import ToolPageTemplate from "../components/ToolPageTemplate";

// Set worker source for PDF.js


const PdfPng = () => {
  const [scale, setScale] = useState(2.0); // Default scale (2x)
  const [pageMode, setPageMode] = useState("all"); // all, single, range
  const [pageRange, setPageRange] = useState("");
  const [singlePage, setSinglePage] = useState("1");
  const [numPages, setNumPages] = useState(0);
  const [language, setLanguage] = useState("eng");

  const validateFile = useCallback(async (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfjsLib = await import("pdfjs-dist");

const pdfWorker = await import(
  "pdfjs-dist/build/pdf.worker.min.mjs?url"
);

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;

const pdf = await pdfjsLib.getDocument({
  data: arrayBuffer,
}).promise;
        setNumPages(pdf.numPages);
      } catch (err) {
        console.error("Error loading PDF info:", err);
      }
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
    setNumPages(0);
    setPageRange("");
    setSinglePage("1");
    setPageMode("all");
  };

  const handleCustomSubmit = async ({ file, setStatusMessage, setLoading, setStatusType }) => {
    setStatusMessage("Processing PDF... This may take a while for large files.");
    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");

const pdfWorker = await import(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"
);

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      let pagesToRender = [];
      if (pageMode === "all") {
        pagesToRender = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else if (pageMode === "single") {
        const pageNum = parseInt(singlePage);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
          throw new Error(
            `Invalid page number: ${singlePage}. Please enter a value between 1 and ${totalPages}.`,
          );
        }
        pagesToRender = [pageNum];
      } else if (pageMode === "range") {
        const ranges = pageRange.split(",").map((r) => r.trim());
        ranges.forEach((r) => {
          if (r.includes("-")) {
            const [start, end] = r.split("-").map(Number);
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= totalPages) pagesToRender.push(i);
            }
          } else {
            const num = Number(r);
            if (num >= 1 && num <= totalPages) pagesToRender.push(num);
          }
        });
      }

      // Deduplicate and sort
      pagesToRender = [...new Set(pagesToRender)].sort((a, b) => a - b);

      if (pagesToRender.length === 0) {
        throw new Error("No valid pages selected");
      }

      const zip = new JSZip();
      const results = [];

      for (let i = 0; i < pagesToRender.length; i++) {
        const pageNum = pagesToRender[i];
        setStatusMessage(
          `Rendering page ${pageNum} (${i + 1}/${pagesToRender.length})...`,
        );
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        results.push({ name: `page-${pageNum}.png`, blob });
      }

      if (results.length === 1) {
        const url = window.URL.createObjectURL(results[0].blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(/\.pdf$/i, ".png");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setStatusMessage("Success! Your PNG file has been downloaded.");
        setStatusType("success");
      } else {
        setStatusMessage("Packaging files into ZIP...");
        results.forEach((res) => zip.file(res.name, res.blob));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name.replace(/\.pdf$/i, "")}_pages.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setStatusMessage(
          `Success! ZIP file with ${results.length} pages downloaded.`,
        );
        setStatusType("success");
      }

      setTimeout(() => setStatusMessage(""), 5000);
    } catch (error) {
      console.error("Client-side conversion error:", error);
      setStatusMessage("Client conversion failed — trying server fallback...");
      setStatusType("info");

      // Attempt server-side conversion fallback
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("language", language); 

        const tryUrls = ["/convertPng", "http://localhost:5000/convertPng"];

        let response = null;
        for (const url of tryUrls) {
          try {
            response = await fetch(url, { method: "POST", body: form });
            if (response && response.ok) break;
          } catch (e) {
            console.warn("Server convert attempt failed:", url, e);
            response = null;
          }
        }

        if (response && response.ok) {
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = file.name.replace(/\.pdf$/i, ".png");
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(downloadUrl);
          setStatusMessage("Success! PNG downloaded from server fallback.");
          setStatusType("success");
        } else {
          const msg = response
            ? await response.text()
            : "Server conversion unavailable";
          setStatusMessage(`Error: ${msg}`);
          setStatusType("error");
        }
      } catch (serverErr) {
        console.error("Server fallback error:", serverErr);
        setStatusMessage(`Error: ${error.message || "Failed to convert file"}`);
        setStatusType("error");
      }

      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const extraFields = ({ file }) => {
    if (!file) return null;
    return (
      <div className="w-full space-y-6 mb-8 text-left bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
        {/* Quality Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quality / DPI
            </label>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-xs">
              {scale.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 transition-all"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            <span>Standard (1x)</span>
            <span>High (3x)</span>
            <span>Ultra (5x)</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Document Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-medium cursor-pointer"
          >
            <option value="eng">🇬🇧 English (Default)</option>
            <option value="hin">🇮🇳 Hindi (हिन्दी)</option>
            <option value="spa">🇪🇸 Spanish (Español)</option>
            <option value="fra">🇫🇷 French (Français)</option>
            <option value="deu">🇩🇪 German (Deutsch)</option>
          </select>
        </div>

        {/* Page Selection */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Page Selection {numPages > 0 && `(Total: ${numPages})`}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["all", "single", "range"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPageMode(mode)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                  pageMode === mode
                    ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)] scale-[1.01]"
                    : "bg-white dark:bg-slate-950 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-450"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {pageMode === "single" && (
            <div className="animate-in zoom-in-95 duration-200">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Page:
                </span>
                <input
                  type="number"
                  min="1"
                  max={numPages}
                  value={singlePage}
                  onChange={(e) => setSinglePage(e.target.value)}
                  className="w-24 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-colors bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold text-center"
                />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                  of {numPages}
                </span>
              </div>
            </div>
          )}

          {pageMode === "range" && (
            <div className="animate-in zoom-in-95 duration-200">
              <input
                type="text"
                placeholder="e.g. 1-3, 5"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-colors bg-white dark:bg-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-800 dark:text-slate-100 font-medium"
              />
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-550">
                Enter page numbers or ranges (e.g., 1-5, 8, 10-12)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="PDF to PNG Converter"
      description="Convert PDF pages to high-quality PNG images"
      accept=".pdf"
      validateFile={validateFile}
      onSubmit={handleCustomSubmit}
      onClear={handleClear}
      submitButtonText="Convert to PNG"
      loadingButtonText="Converting..."
      extraFields={extraFields}
      maxWidthClass="max-w-[600px]"
      inputId="file-input"
      defaultIcon={
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2V8H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 18V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 15L12 12L15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      defaultText="Choose PDF file or drag & drop here"
      supportText="Click to browse or drop your PDF file"
    />
  );
};

export default PdfPng;
