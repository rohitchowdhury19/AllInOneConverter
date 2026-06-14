import { useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import ToolPageTemplate from "../components/ToolPageTemplate";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function PdfSplit() {
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("1");
  const [totalPages, setTotalPages] = useState(null);

  // Load total page count using pdfjs whenever a file is validated
  const validateFile = useCallback(async (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setTotalPages(pdf.numPages);
        setStartPage("1");
        setEndPage(String(pdf.numPages));
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
    setTotalPages(null);
    setStartPage("1");
    setEndPage("1");
  };

  const clamp = (val, min, max) =>
    Math.min(Math.max(Number(val), min), max);

  const handleSplitSubmit = async ({ file, setStatusMessage, setLoading, setStatusType }) => {
    const sp = parseInt(startPage, 10);
    const ep = parseInt(endPage, 10);

    if (isNaN(sp) || isNaN(ep)) {
      setStatusMessage("Please enter valid page numbers.");
      setStatusType("error");
      setLoading(false);
      return;
    }
    if (sp < 1) {
      setStatusMessage("Start page must be at least 1.");
      setStatusType("error");
      setLoading(false);
      return;
    }
    if (totalPages && ep > totalPages) {
      setStatusMessage(`End page cannot exceed ${totalPages} (total pages).`);
      setStatusType("error");
      setLoading(false);
      return;
    }
    if (sp > ep) {
      setStatusMessage("Start page cannot be greater than end page.");
      setStatusType("error");
      setLoading(false);
      return;
    }

    setStatusMessage("Splitting PDF...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("start_page", startPage);
      formData.append("end_page", endPage);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/split-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Split failed. Please try again.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.pdf$/i, "");
      a.download = `${baseName}_pages_${startPage}-${endPage}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage(`Success! Pages ${startPage}–${endPage} extracted and downloaded.`);
      setStatusType("success");
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
      setStatusType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  const extraFields = ({ file }) => {
    if (!file) return null;
    return (
      <div className="w-full space-y-4 mb-8 text-left bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Select Page Range
          {totalPages !== null && (
            <span className="ml-auto text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
              1 – {totalPages}
            </span>
          )}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Start Page */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Start Page
            </span>
            <input
              type="number"
              min={1}
              max={totalPages ?? undefined}
              value={startPage}
              onChange={(e) => {
                const val = e.target.value;
                setStartPage(val);
                if (parseInt(val, 10) > parseInt(endPage, 10)) {
                  setEndPage(val);
                }
              }}
              onBlur={(e) => {
                const clamped = clamp(
                  e.target.value,
                  1,
                  totalPages ?? (parseInt(endPage, 10) || 1)
                );
                setStartPage(String(clamped));
                if (clamped > parseInt(endPage, 10)) setEndPage(String(clamped));
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
          </label>

          {/* End Page */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              End Page
            </span>
            <input
              type="number"
              min={parseInt(startPage, 10) || 1}
              max={totalPages ?? undefined}
              value={endPage}
              onChange={(e) => setEndPage(e.target.value)}
              onBlur={(e) => {
                const sp = parseInt(startPage, 10) || 1;
                const clamped = clamp(
                  e.target.value,
                  sp,
                  totalPages ?? Math.max(sp, parseInt(e.target.value, 10) || sp)
                );
                setEndPage(String(clamped));
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
          </label>
        </div>

        {/* Summary pill */}
        {startPage && endPage && parseInt(startPage) <= parseInt(endPage) && (
          <p className="mt-3 text-xs text-blue-605 dark:text-blue-400 font-bold">
            ✦ Will extract{" "}
            <span className="font-extrabold underline decoration-blue-500/30">
              {Math.max(0, parseInt(endPage, 10) - parseInt(startPage, 10) + 1)}
            </span>{" "}
            page
            {parseInt(endPage, 10) - parseInt(startPage, 10) + 1 !== 1 ? "s" : ""}
            {" "}(
            {parseInt(startPage, 10) === parseInt(endPage, 10)
              ? `page ${startPage}`
              : `pages ${startPage} – ${endPage}`}
            )
          </p>
        )}
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Split PDF"
      description="Extract specific pages or page ranges from a PDF"
      accept=".pdf"
      validateFile={validateFile}
      onSubmit={handleSplitSubmit}
      onClear={handleClear}
      submitButtonText="Split PDF"
      loadingButtonText="Splitting..."
      extraFields={extraFields}
      maxWidthClass="max-w-[600px]"
      inputId="split-file-input"
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
            d="M16 14H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 11V17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      defaultText="Choose PDF file or drag & drop here"
      supportText="Single PDF · Pages will be detected automatically"
    />
  );
}

export default PdfSplit;
