import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

const MAX_SIZE = 10 * 1024 * 1024;

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const fileToPngBytes = async (file) => {
  if (file.type === "image/png") {
    return file.arrayBuffer();
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context not available");
  }
  ctx.drawImage(bitmap, 0, 0);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Failed to convert image"));
    }, "image/png");
  });

  return blob.arrayBuffer();
};

function ImagePdf() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [items]);

  const totalSize = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );

  const addFiles = useCallback((selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const nextItems = [];
    const rejected = [];

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        rejected.push(`${file.name} (not an image)`);
        return;
      }

      if (file.size > MAX_SIZE) {
        rejected.push(`${file.name} (over 10MB)`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      nextItems.push({ id: createId(), file, previewUrl });
    });

    if (rejected.length > 0) {
      setStatusMessage(`Skipped: ${rejected.join(", ")}`);
      setStatusType("error");
      setTimeout(() => setStatusMessage(""), 4000);
    }

    if (nextItems.length > 0) {
      setItems((prev) => [...prev, ...nextItems]);
      setStatusMessage(
        `Added ${nextItems.length} image${nextItems.length > 1 ? "s" : ""}.`,
      );
      setStatusType("success");
      setTimeout(() => setStatusMessage(""), 2500);
    }
  }, []);

  const handleFileChange = (event) => {
    addFiles(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      dropAreaRef.current &&
      !dropAreaRef.current.contains(event.relatedTarget)
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files || []));
    event.dataTransfer.clearData();
  };

  const handleAreaClick = (event) => {
    if (
      event.target.tagName.toLowerCase() !== "label" &&
      !event.target.closest("label") &&
      event.target.tagName.toLowerCase() !== "button" &&
      !event.target.closest("button")
    ) {
      fileInputRef.current?.click();
    }
  };

  const moveItem = (index, direction) => {
    setItems((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  };

  const removeItem = (id) => {
    setItems((prev) => {
      const item = prev.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((entry) => entry.id !== id);
    });
  };

  const handleReorderDrop = (targetId) => {
    if (!draggedId || draggedId === targetId) return;
    setItems((prev) => {
      const currentIndex = prev.findIndex((item) => item.id === draggedId);
      const targetIndex = prev.findIndex((item) => item.id === targetId);
      if (currentIndex === -1 || targetIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedId(null);
    setDragOverId(null);
  };

  const clearAll = () => {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setStatusMessage("");
    setStatusType("info");
  };

  const createPdf = async (event) => {
    event.preventDefault();
    if (items.length === 0) {
      setStatusMessage("Please add at least one image.");
      setStatusType("error");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setLoading(true);
    setStatusMessage("Creating PDF...");
    setStatusType("info");

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of items) {
        const bytes = await fileToPngBytes(item.file);
        const image = await pdfDoc.embedPng(bytes);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "images-to-pdf.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage("Success! Your PDF has been created.");
      setStatusType("success");
    } catch (err) {
      console.error(err);
      setStatusMessage("Error: Failed to create PDF. See console for details.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-linear-to-br from-[#f8fafc] to-white dark:from-slate-900 dark:to-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden animate-in fade-in zoom-in-95 duration-350">
      <h1 className="mb-3 text-[#0f172a] dark:text-slate-100 text-3xl sm:text-4xl font-black tracking-tight leading-none bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
        Image to PDF
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 max-w-sm mx-auto font-medium leading-relaxed">
        Convert multiple images into a single PDF and arrange them in the exact order you want.
      </p>

      <form onSubmit={createPdf} className="w-full flex flex-col items-center">
        <div
          ref={dropAreaRef}
          className={`w-full border-2 border-dashed rounded-3xl p-8 mb-10 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center select-none ${
            isDragging
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.02] shadow-[0_4px_20px_rgba(37,99,235,0.15)] animate-pulse"
              : "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-blue-500 dark:hover:border-blue-400 hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(37,99,235,0.15)] hover:bg-slate-50 dark:hover:bg-slate-800/60 active:translate-y-0 active:scale-[0.99] active:shadow-sm"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAreaClick}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            id="image-pdf-input"
            ref={fileInputRef}
            className="hidden"
          />
          <label
            htmlFor="image-pdf-input"
            className="flex flex-col items-center text-slate-600 dark:text-slate-300 cursor-pointer font-semibold transition-colors duration-200 w-full"
          >
            <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 16L8.58579 11.4142C9.36683 10.6332 10.6332 10.6332 11.4142 11.4142L16 16M14 14L15.5858 12.4142C16.3668 11.6332 17.6332 11.6332 18.4142 12.4142L20 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 8H14.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4 20 4 19.1046 4 18V6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl text-slate-800 dark:text-slate-100 font-bold mb-2">
              Choose images or drag & drop here
            </span>
            <span className="text-sm text-slate-450 dark:text-slate-500 font-medium">
              Supports PNG, JPG, GIF, WEBP and more. Up to 10MB each.
            </span>
          </label>
        </div>

        {items.length > 0 && (
          <div className="w-full mb-6">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-3">
              <span>
                {items.length} image{items.length > 1 ? "s" : ""} selected
              </span>
              <span>
                Total size: {(totalSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 rounded-2xl border p-3 shadow-xs transition-all bg-white dark:bg-slate-950 ${
                    dragOverId === item.id
                      ? "border-blue-500 ring-2 ring-blue-500/15"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                  draggable
                  onDragStart={() => setDraggedId(item.id)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverId(item.id);
                  }}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={() => handleReorderDrop(item.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400">
                      {index + 1}
                    </div>
                    <button
                      type="button"
                      className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-550 dark:text-slate-400 cursor-grab active:cursor-grabbing flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                      aria-label="Drag to reorder"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="5" cy="4" r="1.5" />
                        <circle cx="11" cy="4" r="1.5" />
                        <circle cx="5" cy="8" r="1.5" />
                        <circle cx="11" cy="8" r="1.5" />
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="11" cy="12" r="1.5" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="h-16 w-16 object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p
                      className="truncate font-bold text-slate-800 dark:text-slate-100 text-sm"
                      title={item.file.name}
                    >
                      {item.file.name}
                    </p>
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-medium mt-0.5">
                      {(item.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label="Move up"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5" />
                        <path d="M5 12l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 1)}
                      disabled={index === items.length - 1}
                      className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label="Move down"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14" />
                        <path d="M19 12l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="h-9 w-9 rounded-full border border-rose-100 dark:border-rose-950/30 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center cursor-pointer transition-colors"
                      aria-label="Remove"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
          <button
            type="submit"
            disabled={items.length === 0 || loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-8 border-none rounded-xl cursor-pointer text-base font-bold transition-all duration-300 shadow-[0_4px_12px_rgba(37,99,235,0.2)] tracking-wide relative overflow-hidden hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(37,99,235,0.3)] active:enabled:translate-y-0 active:enabled:shadow-sm disabled:bg-gradient-to-r disabled:from-[#e2e8f0] disabled:to-[#cbd5e1] dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-[#94a3b8] dark:disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin"></span>
                Creating...
              </span>
            ) : (
              "Convert to PDF"
            )}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={items.length === 0 || loading}
            className="flex-1 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 py-4 px-8 rounded-xl text-base font-bold transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-35 disabled:cursor-not-allowed"
          >
            Clear all
          </button>
        </div>

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
      </form>
    </div>
  );
}

export default ImagePdf;
