# Library Service

A modern, full-stack library management system utilizing **gRPC** for high-performance communication, **Next.js** for a responsive frontend, and **PostgreSQL** for robust data persistence.

## 🚀 Features
- **Book Inventory:** Real-time listing and gallery of available books retrieved via gRPC.
- **Admin Control:** Streamlined interface for registering new books with ISBN validation.
- **Borrowing System:** Integrated state management to mark books as borrowed in PostgreSQL.
- **Member Management:** Backend gRPC support for registering library members via `CreateMember` RPC.
- **Service Validation:** Multi-layer validation for ISBN formats and input lengths to ensure data integrity.

## 🛠️ Tech Stack
- **Frontend:** Next.js 14 (TypeScript), Tailwind CSS
- **Backend:** Python 3.x, gRPC, Psycopg2
- **Database:** PostgreSQL 15+
- **Communication:** Protocol Buffers (Proto3)

---

## 📦 Project Structure
```text
library-service/
├── backend/
│   ├── app/
│   │   ├── database.py         # PostgreSQL connection logic
│   │   ├── main.py             # gRPC Server implementation
│   │   └── test_grpc.py        # Backend testing scripts (Member creation)
│   ├── codegen/                # Generated gRPC Python stubs
│   │   ├── library_pb2.py
│   │   └── library_pb2_grpc.py
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── app/                    # Next.js App Router (UI & API Routes)
│   ├── lib/                    # Shared frontend utilities
│   ├── public/                 # Static assets
│   ├── next.config.ts          # Next.js configuration
│   └── package.json            # Node.js dependencies
├── proto/
│   └── library.proto           # gRPC Service & Message definitions
├── scripts/
│   └── init.sql                # Database schema initialization
└── .gitignore                  # Git exclusion rules
```

---

## ⚙️ Setup & Installation

### 1. Database Configuration
1. Ensure **PostgreSQL** is running on your local machine (`127.0.0.1:5432`).
2. Create a new database named `library_service_db`.
3. Execute the `scripts/init.sql` file using your preferred SQL tool (pgAdmin, psql) to create the `books` and `members` tables.
    - **Default Username:** `postgres`
    - **Default Password:** `lib_password`

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary Python libraries:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the gRPC server:
   ```bash
   python app/main.py
   ```
   *The server will listen on port `50051`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node.js packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The UI will be accessible at [http://localhost:3000](http://localhost:3000).*

---

## 🧪 Testing the Service

### Book Management (Frontend)
- **Gallery:** View the current collection. Click **Borrow** on any book to update its availability status in the database.
- **Admin Panel:** Add new books to the system. *Note: The ISBN field requires a minimum of 10 characters.*

### Member Management (Backend)
To verify that the `CreateMember` gRPC functionality is working correctly without the UI, run the provided test script:
```bash
python backend/app/test_grpc.py
```
