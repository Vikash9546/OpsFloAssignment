import os
import requests
from pathlib import Path
from app.utils.logger import logger

PDF_SOURCES = {
    "conveyor_maintenance.pdf": "https://modularconveyor.com/MCE-Media/General/Documents/Manuals/Maintenance_Manual_May2015.pdf",
    "conveyor_operation.pdf": "https://www.eabhigyan.com/pluginfile.php/121268/course/overviewfiles/%E2%80%9CCONVEYOR%20OPERATION%20AND%20MAINTENANCE%20.pdf?forcedownload=1",
    "belt_conveyors.pdf": "https://practicalmaintenance.net/wp-content/uploads/Construction-and-Maintenance-of-Belt-Conveyors-for-Coal-and-Bulk-Material-Handling-Plants.pdf",
    "maintenance_handbook.pdf": "https://vietnamwcm.wordpress.com/wp-content/uploads/2008/08/maintenance-engineering-handbook.pdf",
}

def download_pdfs(docs_dir: str):
    """Downloads target PDF files securely if they do not exist locally."""
    Path(docs_dir).mkdir(parents=True, exist_ok=True)
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
    
    for filename, url in PDF_SOURCES.items():
        filepath = os.path.join(docs_dir, filename)
        if not os.path.exists(filepath):
            logger.info(f"Downloading knowledge base file: {filename}...")
            try:
                response = requests.get(url, headers=headers, timeout=30)
                response.raise_for_status()
                with open(filepath, "wb") as f:
                    f.write(response.content)
                logger.info(f"Successfully saved {filename}")
            except Exception as e:
                logger.error(f"Failed to download {filename}: {e}")
                # We log the failure but do not crash the pipeline, so remaining docs can process.
        else:
            logger.info(f"Knowledge base file {filename} already exists locally.")
