/**
 * API endpoint definitions
 * These match the endpoints available in the backend controllers
 * Note: Backend uses Pascal case for controller names (Doctor, Patient, etc.)
 */
const endpoints = {
  // Authentication
  login: '/Auth/Login',
  
  // Patient endpoints
  patients: '/Patient',
  patientById: (id: number) => `/Patient/${id}`,
  patientDetails: (id: number) => `/Patient/${id}/Details`,
  patientSearch: '/Patient/Search',
  patientByOib: (oib: string) => `/Patient/Oib/${oib}`,
  
  // Doctor endpoints
  doctors: '/Doctor',
  doctorById: (id: number) => `/Doctor/${id}`,
  doctorDetails: (id: number) => `/Doctor/${id}/Details`,
  doctorsWithExaminations: '/Doctor/WithExaminations',
  
  // Examination endpoints
  examinations: '/Examination',
  examinationById: (id: number) => `/Examination/${id}`,
  examinationDetails: (id: number) => `/Examination/${id}/Details`,
  examinationsByPatient: (patientId: number) => `/Examination/Patient/${patientId}`,
  examinationsByDoctor: (doctorId: number) => `/Examination/Doctor/${doctorId}`,
  
  // Medical history endpoints
  medicalHistories: '/MedicalHistory',
  medicalHistoryById: (id: number) => `/MedicalHistory/${id}`,
  medicalHistoryByPatient: (patientId: number) => `/MedicalHistory/Patient/${patientId}`,
  activeConditions: (patientId: number) => `/MedicalHistory/Patient/${patientId}/Active`,
  
  // Medical image endpoints
  medicalImages: '/MedicalImage',
  medicalImageById: (id: number) => `/MedicalImage/${id}`,
  medicalImagesByExamination: (examinationId: number) => `/MedicalImage/Examination/${examinationId}`,
  medicalImageDownload: (id: number) => `/MedicalImage/${id}/Download`,
  medicalImageSecureUrl: (id: number) => `/MedicalImage/${id}/SecureUrl`,
  uploadMedicalImage: (examinationId: number) => `/MedicalImage/Examination/${examinationId}/Upload`,
  
  // Prescription endpoints
  prescriptions: '/Prescription',
  prescriptionById: (id: number) => `/Prescription/${id}`,
  prescriptionsByPatient: (patientId: number) => `/Prescription/Patient/${patientId}`,
  prescriptionsByDoctor: (doctorId: number) => `/Prescription/Doctor/${doctorId}`,
  prescriptionPdf: (id: number) => `/Prescription/${id}/Pdf`
};

export default endpoints; 