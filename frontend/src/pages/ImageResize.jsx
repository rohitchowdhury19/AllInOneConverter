import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { Expand, Image as ImageIcon } from "lucide-react";

function ImageResize() {
  const [dimensions, setDimensions] = useState({ width: "1280", height: "720" });
  const [unit, setUnit] = useState("px");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(false);

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Error: Please select an image file (PNG, JPG, JPEG, WEBP, etc.)",
    };
  }, []);

  const presets = [
    { name: "Small", width: 640, height: 480 },
    { name: "Medium", width: 1280, height: 720 },
    { name: "Large", width: 1920, height: 1080 },
    { name: "Square", width: 1080, height: 1080 },
  ];

  const handleDimensionChange = (field, value) => {
    setDimensions((prev) => ({ ...prev, [field]: value }));
  };

  const applyPreset = (width, height) => {
    setUnit("px");
    setDimensions({ width: String(width), height: String(height) });
  };

  const modifyFormData = (formData) => {
    formData.append("width", dimensions.width);
    formData.append("height", dimensions.height);
    formData.append("unit", unit);
    formData.append("maintainAspectRatio", String(maintainAspectRatio));
  };

 
const getValidationError = (dimensions, maintainAspectRatio, unit) => {
  const width = Number(dimensions.width);
  const height = Number(dimensions.height);

 
  if (!String(dimensions.width).trim()) return `Please enter a width in ${unit}.`;
  if (width <= 0) return `Width must be greater than 0 ${unit}.`;


  if (!maintainAspectRatio) {
    if (!String(dimensions.height).trim()) return `Please enter a height in ${unit}.`;
    if (height <= 0) return `Height must be greater than 0 ${unit}.`;
  }

  return null; 
};


const handleBeforeSubmit = (setStatusMessage, setStatusType) => {
  const errorMessage = getValidationError(dimensions, maintainAspectRatio, unit);

  if (errorMessage) {
    setStatusMessage(errorMessage);
    setStatusType("error");
    
   
    setTimeout(() => setStatusMessage(""), 3000);
    
    return false;
  }

  return true;
};

  const extraFields = ({ file }) => {
    if (!file) return null;
    return (
      <div className="w-full max-w-[500px] mb-8 p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm text-left">
        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-700 dark:text-slate-300">
          <ImageIcon className="w-4 h-4 text-blue-650 dark:text-blue-500" />
          Resize Presets
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          {presets.map((preset) => {
            const isActive =
              dimensions.width === String(preset.width) &&
              dimensions.height === String(preset.height) &&
              unit === "px";

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.width, preset.height)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isActive
                    ? "bg-blue-50/50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-450"
                }`}
              >
                <span>{preset.name}</span>
                <span className="text-[10px] opacity-80">{preset.width} x {preset.height}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Resize Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 cursor-pointer font-medium"
          >
            <option value="px">Pixels (px)</option>
            <option value="mm">Millimeters (mm)</option>
            <option value="cm">Centimeters (cm)</option>
          </select>
        </div>

        <label className="flex items-center gap-3 mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-4 py-3 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
          <input
            type="checkbox"
            checked={maintainAspectRatio}
            onChange={(e) => setMaintainAspectRatio(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-blue-600 dark:text-blue-500 focus:ring-blue-500"
          />
          <div>
            <span className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Keep aspect ratio
            </span>
            <span className="block text-xs text-slate-450 dark:text-slate-500">
              Height will be auto-calculated from the width in {unit}.
            </span>
          </div>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-left">
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Width ({unit})
            </span>
            <input
              type="number"
              value={dimensions.width}
              onChange={(e) => handleDimensionChange("width", e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 font-medium"
            />
          </label>

          {!maintainAspectRatio && (
            <label className="text-left">
              <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Height ({unit})
              </span>
              <input
                type="number"
                value={dimensions.height}
                onChange={(e) =>
                  handleDimensionChange("height", e.target.value)
                }
                className="w-full rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 font-medium"
              />
            </label>
          )}
        </div>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Image Resize"
      accept="image/*"
      validateFile={validateFile}
      apiEndpoint="/resizeImage"
      fileFieldName="image"
      modifyFormData={modifyFormData}
      onSubmit={async (context) => {
        const { file, formData, setStatusMessage, setLoading, setStatusType } = context;
        if (!handleBeforeSubmit(setStatusMessage, setStatusType)) {
          setLoading(false);
          return;
        }

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/resizeImage`, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            const extension = file.name.includes(".")
              ? file.name.slice(file.name.lastIndexOf("."))
              : ".png";
            const baseName = file.name.includes(".")
              ? file.name.replace(/\.[^.]+$/, "")
              : file.name;

            a.href = url;
            a.download = `${baseName}_resized${extension}`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setStatusMessage(
              maintainAspectRatio
                ? `Success! Image resized using width ${dimensions.width} ${unit} with aspect ratio preserved.`
                : `Success! Image resized to ${dimensions.width} x ${dimensions.height} ${unit}.`,
            );
            setStatusType("success");
          } else {
            const error = await response.json();
            setStatusMessage(`Error: ${error.error || "Resize failed"}`);
            setStatusType("error");
          }
        } catch (error) {
          setStatusMessage(`Error: ${error.message || "Failed to resize image"}`);
          setStatusType("error");
        } finally {
          setLoading(false);
          setTimeout(() => setStatusMessage(""), 5000);
        }
      }}
      submitButtonText={`Resize Image (${unit})`}
      loadingButtonText="Resizing..."
      extraFields={extraFields}
      maxWidthClass="max-w-[700px]"
      defaultIcon={<Expand className="w-16 h-16" />}
      defaultText="Upload image for resizing"
      supportText="Choose a preset or enter custom dimensions and unit"
      inputId="resize-input"
    />
  );
}

export default ImageResize;
