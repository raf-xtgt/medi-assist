## 1. Target Market & Deployment Profile

* **Primary Users:** Small-to-medium clinics, private practices, and solo physicians.
---

## 2. Admin System (Operational Console)

Designed to let a single receptionist, office manager, or the physician running a solo practice manage the entire operational footprint from one clean dashboard.

* **Authentication:** Passwordless signup and secure login using a verified mobile phone number via an OTP (One-Time Password) flow.
* **Provider Profile Management:** Admin can create, update, or remove doctor profiles by entering their full name, bio/specialty details, credentials, and uploading a high-resolution professional headshot.
* **Availability Engine:** A highly visual, drag-and-drop web calendar grid where admins define standard weekly working hours, custom shifts, block out vacation times, or set specific slot buffers for individual doctors.
* **Legacy Patient Onboarding:** To support practices migrating from paper or clunky desktop systems, the admin can manually register existing patients. Fields include: Name, Age, Email, Phone, Physical Address, and a Markdown text area for legacy medical history/notes.
* **Relational Directory:** A cross-referenced directory showing all active doctors, along with a searchable list of patients assigned to each provider's care panels.
* **Operational Health Dashboard:** A real-time data grid breaking down the day's appointments by status metrics:
* *Total Appointments* (Scheduled capacity)
* *Remaining* (Upcoming slots for the day)
* *Done* (Completed appointments with finalized notes)
* *Postponed/Canceled* (Slots freed or moved)


---

## 3. Doctor Workspace (The Ambient Core)

The single screen where clinical care meets automated charting, optimizing focus by pulling data entry into the background.

* **Scoped Access & Authentication:** Doctors log in securely using their mobile number via an OTP flow. The interface restricts their visibility, ensuring they can view, edit, and manage **only their own calendar and patient charts**.
* **Calendar Mechanics:** A mobile-responsive scheduler allowing doctors to quickly move, reschedule, or cancel slots on the fly with single-tap gesture controls.
* **The Ambient Session Loop:** A prominent, unmistakable control panel inside the active patient timeline:
1. **"Start Appointment":** Activating this triggers the browser's native audio API to stream ambient consultation audio securely to the backend. The UI displays a live, subtle wave visualizer indicating active recording.
2. **Structural Data Entry Layer:** While the conversation flows, a clean text grid remains active on-screen, allowing the doctor to manually type out prescriptions (Medicine Name, Dosage Frequency, Duration, and specific structural remarks) or capture immediate vitals.
3. **"End Appointment":** Clicking this kills the live audio stream and instantly triggers the backend multi-agent pipeline to process the session payload.


* **The AI Post-Visit Brief:** Within seconds of ending the session, the UI renders the generated output for review before committing it to the database:
    * *Clinical Insights Grid:* Bulleted high points of the conversation.
    * *Patient Instructions Directive:* A translated, jargon-free summary of things the patient needs to do.
    * *Prescription Verification:* A structural review matching the typed inputs against the conversation context to flag discrepancies.


---

## 4. Patient Experience (Frictionless Web Layer)

A client-facing web application optimized for mobile viewports, prioritizing rapid conversion with absolute minimal form-field fatigue.

### The Forked Landing Page

When a patient accesses the clinic's URL, they are met with a minimal, zero-login split interface:

1. `[ Book Appointment ]` (The Bypass Path)
2. `[ Ask a Question / Triage ]` (The Conversational Path)

```
                       ┌──────────────────────────┐
                       │  Clinic Hosted Landing   │
                       └────────────┬─────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         [ Book Appointment ]           [ Ask a Question / Triage ]
         (Direct-to-Calendar)             (AI Web Chat Helpdesk)
                    │                               │
                    │                    Captures: Name & Phone
                    │                               │
                    │                    Triages Symptoms & Needs
                    │                               │
                    │                    Recommends Matching Doctor
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
                      ┌──────────────────────────┐
                      │  Passwordless Calendar   │
                      │  & Mobile Card Capture   │
                      └─────────────┬────────────┘
                                    ▼
                      ┌──────────────────────────┐
                      │  Auto-Provision Account  │
                      │  & Trigger Confirmation  │
                      └──────────────────────────┘

```

### The Direct-to-Calendar Bypass

If the patient clicks **Book Appointment**, they bypass all conversational layers:

* They type the doctor's name or pick from a simple visual card directory featuring headshots and specialty tags.
* The system serves a passwordless calendar layout. The patient taps an open slot, inputs their Name and Mobile Number, and clicks "Confirm Booking" to finalize the transaction.

### The AI Web-Chat Helpdesk (Cost-Optimized Onboarding)

If the patient selects **Ask a Question / Triage**, they enter a web-native chat workspace:

* **Disconnection Insurance Gate:** Before the LLM processes a single token, a simple modal forces the input of **Name** and **Mobile Number**. If the browser tab closes mid-chat, the lead is preserved, and the admin console flags it for manual follow-up.
* **Intelligent Triaging:** The patient describes their symptoms, recovery concerns, or general scheduling needs in natural language. The triage agent processes the text, matches their problem profile against the staff directory, and suggests the ideal provider.
* **The Intent Pivot:** The agent asks: *"Would you like me to go ahead and secure an open slot with Dr. [Name] to get this looked at?"* If the patient confirms, the chat window transitions seamlessly into the visual calendar view with that doctor already pre-selected.

### Unified Relational Data Rules

Upon confirming any booking via either path, the system evaluates the database:

* If the mobile number does not exist, it instantly spins up a secure patient profile in the background with zero password workflows.
* The data structure enforces a robust **Many-to-Many Architecture**: One doctor manages a panel of many patients, and a single patient can maintain active medical case relationships across multiple doctors within the practice network based on their distinct clinical needs.

---

## 5. The Asynchronous Follow-Up Engine

To keep unit economics highly sustainable, conversational SMS loops are replaced with strict, high-leverage transactional triggers.

* **The Trigger:** The follow-up queue is generated entirely from the validated output authorized by the doctor at the close of an appointment session.
* **The Delivery Matrix:** The system schedules and fires precise, short-form transactional text alerts to the patient's phone at strategic intervals (e.g., 24 hours post-visit, 7 days post-visit).
* **Content Archetype:** Rather than a generic reminder, messages are hyper-specific to the care timeline:
> *"Hi James, hope the recovery is going well. Just a reminder from Dr. Rahman to finish your 5-day antibiotic course by Friday. If the swelling hasn't gone down, click here to request a quick follow-up window: [Magic Link]"*



---

## 6. Multi-Agent Orchestration Architecture

A backend ecosystem built using specialized worker nodes, optimized for structured text extraction and quick inference turnarounds.

```
                  ┌────────────────────────────────────────┐
                  │       Active Audio Session Stream       │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                       [ AppointmentListenerAgent ]
                       (Continuous Capture & Text Stitching)
                                      │
                                      ▼
                        [ AppointmentReportAgent ]
                        (Orchestrator Node)
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
[ KeyPointsGenerator ]      [ PatientFileGenerator ]  [ FollowUpGeneratorAgent ]
(Clinical Context Extraction) (Structural Graph Schema) (Lean SMS Payload Matrix)

```

### 1. AppointmentListenerAgent

* **Core Mandate:** The active ingestion node during an appointment session.
* **Behavior:** Runs continuously in the background during a live call, executing high-fidelity audio chunk stitching and streaming it directly to a low-latency speech-to-text transcription engine. It produces a perfectly timestamped text transcript of the clinical encounter.

### 2. AppointmentReportAgent

* **Core Mandate:** The primary orchestrator node that activates immediately upon the "End Appointment" trigger.
* **Behavior:** Ingests the finalized raw transcript text block along with any manual structured data typed in by the physician. It handles input validation, coordinates execution boundaries, and fans out targeted data sub-payloads to three specialized sub-agents.

#### Sub-Agent A: AppointmentKeyPointsGenerator

* **Core Mandate:** Isolate and extract clinical truths.
* **Behavior:** Uses a highly focused prompt template optimized for medical domain filtering. It strips out conversational filler and summarizes key talking points, explicit physician instructions, visual observations, and home-care directives into a clean, parsed markdown schema.

#### Sub-Agent B: PatientFileGeneratorAgent

* **Core Mandate:** Maintain absolute data integrity within the patient's record.
* **Behavior:** Translates the post-visit clinical summary into structured database updates. It isolates new clinical parameters (like newly stated allergies, updated chronic conditions, or structural medication histories) and stages them to update the patient profile graph database without overwriting verified legacy files.

#### Sub-Agent C: FollowUpGeneratorAgent

* **Core Mandate:** Translate clinical directives into high-conversion patient notifications.
* **Behavior:** Ingests the highlighted patient instruction summary and references the scheduled timeline logic. It drafts concise, warm, actionable text follow-ups stripped of medical jargon, ensuring they fit safely inside single-segment text message limits to optimize pass-through API costs.

### 3. PatientReportAgent

* **Core Mandate:** Deliver instant clinical contextual recall to the provider.
* **Behavior:** A dedicated, read-only chat utility accessible via the Doctor Workspace. Before entering the exam room, the physician can trigger this agent to query the patient's timeline history. It processes historical notes, past prescriptions, and compliance data from prior visits to surface a 3-bullet "clinical briefing," instantly refreshing the doctor's mind on recurring conditions before the appointment begins.

---

