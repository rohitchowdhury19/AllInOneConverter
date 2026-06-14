import React, { useState, useCallback, lazy, Suspense } from "react";
import { useFileUpload } from "../hooks/useFileUpload";

const FileUploadArea = lazy(() => import("./FileUploadArea"));

const ToolPageTemplate = ({
  title,
  description,
  accept = "*",
  validateFile,
  apiEndpoint,
  fileFieldName = "image",
  modifyFormData,
  onSubmit,
  onClear,
  submitButtonText = "Submit",
  loadingButtonText = "Processing...",
  onSuccessMessage,
  onSuccess,
  getDownloadFilename,
  extraFields,
  extraContent,
  showSubmitButton = true,
  maxWidthClass = "max-w-[600px]",
  defaultIcon,
  defaultText,
  supportText,
  inputId = "file-input",
}) => {
  const [statusType, setStatusType] = useState("info");

  const internalValidate = useCallback(
    async (selectedFile) => {
      if (validateFile) {
        return await validateFile(selectedFile);
      }
      return { isValid: true, message: `File selected: ${selectedFile.name}` };
    },
    [validateFile],
  );

  const {
    file,
    loading,
    setLoading,
    isDragging,
    statusMessage,
    setStatusMessage,
    previewUrl,
    fileInputRef,
    dropAreaRef,
    handleFileChange,
    handleClear,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAreaClick,
  } = useFileUpload(internalValidate);

  const handleClearAll = (e) => {
    handleClear(e);
    setStatusType("info");
    if (onClear) {
      onClear();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      setStatusMessage("Please select a file first");
      setStatusType("error");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setLoading(true);
    setStatusType("info");

    const formData = new FormData();
    formData.append(fileFieldName, file);

    if (modifyFormData) {
      modifyFormData(formData);
    }

    try {
      if (onSubmit) {
        await onSubmit({
          file,
          formData,
          setStatusMessage,
          setLoading,
          setStatusType,
          previewUrl,
        });
        return;
      }

      if (!apiEndpoint) {
        throw new Error("No API endpoint or custom onSubmit handler provided.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${apiEndpoint}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        const downloadName = getDownloadFilename
          ? getDownloadFilename(file.name)
          : file.name;
        a.download = downloadName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        if (onSuccess) {
          const customMessage = onSuccess(blob, file.name);
          setStatusMessage(customMessage || (onSuccessMessage || "Success! File downloaded."));
        } else {
          setStatusMessage(onSuccessMessage || "Success! File downloaded.");
        }
        setStatusType("success");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatusMessage(`Error: ${errorData.error || "Operation failed"}`);
        setStatusType("error");
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message || "Failed to process file"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatusMessage("");
      }, 5000);
    }
  };

  const context = {
    file,
    loading,
    setLoading,
    statusMessage,
    setStatusMessage,
    statusType,
    setStatusType,
    handleClear: handleClearAll,
    handleSubmit,
    previewUrl,
  };

  return (
    <div className={`w-full ${maxWidthClass} mx-auto p-10 text-center flex flex-col justify-center items-center bg-linear-to-br from-[#f8fafc] to-white dark:from-slate-900 dark:to-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden animate-in fade-in zoom-in-95 duration-350`}>
      <h1 className="mb-3 text-[#0f172a] dark:text-slate-100 text-3xl sm:text-4xl font-black tracking-tight leading-none bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
        {title}
      </h1>
      {description && <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 max-w-sm mx-auto font-medium leading-relaxed">{description}</p>}

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Loading upload...</div>}>
          <FileUploadArea
            file={file}
            previewUrl={previewUrl}
            isDragging={isDragging}
            fileInputRef={fileInputRef}
            dropAreaRef={dropAreaRef}
            handleFileChange={handleFileChange}
            handleClear={handleClearAll}
            handleDragEnter={handleDragEnter}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleAreaClick={handleAreaClick}
            accept={accept}
            inputId={inputId}
            defaultIcon={defaultIcon}
            defaultText={defaultText}
            supportText={supportText}
          />
        </Suspense>

        {extraFields && (typeof extraFields === "function" ? extraFields(context) : extraFields)}

        {showSubmitButton && (
          <button
            type="submit"
            disabled={!file || loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-8 border-none rounded-xl cursor-pointer text-base font-bold transition-all duration-300 shadow-[0_4px_12px_rgba(37,99,235,0.2)] tracking-wide relative overflow-hidden w-full max-w-72 mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(37,99,235,0.3)] active:enabled:translate-y-0 active:enabled:shadow-sm disabled:bg-gradient-to-r disabled:from-[#e2e8f0] disabled:to-[#cbd5e1] dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-[#94a3b8] dark:disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin"></span>
                {loadingButtonText}
              </span>
            ) : (
              submitButtonText
            )}
          </button>
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
      </form>

      {extraContent && (typeof extraContent === "function" ? extraContent(context) : extraContent)}
    </div>
  );
};

export default ToolPageTemplate;
