import React, { useState, useRef } from 'react';
import { X, UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedCustomer {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  status: string;
  notes: string;
  isValid: boolean;
  errors: string[];
}

export default function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCustomer[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Simple, robust client-side CSV parser
  const parseCSV = (text: string): ParsedCustomer[] => {
    // Regex to split CSV lines, accounting for fields wrapped in double quotes
    const lines: string[] = [];
    let currentLine = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' && !insideQuotes) {
        lines.push(currentLine.trim());
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    if (currentLine) lines.push(currentLine.trim());

    if (lines.length <= 1) return [];

    // Parse Headers
    const headers = parseCSVLine(lines[0]);
    
    // Map headers to column indices
    const colMap: Record<string, number> = {};
    headers.forEach((h, idx) => {
      const cleaned = h.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      colMap[cleaned] = idx;
    });

    const records: ParsedCustomer[] = [];

    // Helper to get index matching possible headers
    const getVal = (rowFields: string[], keys: string[]): string => {
      for (const key of keys) {
        if (colMap[key] !== undefined) {
          return (rowFields[colMap[key]] || '').trim();
        }
      }
      return '';
    };

    // Parse row entries
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      const fields = parseCSVLine(lines[i]);
      if (fields.length === 0 || (fields.length === 1 && !fields[0])) continue;

      // Match common header names
      const name = getVal(fields, ['fullname', 'name', 'customername', 'namefields']);
      const email = getVal(fields, ['email', 'emailaddress', 'mail']);
      const phone = getVal(fields, ['phone', 'phonenumber', 'tel', 'mobile']);
      const gender = getVal(fields, ['gender', 'sex']) || 'male';
      const dob = getVal(fields, ['dob', 'dateofbirth', 'birthdate']);
      const address = getVal(fields, ['address', 'street', 'streetaddress']);
      const city = getVal(fields, ['city']);
      const state = getVal(fields, ['state', 'province', 'region']);
      const country = getVal(fields, ['country']) || 'United States';
      const zipcode = getVal(fields, ['zip', 'zipcode', 'postalcode']);
      const status = (getVal(fields, ['status', 'statefields']) || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active';
      const notes = getVal(fields, ['notes', 'comments', 'desc']);

      const errors: string[] = [];
      if (!name) errors.push('Name is required');
      if (!email) {
        errors.push('Email is required');
      } else if (!email.includes('@')) {
        errors.push('Email is invalid');
      }

      records.push({
        name,
        email,
        phone,
        gender,
        dob,
        address,
        city,
        state,
        country,
        zipcode,
        status,
        notes,
        isValid: errors.length === 0,
        errors
      });
    }

    return records;
  };

  // Parses a single CSV line respect double quotes
  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map(s => s.replace(/^"|"$/g, '').trim());
  }

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Invalid file type. Please upload a .csv file.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);
      setParsedData(data);
      if (data.length > 0) {
        toast.info(`Successfully parsed ${data.length} records. Please review below.`);
      } else {
        toast.error('Unable to parse any customer records from this CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImportSubmit = async () => {
    const validCustomers = parsedData.filter(d => d.isValid);
    if (validCustomers.length === 0) {
      toast.error('No valid records to import.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/customers/import', { customers: validCustomers });
      toast.success(`Successfully imported ${validCustomers.length} customer records!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete import.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-600/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Batch Import Customers</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Upload Drag Area */}
          {parsedData.length === 0 ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerSelect}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-3 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/5' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-600/10 rounded-2xl border border-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Upload CSV Ledger</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Drag and drop your customer spreadsheet here, or click to browse files. Accepts standard `.csv` exports.
                </p>
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md mt-2">
                Format: Name, Email, Phone, Gender, Address, Status...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{fileName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Parsed {parsedData.length} records ({parsedData.filter(d => d.isValid).length} ready, {parsedData.filter(d => !d.isValid).length} with errors)
                  </p>
                </div>
                <button
                  onClick={() => { setParsedData([]); setFileName(''); }}
                  className="text-xs text-rose-500 hover:underline font-semibold"
                >
                  Clear & Choose Another
                </button>
              </div>

              {/* Parsed List Preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="max-h-[35vh] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase">
                        <th className="p-3">Customer Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Validity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                      {parsedData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-200/5 dark:hover:bg-slate-800/5">
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{row.name || <span className="text-rose-400">Missing</span>}</td>
                          <td className="p-3 text-slate-500 dark:text-slate-400">{row.email || <span className="text-rose-400">Missing</span>}</td>
                          <td className="p-3 text-slate-500 dark:text-slate-400">{row.phone || '-'}</td>
                          <td className="p-3 capitalize">{row.status}</td>
                          <td className="p-3 text-right">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                                <CheckCircle2 className="w-3 h-3" /> Ready
                              </span>
                            ) : (
                              <span
                                title={row.errors.join(', ')}
                                className="inline-flex items-center gap-1 text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full font-medium cursor-help"
                              >
                                <AlertTriangle className="w-3 h-3" /> {row.errors.length} error(s)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          {parsedData.length > 0 && (
            <button
              onClick={handleImportSubmit}
              disabled={loading || parsedData.filter(d => d.isValid).length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white rounded-xl font-medium transition-all shadow-md shadow-blue-500/10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Import {parsedData.filter(d => d.isValid).length} Records
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
