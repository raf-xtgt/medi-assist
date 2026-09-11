# MediAssist Demo Video Script (Refined)

**Target Duration**: 2 Minutes and 55 Seconds (175 seconds total)
**Voiceover Pace**: Steady, professional, and clear (~130 words per minute)

---

## Technical Stack Highlights to Emphasize
1. **Frontend**: Next.js deployed on **Vercel** with dynamic routing and environment variables.
2. **Backend**: FastAPI deployed on **AWS App Runner** supporting persistent Server-Sent Events (SSE).
3. **Database**: **AWS Aurora PostgreSQL** utilizing GIN indexes (`pg_trgm`), relational subqueries, and native `LISTEN/NOTIFY` pub/sub signaling.

---

## Capture & Form Speed-Up Guidelines
*   **Speeding Up Form Fills**: Since the video must show clinic creation, doctor availability, patient symptom input, and clinical reports, record your screen at normal speed (1x) and type normally. In your video editor (e.g., Premiere, CapCut, or Camtasia), apply a **3x to 5x speed ramp** (300%–500% speed) over the typing sequences. This keeps the demo dynamic and fits within the tight 2:55 limit.
*   **Frictionless Login**: Clicking "Enter Portal" automatically logs the user in with pre-filled dummy OTPs, bypassing verification steps to show immediate dashboard responsiveness to the judges.

---

## Storyboard & Voiceover Script

| Timestamp | Visual (What to show in the demo) | Audio (Exact Voiceover script) |
| :--- | :--- | :--- |
| **0:00 - 0:15** | **B-roll footage**: A stressed physician at a desk, buried in stacks of physical files or clicking through a clunky, dated healthcare software portal. | Solo practices and small clinics face a crisis of administrative burnout, spending up to half their day on scheduling, phone triaging, and charting. |
| **0:15 - 0:25** | MediAssist landing page, showing the clear value prop: "Consolidated charting, scheduling, and triage into one portal-free workflow." | MediAssist replaces clunky, fragmented legacy software with a platform-agnostic, portal-free AI Patient Management System. |
| **0:25 - 0:40** | **Speed-up Sequence (3x)**: Admin clicks "Enter Portal" (bypassing auth barriers). Admin creates a clinic and adds doctor details/availability. The slug is generated and clicked. | The admin portal, deployed on Vercel, allows solo practices to register clinics and assign staff. Clinic sites are generated instantly leveraging Next.js Dynamic Routing. |
| **0:40 - 0:55** | 1. Dynamic Interaction (1x Speed): Show the Admin Edit Clinic screen with the side-by-side layout: Left side displays the Google Maps Card (Step 1); right side displays the Website Template Preview (Step 2). <br><br> 2. The cursor clearly clicks the blue "Website ↗" icon on the mock Google Maps card.<br><br> 3. The browser instantly switches tabs to show the live public patient page loading seamlessly at /clinic/seattle-orthopedics. | To solve local patient discovery, MediAssist maps instant template styling directly to an interactive Google Business Profile preview. Clicking on the 'Website link' redirects instantly via dynamic routing to the zero-infra clinic landing page accessible to patients, allowing for high-conversion triage. |
| **0:55 - 1:15** | **Speed-up Sequence (3x)**: Mobile view. Patient types: "Having severe headaches and neck stiffness." AI Triage Helpdesk responds, asks questions, and recommends a doctor. | Patients enter symptoms into our AI Triage Helpdesk. Powered by Gemini, the helpdesk gathers clinical severity and matches patients to the right specialist. |
| **1:15 - 1:30** | **Overlay Code Snippet** showing GIN index definition and SQLAlchemy fuzzy matching filter: *refer code snippet 1* | To accelerate doctor matching, the system executes fuzzy searches against Aurora PostgreSQL, optimized with trigram GIN indexes. The booking is secured instantly via magic links. |
| **1:30 - 1:45** | Doctor dashboard. Doctor logs in (frictionless bypass), navigates to "Consult", and selects the triage-matched patient. | Doctors log in securely to their dashboard. In the consult screen, they see upcoming triage notes and select the patient from the queue to start the visit. |
| **1:45 - 2:00** | **B-roll footage**: A doctor having a natural, friendly discussion with a patient in an examination room. Pulse recording animation overlays the footage. | The doctor opens the Unified Ambient Loop. As they speak with the patient, consultation audio is uploaded in chunks directly to Google Cloud Storage. |
| **2:00 - 2:20** | **Overlay Code Snippet** showing the SSE and pub/sub routing on App Runner: *refer code snippet 2* | Clicking End Appointment triggers an async AI pipeline. The FastAPI backend processes the dialogue, records medical charts in Aurora, and pushes updates to the Vercel frontend in real-time via Server-Sent Events. |
| **2:20 - 2:35** | **Speed-up Sequence (3x)**: The doctor reviews the auto-populated SOAP chart, updates the generated prescription dosage, and reviews discrepancy flags. | The system also cross-references the live consult with the initial patient triage questionnaire, highlighting clinical discrepancies to reduce diagnostics errors and physician liability. |
| **2:35 - 2:50** | Patient mobile screen showing timeline history of past visits. Patient goes back to "Home" to start a new symptom search. | Returning patients bypass signup entirely, viewing their treatment history on a secure timeline. They can instantly triage new symptoms and book follow-ups. |
| **2:50 - 2:55** | Final call to action showing: "MediAssist: Clinical management, simplified. Deployed on Vercel & AWS." | MediAssist makes clinical care seamless and high-converting, leveraging Vercel and AWS Aurora PostgreSQL. Experience the future of practice management today. |


## Code snippets

1. code snippet - 1 <br><br>
**1:15 - 1:30** : <br><br>```sql\n-- Accelerated on Aurora Postgres:\nCREATE INDEX idx_doctor_name_trgm \nON app_mda_doctor USING GIN (name gin_trgm_ops);\n```<br>```python\n# GIN Trigram Fuzzy Query\nfor token in tokens:\n    pattern = f"%{token}%"\n    token_filters.append(AppMdaDoctor.name.ilike(pattern))\n    token_filters.append(AppMdaDoctor.specialty.ilike(pattern))\nreturn db.query(AppMdaDoctor).filter(or_(*token_filters))\n```

2. code snippet - 2 <br><br>
**2:00 - 2:20** : <br><br>```python\n@router.get("/events/{doctor_guid}")\nasync def session_events_stream(doctor_guid: str):\n    async def event_generator():\n        queue = register_queue(doctor_guid)\n        try:\n            while True:\n                payload = await queue.get()\n                yield f"event: {payload['event']}\\ndata: ...\\n\\n"\n        finally:\n            unregister_queue(doctor_guid, queue)\n    return StreamingResponse(event_generator(), ...)\n```

lookback: 
**0:40 - 0:55** | Show the GBP view
**2:20 - 2:35** | modify transcript to be consistent with data in the ambient panel - reduce discrepancy
