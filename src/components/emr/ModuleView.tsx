import { useState, useEffect, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { type ModuleDef, type FieldDef } from '@/lib/modules';
import {
  getRecords, addRecord, updateRecord, deleteRecord, type EntryRecord,
} from '@/lib/store';
import { formatDate, formatDateTime, calculateBMI, truncate } from '@/lib/helpers';
import { toast } from 'sonner';

interface Props {
  module: ModuleDef;
  patientId: string;
}

export default function ModuleView({ module, patientId }: Props) {
  const [records, setRecords] = useState<EntryRecord[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const reload = () => setRecords(getRecords(patientId, module.key));

  useEffect(() => {
    reload();
    setShowForm(false);
    setEditingId(null);
    setFormData({});
    setSearch('');
    setExpandedRow(null);
  }, [patientId, module.key]);

  const tableFields = module.fields.filter(f => f.inTable);
  const allFields = module.fields;

  const handleFieldChange = (field: FieldDef, value: string) => {
    const updated = { ...formData, [field.key]: value };
    // Auto-calc BMI for vital signs
    if (module.key === 'vital_signs' && (field.key === 'weight' || field.key === 'height')) {
      updated.bmi = calculateBMI(
        field.key === 'weight' ? value : formData.weight || '',
        field.key === 'height' ? value : formData.height || '',
      );
    }
    setFormData(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Validate required fields
    for (const f of allFields) {
      if (f.required && !formData[f.key]?.trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    if (editingId) {
      updateRecord(patientId, module.key, editingId, formData);
      toast.success('Record updated');
    } else {
      addRecord(patientId, module.key, formData);
      toast.success('Record added');
    }
    reload();
    setFormData({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (record: EntryRecord) => {
    const data: Record<string, string> = {};
    allFields.forEach(f => { data[f.key] = record[f.key] || ''; });
    setFormData(data);
    setEditingId(record.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this record?')) return;
    deleteRecord(patientId, module.key, id);
    reload();
    toast.success('Record deleted');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
  };

  const filtered = records.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return Object.values(r).some(v => String(v).toLowerCase().includes(s));
  });

  const displayValue = (field: FieldDef, value: string) => {
    if (!value) return '—';
    if (field.type === 'date') return formatDate(value);
    if (field.type === 'datetime-local') return formatDateTime(value);
    if (field.type === 'textarea') return truncate(value, 50);
    return value;
  };

  const renderFormField = (field: FieldDef) => {
    const value = formData[field.key] || '';
    const baseClass = 'emr-input';

    if (field.type === 'select') {
      return (
        <div key={field.key}>
          <label className="emr-label">{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</label>
          <select
            value={value}
            onChange={e => handleFieldChange(field, e.target.value)}
            className={baseClass}
            required={field.required}
          >
            <option value="">Select…</option>
            {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="col-span-full">
          <label className="emr-label">{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</label>
          <textarea
            value={value}
            onChange={e => handleFieldChange(field, e.target.value)}
            className={`${baseClass} min-h-[80px] resize-y`}
            required={field.required}
            rows={3}
          />
        </div>
      );
    }

    return (
      <div key={field.key}>
        <label className="emr-label">{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</label>
        <input
          type={field.type}
          value={value}
          onChange={e => handleFieldChange(field, e.target.value)}
          className={baseClass}
          required={field.required}
          min={field.min}
          max={field.max}
          step={field.step}
          readOnly={field.computed}
          placeholder={field.computed ? 'Auto' : undefined}
        />
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">{module.label}</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search records…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="emr-input pl-8 pr-8"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({}); }}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-4 lg:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {editingId ? 'Edit Record' : 'New Record'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allFields.map(renderFormField)}
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-border">
              <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                {editingId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {records.length === 0 ? 'No records yet. Click "Add" to create one.' : 'No records match your search.'}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {tableFields.map(f => (
                    <th key={f.key} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                      {f.label}
                    </th>
                  ))}
                  <th className="text-right px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => (
                  <tr key={record.id} className="emr-table-row group">
                    {tableFields.map(f => (
                      <td key={f.key} className="px-3 py-2.5 text-foreground whitespace-nowrap max-w-[200px] truncate">
                        {f.key === 'flag' && record[f.key] ? (
                          <span className={`emr-badge ${
                            record[f.key] === 'Normal' ? 'emr-badge-success' :
                            record[f.key] === 'Critical' ? 'emr-badge-destructive' : 'emr-badge-warning'
                          }`}>
                            {record[f.key]}
                          </span>
                        ) : f.key === 'status' && record[f.key] ? (
                          <span className={`emr-badge ${
                            record[f.key] === 'Active' || record[f.key] === 'Chronic' ? 'emr-badge-primary' :
                            record[f.key] === 'Resolved' || record[f.key] === 'Completed' ? 'emr-badge-success' : 'emr-badge-warning'
                          }`}>
                            {record[f.key]}
                          </span>
                        ) : f.key === 'severity' && record[f.key] ? (
                          <span className={`emr-badge ${
                            record[f.key] === 'Mild' ? 'emr-badge-success' :
                            record[f.key] === 'Moderate' ? 'emr-badge-warning' : 'emr-badge-destructive'
                          }`}>
                            {record[f.key]}
                          </span>
                        ) : (
                          displayValue(f, record[f.key])
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Expand"
                        >
                          {expandedRow === record.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-accent"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Expanded row detail */}
                {filtered.map(record => expandedRow === record.id ? (
                  <tr key={`${record.id}-detail`} className="bg-muted/30">
                    <td colSpan={tableFields.length + 1} className="px-4 py-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                        {allFields.filter(f => !f.inTable).map(f => (
                          <div key={f.key}>
                            <span className="text-xs text-muted-foreground">{f.label}:</span>
                            <div className="text-foreground mt-0.5 whitespace-pre-wrap">{record[f.key] || '—'}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : null)}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-border text-xs text-muted-foreground">
            {filtered.length} of {records.length} record{records.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
