import React, { useCallback } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { FileText } from "lucide-react";

function PdfDocx() {
  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
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

  return (
    <ToolPageTemplate
      title="PDF to Word"
      description="Text-based PDFs only. Scanned PDFs are not supported."
      accept="application/pdf"
      validateFile={validateFile}
      apiEndpoint="/convertDocx"
      fileFieldName="file"
      submitButtonText="Convert to Word"
      loadingButtonText="Converting..."
      getDownloadFilename={(name) => name.replace(/\.pdf$/i, ".docx")}
      maxWidthClass="max-w-[600px]"
      inputId="pdf-docx-input"
      defaultIcon={<FileText className="w-16 h-16" />}
      defaultText="Choose PDF file or drag & drop here"
      supportText="Click to browse or drop your PDF file"
    />
  );
}

export default PdfDocx;