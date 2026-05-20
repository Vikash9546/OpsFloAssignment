import logging
import sys

# Configure default logging format
logging_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

logging.basicConfig(
    level=logging.INFO,
    format=logging_format,
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Export default logger
logger = logging.getLogger("Maintainer_AI")
