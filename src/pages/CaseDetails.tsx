import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDb, SurgicalCase, Patient, User } from '../store/mockDb';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Calendar, User as UserIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [surgicalCase, setSurgicalCase] = useState<SurgicalCase | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<User | null>(null);

  useEffect(() => {
    if (id) {
      const c = mockDb.getCases().find(c => c.id === id);
      if (c) {
        setSurgicalCase(c);
        const p = mockDb.getPatients().find(p => p.id === c.patientId);
        if (p) setPatient(p);
        const d = mockDb.getUsers().find(u => u.id === c.doctorId);
        if (d) setDoctor(d);
      }
    }
  }, [id]);

  if (!surgicalCase) {
    return <div className="text-center py-12">Case not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Case Report</h1>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header Section */}
        <div className="bg-teal-600 dark:bg-teal-900 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{surgicalCase.diagnosis}</h2>
              <div className="flex items-center gap-2 text-teal-100">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(surgicalCase.date), 'MMMM dd, yyyy')}</span>
              </div>
            </div>
            {doctor && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <UserIcon className="w-4 h-4" />
                <span className="font-medium text-sm">Dr. {doctor.name}</span>
              </div>
            )}
          </div>

          {patient && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-teal-500/30">
              <div>
                <span className="block text-teal-200 text-xs uppercase tracking-wider mb-1">Patient ID</span>
                <span className="font-medium">{patient.displayId}</span>
              </div>
              <div>
                <span className="block text-teal-200 text-xs uppercase tracking-wider mb-1">Age</span>
                <span className="font-medium">{patient.age}</span>
              </div>
              <div>
                <span className="block text-teal-200 text-xs uppercase tracking-wider mb-1">Gender</span>
                <span className="font-medium">{patient.gender}</span>
              </div>
              {/* Do not show patient name in public atlas to preserve anonymity, but if it's the doctor viewing their own case, maybe show it? For now, keep it anonymous to be safe, or show it if the current user is the doctor. Let's just show ID for privacy. */}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Classifications & Approach */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Surgical Details</h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li><span className="font-medium text-slate-900 dark:text-white">Approach:</span> {surgicalCase.surgicalApproach || 'N/A'}</li>
                <li><span className="font-medium text-slate-900 dark:text-white">Anesthesia:</span> {surgicalCase.anesthesiaType}</li>
                {surgicalCase.traumaClassification && (
                  <li><span className="font-medium text-slate-900 dark:text-white">Trauma Class:</span> {surgicalCase.traumaClassification}</li>
                )}
                {surgicalCase.jointsClassification && (
                  <li><span className="font-medium text-slate-900 dark:text-white">Joints Class:</span> {surgicalCase.jointsClassification}</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Post-Op Protocol</h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li><span className="font-medium text-slate-900 dark:text-white">Weight Bearing:</span> {surgicalCase.weightBearingStatus}</li>
              </ul>
            </div>
          </div>

          {/* Text Fields */}
          <div className="space-y-6">
            
            {/* Pre-Op */}
            {surgicalCase.chiefComplaint && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Chief Complaint & HPI</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {surgicalCase.chiefComplaint}
                </div>
              </div>
            )}

            {(surgicalCase.pastMedicalHistory || surgicalCase.medicationsAndAllergies) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surgicalCase.pastMedicalHistory && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Past Medical History</h3>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {surgicalCase.pastMedicalHistory}
                    </div>
                  </div>
                )}
                {surgicalCase.medicationsAndAllergies && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Medications & Allergies</h3>
                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg text-red-700 dark:text-red-300 whitespace-pre-wrap border border-red-100 dark:border-red-900/30">
                      {surgicalCase.medicationsAndAllergies}
                    </div>
                  </div>
                )}
              </div>
            )}

            {surgicalCase.neurovascularStatus && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Neurovascular Status</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {surgicalCase.neurovascularStatus}
                </div>
              </div>
            )}

            {(surgicalCase.informedConsent || surgicalCase.medicalClearance) && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Consent & Clearances</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300">
                  <ul className="list-disc list-inside space-y-1">
                    {surgicalCase.informedConsent && <li>Informed Consent Obtained & Signed</li>}
                    {surgicalCase.medicalClearance && <li>Medical / Anesthesia Clearance Obtained</li>}
                  </ul>
                </div>
              </div>
            )}

            {surgicalCase.surgicalPlan && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Surgical Plan</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {surgicalCase.surgicalPlan}
                </div>
              </div>
            )}

            {/* Intra-Op */}
            {(surgicalCase.estimatedBloodLoss || surgicalCase.tourniquetTime) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surgicalCase.estimatedBloodLoss && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Estimated Blood Loss</h3>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300">
                      {surgicalCase.estimatedBloodLoss}
                    </div>
                  </div>
                )}
                {surgicalCase.tourniquetTime && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Tourniquet Time</h3>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300">
                      {surgicalCase.tourniquetTime}
                    </div>
                  </div>
                )}
              </div>
            )}

            {surgicalCase.operativeDescription && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Operative Description</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {surgicalCase.operativeDescription}
                </div>
              </div>
            )}

            {surgicalCase.implantsUsed && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Implants & Hardware</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {surgicalCase.implantsUsed}
                </div>
              </div>
            )}

            {surgicalCase.complications && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Complications</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {surgicalCase.complications}
                </div>
              </div>
            )}

            {/* Post-Op */}
            {(surgicalCase.painManagementDvt || surgicalCase.woundCare) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surgicalCase.painManagementDvt && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Pain Management & DVT</h3>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {surgicalCase.painManagementDvt}
                    </div>
                  </div>
                )}
                {surgicalCase.woundCare && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Wound Care</h3>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {surgicalCase.woundCare}
                    </div>
                  </div>
                )}
              </div>
            )}

            {surgicalCase.physiotherapyPlan && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Physiotherapy Plan</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {surgicalCase.physiotherapyPlan}
                </div>
              </div>
            )}

            {surgicalCase.followUpDate && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Follow-up Plan</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {surgicalCase.followUpDate}
                </div>
              </div>
            )}
          </div>

          {/* Media */}
          {(surgicalCase.imageUrls?.length > 0 || surgicalCase.labReportUrls?.length > 0) && (
            <div className="space-y-8">
              {surgicalCase.labReportUrls && surgicalCase.labReportUrls.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Lab Reports</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {surgicalCase.labReportUrls.map((url, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
                        {url.endsWith('.pdf') ? (
                          <div className="w-full aspect-square flex flex-col items-center justify-center text-slate-500">
                            <FileText className="w-12 h-12 mb-3 text-slate-400" />
                            <span className="font-medium">Lab PDF</span>
                            <a href={url} target="_blank" rel="noreferrer" className="mt-2 text-sm text-teal-600 hover:underline">
                              Open PDF
                            </a>
                          </div>
                        ) : (
                          <a href={url} target="_blank" rel="noreferrer" className="block w-full aspect-square">
                            <img src={url} alt={`Lab ${idx}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {surgicalCase.imageUrls && surgicalCase.imageUrls.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Surgical Images</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {surgicalCase.imageUrls.map((url, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
                        {url.endsWith('.pdf') ? (
                          <div className="w-full aspect-square flex flex-col items-center justify-center text-slate-500">
                            <FileText className="w-12 h-12 mb-3 text-slate-400" />
                            <span className="font-medium">PDF Document</span>
                            <a href={url} target="_blank" rel="noreferrer" className="mt-2 text-sm text-teal-600 hover:underline">
                              Open PDF
                            </a>
                          </div>
                        ) : (
                          <a href={url} target="_blank" rel="noreferrer" className="block w-full aspect-square">
                            <img src={url} alt={`Media ${idx}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Medicolegal Documentation */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Medicolegal Documentation</h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg text-sm text-slate-700 dark:text-slate-300 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <span className="font-medium">Attending Provider:</span>
                <span>Dr. {doctor?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <span className="font-medium">Time of Dictation:</span>
                <span>{format(new Date(surgicalCase.updatedAt), 'MMMM dd, yyyy HH:mm:ss')}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="font-medium">Provider Signature:</span>
                <span className="italic text-slate-400">Electronically Signed</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
