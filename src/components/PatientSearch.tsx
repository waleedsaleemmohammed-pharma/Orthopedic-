import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb, Patient } from '../store/mockDb';
import { Search } from 'lucide-react';

export default function PatientSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length >= 3) {
      const patients = mockDb.getPatients();
      const filtered = patients.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.displayId.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (patientId: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/patient/${patientId}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          className="w-full h-9 pl-9 pr-4 rounded-md border border-slate-300 bg-slate-100 dark:bg-slate-900 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          placeholder="Search patient (min 3 chars)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((patient) => (
            <button
              key={patient.id}
              className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
              onClick={() => handleSelect(patient.id)}
            >
              <div className="font-medium text-sm">{patient.name}</div>
              <div className="text-xs text-slate-500">ID: {patient.displayId} | Age: {patient.age}</div>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && query.length >= 3 && results.length === 0 && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg z-50 p-4 text-center text-sm text-slate-500">
          No patients found.
        </div>
      )}
    </div>
  );
}
