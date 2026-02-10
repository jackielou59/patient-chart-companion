export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime-local' | 'select' | 'textarea' | 'email' | 'tel';
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  inTable?: boolean;
  computed?: boolean;
}

export interface ModuleDef {
  key: string;
  label: string;
  fields: FieldDef[];
}

export const MODULES: ModuleDef[] = [
  {
    key: 'administrative',
    label: 'Administrative Data',
    fields: [
      { key: 'visit_date', label: 'Visit Date', type: 'date', required: true, inTable: true },
      { key: 'full_name', label: 'Full Name', type: 'text', required: true, inTable: true },
      { key: 'mrn', label: 'MRN', type: 'text', inTable: true },
      { key: 'dob', label: 'DOB', type: 'date' },
      { key: 'sex', label: 'Sex', type: 'select', options: ['Male', 'Female', 'Other'], inTable: true },
      { key: 'phone', label: 'Phone', type: 'tel' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'emergency_contact_name', label: 'Emergency Contact', type: 'text' },
      { key: 'emergency_contact_phone', label: 'Emergency Phone', type: 'tel' },
      { key: 'insurance_provider', label: 'Insurance Provider', type: 'text', inTable: true },
      { key: 'policy_no', label: 'Policy No.', type: 'text' },
      { key: 'primary_physician', label: 'Primary Physician', type: 'text' },
    ],
  },
  {
    key: 'clinical_notes',
    label: 'Clinical Notes',
    fields: [
      { key: 'date_time', label: 'Date/Time', type: 'datetime-local', required: true, inTable: true },
      { key: 'author', label: 'Author', type: 'text', required: true, inTable: true },
      { key: 'note_type', label: 'Note Type', type: 'select', options: ['SOAP', 'Progress', 'Discharge'], required: true, inTable: true },
      { key: 'subjective', label: 'Subjective', type: 'textarea' },
      { key: 'objective', label: 'Objective', type: 'textarea' },
      { key: 'assessment', label: 'Assessment', type: 'textarea', inTable: true },
      { key: 'plan', label: 'Plan', type: 'textarea' },
    ],
  },
  {
    key: 'medical_history',
    label: 'Medical History',
    fields: [
      { key: 'condition', label: 'Condition/Problem', type: 'text', required: true, inTable: true },
      { key: 'onset_date', label: 'Onset Date', type: 'date', inTable: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Resolved', 'Chronic', 'Remission'], required: true, inTable: true },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    key: 'diagnoses',
    label: 'Diagnoses',
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true, inTable: true },
      { key: 'diagnosis_name', label: 'Diagnosis Name', type: 'text', required: true, inTable: true },
      { key: 'icd10', label: 'ICD-10 Code', type: 'text', inTable: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Resolved', 'Ruled Out'], required: true, inTable: true },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    key: 'medications',
    label: 'Medications',
    fields: [
      { key: 'medication_name', label: 'Medication Name', type: 'text', required: true, inTable: true },
      { key: 'dose', label: 'Dose', type: 'text', required: true, inTable: true },
      { key: 'route', label: 'Route', type: 'select', options: ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhaled', 'Rectal', 'Other'], inTable: true },
      { key: 'frequency', label: 'Frequency', type: 'text', inTable: true },
      { key: 'start_date', label: 'Start Date', type: 'date', required: true },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'prescriber', label: 'Prescriber', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    key: 'allergies',
    label: 'Allergies',
    fields: [
      { key: 'allergen', label: 'Allergen', type: 'text', required: true, inTable: true },
      { key: 'reaction', label: 'Reaction', type: 'text', required: true, inTable: true },
      { key: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe', 'Life-threatening'], required: true, inTable: true },
      { key: 'onset_date', label: 'Onset Date', type: 'date', inTable: true },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    key: 'lab_results',
    label: 'Laboratory Results',
    fields: [
      { key: 'test_name', label: 'Test Name', type: 'text', required: true, inTable: true },
      { key: 'date', label: 'Date', type: 'date', required: true, inTable: true },
      { key: 'value', label: 'Value', type: 'text', required: true, inTable: true },
      { key: 'units', label: 'Units', type: 'text', inTable: true },
      { key: 'reference_range', label: 'Reference Range', type: 'text' },
      { key: 'flag', label: 'Flag', type: 'select', options: ['Normal', 'High', 'Low', 'Critical'], inTable: true },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    key: 'immunizations',
    label: 'Immunizations',
    fields: [
      { key: 'vaccine', label: 'Vaccine', type: 'text', required: true, inTable: true },
      { key: 'date_given', label: 'Date Given', type: 'date', required: true, inTable: true },
      { key: 'dose', label: 'Dose', type: 'text', inTable: true },
      { key: 'lot_no', label: 'Lot No.', type: 'text' },
      { key: 'site', label: 'Site', type: 'text', inTable: true },
      { key: 'provider', label: 'Provider', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    key: 'imaging',
    label: 'Imaging Reports',
    fields: [
      { key: 'modality', label: 'Modality', type: 'select', options: ['XR', 'CT', 'MRI', 'US', 'PET', 'Other'], required: true, inTable: true },
      { key: 'study_date', label: 'Study Date', type: 'date', required: true, inTable: true },
      { key: 'body_part', label: 'Body Part', type: 'text', required: true, inTable: true },
      { key: 'impression', label: 'Impression', type: 'textarea', inTable: true },
      { key: 'findings', label: 'Findings', type: 'textarea' },
      { key: 'radiologist', label: 'Radiologist', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    key: 'vital_signs',
    label: 'Vital Signs',
    fields: [
      { key: 'date_time', label: 'Date/Time', type: 'datetime-local', required: true, inTable: true },
      { key: 'temperature', label: 'Temperature (°C)', type: 'number', step: 0.1, min: 30, max: 45, inTable: true },
      { key: 'pulse', label: 'Pulse (bpm)', type: 'number', min: 20, max: 300, inTable: true },
      { key: 'resp_rate', label: 'Resp Rate (/min)', type: 'number', min: 0, max: 80 },
      { key: 'bp_systolic', label: 'BP Systolic', type: 'number', min: 40, max: 300, inTable: true },
      { key: 'bp_diastolic', label: 'BP Diastolic', type: 'number', min: 20, max: 200, inTable: true },
      { key: 'spo2', label: 'SpO₂ (%)', type: 'number', min: 0, max: 100 },
      { key: 'weight', label: 'Weight (kg)', type: 'number', step: 0.1, min: 0 },
      { key: 'height', label: 'Height (cm)', type: 'number', step: 0.1, min: 0 },
      { key: 'bmi', label: 'BMI', type: 'number', step: 0.1, computed: true },
    ],
  },
  {
    key: 'treatment_plans',
    label: 'Treatment Plans',
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true, inTable: true },
      { key: 'problem_goal', label: 'Problem/Goal', type: 'text', required: true, inTable: true },
      { key: 'interventions', label: 'Interventions', type: 'textarea', inTable: true },
      { key: 'responsible_clinician', label: 'Responsible Clinician', type: 'text', inTable: true },
      { key: 'followup_date', label: 'Follow-up Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Completed', 'On Hold', 'Cancelled'], required: true, inTable: true },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
];

export const MODULE_KEYS = MODULES.map(m => m.key);
