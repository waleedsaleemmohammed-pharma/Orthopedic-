import { useState, useEffect } from 'react';

// Mock Database Types
export type Role = 'admin' | 'doctor';

export interface User {
  id: string;
  username: string;
  passwordHash: string; // In a real app, never store plain text
  role: Role;
  name: string;
  mustChangePassword?: boolean;
}

export interface Patient {
  id: string;
  displayId: string; // Anonymized ID
  name: string;
  age: number | '';
  gender: 'Male' | 'Female' | 'Other' | '';
  medicalHistory: string;
  pastSurgeries: string;
}

export interface SurgicalCase {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  
  // Pre-op
  diagnosis: string;
  comorbidities: string;
  currentMedications: string;
  surgicalPlan: string;
  
  // Clinical Assessment & History
  chiefComplaint?: string;
  pastMedicalHistory?: string;
  medicationsAndAllergies?: string;
  neurovascularStatus?: string;

  // Consent & Clearances
  informedConsent?: boolean;
  medicalClearance?: boolean;
  
  // Classifications
  traumaClassification?: string;
  jointsClassification?: string;
  
  // Intra-op
  anesthesiaType: string;
  surgicalApproach: string;
  implantsUsed: string;
  estimatedBloodLoss?: string;
  tourniquetTime?: string;
  complications?: string;
  operativeDescription?: string;
  
  // Post-op
  weightBearingStatus: string;
  physiotherapyPlan: string;
  postOpMedications: string;
  painManagementDvt?: string;
  woundCare?: string;
  followUpDate?: string;
  
  // Media & Sharing
  imageUrls: string[];
  labReportUrls?: string[];
  isSharedToCommunity: boolean;
  
  // Medicolegal
  timeOfDictation?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Initial Mock Data
const initialUsers: User[] = [
  {
    id: 'admin-1',
    username: 'ahmed',
    passwordHash: 'admin', // Mock password
    role: 'admin',
    name: 'System Admin',
  }
];

const initialPatients: Patient[] = [];
const initialCases: SurgicalCase[] = [];

// Simple local storage wrapper for mock DB
export const mockDb = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem('users') || JSON.stringify(initialUsers)),
  saveUsers: (users: User[]) => localStorage.setItem('users', JSON.stringify(users)),
  
  getPatients: (): Patient[] => JSON.parse(localStorage.getItem('patients') || JSON.stringify(initialPatients)),
  savePatients: (patients: Patient[]) => localStorage.setItem('patients', JSON.stringify(patients)),
  
  getCases: (): SurgicalCase[] => JSON.parse(localStorage.getItem('cases') || JSON.stringify(initialCases)),
  saveCases: (cases: SurgicalCase[]) => localStorage.setItem('cases', JSON.stringify(cases)),
  deleteCase: (id: string) => {
    const cases = JSON.parse(localStorage.getItem('cases') || JSON.stringify(initialCases));
    localStorage.setItem('cases', JSON.stringify(cases.filter((c: SurgicalCase) => c.id !== id)));
  },
};

// Auth State Hook
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username: string, passwordHash: string) => {
    const users = mockDb.getUsers();
    const user = users.find(u => u.username === username && u.passwordHash === passwordHash);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const updatePassword = (newPasswordHash: string) => {
    if (!currentUser) return;
    const users = mockDb.getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, passwordHash: newPasswordHash, mustChangePassword: false };
      }
      return u;
    });
    mockDb.saveUsers(updatedUsers);
    
    const updatedUser = { ...currentUser, passwordHash: newPasswordHash, mustChangePassword: false };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  return { currentUser, login, logout, updatePassword };
}
