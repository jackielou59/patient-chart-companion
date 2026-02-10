import {
  LayoutDashboard, ClipboardList, FileText, History,
  Stethoscope, Pill, AlertTriangle, FlaskConical,
  Syringe, ScanLine, Activity, Target, Menu, X,
  Download, Upload, Trash2, UserPlus, ChevronDown, Heart,
} from 'lucide-react';
import { useState, useRef, type FormEvent } from 'react';
import { MODULES, MODULE_KEYS } from '@/lib/modules';
import { usePatient } from '@/contexts/PatientContext';
import { exportAllPatientData, importPatientData, clearPatientModuleData } from '@/lib/store';
import { toast } from 'sonner';

const ICON_MAP: Record<string, React.ElementType> = {
  administrative: ClipboardList,
  clinical_notes: FileText,
  medical_history: History,
  diagnoses: Stethoscope,
  medications: Pill,
  allergies: AlertTriangle,
  lab_results: FlaskConical,
  immunizations: Syringe,
  imaging: ScanLine,
  vital_signs: Activity,
  treatment_plans: Target,
};

interface Props {
  activeModule: string;
  onSelectModule: (key: string) => void;
}

export default function Sidebar({ activeModule, onSelectModule }: Props) {
  const { patients, currentPatient, addPatient, switchPatient, refreshPatients } = usePatient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [patientDropdown, setPatientDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (key: string) => {
    onSelectModule(key);
    setMobileOpen(false);
  };

  const handleNewPatient = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get('name') as string).trim();
    const dob = fd.get('dob') as string;
    const sex = fd.get('sex') as string;
    const mrn = (fd.get('mrn') as string).trim();
    if (!name || !mrn) { toast.error('Name and MRN are required'); return; }
    addPatient({ name, dob, sex, mrn });
    setShowNewPatient(false);
    toast.success(`Patient "${name}" created`);
  };

  const handleExport = () => {
    if (!currentPatient) return;
    const data = exportAllPatientData(currentPatient.id, MODULE_KEYS);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emr_${currentPatient.mrn}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chart exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const patient = importPatientData(data, MODULE_KEYS);
        if (patient) {
          refreshPatients();
          toast.success(`Imported chart for "${patient.name}"`);
        } else {
          toast.error('Invalid chart data');
        }
      } catch {
        toast.error('Failed to parse file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    if (!currentPatient) return;
    if (!confirm(`Clear ALL data for ${currentPatient.name}? This cannot be undone.`)) return;
    clearPatientModuleData(currentPatient.id, MODULE_KEYS);
    toast.success('Patient data cleared');
    onSelectModule('dashboard');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: 'hsl(var(--sidebar-background))' }}>
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-2 border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <Heart className="h-6 w-6" style={{ color: 'hsl(var(--sidebar-primary))' }} />
        <span className="font-bold text-lg tracking-tight" style={{ color: 'hsl(var(--sidebar-primary-foreground))' }}>
          MedChart EMR
        </span>
      </div>

      {/* Patient selector */}
      <div className="px-3 py-3 border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <div className="relative">
          <button
            onClick={() => setPatientDropdown(!patientDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm"
            style={{ background: 'hsl(var(--sidebar-accent))', color: 'hsl(var(--sidebar-accent-foreground))' }}
          >
            <span className="truncate">{currentPatient ? currentPatient.name : 'Select Patient'}</span>
            <ChevronDown className="h-4 w-4 shrink-0 ml-1" />
          </button>
          {patientDropdown && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg z-50 max-h-48 overflow-auto"
              style={{ background: 'hsl(var(--sidebar-accent))', border: '1px solid hsl(var(--sidebar-border))' }}
            >
              {patients.map(p => (
                <button
                  key={p.id}
                  onClick={() => { switchPatient(p.id); setPatientDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:opacity-80 transition-opacity"
                  style={{
                    color: p.id === currentPatient?.id ? 'hsl(var(--sidebar-primary))' : 'hsl(var(--sidebar-accent-foreground))',
                    fontWeight: p.id === currentPatient?.id ? 600 : 400,
                  }}
                >
                  {p.name} <span className="opacity-60">({p.mrn})</span>
                </button>
              ))}
              {patients.length === 0 && (
                <div className="px-3 py-2 text-sm opacity-50" style={{ color: 'hsl(var(--sidebar-foreground))' }}>No patients</div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => { setShowNewPatient(!showNewPatient); setPatientDropdown(false); }}
          className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          style={{ border: '1px dashed hsl(var(--sidebar-border))', color: 'hsl(var(--sidebar-foreground))' }}
        >
          <UserPlus className="h-3.5 w-3.5" /> New Patient
        </button>

        {showNewPatient && (
          <form onSubmit={handleNewPatient} className="mt-2 space-y-2">
            <input name="name" placeholder="Full Name *" required className="emr-input text-xs" />
            <input name="mrn" placeholder="MRN *" required className="emr-input text-xs" />
            <input name="dob" type="date" className="emr-input text-xs" />
            <select name="sex" className="emr-input text-xs">
              <option value="">Sex</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium" style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                Create
              </button>
              <button type="button" onClick={() => setShowNewPatient(false)} className="px-2 py-1.5 rounded-md text-xs" style={{ color: 'hsl(var(--sidebar-foreground))' }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto px-2 py-2 space-y-0.5">
        <button
          onClick={() => handleSelect('dashboard')}
          className={`emr-sidebar-link w-full ${activeModule === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" /> Dashboard
        </button>
        {MODULES.map(m => {
          const Icon = ICON_MAP[m.key] || ClipboardList;
          return (
            <button
              key={m.key}
              onClick={() => handleSelect(m.key)}
              className={`emr-sidebar-link w-full ${activeModule === m.key ? 'active' : ''}`}
            >
              <Icon className="h-4 w-4 shrink-0" /> <span className="truncate">{m.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Data actions */}
      <div className="px-3 py-3 border-t space-y-1.5" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <button onClick={handleExport} disabled={!currentPatient} className="emr-sidebar-link w-full opacity-80 hover:opacity-100 disabled:opacity-30">
          <Download className="h-4 w-4" /> Export JSON
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="emr-sidebar-link w-full opacity-80 hover:opacity-100">
          <Upload className="h-4 w-4" /> Import JSON
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <button onClick={handleClear} disabled={!currentPatient} className="emr-sidebar-link w-full opacity-80 hover:opacity-100 disabled:opacity-30" style={{ color: 'hsl(var(--destructive))' }}>
          <Trash2 className="h-4 w-4" /> Clear Patient Data
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 lg:hidden p-2 rounded-md shadow-md"
        style={{ background: 'hsl(var(--sidebar-background))', color: 'hsl(var(--sidebar-foreground))' }}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
