import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDb, Patient, SurgicalCase } from '../store/mockDb';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, PlusCircle, Download, FileText, Edit, Calendar, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

// Helper to convert image URL to base64 for jsPDF
const getBase64ImageFromUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = error => reject(error);
    img.src = url;
  });
};

export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [cases, setCases] = useState<SurgicalCase[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const p = mockDb.getPatients().find(p => p.id === id);
      if (p) setPatient(p);
      
      const c = mockDb.getCases().filter(c => c.patientId === id);
      setCases(c.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!patient) return;
    setIsGeneratingPdf(true);
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      let y = 20;
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - margin * 2;

      const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0,0,0]) => {
        if (!text) return;
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.4; // approximate height in mm
        
        // Check if we need a new page
        if (y + (lines.length * lineHeight) > 280) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(lines, margin, y);
        y += (lines.length * lineHeight) + 2;
      };

      // Header
      addText("OrthoLog - Clinical Patient Report", 22, true, [13, 148, 136]); // Teal color
      y += 5;
      
      // Patient Info
      addText(`Patient Name: ${patient.name}`, 14, true);
      addText(`Patient ID: ${patient.displayId} | Age: ${patient.age} | Gender: ${patient.gender}`, 11, false, [100, 100, 100]);
      y += 10;

      if (cases.length === 0) {
        addText("No surgical cases recorded.", 12);
      } else {
        for (let i = 0; i < cases.length; i++) {
          const c = cases[i];
          
          // Divider
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, y - 4, pageWidth - margin, y - 4);
          y += 4;
          
          addText(`Date: ${format(new Date(c.date), 'MMMM dd, yyyy')}`, 10, true, [100, 100, 100]);
          addText(`Diagnosis: ${c.diagnosis}`, 14, true);
          
          const details = [];
          if (c.surgicalApproach) details.push(`Approach: ${c.surgicalApproach}`);
          if (c.anesthesiaType) details.push(`Anesthesia: ${c.anesthesiaType}`);
          if (c.traumaClassification) details.push(`Trauma: ${c.traumaClassification}`);
          if (c.jointsClassification) details.push(`Joints: ${c.jointsClassification}`);
          
          if (details.length > 0) {
            addText(details.join(' | '), 10, false, [80, 80, 80]);
          }
          y += 4;

          if (c.chiefComplaint) {
            addText("Chief Complaint & HPI:", 11, true);
            addText(c.chiefComplaint, 10);
            y += 2;
          }

          if (c.pastMedicalHistory) {
            addText("Past Medical History:", 11, true);
            addText(c.pastMedicalHistory, 10);
            y += 2;
          }

          if (c.medicationsAndAllergies) {
            addText("Medications & Allergies:", 11, true, [200, 0, 0]);
            addText(c.medicationsAndAllergies, 10);
            y += 2;
          }

          if (c.neurovascularStatus) {
            addText("Neurovascular Status:", 11, true);
            addText(c.neurovascularStatus, 10);
            y += 2;
          }

          if (c.informedConsent || c.medicalClearance) {
            addText("Consent & Clearances:", 11, true);
            if (c.informedConsent) addText("- Informed Consent Obtained & Signed", 10);
            if (c.medicalClearance) addText("- Medical / Anesthesia Clearance Obtained", 10);
            y += 2;
          }

          if (c.surgicalPlan) {
            addText("Surgical Plan:", 11, true);
            addText(c.surgicalPlan, 10);
            y += 2;
          }

          const intraOpDetails = [];
          if (c.estimatedBloodLoss) intraOpDetails.push(`EBL: ${c.estimatedBloodLoss}`);
          if (c.tourniquetTime) intraOpDetails.push(`Tourniquet: ${c.tourniquetTime}`);
          if (intraOpDetails.length > 0) {
            addText(intraOpDetails.join(' | '), 10, true, [80, 80, 80]);
            y += 2;
          }

          if (c.operativeDescription) {
            addText("Operative Description:", 11, true);
            addText(c.operativeDescription, 10);
            y += 2;
          }
          
          if (c.implantsUsed) {
            addText("Implants Used:", 11, true);
            addText(c.implantsUsed, 10);
            y += 2;
          }

          if (c.complications) {
            addText("Complications:", 11, true);
            addText(c.complications, 10);
            y += 2;
          }
          
          addText("Post-Op & Rehab:", 11, true);
          addText(`Weight Bearing: ${c.weightBearingStatus}`, 10);
          if (c.physiotherapyPlan) {
            addText(c.physiotherapyPlan, 10);
          }
          y += 2;

          if (c.painManagementDvt) {
            addText("Pain Management & DVT:", 11, true);
            addText(c.painManagementDvt, 10);
            y += 2;
          }

          if (c.woundCare) {
            addText("Wound Care:", 11, true);
            addText(c.woundCare, 10);
            y += 2;
          }

          if (c.followUpDate) {
            addText("Follow-up Plan:", 11, true);
            addText(c.followUpDate, 10);
            y += 2;
          }
          
          // Images
          const allMediaUrls = [...(c.imageUrls || []), ...(c.labReportUrls || [])];
          if (allMediaUrls.length > 0) {
            addText("Attached Media:", 11, true);
            y += 2;
            
            let imgX = margin;
            const imgSize = 45; // mm
            let hasImages = false;
            
            for (const url of allMediaUrls) {
              if (url.endsWith('.pdf')) continue; // Skip PDFs in image export
              hasImages = true;
              try {
                const imgData = await getBase64ImageFromUrl(url);
                
                if (y + imgSize > 280) {
                  doc.addPage();
                  y = 20;
                  imgX = margin;
                }
                
                if (imgX + imgSize > pageWidth - margin) {
                  imgX = margin;
                  y += imgSize + 5;
                  if (y + imgSize > 280) {
                    doc.addPage();
                    y = 20;
                  }
                }
                
                doc.addImage(imgData, 'JPEG', imgX, y, imgSize, imgSize);
                imgX += imgSize + 5;
              } catch (e) {
                console.error("Failed to load image for PDF", e);
              }
            }
            if (hasImages) {
              y += imgSize + 10;
            }
          }
          
          // Medicolegal Documentation
          y += 5;
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, y, pageWidth - margin, y);
          y += 5;
          
          const doctor = mockDb.getUsers().find(u => u.id === c.doctorId);
          addText("Medicolegal Documentation:", 11, true);
          addText(`Attending Provider: Dr. ${doctor?.name || 'Unknown'}`, 10);
          addText(`Time of Dictation: ${format(new Date(c.updatedAt), 'MMMM dd, yyyy HH:mm:ss')}`, 10);
          addText("Signature: ___________________________", 10);
          
          y += 10;
        }
      }

      doc.save(`Patient_Report_${patient.displayId}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDeleteCase = () => {
    if (caseToDelete) {
      mockDb.deleteCase(caseToDelete);
      setCases(prev => prev.filter(c => c.id !== caseToDelete));
      setCaseToDelete(null);
    }
  };

  if (!patient) {
    return <div className="text-center py-12">Patient not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 print:pb-0">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Patient Archive</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="gap-2">
            <Download className="w-4 h-4" />
            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button onClick={() => navigate('/log-surgery', { state: { patientId: patient.id } })} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Case
          </Button>
        </div>
      </div>

      {/* The visible UI */}
      <div className="bg-slate-50 dark:bg-slate-950 p-2 sm:p-6 rounded-xl space-y-6 print:p-0 print:bg-white print:text-black">
        
        {/* Patient Details Header */}
        <Card className="border-l-4 border-l-teal-600 print:border-l-4 print:border-slate-800 print:shadow-none">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{patient.name}</CardTitle>
                <div className="text-sm text-slate-500 mt-1 flex gap-4 print:text-slate-800">
                  <span>ID: <span className="font-medium text-slate-900 dark:text-slate-100 print:text-black">{patient.displayId}</span></span>
                  <span>Age: <span className="font-medium text-slate-900 dark:text-slate-100 print:text-black">{patient.age}</span></span>
                  <span>Gender: <span className="font-medium text-slate-900 dark:text-slate-100 print:text-black">{patient.gender}</span></span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-teal-600 print:hidden" onClick={() => alert('Edit patient details feature coming soon.')}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Surgical History */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 print:text-black">
            <FileText className="w-5 h-5 text-teal-600 print:text-black" />
            Surgical History
          </h2>
          
          {cases.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 print:border-none">
              No surgical cases recorded yet.
            </div>
          ) : (
            <div className="space-y-6">
              {cases.map((c, index) => (
                <Card key={c.id} className="overflow-hidden print:shadow-none print:border-slate-300 print:break-inside-avoid">
                  <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center print:bg-slate-100">
                    <div className="flex items-center gap-2 font-medium text-teal-700 dark:text-teal-400 print:text-black">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(c.date), 'MMMM dd, yyyy')}
                    </div>
                    <div className="flex gap-2 print:hidden">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/edit-case/${c.id}`)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => setCaseToDelete(c.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    
                    {/* Diagnosis & Plan */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 print:text-black">{c.diagnosis}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {c.traumaClassification && (
                          <div><span className="text-slate-500 print:text-slate-700">Classification:</span> <span className="font-medium print:text-black">{c.traumaClassification}</span></div>
                        )}
                        {c.jointsClassification && (
                          <div><span className="text-slate-500 print:text-slate-700">Classification:</span> <span className="font-medium print:text-black">{c.jointsClassification}</span></div>
                        )}
                        <div><span className="text-slate-500 print:text-slate-700">Anesthesia:</span> <span className="font-medium print:text-black">{c.anesthesiaType}</span></div>
                        <div><span className="text-slate-500 print:text-slate-700">Approach:</span> <span className="font-medium print:text-black">{c.surgicalApproach}</span></div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      {c.surgicalPlan && (
                        <div>
                          <span className="text-slate-500 font-medium block mb-1 print:text-slate-700">Surgical Plan</span>
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap print:text-black">{c.surgicalPlan}</p>
                        </div>
                      )}
                      {c.implantsUsed && (
                        <div>
                          <span className="text-slate-500 font-medium block mb-1 print:text-slate-700">Implants Used</span>
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap print:text-black">{c.implantsUsed}</p>
                        </div>
                      )}
                      {c.physiotherapyPlan && (
                        <div>
                          <span className="text-slate-500 font-medium block mb-1 print:text-slate-700">Post-Op & Rehab</span>
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap print:text-black">
                            <span className="font-medium text-slate-900 dark:text-slate-100 print:text-black">WB Status: {c.weightBearingStatus}</span><br/>
                            {c.physiotherapyPlan}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Media */}
                    {c.imageUrls && c.imageUrls.length > 0 && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 font-medium block mb-3 text-sm print:text-slate-700">Attached Media</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {c.imageUrls.map((url, idx) => (
                            <div key={idx} className="aspect-square rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden print:border-slate-300">
                              {url.endsWith('.pdf') ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 print:bg-white print:text-black">
                                  <FileText className="w-8 h-8 mb-2" />
                                  <span className="text-xs">PDF</span>
                                </div>
                              ) : (
                                <img src={url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {caseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2">Delete Surgical Case</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete this surgical case? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCaseToDelete(null)}>Cancel</Button>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteCase}>Delete Case</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
