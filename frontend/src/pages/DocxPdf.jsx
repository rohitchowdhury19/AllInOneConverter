import React, { useCallback } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { FileText } from "lucide-react";

function DocxPdf() {
  const validateFile = useCallback((selectedFile) => {
    const accepted = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    const isDocx = selectedFile && (
      accepted.includes(selectedFile.type) || 
      selectedFile.name.endsWith(".docx") || 
      selectedFile.name.endsWith(".doc")
    );
    
    if (isDocx) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Error: Please select a Word file (.docx or .doc)",
    };
  }, []);

  return (
    <ToolPageTemplate
      title="DOCX to PDF"
      description="Upload a Word document (.docx) to convert it to PDF."
      accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
      validateFile={validateFile}
      apiEndpoint="/convertDocxToPdf"
      fileFieldName="file"
      submitButtonText="Convert to PDF"
      loadingButtonText="Converting..."
      getDownloadFilename={(name) => name.replace(/\.(docx|doc)$/i, ".pdf")}
      maxWidthClass="max-w-[600px]"
      inputId="docx-pdf-input"
      defaultIcon={<FileText className="w-16 h-16" />}
      defaultText="Choose Word file or drag & drop here"
      supportText="Click to browse or drop your DOCX file"
    />
  );
}

export default DocxPdf;
