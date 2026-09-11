# Demo flow

## Problem statment
MediAssist - An AI-powered Patient Management System that is a lean, platform-agnostic solution built specifically to eliminate administrative burnout for small clinics and solo practices. It features a cost-effective, web-first AI triage helpdesk that naturally converts inquiries into portal-free, passwordless calendar bookings using secure magic links. For clinicians, the "Unified Ambient Loop" securely records consultations to auto-generate clinical charts and verify prescriptions,. By consolidating charting, scheduling, and triage into one seamless workflow, it replaces clunky legacy stacks with a simple, high-conversion solution.


## Step-1 : Admin flow
1. Admin goes to the site landing page and clicks "Enter portal" in the admin card of  LandingPage in #page.tsx .

2. Admin logins using mobile phone and dummy otp.

3. The admin is taken to the admin dashboard. They click on clinics menu and are taken to #ClinicListing.tsx .

4. Admin creates clinics and adds a doctor to the clinic.

5. Admin clicks on the "clinic site" url and redirects to the site (using dynamic routing via slug). 



## Step-2: First time patient flow (mobile view)
1. The patient accesses the clinic site.

2. The patient clicks on the "Get Help" button in the clinic site and is taken to the patient landing page in #PatientLanding.tsx .

3. The patient keys in their name and phone number in the "gate view". Patient then take to the #UnifiedBookingTriage.tsx , searches for symptom and is able to triage with the ai helpdesk in #TriageChat.tsx .

4. The helpdesk recommends doctor . The patient books the appointment. Patient taken to the PatientHomePage in #page.tsx .



## Step-3: Doctor flow
1. Doctor goes to the site landing page and clicks "Enter portal" in the doctor card of  LandingPage in #page.tsx .

2. Doctor logins using mobile phone and dummy otp. They are taken to the doctor dashboard. They click on "Consult" menu and are taken to the #AmbientCoreWorkspace.tsx .

3. They select the "aforementioned" patient from the scheduler, start the appointment, key in the clinical notes and prescriptions. Click end appointment and the "AI Post-Visit Brief" is generated.




## Step-4: Repeat patient flow (mobile view)
1. The patient clicks on the "Get Help" button and are taken to the PatientHomePage in #page.tsx .

2. They click on records and can see their timeline history.

3. They go back to the "Home" and search for a new problem. AI recommends doctor, they book appointment.



## Step-5: Repeat patient appointment flow 
1. The doctor clicks on the patient record in the #AmbientScheduler.tsx and checks their timeline history.

2. They start the appointment, key in clinical notes, prescriptions and ends appointment. The "AI Post-Visit Brief" is generated.

