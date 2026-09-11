# Criteria Fulfillment: MediAssist

This document outlines how **MediAssist** satisfies and exceeds the judging criteria for the Hackathon: **Technological Implementation**, **Design**, **Impact & Real-world Applicability**, and **Originality**. Built as a monetizable B2B application for small to medium-sized clinics, private practices, and solo physicians, the system integrates a robust full-stack architecture to solve a critical real-world problem: administrative burnout.

---

## 1. Technological Implementation

### A. AWS Database Integration & Deliberate Data Model
MediAssist utilizes **AWS Aurora PostgreSQL** as its primary relational engine, featuring a highly normalized, structured data model designed specifically for medical practice workflows. 

*   **Cohesive Schema Layout**: All schemas are defined with transactional integrity, foreign key relations, and optimized indexes. The schema includes 17 relational tables representing core medical entities (refer to [db-tables.md](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/documentation/db-tables.md)):
    *   **Core Systems**: `app_mda_user`, `app_mda_prmn` (Permissions).
    *   **Clinic Management**: `app_mda_clinic_hdr` (supporting multi-clinic slugs and metadata).
    *   **Provider & Patient Directories**: `app_mda_doctor`, `app_mda_patient`, and `app_mda_doctor_patient_link` (managing secure, HIPAA-compliant patient-doctor rosters).
    *   **Operational Workflows**: `app_mda_doctor_availability`, `app_mda_appointment`.
    *   **Unified Ambient Loop Elements**: `app_mda_appointment_session`, `app_mda_appointment_note`, `app_mda_clinical_report`, `app_mda_prescription`, and `app_mda_follow_up_queue`.
    *   **Patient Triage Intake**: `app_mda_lead_chat_hdr`, `app_mda_lead_chat_transcript`.

*   **PostgreSQL-Specific Optimization (`pg_trgm` GIN Indexes)**: To support AI-driven doctor matching during triage without sacrificing performance, the database employs GIN (Generalized Inverted Index) trigram indexes on text-heavy columns (refer to lines 331–333 of [db-tables.md](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/documentation/db-tables.md)):
    ```sql
    CREATE INDEX idx_doctor_name_trgm ON app_mda_doctor USING GIN (name gin_trgm_ops);
    CREATE INDEX idx_doctor_specialty_trgm ON app_mda_doctor USING GIN (specialty gin_trgm_ops);
    CREATE INDEX idx_doctor_email_trgm ON app_mda_doctor USING GIN (email gin_trgm_ops);
    ```
    These indexes are leveraged in [app_mda_doctor_service.py](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/backend/service/app_mda_doctor_service.py#L111-L200) to perform ultra-fast fuzzy searches using SQL `ILIKE` operators, parsing patient search strings into clean tokens while stripping common stop words.

### B. Complex Joins & Database Operations
Instead of performing multiple database round-trips or relying on client-side joins, the backend runs optimized SQL queries joining several relational entities:

1.  **Admin Dashboard (Metrics & Roster Retrieval)**: 
    *   Endpoint: `GET /api/dashboard/admin` in [app_mda_dashboard_controller.py](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/backend/controller/app_mda_dashboard_controller.py#L26-L141).
    *   Operation: Joins appointments (`AppMdaAppointment`), patients (`AppMdaPatient`), doctors (`AppMdaDoctor`), and notes (`AppMdaAppointmentNote`) to compile clinic schedules, calculate completion rates, and evaluate doctor utilization ratios against calendar configurations.
2.  **Doctor Dashboard (Clinical Feed & Queue)**:
    *   Endpoint: `GET /api/dashboard/doctor` in [app_mda_dashboard_controller.py](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/backend/controller/app_mda_dashboard_controller.py#L144-L300).
    *   Operation: Resolves upcoming appointments, extracts triage summaries (via `AppMdaLeadChatHdr` joined on `lead_guid`), tracks unreviewed sessions (`AppMdaAppointmentSession`), and computes average consultation duration using PostgreSQL specific timestamp math (`func.avg(extract('epoch', updated_date - created_date) / 60)`). It also merges reports, notes, and prescriptions into a single unified temporal activity feed using multiple distinct SQL joins.
3.  **Roster Patient-Doctor Mapping & Appointment Counts**:
    *   Endpoint: `GET /api/doctor/patients` in [app_mda_doctor_controller.py](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/backend/controller/app_mda_doctor_controller.py#L141-L167).
    *   Operation: Compiles a subquery aggregating completed appointments per patient, then performs a primary join between `AppMdaDoctorPatientLink` and `AppMdaPatient`, outer-joining the aggregated counts.
4.  **Doctor Scheduler Patient List**:
    *   Service: `get_appointments_by_doctor` in [app_mda_appointment_service.py](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/backend/service/app_mda_appointment_service.py#L128-L173).
    *   Operation: Chains `AppMdaDoctorPatientLink` to `AppMdaPatient`, outer-joins the triage headers (`AppMdaLeadChatHdr`), and joins `AppMdaAppointment` on doctor and patient matching constraints to fetch active schedules with pre-visit intake contexts in a single query.

### C. Advanced Vercel & AWS App Runner Deployments (Beyond Basics)
The deployment pipeline goes beyond basic click-to-deploy systems by utilizing containerization, dynamic environment linking, and edge optimization:

*   **Backend on AWS App Runner (`deploy_backend.sh`)**:
    *   The backend is fully containerized using a clean multi-stage `Dockerfile` running Python 3.11-slim, FastAPI, and Uvicorn.
    *   The deployment script [deploy_backend.sh](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/deploy_backend.sh) builds and pushes the image to **AWS ECR**.
    *   It provisions an ECR access IAM Role (`AppRunnerECRAccessRole`), dynamically parses local secrets from `.env`, encodes Google Cloud Service Account JSON credentials to base64 (`GCP_CREDS_JSON_BASE64`), and uploads the combined runtime environment variables directly to AWS App Runner.
    *   App Runner hosts the FastAPI app behind managed SSL, providing horizontal auto-scaling and maintaining persistent, non-buffered connections needed for Server-Sent Events (SSE).
*   **Frontend on Vercel (`deploy_frontend.sh`)**:
    *   The Next.js frontend is deployed to Vercel via [deploy_frontend.sh](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/deploy_frontend.sh).
    *   Instead of hardcoding APIs, the script queries the live AWS App Runner backend to extract its assigned URL, and uses the Vercel CLI to securely push variables (`NEXT_PUBLIC_API_BASE_URL` and `FASTAPI_URL`) to Vercel's production environment.
    *   It also automatically configures local development variables to point to `localhost:8000`, preserving testing speed for development cycles.

---

## 2. Design

### A. Intuitive and Well-Considered User Experience
MediAssist implements clean, modern interface designs tailored specifically to three distinct user archetypes:
1.  **Clinic Admin**: A high-level portal providing clinical operational metrics, appointment completion KPIs, doctor availability management, and slug-based clinic-site generation.
2.  **Clinician (Unified Ambient Loop Workspace)**: A premium dark-mode, single-page interface ([AmbientCoreWorkspace.tsx](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/frontend/components/doctor/AmbientCoreWorkspace.tsx)) optimized for in-consultation usage. It minimizes cognitive load by putting recording triggers, real-time transcription feeds, patient clinical history charts, and prescription sheets into a single, cohesive interface.
3.  **Patient (Mobile Triage Helpdesk)**: A passwordless, magic-link driven responsive application ([PatientLanding.tsx](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/frontend/components/patient/PatientLanding.tsx)) that eliminates user credentials. Patients can easily converse with the AI triage system to discuss symptoms, view recommended practitioners, and book appointments instantly.

### B. Front-End / Back-End Cohesion via Real-Time SSE
The front-end and back-end demonstrate seamless full-stack cohesion via the **Unified Ambient Loop** (see [sse-pipeline-architecture.md](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/documentation/sse-pipeline-architecture.md)):
1.  **Connection**: The doctor's browser establishes a Server-Sent Events (SSE) stream via `EventSource` listening at `/api/ambient-session/events/{doctor_guid}` (handled in [ambient_session_controller.py](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/backend/controller/ambient_session_controller.py#L342-L392)).
2.  **Recording & Chunking**: During a consultation, the frontend uploads raw audio in sequential chunks to `/api/ambient-session/upload-chunk`, which are uploaded to GCS.
3.  **Asynchronous Execution**: When the doctor clicks "End Appointment", `/api/ambient-session/end` is triggered, immediately freeing the frontend thread while spawning a background thread (`_process_session_pipeline`) in FastAPI.
4.  **Pub/Sub & Broadcast**: As the background thread finishes clinical tasks, it commits data to PostgreSQL and publishes messages using PostgreSQL's native `LISTEN/NOTIFY` system (via [pg_notify.py](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/backend/util/pg_notify.py)).
5.  **Reactive UI Transition**: The backend listener intercepts notifications on the database connection and routes them to the SSE queues. The UI immediately reacts to events:
    *   `transcription_complete`: Pushes the transcribed dialogue onto the screen.
    *   `report_generated`: Automatically fills out the SOAP note (Summary, Key Observations, Red Flags, Care Plans, and Audit discrepancies).
    *   `followup_queued`: Renders the draft patient message for approval.

This eliminates polling and creates a real-time reactive interface that bridges browser interactions and backend processing.

---

## 3. Impact & Real-World Applicability

### A. Solves the Real-World Physician Burnout Crisis
Administrative tasks like charting, scheduling, and phone triaging consume up to 50% of a physician's workday. MediAssist directly resolves this:
*   **Unified Ambient Loop**: Auto-generates clinical notes from speech, eliminating manual charting after each patient visit.
*   **Automated Verification and Safety**: Compares generated SOAP notes against initial patient triage intake records to flag clinical discrepancies (preventing medication errors or missed diagnostics).
*   **Passwordless Conversion**: Standard portal architectures require credentials, leading to booking drop-offs. MediAssist's portal-free booking flow converts patient triage questions into bookings using secure, magic link parameters.

### B. Highly Viable and Shippable Stack
MediAssist is architected for production viability:
*   **Infrastructure Scalability**: AWS App Runner scales automatically based on load, while AWS Aurora PostgreSQL handles high concurrency with database indexing and connection management.
*   **HIPAA-Compliant Layout**: Separates incoming leads (`app_mda_patient_lead`) from registered medical records, uses UUIDs for record referencing, and supports secure transmission via App Runner HTTPS/TLS.

---

## 4. Originality

### A. The "Unified Ambient Loop" with Auditing
While simple transcription tools exist, MediAssist introduces a complete loop:
```
Dialogue Audio ──→ Transcription ──→ Clinical Charting (SOAP) ──→ Discrepancy Auditing vs. Patient Intake ──→ Patient Summary Message
```
The Gemini-powered engine does not just transcribe; it cross-references the doctor's consultation dialogue with the patient's initial triage questionnaire to highlight medical form discrepancies. This helps clinicians identify discrepancies (e.g., if a patient mentioned left-side numbness during triage but it was omitted during the diagnostic review).

### B. Zero-Broker Messaging (Aurora Pub/Sub)
Instead of deploying heavy, expensive messaging architectures (like RabbitMQ, Apache Kafka, or Redis Pub/Sub), the system utilizes **PostgreSQL's native `LISTEN/NOTIFY` protocol** paired with Python `asyncio` queues. This approach:
1.  Keeps the database as the single source of truth for both persistence and messaging.
2.  Maintains a highly lean stack, which is critical for solo practitioners and small clinics seeking to minimize hosting overhead.
3.  Leverages connection pooling to handle real-time notification routing directly on the database engine.
