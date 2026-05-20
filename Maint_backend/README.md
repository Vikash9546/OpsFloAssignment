# Maintainer_AI Backend

Intelligent Industrial Maintenance Agent system that processes natural language equipment complaints using an Agentic AI + SQL architecture.

Built with **FastAPI**, **PostgreSQL**, **Prisma ORM**, and the **Groq LLM API**, this service automatically parses complaints, classifies their issue type, assigns appropriate priority, produces concise summaries, and tracks them using unique sequential tickets.

---

## Technical Stack
- **Runtime**: Python 3.12+
- **API Framework**: FastAPI & Uvicorn
- **AI Engine**: Groq LLM API (Default model: `llama3-8b-8192`)
- **Database**: PostgreSQL
- **ORM**: Prisma ORM for Python
- **Validation**: Pydantic v2

---

## Project Structure
```
Maintainer_AI/
└── backend/
    ├── app/
    │   ├── main.py                     # API Application & server lifecycles
    │   ├── config.py                   # Environment settings & validations
    │   ├── database.py                 # Prisma client instance and database hooks
    │   ├── prisma_schema.prisma        # Prisma ORM schema and database models
    │   │
    │   ├── routes/
    │   │   └── complaint_routes.py     # GET and POST API endpoints
    │   │
    │   ├── services/
    │   │   ├── llm_service.py          # Groq API async service with fallback heuristics
    │   │   ├── classifier_service.py   # Electrical/Mechanical/Sensor type validator
    │   │   ├── priority_service.py     # Low/Medium/High priority level validator
    │   │   ├── summary_service.py      # Summary sanitizer & trimmer
    │   │   └── ticket_service.py       # Sequential ticket ID generator (TKT-YYYY-XXXX)
    │   │
    │   ├── agents/
    │   │   └── maintenance_agent.py    # Orchestration agent coordinating pipeline flow
    │   │
    │   ├── models/
    │   │   └── complaint_model.py      # Domain rules, types, and constraints
    │   │
    │   ├── schemas/
    │   │   └── complaint_schema.py    # Pydantic request and response shapes
    │   │
    │   └── utils/
    │       └── logger.py               # Formatted runtime application logging
    │
    ├── requirements.txt                # Third-party dependency definitions
    ├── .env                            # Environment variables (private credentials)
    └── README.md                       # Operations and setup documentation
```

---

## Installation & Local Setup

### 1. Prerequisites
- **Python**: Ensure Python 3.12 or newer is installed on your local machine.
- **PostgreSQL**: A running instance of PostgreSQL (either local or cloud-hosted) with a database created (e.g. `maintainer_ai`).

### 2. Step-by-Step Installation
First, open your terminal and navigate to the backend directory:
```bash
cd Maintainer_AI/backend
```

Create a Python virtual environment:
```bash
python3 -m venv venv
```

Activate the virtual environment:
- On macOS/Linux:
  ```bash
  source venv/bin/activate
  ```
- On Windows (Command Prompt):
  ```cmd
  venv\Scripts\activate.bat
  ```

Install the third-party dependencies:
```bash
pip install -r requirements.txt
```

---

## Environment Configuration
Create or modify the `.env` file under `Maintainer_AI/backend/` and supply your actual database connection credentials and Groq API key:
```env
# Groq API Configuration
GROQ_API_KEY=gsk_your_groq_api_key_goes_here

# PostgreSQL Connection URL
# Format: postgresql://[user]:[password]@[host]:[port]/[database_name]
DATABASE_URL=postgresql://postgres:password@localhost:5432/maintainer_ai
```

---

## Database Initialization (Prisma ORM)

Once your `.env` contains a valid `DATABASE_URL`, execute the following commands in your activated virtual environment to generate the Prisma client and prepare your PostgreSQL tables.

### 1. Generate the Prisma Client
Generate the dynamic Python client code corresponding to your schema:
```bash
prisma generate --schema app/prisma_schema.prisma
```

### 2. Push Schema to PostgreSQL Database
Create the tables in your database matching the schema structure without needing complex migration files:
```bash
prisma db push --schema app/prisma_schema.prisma
```
*(Alternatively, you can run `prisma migrate dev` if you prefer formal SQL migration files).*

---

## Running the Server

Start the development server with **Uvicorn** by executing the following command from the `backend/` directory:
```bash
uvicorn app.main:app --reload --port 8000
```

Once started, the API is accessible at:
- **Root Status**: `http://localhost:8000/`
- **Interactive OpenAPI Documentation**: `http://localhost:8000/docs`
- **Alternative Redoc Documentation**: `http://localhost:8000/redoc`

---

## API Endpoints

### 1. Process Natural Language Complaint
- **Endpoint**: `POST /complaints`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "complaint": "Hydraulic pump leaking oil continuously."
  }
  ```
- **Response Examples**:
  - **Success (201 Created)**:
    ```json
    {
      "ticket_id": "TKT-2026-0001",
      "original_complaint": "Hydraulic pump leaking oil continuously.",
      "issue_type": "Mechanical",
      "priority": "Medium",
      "summary": "Hydraulic leakage detected in pump assembly.",
      "created_at": "2026-05-20T13:30:00.123456Z"
    }
    ```
  - **Validation Error (422 Unprocessable Entity)**:
    *Triggered if the complaint is empty or is under 10 characters.*
    ```json
    {
      "detail": [
        {
          "loc": ["body", "complaint"],
          "msg": "Value error, Complaint text must be at least 10 characters in length.",
          "type": "value_error"
        }
      ]
    }
    ```

### 2. List All Tickets
- **Endpoint**: `GET /complaints`
- **Response Example**:
  ```json
  [
    {
      "ticket_id": "TKT-2026-0001",
      "original_complaint": "Hydraulic pump leaking oil continuously.",
      "issue_type": "Mechanical",
      "priority": "Medium",
      "summary": "Hydraulic leakage detected in pump assembly.",
      "created_at": "2026-05-20T13:30:00.123456Z"
    }
  ]
  ```

### 3. Retrieve Single Ticket
- **Endpoint**: `GET /complaints/{ticket_id}`
- **Response Examples**:
  - **Success (200 OK)**:
    ```json
    {
      "ticket_id": "TKT-2026-0001",
      "original_complaint": "Hydraulic pump leaking oil continuously.",
      "issue_type": "Mechanical",
      "priority": "Medium",
      "summary": "Hydraulic leakage detected in pump assembly.",
      "created_at": "2026-05-20T13:30:00.123456Z"
    }
    ```
  - **Not Found (404 Not Found)**:
    ```json
    {
      "detail": "Complaint ticket with ID 'TKT-2026-9999' was not found."
    }
    ```

---

## Architectural Details & Code Quality
This project implements **Clean Architecture** patterns:
- **Routes Layer** (`app/routes/`): Standard REST API transport protocols. Enforces incoming payload format constraints.
- **Orchestration Agent Layer** (`app/agents/`): The core intelligence. Coordinates separate services to perform sequence checks, fetch summaries, run rules and trigger DB storage.
- **Modular Service Layer** (`app/services/`): Single responsibility micro-utilities. E.g., Groq interface, classification rules engines, ticket formatting sequence algorithms.
- **Prisma Client Database Layer** (`app/database.py`): Clean runtime ORM instance management.
- **Pydantic Validation Layer** (`app/schemas/`): Guaranteed type safety, automated type coercion, and robust request body schema generation.
- **Error Safety Fallbacks**: The LLM engine features heuristic fallback parsing to keep the application resilient and online even when LLM JSON decoding encounters errors.
