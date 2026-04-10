import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { mockDb, SurgicalCase, Patient } from '../store/mockDb';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Save, ArrowLeft, Camera, Image as ImageIcon, X, FileText } from 'lucide-react';
import { clsx } from 'clsx';

type Tab = 'preop' | 'intraop' | 'postop' | 'media';

export default function SurgicalLog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: caseId } = useParams<{ id: string }>();
  const prefilledPatientId = location.state?.patientId;

  const [activeTab, setActiveTab] = useState<Tab>('preop');
  
  // Patient State
  const [patientData, setPatientData] = useState<Partial<Patient>>({
    displayId: '',
    name: '',
    age: '',
    gender: ''
  });

  // Form State
  const [formData, setFormData] = useState<Partial<SurgicalCase>>({
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    comorbidities: '',
    currentMedications: '',
    surgicalPlan: '',
    chiefComplaint: '',
    pastMedicalHistory: '',
    medicationsAndAllergies: '',
    neurovascularStatus: '',
    informedConsent: false,
    medicalClearance: false,
    traumaClassification: '',
    jointsClassification: '',
    anesthesiaType: 'General',
    surgicalApproach: '',
    implantsUsed: '',
    estimatedBloodLoss: '',
    tourniquetTime: '',
    complications: '',
    operativeDescription: '',
    weightBearingStatus: 'NWB',
    physiotherapyPlan: '',
    postOpMedications: '',
    painManagementDvt: '',
    woundCare: '',
    followUpDate: '',
    isSharedToCommunity: false,
    imageUrls: [],
    labReportUrls: []
  });

  useEffect(() => {
    if (caseId) {
      const existingCase = mockDb.getCases().find(c => c.id === caseId);
      if (existingCase) {
        setFormData(existingCase);
        const p = mockDb.getPatients().find(p => p.id === existingCase.patientId);
        if (p) setPatientData(p);
      }
    } else if (prefilledPatientId) {
      const p = mockDb.getPatients().find(p => p.id === prefilledPatientId);
      if (p) setPatientData(p);
    }
  }, [caseId, prefilledPatientId]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const labInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof SurgicalCase, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientChange = (field: keyof Patient, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'lab' = 'image') => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      const newUrls = filesArray.map(file => URL.createObjectURL(file));
      if (type === 'image') {
        setFormData(prev => ({
          ...prev,
          imageUrls: [...(prev.imageUrls || []), ...newUrls]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          labReportUrls: [...(prev.labReportUrls || []), ...newUrls]
        }));
      }
    }
  };

  const removeImage = (index: number, type: 'image' | 'lab' = 'image') => {
    setFormData(prev => {
      if (type === 'image') {
        const newUrls = [...(prev.imageUrls || [])];
        newUrls.splice(index, 1);
        return { ...prev, imageUrls: newUrls };
      } else {
        const newUrls = [...(prev.labReportUrls || [])];
        newUrls.splice(index, 1);
        return { ...prev, labReportUrls: newUrls };
      }
    });
  };

  const handleSave = () => {
    let finalPatientId = patientData.id;

    // Save or update patient
    const patients = mockDb.getPatients();
    if (!finalPatientId) {
      finalPatientId = `pt-${Date.now()}`;
      const newPatient: Patient = {
        id: finalPatientId,
        displayId: patientData.displayId || `ID-${Math.floor(Math.random() * 10000)}`,
        name: patientData.name || 'Unknown',
        age: Number(patientData.age) || 0,
        gender: patientData.gender as any || 'Other',
        medicalHistory: '',
        pastSurgeries: ''
      };
      mockDb.savePatients([...patients, newPatient]);
    } else {
      // Update existing patient if needed
      const updatedPatients = patients.map(p => p.id === finalPatientId ? { ...p, ...patientData } as Patient : p);
      mockDb.savePatients(updatedPatients);
    }

    const newCase: SurgicalCase = {
      ...formData,
      id: caseId || `case-${Date.now()}`,
      patientId: finalPatientId,
      doctorId: JSON.parse(localStorage.getItem('currentUser') || '{}').id,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as SurgicalCase;

    const cases = mockDb.getCases();
    if (caseId) {
      mockDb.saveCases(cases.map(c => c.id === caseId ? newCase : c));
    } else {
      mockDb.saveCases([...cases, newCase]);
    }
    
    if (prefilledPatientId || caseId) {
      navigate(`/patient/${finalPatientId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{caseId ? 'Edit Surgical Record' : 'New Surgical Record'}</h1>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          {caseId ? 'Update Case' : 'Save Case'}
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 hide-scrollbar">
        {[
          { id: 'preop', label: 'Pre-Op & Planning' },
          { id: 'intraop', label: 'Intra-Op Details' },
          { id: 'postop', label: 'Post-Op & Rehab' },
          { id: 'media', label: 'Media & Imaging' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={clsx(
              "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.id 
                ? "border-teal-600 text-teal-600 dark:border-teal-500 dark:text-teal-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300 dark:hover:border-slate-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'preop' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient & Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Patient Name</label>
                    <Input 
                      placeholder="e.g., Ahmed Ali" 
                      value={patientData.name} 
                      onChange={e => handlePatientChange('name', e.target.value)} 
                      disabled={!!prefilledPatientId}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Patient ID</label>
                    <Input 
                      placeholder="e.g., PT-001" 
                      value={patientData.displayId} 
                      onChange={e => handlePatientChange('displayId', e.target.value)} 
                      disabled={!!prefilledPatientId}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Age</label>
                    <Input 
                      type="number" 
                      placeholder="e.g., 45" 
                      value={patientData.age} 
                      onChange={e => handlePatientChange('age', e.target.value)} 
                      disabled={!!prefilledPatientId}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900 disabled:opacity-50"
                      value={patientData.gender}
                      onChange={e => handlePatientChange('gender', e.target.value)}
                      disabled={!!prefilledPatientId}
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date of Surgery</label>
                    <Input type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Diagnosis</label>
                    <Input placeholder="e.g., Closed displaced midshaft femur fracture" value={formData.diagnosis} onChange={e => handleChange('diagnosis', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Chief Complaint & HPI</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Mechanism of injury, pain details, duration..."
                    value={formData.chiefComplaint}
                    onChange={e => handleChange('chiefComplaint', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Past Medical/Surgical History</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                      placeholder="Chronic illnesses, previous surgeries..."
                      value={formData.pastMedicalHistory}
                      onChange={e => handleChange('pastMedicalHistory', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-red-600 dark:text-red-400">Medications & Allergies</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-red-300 bg-red-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:border-red-900/30 dark:bg-red-950/20"
                      placeholder="List all allergies and current medications..."
                      value={formData.medicationsAndAllergies}
                      onChange={e => handleChange('medicationsAndAllergies', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Physical Examination (Neurovascular Status)</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Document nerve and vascular status before intervention..."
                    value={formData.neurovascularStatus}
                    onChange={e => handleChange('neurovascularStatus', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trauma Classification (Optional)</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                      value={formData.traumaClassification}
                      onChange={e => handleChange('traumaClassification', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="AO/OTA 32-A3">AO/OTA 32-A3</option>
                      <option value="Gustilo-Anderson Type I">Gustilo-Anderson Type I</option>
                      <option value="Gustilo-Anderson Type II">Gustilo-Anderson Type II</option>
                      <option value="Salter-Harris Type II">Salter-Harris Type II</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Joints/Sports Classification (Optional)</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                      value={formData.jointsClassification}
                      onChange={e => handleChange('jointsClassification', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Kellgren-Lawrence Grade 3">Kellgren-Lawrence Grade 3</option>
                      <option value="Kellgren-Lawrence Grade 4">Kellgren-Lawrence Grade 4</option>
                      <option value="Outerbridge Grade III">Outerbridge Grade III</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Surgical Plan</label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Describe the planned procedure..."
                    value={formData.surgicalPlan}
                    onChange={e => handleChange('surgicalPlan', e.target.value)}
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold mb-3">Consent & Clearances</h3>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-950"
                        checked={formData.informedConsent}
                        onChange={(e) => handleChange('informedConsent', e.target.checked)}
                      />
                      <span className="text-sm font-medium">Informed Consent Obtained & Signed</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-950"
                        checked={formData.medicalClearance}
                        onChange={(e) => handleChange('medicalClearance', e.target.checked)}
                      />
                      <span className="text-sm font-medium">Medical / Anesthesia Clearance Obtained</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'intraop' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operative Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Anesthesia Type</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                      value={formData.anesthesiaType}
                      onChange={e => handleChange('anesthesiaType', e.target.value)}
                    >
                      <option value="General">General</option>
                      <option value="Spinal">Spinal</option>
                      <option value="Epidural">Epidural</option>
                      <option value="Regional Block">Regional Block</option>
                      <option value="Local">Local</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Surgical Approach</label>
                    <Input placeholder="e.g., Direct Anterior, Lateral, Posterior" value={formData.surgicalApproach} onChange={e => handleChange('surgicalApproach', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estimated Blood Loss (EBL)</label>
                    <Input placeholder="e.g., 150 ml" value={formData.estimatedBloodLoss} onChange={e => handleChange('estimatedBloodLoss', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tourniquet Time</label>
                    <Input placeholder="e.g., 45 mins (Pressure: 250 mmHg)" value={formData.tourniquetTime} onChange={e => handleChange('tourniquetTime', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Implants & Hardware Used</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                    placeholder="e.g., Synthes 4.5mm LCP, 8 holes. 3 cortical screws proximal, 4 locking distal."
                    value={formData.implantsUsed}
                    onChange={e => handleChange('implantsUsed', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Operative Description</label>
                  <textarea 
                    className="flex min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Step-by-step description of the procedure..."
                    value={formData.operativeDescription}
                    onChange={e => handleChange('operativeDescription', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Complications</label>
                  <textarea 
                    className="flex min-h-[60px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                    placeholder="None, or describe any intra-operative complications..."
                    value={formData.complications}
                    onChange={e => handleChange('complications', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'postop' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recovery & Rehab</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight Bearing Status</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                    value={formData.weightBearingStatus}
                    onChange={e => handleChange('weightBearingStatus', e.target.value)}
                  >
                    <option value="NWB">Non-Weight Bearing (NWB)</option>
                    <option value="TTWB">Toe-Touch Weight Bearing (TTWB)</option>
                    <option value="PWB">Partial Weight Bearing (PWB)</option>
                    <option value="WBAT">Weight Bearing As Tolerated (WBAT)</option>
                    <option value="FWB">Full Weight Bearing (FWB)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Physiotherapy Plan</label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                    placeholder="e.g., ROM exercises starting day 1. Avoid active abduction for 6 weeks."
                    value={formData.physiotherapyPlan}
                    onChange={e => handleChange('physiotherapyPlan', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pain Management & DVT Prophylaxis</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                      placeholder="Analgesics, anticoagulants prescribed..."
                      value={formData.painManagementDvt}
                      onChange={e => handleChange('painManagementDvt', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wound Care</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-900"
                      placeholder="Dressing changes, showering instructions..."
                      value={formData.woundCare}
                      onChange={e => handleChange('woundCare', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Specific Follow-up Date/Plan</label>
                  <Input placeholder="e.g., 2 weeks in clinic for suture removal and X-ray" value={formData.followUpDate} onChange={e => handleChange('followUpDate', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Imaging & Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <h3 className="text-sm font-semibold mb-3">Lab Reports & Investigations</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                    {formData.labReportUrls?.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden group">
                        {url.endsWith('.pdf') ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <span className="text-xs font-medium text-center px-2">Lab PDF</span>
                          </div>
                        ) : (
                          <img src={url} alt={`Lab ${idx}`} className="w-full h-full object-cover" />
                        )}
                        <button 
                          onClick={() => removeImage(idx, 'lab')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                          title="Remove lab report"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <input 
                      type="file" 
                      ref={labInputRef} 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.pdf" 
                      multiple 
                      onChange={(e) => handleFileUpload(e, 'lab')} 
                    />
                    
                    <div 
                      onClick={() => labInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                    >
                      <FileText className="w-8 h-8 mb-2" />
                      <span className="text-xs font-medium">Upload Lab</span>
                      <span className="text-[10px] mt-1 opacity-70">JPG, PNG, PDF</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Surgical Images & X-Rays</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                    {formData.imageUrls?.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden group">
                        {url.endsWith('.pdf') ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <span className="text-xs font-medium">PDF Document</span>
                          </div>
                        ) : (
                          <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        )}
                        <button 
                          onClick={() => removeImage(idx, 'image')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.pdf" 
                      multiple 
                      onChange={(e) => handleFileUpload(e, 'image')} 
                    />
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs font-medium">Upload Image</span>
                      <span className="text-[10px] mt-1 opacity-70">JPG, PNG, PDF</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-950"
                      checked={formData.isSharedToCommunity}
                      onChange={(e) => handleChange('isSharedToCommunity', e.target.checked)}
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">Share to Community Feed (The Atlas)</p>
                      <p className="text-sm text-slate-500">Patient identifiers will be strictly anonymized.</p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
