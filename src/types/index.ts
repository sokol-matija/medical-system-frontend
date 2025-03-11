// Patient Model
export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  personalIdNumber: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  medicalHistories?: MedicalHistory[];
  examinations?: Examination[];
  prescriptions?: Prescription[];
}

// MedicalHistory Model
export interface MedicalHistory {
  id: number;
  patientId: number;
  diseaseName: string;
  startDate: string;
  endDate?: string;
  patient?: Patient;
}

// Doctor Model
export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  examinations?: Examination[];
  prescriptions?: Prescription[];
}

// Examination Model
export interface Examination {
  id: number;
  patientId: number;
  doctorId: number;
  type: ExaminationType;
  examinationDateTime: string;
  notes: string;
  patient?: Patient;
  doctor?: Doctor;
  medicalImages?: MedicalImage[];
  prescriptions?: Prescription[];
}

// ExaminationType Enum
export enum ExaminationType {
  GP = "GP",
  KRV = "KRV",
  XRAY = "XRAY",
  CT = "CT",
  MR = "MR",
  ULTRA = "ULTRA",
  EKG = "EKG",
  ECHO = "ECHO",
  EYE = "EYE",
  DERM = "DERM",
  DENTA = "DENTA",
  MAMMO = "MAMMO",
  NEURO = "NEURO"
}

// MedicalImage Model
export interface MedicalImage {
  id: number;
  examinationId: number;
  fileName: string;
  fileType: string;
  uploadDateTime: string;
  examination?: Examination;
}

// Prescription Model
export interface Prescription {
  id: number;
  examinationId: number;
  patientId: number;
  doctorId: number;
  medication: string;
  dosage: string;
  instructions: string;
  prescriptionDate: string;
  examination?: Examination;
  patient?: Patient;
  doctor?: Doctor;
} 