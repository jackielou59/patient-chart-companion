import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  type Patient,
  getPatients,
  savePatients,
  getCurrentPatientId,
  setCurrentPatientId,
} from '@/lib/store';
import { generateId } from '@/lib/helpers';

interface PatientContextType {
  patients: Patient[];
  currentPatient: Patient | null;
  addPatient: (data: Omit<Patient, 'id'>) => Patient;
  switchPatient: (id: string) => void;
  deletePatient: (id: string) => void;
  refreshPatients: () => void;
}

const PatientContext = createContext<PatientContextType | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(getPatients);
  const [curId, setCurId] = useState<string | null>(getCurrentPatientId);

  const currentPatient = patients.find(p => p.id === curId) ?? null;

  const addPatient = useCallback((data: Omit<Patient, 'id'>) => {
    const p: Patient = { id: generateId(), ...data };
    const updated = [...getPatients(), p];
    savePatients(updated);
    setPatients(updated);
    setCurId(p.id);
    setCurrentPatientId(p.id);
    return p;
  }, []);

  const switchPatient = useCallback((id: string) => {
    setCurId(id);
    setCurrentPatientId(id);
  }, []);

  const deletePatient = useCallback((id: string) => {
    const updated = getPatients().filter(p => p.id !== id);
    savePatients(updated);
    setPatients(updated);
    if (curId === id) {
      const newId = updated[0]?.id ?? null;
      setCurId(newId);
      setCurrentPatientId(newId);
    }
  }, [curId]);

  const refreshPatients = useCallback(() => {
    setPatients(getPatients());
  }, []);

  return (
    <PatientContext.Provider value={{ patients, currentPatient, addPatient, switchPatient, deletePatient, refreshPatients }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be used within PatientProvider');
  return ctx;
}
