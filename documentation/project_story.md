# Medi-Assist: Bridging the Healthcare Chasm in Hard Markets

## Inspiration

In the bustling medical clinics of Dhaka and Chittagong, healthcare is a high-volume, high-friction race against time. A single private practitioner or clinic doctor often sees between 60 to 80 patients in a single evening session. In this high-pressure environment, typical of third-world emerging economies like Bangladesh, administration is a luxury. There are no medical scribes, no digital assistants, and no administrative staff typing notes. 

Consequently, doctors rely on hand-written prescription pads, scribble clinical briefs, and look at paper charts. The adoption of traditional Electronic Health Records (EHR) has failed because they require the doctor to spend more time typing on a screen than looking at the patient. 

Furthermore, patients in these markets face severe barriers. While mobile internet penetration is high, digital literacy is highly variable. Demanding that a rural patient create an account, remember a password, verify their email, and navigate complex patient portals is a recipe for abandonment.

We built **Medi-Assist** to disrupt this legacy. We wanted to create a "Unified Ambient Loop"—a zero-friction, passwordless ecosystem that handles patient triage, booking, audio recording, clinical report generation, and SMS follow-ups automatically, allowing the doctor to reclaim their screen-time and focus entirely on patient care.

---

## What it does

Medi-Assist acts as a virtual medical clerk and triage officer:
1. **Frictionless Triage**: A patient arrives at the clinic portal. Instead of logging in, they enter a "zero-login" flow using only a name and phone number. An AI-powered triage agent (powered by the Google Vertex AI Agent Developer Kit (ADK) and Gemini 2.5 Flash) talks to the patient. It is programmed to gather four specific data points: primary complaint, severity (1-10), duration, and recurrence. 
2. **Dynamic Matching & Booking**: Once gathered, it searches the doctor roster, recommends the best matching doctor, explains why, and opens a booking calendar inline.
3. **Ambient Consultation Recording**: When the appointment starts, the doctor hits "Start Session." As they speak naturally with the patient, the browser streams audio chunks to the server in real-time.
4. **Autonomous Analysis & Reporting**: When the session ends, the system automatically merges the audio, transcribes it, and pushes it through a multi-stage background pipeline. Gemini 2.5 Flash reviews the verbal transcript, compares it to the physical vitals typed by the doctor, identifies clinical discrepancies, evaluates patient comprehension, and compiles a comprehensive clinical report.
5. **Real-Time Delivery & Follow-Ups**: The doctor's screen updates in real-time as the report components compile. The pipeline automatically schedules a patient-friendly follow-up message (under 30 words, zero emojis) in the SMS/email queue.

---

## How we built it

We designed Medi-Assist as a hybrid, cost-efficient, and low-latency cloud infrastructure that could run reliably on tight budgets:
- **Frontend**: Next.js SPA hosted on the **Vercel Edge Network** for rapid caching and global delivery.
- **Backend**: **FastAPI** web server running in Docker containers on **AWS App Runner**, which scales automatically and handles HTTPS load balancing.
- **Data Layer**: **PostgreSQL** database integrated via SQLAlchemy for all clinic records, utilizing GIN trigram indexes for high-speed doctor search.
- **Asynchronous Pipeline**: Built using FastAPI's native `BackgroundTasks` to execute multi-stage tasks without holding up HTTP requests.
- **Real-Time Sync**: Instead of deploying an expensive Redis cluster (which is cost-prohibitive for bootstrapped clinics in emerging markets), we engineered a real-time event broker using **PostgreSQL LISTEN/NOTIFY** wire protocol. FastAPI listens to the DB broadcast and pushes updates directly to active React client streams using **Server-Sent Events (SSE)**.
- **AI Core**: Orchestrated using **Vertex AI SDK** with `gemini-2.5-flash` for report compiling, and Vertex AI ADK for stateful patient chats.

---

## Challenges we ran into

### 1. The Mobile Connectivity and Latency Problem
Emerging market users experience frequent connectivity drops. Standard WebSockets or polling methods created immense overhead.
*   *Solution*: We deployed unidirectional **Server-Sent Events (SSE)**. SSE handles auto-reconnection out of the box. Because Next.js API route rewrites buffer responses (breaking SSE streaming), we configured our frontend hooks to connect directly to the FastAPI domain on AWS App Runner, bypassing proxies entirely.

### 2. Eliminating the Authentication Block
Requiring passwords in markets with low digital literacy leads to high bounce rates.
*   *Solution*: We built a passwordless cookie-based session verification layer. Patients get instant access to triage and booking, while sensitive clinical panels are locked behind secure JWT tokens issued to verified doctors.

### 3. PostgreSQL NOTIFY Payload Limits
PostgreSQL NOTIFY payloads are limited to 8,000 bytes. Long transcripts and detailed reports threatened to overflow the buffer.
*   *Solution*: We modularized the event dispatch in [pg_notify.py](file:///home/rafxtgt/Documents/work/hackathons/aws-and-vercel/medi-assist/backend/util/pg_notify.py). By dividing notifications into step-level events (`transcription_complete`, `report_generated`, `followup_queued`), we kept the payload of each notify block well within the 8KB limit.

---

## Accomplishments that we're proud of

*   **Zero-Infrastructure Event Broker**: Chaining PostgreSQL LISTEN/NOTIFY to FastAPI SSE queues allowed us to bypass Redis, saving substantial server costs and simplifying deployments.
*   **The Clinical Audit System**: Doctors often forget to write down verbal agreements or vital anomalies on forms. Our Gemini 2.5 Flash prompt compares the verbal transcript with the physical note form, generating a "discrepancy log" that saves doctors from critical compliance and clinical mistakes.
*   **Vertex AI ADK Chatbot Integration**: The triage chatbot behaves like a human coordinator, asking one question at a time instead of dumping a form on the patient, lowering the barrier to digital healthcare access.

---

## What we learned

We learned that in emerging markets, **simplicity and efficiency trump complexity**. We modeled the clinic throughput increase and infrastructure cost equations to guide our design:

### Patient Throughput Formula
The patient throughput of a clinic doctor can be modeled as:
\[T = \frac{P}{t_c + t_a}\]
Where:
- \(T\) is the patient throughput (patients/hour).
- \(P\) is the active clinic hours.
- \(t_c\) is the consultation time.
- \(t_a\) is the administrative time spent typing, writing notes, and booking follow-ups.

By using the **Unified Ambient Loop**, administrative time is slashed to zero (\(t_a \approx 0\)), allowing throughput to scale exponentially:
\[T_{\text{ambient}} = \frac{P}{t_c}\]

### Infrastructure Cost Saving
By replacing a Redis/Celery queue cluster with Postgres-native LISTEN/NOTIFY and FastAPI BackgroundTasks, we reduced running server costs:
\[\text{Savings} = C_{\text{Redis}} + C_{\text{Celery\_Worker}} - C_{\text{Postgres\_LISTEN}} \approx \$45/\text{month}\]
For a small clinic in a developing market, this savings covers a significant portion of their monthly API budget.

---

## What's next for MediAssist

1. **Multilingual Audio Transcription (Bengali + English / "Banglish")**: In Bangladesh, consultation conversations are rarely in pure English or pure Bengali; they are a mix ("Banglish"). We plan to integrate multilingual speech models that can accurately transcribe mixed dialects.
2. **Offline-First Audio Buffering**: Building service workers in the Next.js frontend to queue audio chunks locally in IndexedDB if the clinic's Wi-Fi drops, uploading them automatically when connection resumes.
3. **SMS Gateway Integration**: Hooking up local SMS gateways (like SSL Wireless) to push the generated `follow_up_msg` directly to basic mobile phones as offline SMS alerts.
