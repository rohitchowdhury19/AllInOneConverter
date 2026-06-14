from flask import Blueprint, request, send_file, jsonify
import fitz  # PyMuPDF
import io

protect_pdf_bp = Blueprint("protect_pdf", __name__)


@protect_pdf_bp.route("/protect-pdf", methods=["POST"])
def protect_pdf():
    file = request.files.get("file")
    password = request.form.get("password")

    if not file or file.filename == "":
        return jsonify({"error": "No file provided."}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are accepted."}), 400

    if not password:
        return jsonify({"error": "No password provided."}), 400

    data = file.read()
    src = None

    try:
        src = fitz.open(stream=data, filetype="pdf")

        if src.is_encrypted:
            return jsonify({"error": "The uploaded PDF is already password protected."}), 400

        # Create output stream
        buf = io.BytesIO()
        
        # Save document with encryption
        # owner_pw and user_pw are set to user's password.
        # user_pw is required to open/view the document.
        # owner_pw is required to change permissions.
        src.save(
            buf,
            encryption=fitz.PDF_ENCRYPT_AES_256,
            owner_pw=password,
            user_pw=password
        )
        buf.seek(0)

        base_name = file.filename.rsplit(".", 1)[0] or "document"
        download_name = f"{base_name}_protected.pdf"

        return send_file(
            buf,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=download_name,
        )

    except fitz.FileDataError:
        return jsonify({"error": "The uploaded file appears to be corrupted or is not a valid PDF."}), 400

    except Exception as e:
        return jsonify({"error": f"An error occurred while protecting the PDF: {str(e)}"}), 500

    finally:
        if src:
            src.close()
