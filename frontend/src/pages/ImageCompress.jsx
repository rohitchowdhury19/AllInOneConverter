import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { Sliders, Zap, ShieldCheck, Maximize } from "lucide-react";
import {
  formatFileSize,
  calculateSavedPercentage,
} from "../utils/fileSizeFormatter";

function ImageCompress() {
  const [quality, setQuality] = useState(70);
  const [originalSize, setOriginalSize] = useState(null);
  const [convertedSize, setConvertedSize] = useState(null);
  const [, setUploadedFile] = useState(null);

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setOriginalSize(selectedFile.size);
      setConvertedSize(null);
      setUploadedFile(selectedFile);

      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message:
        "Error: Please select an image file (PNG, JPG, JPEG, GIF, BMP, etc.)",
    };
  }, []);

  const presets = [
    { name: "Max Compression", quality: 20, icon: <Zap className="w-4 h-4" /> },
    {
      name: "Web Optimized",
      quality: 60,
      icon: <Maximize className="w-4 h-4" />,
    },
    {
      name: "High Quality",
      quality: 90,
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const modifyFormData = (formData) => {
    formData.append("quality", quality);
  };

  const onSuccess = (responseBlob) => {
    setConvertedSize(responseBlob.size);
    return `Success! Image compressed with ${quality}% quality.`;
  };

  const extraFields = ({ file }) => {
    if (!file) return null;

    return (
      <div className="w-full max-w-[500px] mb-8 p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm text-left">
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            Compression Quality: {quality}%
          </label>
          <span
            className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
              quality < 30
                ? "bg-rose-50 text-rose-650 dark:bg-rose-950/20 dark:text-rose-400"
                : quality < 70
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
            }`}
          >
            {quality < 30 ? "Low" : quality < 70 ? "Medium" : "High"}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => setQuality(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 mb-6"
        />

        <div className="grid grid-cols-3 gap-3">
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setQuality(p.quality)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                quality === p.quality
                  ? "bg-blue-50/50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400"
                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-450"
              }`}
            >
              {p.icon}
              {p.name}
            </button>
          ))}
        </div>

        {/* File Size Comparison Display */}
        {convertedSize && originalSize && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-3">
              📊 File Size Comparison
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-450 font-medium">Original:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatFileSize(originalSize)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-455 font-medium">Compressed:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatFileSize(convertedSize)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-900">
                <span className="text-slate-500 dark:text-slate-455 font-medium">Saved:</span>
                <span
                  className={`font-bold ${
                    calculateSavedPercentage(originalSize, convertedSize) > 0
                      ? "text-emerald-650 dark:text-emerald-450"
                      : "text-rose-650 dark:text-rose-450"
                  }`}
                >
                  {formatFileSize(originalSize - convertedSize)} (
                  {calculateSavedPercentage(
                    originalSize,
                    convertedSize,
                  ).toFixed(1)}
                  %
                  {calculateSavedPercentage(originalSize, convertedSize) > 0
                    ? "↓"
                    : "↑"}
                  )
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Show message if converted but no display */}
        {!convertedSize && originalSize && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Click "Compress Image" to see file size comparison.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Image Compressor"
      accept="image/*"
      validateFile={validateFile}
      apiEndpoint="/compress"
      fileFieldName="image"
      modifyFormData={modifyFormData}
      getDownloadFilename={(fileName) => {
        let extension = fileName.split(".").pop().toLowerCase();
        if (!["jpg", "jpeg", "webp"].includes(extension)) {
          extension = "jpg";
        }
        return fileName.replace(/\.[^.]+$/, `_compressed.${extension}`);
      }}
      submitButtonText="Compress Image"
      loadingButtonText="Compressing..."
      onSuccess={onSuccess}
      extraFields={extraFields}
      maxWidthClass="max-w-[700px]"
      defaultIcon={<Sliders className="w-16 h-16" />}
      defaultText="Upload image for compression"
      supportText="Adjust quality and reduce file size"
      inputId="compress-input"
    />
  );
}

export default ImageCompress;
