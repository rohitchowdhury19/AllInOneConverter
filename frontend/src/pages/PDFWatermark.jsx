import { useState, useRef, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const POSITION_OPTIONS = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

function PDFWatermark() {
  const [file, setFile] = useState(null);
  const [watermarkType, setWatermarkType] = useState("text");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [position, setPosition] = useState("bottom-right");
  const [opacity, setOpacity] = useState(60);
  const [size, setSize] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info"); // info | success | error

  const inputRef = useRef(null);
  const imageInputRef = useRef(null);

  const resetStatus = () => {
    setStatusMessage("");
    setStatusType("info");
  };

  const handlePdfUpload = useCallback((incoming) => {
    const pdf = Array.from(incoming).find((f) => f.type === "application/pdf");
    if (!pdf) {
      setStatusMessage("Only PDF files are accepted.");
      setStatusType("error");
      return;
    }

    resetStatus();
    setFile(pdf);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      handlePdfUpload(e.dataTransfer.files);
    },
    [handlePdfUpload]
  );

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const clearFile = () => {
    setFile(null);
    resetStatus();
  };

  const clearWatermarkImage = () => {
    setWatermarkImage(null);
    resetStatus();
  };

  const handleWatermarkImageUpload = (e) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(imageFile.type)) {
      setStatusMessage("Watermark image must be a PNG or JPG file.");
      setStatusType("error");
      return;
    }

    resetStatus();
    setWatermarkImage(imageFile);
  };

  const getPosition = (pageWidth, pageHeight, itemWidth, itemHeight) => {
    const margin = 28;

    switch (position) {
      case "top-left":
        return { x: margin, y: pageHeight - itemHeight - margin };
      case "top-right":
        return { x: pageWidth - itemWidth - margin, y: pageHeight - itemHeight - margin };
      case "center":
        return { x: (pageWidth - itemWidth) / 2, y: (pageHeight - itemHeight) / 2 };
      case "bottom-left":
        return { x: margin, y: margin };
      case "bottom-right":
      default:
        return { x: pageWidth - itemWidth - margin, y: margin };
    }
  };

  const applyWatermark = async () => {
    if (!file) {
      setStatusMessage("Upload a PDF to add watermark.");
      setStatusType("error");
      return;
    }

    if (watermarkType === "image" && !watermarkImage) {
      setStatusMessage("Upload a watermark image to continue.");
      setStatusType("error");
      return;
    }

    resetStatus();
    setIsLoading(true);
    setStatusType("info");

    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let imageEmbed = null;

      if (watermarkType === "image") {
        const imageBytes = await watermarkImage.arrayBuffer();
        if (watermarkImage.type === "image/png") {
          imageEmbed = await pdfDoc.embedPng(imageBytes);
        } else {
          imageEmbed = await pdfDoc.embedJpg(imageBytes);
        }
      }

      const alpha = Math.max(0.05, Math.min(1, opacity / 100));
      const scaleFactor = Math.max(0.1, Math.min(0.9, size / 100));

      pdfDoc.getPages().forEach((page) => {
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();

        if (watermarkType === "text") {
          const fontSize = Math.max(14, Math.min(96, size));
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
          const textHeight = fontSize;
          const { x, y } = getPosition(pageWidth, pageHeight, textWidth, textHeight);

          page.drawText(watermarkText, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(0.18, 0.24, 0.54),
            opacity: alpha,
          });
        } else if (imageEmbed) {
          const { width: baseWidth, height: baseHeight } = imageEmbed.scale(1);
          const maxWidth = pageWidth * scaleFactor;
          const maxHeight = pageHeight * scaleFactor;
          let drawWidth = baseWidth;
          let drawHeight = baseHeight;
          const ratio = baseWidth / baseHeight;

          if (drawWidth > maxWidth) {
            drawWidth = maxWidth;
            drawHeight = drawWidth / ratio;
          }

          if (drawHeight > maxHeight) {
            drawHeight = maxHeight;
            drawWidth = drawHeight * ratio;
          }

          const { x, y } = getPosition(pageWidth, pageHeight, drawWidth, drawHeight);

          page.drawImage(imageEmbed, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
            opacity: alpha,
          });
        }
      });

      const updatedPdfBytes = await pdfDoc.save();
      const blob = new Blob([updatedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "watermarked.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage("PDF watermarked successfully! File downloaded.");
      setStatusType("success");
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
      setStatusType("error");
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-linear-to-br from-[#f8fafc] to-white dark:from-slate-900 dark:to-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden animate-in fade-in zoom-in-95 duration-350">
      <h1 className="mb-3 text-[#0f172a] dark:text-slate-100 text-3xl sm:text-4xl font-black tracking-tight leading-none bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
        PDF Watermark
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 max-w-sm mx-auto font-medium leading-relaxed">
        Add custom text or image watermarks to your PDF documents.
      </p>

      <div
        className={`w-full border-2 border-dashed rounded-3xl p-8 mb-6 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center select-none ${
          isDragging
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.02] shadow-[0_4px_20px_rgba(37,99,235,0.15)] animate-pulse"
            : "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-blue-500 dark:hover:border-blue-400 hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(37,99,235,0.15)] hover:bg-slate-50 dark:hover:bg-slate-800/60 active:translate-y-0 active:scale-[0.99] active:shadow-sm"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handlePdfUpload(e.target.files)}
        />

        <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round" />
            <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
          </svg>
        </div>

        <span className="text-xl text-slate-800 dark:text-slate-100 font-bold mb-2">
          {isDragging ? "Drop your PDF here" : "Choose a PDF or drag & drop here"}
        </span>
        <span className="text-sm text-slate-450 dark:text-slate-500 font-medium">Click to browse or drop your PDF</span>
        <span className="mt-3 text-xs bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400 rounded-full px-3 py-1 font-bold border border-slate-200/50 dark:border-slate-800">
          PDF only · Watermark supported
        </span>
      </div>

      {file && (
        <div className="w-full mb-6 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1 text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
            <span>1 file selected</span>
            <button
              onClick={clearFile}
              className="text-xs text-rose-500 hover:text-rose-700 font-bold transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 shadow-xs">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-650 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
              1
            </span>
            <svg className="w-4.5 h-4.5 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="flex-1 text-sm text-slate-800 dark:text-slate-200 text-left truncate font-semibold" title={file.name}>
              {file.name}
            </span>
            <span className="text-xs text-slate-450 font-bold flex-shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      )}

      <div className="w-full mb-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-left animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-xs font-bold text-slate-550 dark:text-slate-455 uppercase tracking-wider mb-3">Watermark Type</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setWatermarkType("text");
                  resetStatus();
                }}
                className={`py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  watermarkType === "text"
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-slate-900 dark:text-slate-100 font-bold"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-blue-500"
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => {
                  setWatermarkType("image");
                  resetStatus();
                }}
                className={`py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  watermarkType === "image"
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-slate-900 dark:text-slate-100 font-bold"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-blue-500"
                }`}
              >
                Image
              </button>
            </div>
          </div>

          {watermarkType === "text" ? (
            <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-350">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider">Watermark Text</span>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
                placeholder="Enter watermark text"
              />
            </label>
          ) : (
            <div className="flex flex-col gap-3 text-sm text-slate-700 dark:text-slate-355">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer"
                >
                  Upload watermark image
                </button>
                {watermarkImage ? (
                  <button
                    type="button"
                    onClick={clearWatermarkImage}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleWatermarkImageUpload}
              />
              {watermarkImage ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                  {watermarkImage.name}
                </div>
              ) : (
                <p className="text-xs text-slate-450 dark:text-slate-500">PNG or JPG logo file for watermark.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-350">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider">Position</span>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-805 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-medium cursor-pointer"
              >
                {POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-350">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider">Opacity</span>
              <div className="flex items-center gap-3 h-10">
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="h-2 w-full bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                />
                <span className="min-w-[42px] text-xs font-bold text-slate-700 dark:text-slate-300">{opacity}%</span>
              </div>
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-350">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider">Size</span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={100}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="h-2 w-full bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
              />
              <span className="min-w-[42px] text-xs font-bold text-slate-700 dark:text-slate-300">{size}%</span>
            </div>
            <p className="text-xs text-slate-450 dark:text-slate-500">Adjust the watermark size relative to page dimensions.</p>
          </label>
        </div>
      </div>

      <button
        onClick={applyWatermark}
        disabled={!file || isLoading}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-8 border-none rounded-xl cursor-pointer text-base font-bold transition-all duration-300 shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(37,99,235,0.3)] active:enabled:translate-y-0 active:enabled:shadow-sm disabled:bg-gradient-to-r disabled:from-[#e2e8f0] disabled:to-[#cbd5e1] dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-[#94a3b8] dark:disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 w-full max-w-72 mx-auto"
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin"></span>
            Processing...
          </>
        ) : (
          "Apply Watermark"
        )}
      </button>

      {!file && (
        <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-bold animate-pulse">Upload a PDF to add watermark.</p>
      )}

      {statusMessage && (
        <div className={`mt-8 w-full max-w-md p-4 rounded-2xl flex items-center gap-3.5 border text-left shadow-xs animate-in slide-in-from-bottom-3 duration-300 ${
          statusType === "success" 
            ? "bg-emerald-50/80 border-emerald-100/50 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-350"
            : statusType === "error"
            ? "bg-rose-50/80 border-rose-100/50 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-350"
            : "bg-indigo-50/80 border-indigo-100/50 text-indigo-800 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-350"
        }`}>
          <div className={`p-2 rounded-xl shrink-0 ${
            statusType === "success" 
              ? "bg-emerald-500 text-white"
              : statusType === "error"
              ? "bg-rose-500 text-white"
              : "bg-indigo-500 text-white"
          }`}>
            {statusType === "success" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : statusType === "error" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
          </div>
          <span className="text-sm font-semibold">{statusMessage}</span>
        </div>
      )}
    </div>
  );
}

export default PDFWatermark;
