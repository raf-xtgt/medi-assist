-- 1. app_mda_user
CREATE TABLE IF NOT EXISTS app_mda_user (
    guid UUID PRIMARY KEY,
    email VARCHAR(255),
    phone VARCHAR(50),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_app_mda_user_email ON app_mda_user USING BTREE (email);
CREATE INDEX IF NOT EXISTS idx_app_mda_user_phone ON app_mda_user USING BTREE (phone);
CREATE INDEX IF NOT EXISTS idx_app_mda_user_status ON app_mda_user USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_user_created_date ON app_mda_user USING BTREE (created_date);

-- 2. app_mda_prmn
CREATE TABLE IF NOT EXISTS app_mda_prmn (
    guid UUID PRIMARY KEY,
    user_guid UUID,
    role VARCHAR(50),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_app_mda_prmn_user_guid ON app_mda_prmn USING BTREE (user_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_prmn_role ON app_mda_prmn USING BTREE (role);
CREATE INDEX IF NOT EXISTS idx_app_mda_prmn_status ON app_mda_prmn USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_prmn_created_date ON app_mda_prmn USING BTREE (created_date);


-- 3. app_mda_clinic_hdr
CREATE TABLE IF NOT EXISTS app_mda_clinic_hdr (
    guid UUID PRIMARY KEY,
    name VARCHAR(255),
    website_url text,
    slug VARCHAR(100),
    site_metadata JSON,
    created_by_guid UUID,
    address TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_app_mda_clinic_hdr_name ON app_mda_clinic_hdr USING BTREE (name);
CREATE INDEX IF NOT EXISTS idx_app_mda_clinic_hdr_status ON app_mda_clinic_hdr USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_clinic_hdr_created_date ON app_mda_clinic_hdr USING BTREE (created_date);
CREATE INDEX IF NOT EXISTS idx_app_mda_clinic_hdr_updated_date ON app_mda_clinic_hdr USING BTREE (updated_date);
CREATE INDEX IF NOT EXISTS idx_app_mda_clinic_hdr_slug ON app_mda_clinic_hdr USING BTREE (slug);
CREATE INDEX IF NOT EXISTS idx_app_mda_clinic_hdr_created_by ON app_mda_clinic_hdr USING BTREE (created_by_guid);

-- 4. app_mda_doctor
CREATE TABLE IF NOT EXISTS app_mda_doctor (
    guid UUID PRIMARY KEY,
    user_guid UUID,
    clinic_hdr_guid UUID,
    phone VARCHAR(50),
    name VARCHAR(255),
    email VARCHAR(255),
    about TEXT,
    specialty VARCHAR(255),
    image_url VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_user_guid ON app_mda_doctor USING BTREE (user_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_clinic_hdr_guid ON app_mda_doctor USING BTREE (clinic_hdr_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_phone ON app_mda_doctor USING BTREE (phone);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_name ON app_mda_doctor USING BTREE (name);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_email ON app_mda_doctor USING BTREE (email);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_specialty ON app_mda_doctor USING BTREE (specialty);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_status ON app_mda_doctor USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_created_date ON app_mda_doctor USING BTREE (created_date);


-- 5. app_mda_doctor_cred
CREATE TABLE IF NOT EXISTS app_mda_doctor_cred (
    guid UUID PRIMARY KEY,
    doctor_guid UUID,
    file_matadata JSON, 
    remarks_1 TEXT,
    remarks_2 TEXT,
    remarks_3 TEXT,
    remarks_4 TEXT,
    remarks_5 TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_cred_doctor_guid ON app_mda_doctor_cred USING BTREE (doctor_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_cred_remarks_1 ON app_mda_doctor_cred USING BTREE (remarks_1);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_cred_remarks_2 ON app_mda_doctor_cred USING BTREE (remarks_2);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_cred_remarks_3 ON app_mda_doctor_cred USING BTREE (remarks_3);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_cred_remarks_4 ON app_mda_doctor_cred USING BTREE (remarks_4);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_cred_remarks_5 ON app_mda_doctor_cred USING BTREE (remarks_5);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_cred_status ON app_mda_doctor_cred USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_cred_created_date ON app_mda_doctor_cred USING BTREE (created_date);


-- 6. app_mda_patient_lead
CREATE TABLE IF NOT EXISTS app_mda_patient_lead (
    guid UUID PRIMARY KEY,
    phone VARCHAR(50),
    name VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lead_status VARCHAR(100),
    status VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_app_mda_patient_lead_name ON app_mda_patient_lead USING BTREE (name);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_lead_phone ON app_mda_patient_lead USING BTREE (phone);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_lead_status_of_lead ON app_mda_patient_lead USING BTREE (lead_status);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_lead_status ON app_mda_patient_lead USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_lead_created_date ON app_mda_patient_lead USING BTREE (created_date);

-- 7. app_mda_patient
CREATE TABLE IF NOT EXISTS app_mda_patient (
    guid UUID PRIMARY KEY,
    lead_guid UUID,
    user_guid UUID,
    clinic_hdr_guid UUID,
    phone VARCHAR(50),
    name VARCHAR(255),
    email VARCHAR(255),
    address TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENTCREATE INDEX IF NOT EXISTS _TIMESTAMP,
    status VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_app_mda_patient_lead_guid ON app_mda_patient USING BTREE (lead_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_user_guid ON app_mda_patient USING BTREE (user_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_clinic_hdr_guid ON app_mda_patient USING BTREE (clinic_hdr_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_phone ON app_mda_patient USING BTREE (phone);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_name ON app_mda_patient USING BTREE (name);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_email ON app_mda_patient USING BTREE (email);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_address ON app_mda_patient USING BTREE (address);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_status ON app_mda_patient USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_created_date ON app_mda_patient USING BTREE (created_date);
CREATE INDEX IF NOT EXISTS idx_app_mda_patient_updated_date ON app_mda_patient USING BTREE (updated_date);


-- 8. app_mda_doctor_patient_link
CREATE TABLE IF NOT EXISTS app_mda_doctor_patient_link (
    guid UUID PRIMARY KEY,
    doctor_guid UUID,
    patient_guid UUID,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_patient_link_doctor_guid ON app_mda_doctor_patient_link USING BTREE (doctor_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_patient_link_patient_guid ON app_mda_doctor_patient_link USING BTREE (patient_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_patient_link_status ON app_mda_doctor_patient_link USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_patient_link_created_date ON app_mda_doctor_patient_link USING BTREE (created_date);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_patient_link_updated_date ON app_mda_doctor_patient_link USING BTREE (updated_date);


-- 9. app_mda_doctor_availability
CREATE TABLE IF NOT EXISTS app_mda_doctor_availability (
    guid UUID PRIMARY KEY,
    doctor_guid UUID,
    day_of_week VARCHAR(50),
    start_time TIME,
    end_time TIME,
    slot_duration_minutes INTEGER,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_availability_doctor_guid ON app_mda_doctor_availability USING BTREE (doctor_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_availability_day_of_week ON app_mda_doctor_availability USING BTREE (day_of_week);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_availability_slot_duration_minutes ON app_mda_doctor_availability USING BTREE (slot_duration_minutes);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_availability_start_time ON app_mda_doctor_availability USING BTREE (start_time);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_availability_end_time ON app_mda_doctor_availability USING BTREE (end_time);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_availability_status ON app_mda_doctor_availability USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_availability_created_date ON app_mda_doctor_availability USING BTREE (created_date);
CREATE INDEX IF NOT EXISTS idx_app_mda_doctor_availability_updated_date ON app_mda_doctor_availability USING BTREE (updated_date);


-- 10. app_mda_appointment
CREATE TABLE IF NOT EXISTS app_mda_appointment (
    guid UUID PRIMARY KEY,
    clinic_guid UUID,
    doctor_guid UUID,
    patient_guid UUID,
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    appointment_status VARCHAR(50),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_clinic_guid ON app_mda_appointment USING BTREE (clinic_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_doctor_guid ON app_mda_appointment USING BTREE (doctor_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_patient_guid ON app_mda_appointment USING BTREE (patient_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_scheduled_start ON app_mda_appointment USING BTREE (scheduled_start);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_scheduled_end ON app_mda_appointment USING BTREE (scheduled_end);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_status_of_appt ON app_mda_appointment USING BTREE (appointment_status);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_status ON app_mda_appointment USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_created_date ON app_mda_appointment USING BTREE (created_date);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_updated_date ON app_mda_appointment USING BTREE (updated_date);


-- 11. app_mda_appointment_session
CREATE TABLE IF NOT EXISTS app_mda_appointment_session (
    guid UUID PRIMARY KEY,
    appointment_guid UUID,
    doctor_guid UUID,
    audio_stream_url TEXT,
    is_reviewed_by_doctor BOOLEAN,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_session_appointment_guid ON app_mda_appointment_session USING BTREE (appointment_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_session_doctor_guid ON app_mda_appointment_session USING BTREE (doctor_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_session_reviewed_by_doctor ON app_mda_appointment_session USING BTREE (is_reviewed_by_doctor);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_session_status ON app_mda_appointment_session USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_session_created_date ON app_mda_appointment_session USING BTREE (created_date);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_session_updated_date ON app_mda_appointment_session USING BTREE (updated_date);


-- 12. app_mda_prescription
CREATE TABLE IF NOT EXISTS app_mda_prescription (
    guid UUID PRIMARY KEY,
    appointment_guid UUID,
    patient_guid UUID,
    medicine_name VARCHAR(255),
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    duration VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);


CREATE INDEX IF NOT EXISTS idx_app_mda_prescription_appointment_guid ON app_mda_prescription USING BTREE (appointment_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_prescription_patient_guid ON app_mda_prescription USING BTREE (patient_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_prescription_medicine_name ON app_mda_prescription USING BTREE (medicine_name);
CREATE INDEX IF NOT EXISTS idx_app_mda_prescription_dosage ON app_mda_prescription USING BTREE (dosage);
CREATE INDEX IF NOT EXISTS idx_app_mda_prescription_frequency ON app_mda_prescription USING BTREE (frequency);
CREATE INDEX IF NOT EXISTS idx_app_mda_prescription_duration ON app_mda_prescription USING BTREE (duration);
CREATE INDEX IF NOT EXISTS idx_app_mda_prescription_status ON app_mda_prescription USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_prescription_created_date ON app_mda_prescription USING BTREE (created_date);
CREATE INDEX IF NOT EXISTS idx_app_mda_prescription_updated_date ON app_mda_prescription USING BTREE (updated_date);


-- 13. app_mda_follow_up_queue
CREATE TABLE IF NOT EXISTS app_mda_follow_up_queue (
    guid UUID PRIMARY KEY,
    appointment_guid UUID,
    patient_guid UUID,
    scheduled_cron VARCHAR(100),
    follow_up_msg TEXT,
    follow_up_status VARCHAR(50),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_app_mda_follow_up_queue_appointment_guid ON app_mda_follow_up_queue USING BTREE (appointment_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_follow_up_queue_patient_guid ON app_mda_follow_up_queue USING BTREE (patient_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_follow_up_queue_follow_up_status ON app_mda_follow_up_queue USING BTREE (follow_up_status);
CREATE INDEX IF NOT EXISTS idx_app_mda_follow_up_queue_status ON app_mda_follow_up_queue USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_follow_up_queue_created_date ON app_mda_follow_up_queue USING BTREE (created_date);
CREATE INDEX IF NOT EXISTS idx_app_mda_follow_up_queue_updated_date ON app_mda_follow_up_queue USING BTREE (updated_date);

-- 14. app_mda_appointment_note
CREATE TABLE app_mda_appointment_note (
    guid UUID PRIMARY KEY ,
    main_complaint TEXT,
    blood_pressure VARCHAR(11),        -- Accommodates formats like "120/80" or "140/1000"
    heart_rate INTEGER,                -- Usually recorded as whole numbers (bpm)
    temperature NUMERIC(4, 1),         -- e.g., 37.0 or 101.4
    respiratory_rate INTEGER,          -- Breaths per minute
    oxygen_saturation NUMERIC(4, 1),   -- e.g., 98.5% or 100.0%
    weight NUMERIC(5, 2),              -- Accommodates up to 999.99 kg/lbs
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_note_status ON app_mda_appointment_note USING BTREE (status);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_note_created_date ON app_mda_appointment_note USING BTREE (created_date);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_note_updated_date ON app_mda_appointment_note USING BTREE (updated_date);


ALTER TABLE IF EXISTS app_mda_appointment_note
ADD COLUMN IF NOT EXISTS appointment_guid UUID ,
ADD COLUMN IF NOT EXISTS patient_guid UUID;

CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_note_apmt ON app_mda_appointment_note USING BTREE (appointment_guid);
CREATE INDEX IF NOT EXISTS idx_app_mda_appointment_note_patient_guid ON app_mda_appointment_note USING BTREE (patient_guid);

ALTER TABLE IF EXISTS app_mda_appointment_note
ADD COLUMN IF NOT EXISTS additional_remarks TEXT;

-- 15. app_mda_clinical_report
CREATE TABLE app_mda_clinical_report (
    guid UUID PRIMARY KEY,
    appointment_session_guid UUID,
    
    -- Clinical Insights Block
    summary TEXT ,
    key_observations TEXT[] DEFAULT '{}'::TEXT[],
    red_flags TEXT[] DEFAULT '{}'::TEXT[],
    
    -- Patient Instructions Block
    lifestyle_and_diet TEXT[] DEFAULT '{}'::TEXT[],
    care_plan_steps TEXT[] DEFAULT '{}'::TEXT[],
    
    -- Clinical Audit Block
    form_discrepancies TEXT[] DEFAULT '{}'::TEXT[],
    patient_comprehension_rating VARCHAR(50),
    
    -- System Metadata Block
    generated_by VARCHAR(50) ,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for rapid historical data retrieval by doctors
CREATE INDEX IF NOT EXISTS idx_clinical_report_appt_session ON app_mda_clinical_report USING BTREE (appointment_guid);
CREATE INDEX IF NOT EXISTS idx_clinical_report_created_date ON app_mda_clinical_report USING BTREE (created_date);
CREATE INDEX IF NOT EXISTS idx_clinical_report_updated_date ON app_mda_clinical_report USING BTREE (updated_date);


CREATE INDEX idx_doctor_name_trgm ON app_mda_doctor USING GIN (name gin_trgm_ops);
CREATE INDEX idx_doctor_specialty_trgm ON app_mda_doctor USING GIN (specialty gin_trgm_ops);
CREATE INDEX idx_doctor_email_trgm ON app_mda_doctor USING GIN (email gin_trgm_ops);


--16. app_mda_lead_chat_hdr
CREATE TABLE IF NOT EXISTS app_mda_lead_chat_hdr (
    guid UUID PRIMARY KEY, 
    lead_guid UUID ,
    triage_summary TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for app_mda_lead_chat_hdr
CREATE INDEX IF NOT EXISTS idx_chat_hdr_lead_guid ON app_mda_lead_chat_hdr USING BTREE (lead_guid);
CREATE INDEX IF NOT EXISTS idx_chat_hdr_created_date ON app_mda_lead_chat_hdr USING BTREE (created_date);

-- 17. Create app_mda_lead_chat_transcript Table
CREATE TABLE IF NOT EXISTS app_mda_lead_chat_transcript (
    guid UUID PRIMARY KEY,
    chat_hdr_guid UUID,
    msg_content TEXT,
    sender VARCHAR(50), 
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transcript_hdr_guid ON app_mda_lead_chat_transcript USING BTREE (chat_hdr_guid);
CREATE INDEX IF NOT EXISTS idx_transcript_sender ON app_mda_lead_chat_transcript USING BTREE (sender);
CREATE INDEX IF NOT EXISTS idx_transcript_created_date ON app_mda_lead_chat_transcript USING BTREE  (created_date);
