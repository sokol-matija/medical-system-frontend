import api from './apiClient';
import endpoints from './endpoints';
import { Examination } from '../types';
import { toISODateTimeString } from '../utils/dateUtils';

/**
 * Get all examinations
 * @returns Array of examinations
 */
export const getExaminations = async (): Promise<Examination[]> => {
  const response = await api.get<Examination[]>(endpoints.examinations);
  return response.data;
};

/**
 * Get examination by ID
 * @param id - Examination ID
 * @returns Examination
 */
export const getExaminationById = async (id: number): Promise<Examination> => {
  const response = await api.get<Examination>(endpoints.examinationById(id));
  return response.data;
};

/**
 * Get examination with details (medical images, prescriptions)
 * @param id - Examination ID
 * @returns Examination with related data
 */
export const getExaminationDetails = async (id: number): Promise<Examination> => {
  const response = await api.get<Examination>(endpoints.examinationDetails(id));
  return response.data;
};

/**
 * Get examinations by patient ID
 * @param patientId - Patient ID
 * @returns Array of examinations for the patient
 */
export const getExaminationsByPatient = async (patientId: number): Promise<Examination[]> => {
  const response = await api.get<Examination[]>(endpoints.examinationsByPatient(patientId));
  return response.data;
};

/**
 * Get examinations by doctor ID
 * @param doctorId - Doctor ID
 * @returns Array of examinations performed by the doctor
 */
export const getExaminationsByDoctor = async (doctorId: number): Promise<Examination[]> => {
  const response = await api.get<Examination[]>(endpoints.examinationsByDoctor(doctorId));
  return response.data;
};

/**
 * Create a new examination
 * @param examinationData - Examination data without ID
 * @returns Created examination
 */
export const createExamination = async (examinationData: Omit<Examination, 'id'>): Promise<Examination> => {
  // Format examination data with simple properties only
  const formattedExamination = {
    patientId: examinationData.patientId,
    doctorId: examinationData.doctorId,
    // The type comes in from the form as a string representation of a number
    // We just need to ensure it's a number in the API payload
    type: Number(examinationData.type),
    examinationDateTime: toISODateTimeString(new Date(examinationData.examinationDateTime)),
    notes: examinationData.notes
  };
  
  console.log('Sending examination data:', formattedExamination); // Debug log to verify data
  
  const response = await api.post<Examination>(endpoints.examinations, formattedExamination);
  return response.data;
};

/**
 * Update an existing examination
 * @param id - Examination ID
 * @param examination - Updated examination data
 */
export const updateExamination = async (id: number, examination: Examination): Promise<void> => {
  const examinationToUpdate = {
    ...examination,
    // Ensure type is a number in the payload
    type: Number(examination.type),
    examinationDateTime: toISODateTimeString(new Date(examination.examinationDateTime)),
  };
  
  console.log('Updating examination data:', examinationToUpdate); // Debug log to verify data
  
  await api.put(endpoints.examinationById(id), examinationToUpdate);
};

/**
 * Delete an examination
 * @param id - Examination ID
 */
export const deleteExamination = async (id: number): Promise<void> => {
  await api.delete(endpoints.examinationById(id));
};