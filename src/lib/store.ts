import { generateId } from './helpers';

export interface Patient {
  id: string;
  name: string;
  dob: string;
  sex: string;
  mrn: string;
}

export interface EntryRecord {
  id: string;
  [key: string]: string;
}

const PATIENTS_KEY = 'emr_patients';
const CURRENT_KEY = 'emr_current_patient';

export function getPatients(): Patient[] {
  try {
    return JSON.parse(localStorage.getItem(PATIENTS_KEY) || '[]');
  } catch { return []; }
}

export function savePatients(patients: Patient[]) {
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export function getCurrentPatientId(): string | null {
  return localStorage.getItem(CURRENT_KEY);
}

export function setCurrentPatientId(id: string | null) {
  if (id) localStorage.setItem(CURRENT_KEY, id);
  else localStorage.removeItem(CURRENT_KEY);
}

export function getRecords(patientId: string, moduleKey: string): EntryRecord[] {
  try {
    return JSON.parse(localStorage.getItem(`emr_${patientId}_${moduleKey}`) || '[]');
  } catch { return []; }
}

export function saveRecords(patientId: string, moduleKey: string, records: EntryRecord[]) {
  localStorage.setItem(`emr_${patientId}_${moduleKey}`, JSON.stringify(records));
}

export function addRecord(patientId: string, moduleKey: string, data: Record<string, string>): EntryRecord {
  const records = getRecords(patientId, moduleKey);
  const rec: EntryRecord = { id: generateId(), ...data };
  records.unshift(rec);
  saveRecords(patientId, moduleKey, records);
  return rec;
}

export function updateRecord(patientId: string, moduleKey: string, id: string, data: Record<string, string>) {
  const records = getRecords(patientId, moduleKey);
  const idx = records.findIndex(r => r.id === id);
  if (idx >= 0) {
    records[idx] = { ...records[idx], ...data };
    saveRecords(patientId, moduleKey, records);
  }
}

export function deleteRecord(patientId: string, moduleKey: string, id: string) {
  saveRecords(patientId, moduleKey, getRecords(patientId, moduleKey).filter(r => r.id !== id));
}

export function exportAllPatientData(patientId: string, moduleKeys: string[]): object {
  const patients = getPatients();
  const patient = patients.find(p => p.id === patientId);
  const data: Record<string, unknown> = { patient, exportDate: new Date().toISOString() };
  moduleKeys.forEach(key => { data[key] = getRecords(patientId, key); });
  return data;
}

export function importPatientData(data: Record<string, unknown>, moduleKeys: string[]): Patient | null {
  const patient = data.patient as Patient;
  if (!patient?.id) return null;

  const patients = getPatients();
  const idx = patients.findIndex(p => p.id === patient.id);
  if (idx >= 0) patients[idx] = patient;
  else patients.push(patient);
  savePatients(patients);

  moduleKeys.forEach(key => {
    if (Array.isArray(data[key])) {
      saveRecords(patient.id, key, data[key] as EntryRecord[]);
    }
  });

  setCurrentPatientId(patient.id);
  return patient;
}

export function clearPatientModuleData(patientId: string, moduleKeys: string[]) {
  moduleKeys.forEach(key => localStorage.removeItem(`emr_${patientId}_${key}`));
}
