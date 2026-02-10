import { usePatient } from '@/contexts/PatientContext';
import { getRecords, type EntryRecord } from '@/lib/store';
import { MODULES } from '@/lib/modules';
import { formatDate } from '@/lib/helpers';
import {
  User, AlertTriangle, Pill, FlaskConical,
  ClipboardList, FileText, History, Stethoscope,
  Syringe, ScanLine, Activity, Target,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  administrative: ClipboardList, clinical_notes: FileText, medical_history: History,
  diagnoses: Stethoscope, medications: Pill, allergies: AlertTriangle,
  lab_results: FlaskConical, immunizations: Syringe, imaging: ScanLine,
  vital_signs: Activity, treatment_plans: Target,
};

interface Props {
  onNavigate: (key: string) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { currentPatient } = usePatient();

  if (!currentPatient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <User className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Patient Selected</h2>
          <p className="text-muted-foreground text-sm">Create or select a patient from the sidebar to get started.</p>
        </div>
      </div>
    );
  }

  const counts: Record<string, number> = {};
  MODULES.forEach(m => { counts[m.key] = getRecords(currentPatient.id, m.key).length; });

  const allergies = getRecords(currentPatient.id, 'allergies');
  const activeAllergies = allergies.filter(a => a.severity === 'Severe' || a.severity === 'Life-threatening');
  const meds = getRecords(currentPatient.id, 'medications');
  const activeMeds = meds.filter((m: EntryRecord) => !m.end_date || new Date(m.end_date) >= new Date());
  const labs = getRecords(currentPatient.id, 'lab_results');
  const abnormalLabs = labs.filter(l => l.flag === 'High' || l.flag === 'Low' || l.flag === 'Critical');

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Patient card */}
      <div className="bg-card rounded-lg border border-border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground">{currentPatient.name}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
            <span>MRN: <strong className="text-foreground">{currentPatient.mrn}</strong></span>
            {currentPatient.dob && <span>DOB: {formatDate(currentPatient.dob)}</span>}
            {currentPatient.sex && <span>Sex: {currentPatient.sex}</span>}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(activeAllergies.length > 0 || abnormalLabs.length > 0) && (
        <div className="space-y-2">
          {activeAllergies.map(a => (
            <div key={a.id} className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive/10 border border-destructive/20 text-sm">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-foreground"><strong>Allergy:</strong> {a.allergen} — {a.reaction} ({a.severity})</span>
            </div>
          ))}
          {abnormalLabs.slice(0, 5).map(l => (
            <div key={l.id} className="flex items-center gap-2 px-4 py-2 rounded-md bg-warning/10 border border-warning/20 text-sm">
              <FlaskConical className="h-4 w-4 text-warning shrink-0" />
              <span className="text-foreground"><strong>Lab:</strong> {l.test_name}: {l.value} {l.units} — <span className="emr-badge emr-badge-warning">{l.flag}</span></span>
            </div>
          ))}
        </div>
      )}

      {/* Active medications banner */}
      {activeMeds.length > 0 && (
        <div className="bg-accent/10 border border-accent/20 rounded-md p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Pill className="h-4 w-4 text-accent" /> Active Medications ({activeMeds.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeMeds.map(m => (
              <span key={m.id} className="emr-badge emr-badge-accent">{m.medication_name} {m.dose}</span>
            ))}
          </div>
        </div>
      )}

      {/* Module counts grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {MODULES.map(m => {
          const Icon = ICON_MAP[m.key] || ClipboardList;
          const count = counts[m.key] || 0;
          return (
            <button
              key={m.key}
              onClick={() => onNavigate(m.key)}
              className="bg-card border border-border rounded-lg p-4 text-left hover:border-accent/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="text-xs text-muted-foreground font-medium truncate">{m.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className="text-xs text-muted-foreground">{count === 1 ? 'record' : 'records'}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
