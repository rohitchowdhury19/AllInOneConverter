import React from "react";
import { FileText, X, File, Image as ImageIcon } from "lucide-react";

const FileUploadArea = ({
  file,
  previewUrl,
  isDragging,
  fileInputRef,
  dropAreaRef,
  handleFileChange,
  handleClear,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleAreaClick,
  accept = "*",
  inputId = "file-input",
  defaultIcon,
  defaultText,
  supportText,
}) => {
  const isPdf = file && file.type === "application/pdf";
  const isDocx = file && (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx"));

  const getFormatBadgeColor = () => {
    if (isPdf) return "bg-red-50 text-red-650 border-red-200 dark:bg-red-950/25 dark:text-red-400 dark:border-red-900/50";
    if (isDocx) return "bg-blue-50 text-blue-650 border-blue-200 dark:bg-blue-950/25 dark:text-blue-400 dark:border-blue-900/50";
    return "bg-emerald-50 text-emerald-650 border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/50";
  };

  const getFormatLabel = () => {
    if (isPdf) return "PDF Document";
    if (isDocx) return "Word Document";
    return "Image File";
  };

  return (
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
        accept={accept}
        onChange={handleFileChange}
        id={inputId}
        ref={fileInputRef}
        className="hidden"
      />
      
      <label
        htmlFor={inputId}
        className="flex flex-col items-center w-full text-slate-600 dark:text-slate-300 cursor-pointer font-semibold transition-colors duration-200"
      >
        {file ? (
          <div className="relative w-full flex flex-col items-center py-4">
            <div className="relative group max-w-full">
              {previewUrl ? (
                isPdf ? (
                  <embed
                    src={previewUrl}
                    type="application/pdf"
                    className="w-full h-96 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800"
                    style={{ maxHeight: "420px", width: "100%", minWidth: "300px" }}
                  />
                ) : (
                  <div className="relative overflow-hidden rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-800/60">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-80 w-auto rounded-2xl object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-850/60 w-44 h-44 shadow-sm animate-in zoom-in-95 duration-300">
                  {isPdf ? (
                    <FileText className="w-16 h-16 text-red-500 animate-bounce" />
                  ) : isDocx ? (
                    <File className="w-16 h-16 text-blue-500 animate-bounce" />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-emerald-500 animate-bounce" />
                  )}
                </div>
              )}
              
              {/* Floating Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear(e);
                }}
                className="absolute -top-3.5 -right-3.5 bg-rose-500 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-xl hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer z-20 border border-white dark:border-slate-900"
                aria-label="Remove file"
              >
                <X className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>
            
            {/* File Info Block */}
            <div className="mt-6 flex flex-col items-center gap-2 max-w-full">
              <span className="text-slate-800 dark:text-slate-100 font-bold text-base px-2 truncate max-w-xs sm:max-w-md" title={file.name}>
                {file.name}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getFormatBadgeColor()}`}>
                  {getFormatLabel()}
                </span>
                <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200/50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 px-2.5 py-1 rounded-full font-bold">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              {defaultIcon}
            </div>
            <span className="text-xl text-slate-800 dark:text-slate-100 font-bold mb-2">
              {defaultText}
            </span>
            <span className="text-sm text-slate-450 dark:text-slate-500 font-medium">
              {supportText}
            </span>
          </div>
        )}
      </label>
    </div>
  );
};

export default FileUploadArea;
