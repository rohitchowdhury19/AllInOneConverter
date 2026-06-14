import { useState, useRef, useCallback } from "react";

let pdfjsLib = null;

async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      pdfjsLib = window.pdfjsLib;
      resolve(pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      pdfjsLib = window.pdfjsLib;
      resolve(pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function renderPageThumb(pdfDoc, pageNum, width = 120) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const scale = width / viewport.width;
  const scaled = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(scaled.width);
  canvas.height = Math.floor(scaled.height);
  await page.render({
    canvasContext: canvas.getContext("2d"),
    viewport: scaled,
  }).promise;
  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.7),
    aspectRatio: scaled.height / scaled.width,
  };
}

const STAGE = { SELECT: "select", ARRANGE: "arrange", DONE: "done" };

export default function MergePdf() {
  const [stage, setStage] = useState(STAGE.SELECT);
  const [rawFiles, setRawFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("info");

  const [pages, setPages] = useState([]);

  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);
  const [draggingPageId, setDraggingPageId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const inputRef = useRef(null);

  const showStatus = useCallback((msg, type = "info", ttl = 5000) => {
    setStatusMsg(msg);
    setStatusType(type);
    if (ttl) setTimeout(() => setStatusMsg(""), ttl);
  }, []);

  const addFiles = useCallback((incoming) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === "application/pdf",
    );
    if (!pdfs.length) {
      showStatus("Only PDF files are accepted.", "error");
      return;
    }
    setStatusMsg("");
    setRawFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...pdfs.filter((f) => !names.has(f.name))];
    });
  }, [showStatus]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const loadPages = async () => {
    if (rawFiles.length < 2) {
      showStatus("Add at least 2 PDFs.", "error");
      return;
    }
    setIsLoading(true);
    setLoadingMsg("Loading pdf.js...");
    try {
      const lib = await getPdfJs();
      const allPages = [];
      for (let fi = 0; fi < rawFiles.length; fi++) {
        const file = rawFiles[fi];
        setLoadingMsg(
          `Reading "${file.name}"... (${fi + 1}/${rawFiles.length})`,
        );
        const ab = await file.arrayBuffer();
        const pdfDoc = await lib.getDocument({ data: ab }).promise;
        for (let pn = 1; pn <= pdfDoc.numPages; pn++) {
          setLoadingMsg(
            `Rendering "${file.name}" page ${pn}/${pdfDoc.numPages}...`,
          );
          const { dataUrl, aspectRatio } = await renderPageThumb(pdfDoc, pn);
          allPages.push({
            id: `${fi}-${pn}-${Math.random()}`,
            fileIndex: fi,
            fileName: file.name,
            pageNum: pn,
            thumb: dataUrl,
            aspectRatio,
          });
        }
      }
      setPages(allPages);
      setStage(STAGE.ARRANGE);
    } catch (err) {
      console.error(err);
      showStatus(`Failed to load PDFs. ${err.message}`, "error");
    } finally {
      setIsLoading(false);
      setLoadingMsg("");
    }
  };

  const movePage = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= pages.length) return;
    setPages((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handlePageDragStart = (e, index, id) => {
    dragIdx.current = index;
    setDraggingPageId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handlePageDragEnter = (index, id) => {
    dragOverIdx.current = index;
    setDragOverId(id);
  };
  const handlePageDragOver = (e) => e.preventDefault();
  const handlePageDrop = (e) => {
    e.preventDefault();
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from === null || to === null || from === to) {
      resetDrag();
      return;
    }
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    resetDrag();
  };
  const resetDrag = () => {
    dragIdx.current = null;
    dragOverIdx.current = null;
    setDraggingPageId(null);
    setDragOverId(null);
  };

  const removePage = (index) =>
    setPages((prev) => prev.filter((_, i) => i !== index));

  const handleMerge = async () => {
    if (!pages.length) return;
    setIsLoading(true);
    setLoadingMsg("Building merged PDF...");
    try {
      const { PDFDocument } = await import("pdf-lib");

      const srcDocs = {};
      for (let fi = 0; fi < rawFiles.length; fi++) {
        const ab = await rawFiles[fi].arrayBuffer();
        srcDocs[fi] = await PDFDocument.load(ab);
      }

      const merged = await PDFDocument.create();
      for (const pg of pages) {
        const src = srcDocs[pg.fileIndex];
        const [copied] = await merged.copyPages(src, [pg.pageNum - 1]);
        merged.addPage(copied);
      }

      const bytes = await merged.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStage(STAGE.DONE);
      showStatus(
        `merged.pdf downloaded - ${pages.length} pages.`,
        "success",
        0,
      );
    } catch (err) {
      console.error(err);
      showStatus(`Merge failed: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
      setLoadingMsg("");
    }
  };

  const reset = () => {
    setRawFiles([]);
    setPages([]);
    setStage(STAGE.SELECT);
    setStatusMsg("");
  };

  const FILE_COLORS = [
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30",
    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30",
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
    "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/20 dark:text-fuchsia-400 dark:border-fuchsia-900/30",
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30",
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30",
  ];
  const fileColor = (fi) => FILE_COLORS[fi % FILE_COLORS.length];

  return (
    <div className="w-full max-w-[760px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-linear-to-br from-[#f8fafc] to-white dark:from-slate-900 dark:to-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden animate-in fade-in zoom-in-95 duration-350">
      <style>{`
        .thumb-card { transition: box-shadow .15s, transform .15s, opacity .15s; }
        .thumb-card:hover { box-shadow: 0 8px 24px rgba(37,99,235,.15); transform: translateY(-2px); }
        .thumb-card.dragging { opacity: .35; transform: scale(.96); }
        .thumb-card.drag-over { box-shadow: 0 0 0 3px #2563eb; }
        .grip { cursor: grab; } .grip:active { cursor: grabbing; }
        .page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .fade-in { animation: fadeIn .35s ease both; }
        .spinner { width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="merge-root w-full">
        <div className="mb-8">
          <h1 className="mb-3 text-[#0f172a] dark:text-slate-100 text-3xl sm:text-4xl font-black tracking-tight leading-none bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Merge PDFs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto font-medium leading-relaxed">
            {stage === STAGE.SELECT &&
              "Upload PDFs, then arrange pages exactly how you want them."}
            {stage === STAGE.ARRANGE &&
              `${pages.length} pages loaded - drag or use arrows to reorder, then merge.`}
            {stage === STAGE.DONE && "Your merged PDF is ready!"}
          </p>
        </div>

        {stage === STAGE.SELECT && (
          <div className="fade-in w-full">
            <div
              className={`w-full border-2 border-dashed rounded-3xl p-8 mb-6 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center select-none ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.02] shadow-[0_4px_20px_rgba(37,99,235,0.15)] animate-pulse"
                  : "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-blue-500 dark:hover:border-blue-400 hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(37,99,235,0.15)] hover:bg-slate-50 dark:hover:bg-slate-800/60 active:translate-y-0 active:scale-[0.99] active:shadow-sm"
              }`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="14,2 14,8 20,8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round" />
                  <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-xl text-slate-800 dark:text-slate-100 font-bold mb-2">
                {isDragging
                  ? "Drop your PDFs here"
                  : rawFiles.length
                    ? "+ Add more PDFs"
                    : "Choose PDF files or drag & drop"}
              </span>
              <span className="text-sm text-slate-450 dark:text-slate-500 font-medium">
                PDF only - multiple files supported
              </span>
            </div>

            {rawFiles.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                  <span>
                    {rawFiles.length} file{rawFiles.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => setRawFiles([])}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
                {rawFiles.map((f, i) => (
                  <div
                    key={f.name}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm shadow-xs ${fileColor(
                      i,
                    )}`}
                  >
                    <span className="font-bold font-mono text-xs w-5 text-center">
                      {i + 1}
                    </span>
                    <svg
                      className="w-4.5 h-4.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="14,2 14,8 20,8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      className="flex-1 truncate font-semibold text-left"
                      title={f.name}
                    >
                      {f.name}
                    </span>
                    <span className="text-xs opacity-60 shrink-0 font-medium">
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      onClick={() =>
                        setRawFiles((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="opacity-50 hover:opacity-100 transition-opacity text-xs px-1 cursor-pointer font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {statusMsg && (
              <p
                className={`text-sm mb-4 font-semibold ${
                  statusType === "error" ? "text-red-500" : "text-slate-500"
                }`}
              >
                {statusMsg}
              </p>
            )}

            <button
              onClick={loadPages}
              disabled={rawFiles.length < 2 || isLoading}
              className="w-full py-4 rounded-xl font-bold text-white text-base tracking-wide transition-all
                bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                disabled:bg-gradient-to-r disabled:from-[#e2e8f0] disabled:to-[#cbd5e1] dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-[#94a3b8] dark:disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none
                flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:enabled:shadow-[0_6px_16px_rgba(37,99,235,0.3)] active:enabled:translate-y-0 active:enabled:shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  {loadingMsg || "Loading..."}
                </>
              ) : (
                <>Load Pages & Arrange &rarr;</>
              )}
            </button>
            {rawFiles.length === 1 && (
              <p className="text-center text-xs text-blue-600 dark:text-blue-400 font-bold mt-3 animate-pulse">
                Add at least one more PDF to continue.
              </p>
            )}
          </div>
        )}

        {stage === STAGE.ARRANGE && (
          <div className="fade-in w-full text-left">
            <div className="flex flex-wrap gap-2 mb-5">
              {rawFiles.map((f, i) => (
                <span
                  key={f.name}
                  className={`text-xs px-3 py-1 rounded-full border font-bold ${fileColor(
                    i,
                  )}`}
                >
                  {f.name.length > 22 ? `${f.name.slice(0, 20)}...` : f.name}
                </span>
              ))}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 flex items-center gap-2 font-medium">
              <svg
                className="w-4 h-4 text-blue-500 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Drag pages to reorder, or use ▲▼ arrows. Click ✕ to remove a page.
            </p>

            <div className="page-grid mb-8">
              {pages.map((pg, idx) => (
                <div
                  key={pg.id}
                  draggable
                  onDragStart={(e) => handlePageDragStart(e, idx, pg.id)}
                  onDragEnter={() => handlePageDragEnter(idx, pg.id)}
                  onDragOver={handlePageDragOver}
                  onDrop={handlePageDrop}
                  onDragEnd={resetDrag}
                  className={`thumb-card bg-white dark:bg-slate-950 rounded-2xl border overflow-hidden select-none relative shadow-xs
                    ${
                      draggingPageId === pg.id
                        ? "dragging border-blue-500 ring-2 ring-blue-500/15"
                        : "border-slate-200 dark:border-slate-850"
                    }
                    ${
                      dragOverId === pg.id && draggingPageId !== pg.id
                        ? "drag-over"
                        : ""
                    }
                  `}
                >
                  <div className="grip flex items-center justify-center h-7 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850">
                    <svg
                      className="w-4.5 h-4.5 text-slate-400 dark:text-slate-655"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="9" cy="7" r="1.5" />
                      <circle cx="15" cy="7" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="9" cy="17" r="1.5" />
                      <circle cx="15" cy="17" r="1.5" />
                    </svg>
                  </div>

                  <div
                    className="relative bg-slate-100 dark:bg-slate-900"
                    style={{ paddingBottom: `${pg.aspectRatio * 100}%` }}
                  >
                    <img
                      src={pg.thumb}
                      alt={`${pg.fileName} p${pg.pageNum}`}
                      className="absolute inset-0 w-full h-full object-contain"
                      draggable={false}
                    />
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5.5 h-5.5 flex items-center justify-center shadow-md">
                      {idx + 1}
                    </span>
                    <button
                      onClick={() => removePage(idx)}
                      className="absolute top-1.5 right-1.5 w-5.5 h-5.5 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white text-slate-500 dark:text-slate-400 text-[10px] flex items-center justify-center shadow-md transition-all cursor-pointer border border-white dark:border-slate-800"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="px-3 py-2 flex items-center justify-between gap-1 border-t border-slate-100 dark:border-slate-850">
                    <div className="min-w-0">
                      <p
                        className="text-[10px] text-slate-450 dark:text-slate-500 truncate leading-none font-medium"
                        title={pg.fileName}
                      >
                        {pg.fileName.length > 14
                          ? `${pg.fileName.slice(0, 12)}...`
                          : pg.fileName}
                      </p>
                      <p
                        className={`text-[10px] font-bold mt-0.5 ${
                          fileColor(pg.fileIndex).split(" ")[1]
                        }`}
                      >
                        p.{pg.pageNum}
                      </p>
                    </div>
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => movePage(idx, -1)}
                        disabled={idx === 0}
                        className="w-5 h-4.5 text-[9px] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => movePage(idx, 1)}
                        disabled={idx === pages.length - 1}
                        className="w-5 h-4.5 text-[9px] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {statusMsg && (
              <p
                className={`text-sm mb-4 font-bold ${
                  statusType === "error" ? "text-red-500" : "text-green-600"
                }`}
              >
                {statusMsg}
              </p>
            )}

            <div className="flex gap-4">
              <button
                onClick={reset}
                className="px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              >
                &larr; Start over
              </button>
              <button
                onClick={handleMerge}
                disabled={!pages.length || isLoading}
                className="flex-1 py-3.5 rounded-xl font-bold text-white text-base tracking-wide transition-all
                  bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                  disabled:bg-gradient-to-r disabled:from-[#e2e8f0] disabled:to-[#cbd5e1] dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-[#94a3b8] dark:disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none
                  flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:enabled:shadow-[0_6px_16px_rgba(37,99,235,0.3)] active:enabled:translate-y-0 active:enabled:shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    {loadingMsg}
                  </>
                ) : (
                  <>Merge {pages.length} pages &rarr; Download PDF</>
                )}
              </button>
            </div>
          </div>
        )}

        {stage === STAGE.DONE && (
          <div className="fade-in flex flex-col items-center py-12 gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-2 border border-emerald-100 dark:border-emerald-900/30">
              <svg
                className="w-10 h-10 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100">
              merged.pdf downloaded!
            </h2>
            <p className="text-slate-500 dark:text-slate-450 text-sm font-medium">{statusMsg}</p>
            <button
              onClick={reset}
              className="mt-4 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Merge more PDFs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
