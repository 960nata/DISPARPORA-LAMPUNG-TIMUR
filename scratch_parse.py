import os
import glob
from pypdf import PdfReader

def parse_pdfs():
    pdf_dir = "file untuk data dukung"
    output_dir = "parsed_data"
    os.makedirs(output_dir, exist_ok=True)
    
    pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))
    print(f"Found {len(pdf_files)} PDF files to parse.")
    
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        name, ext = os.path.splitext(filename)
        output_txt_path = os.path.join(output_dir, f"{name}.txt")
        
        print(f"Parsing {filename}...")
        try:
            reader = PdfReader(pdf_path)
            full_text = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    full_text.append(f"--- PAGE {i+1} ---\n" + text)
            
            with open(output_txt_path, "w", encoding="utf-8") as f:
                f.write("\n\n".join(full_text))
            print(f"Saved text to {output_txt_path}")
        except Exception as e:
            print(f"Error parsing {filename}: {e}")

if __name__ == "__main__":
    parse_pdfs()
