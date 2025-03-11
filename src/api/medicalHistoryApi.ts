import api from './apiClient';
import endpoints from './endpoints';
import { MedicalHistory } from '../types';

/**
 * Get all medical histories
 * @returns Array of medical histories
 */
export const getMedicalHistories = async (): Promise<MedicalHistory[]> => {
  const response = await api.get<MedicalHistory[]>(endpoints.medicalHistories);
  return response.data;
};

/**
 * Get medical history by ID
 * @param id - Medical history ID
 * @returns Medical history
 */
export const getMedicalHistoryById = async (id: number): Promise<MedicalHistory> => {
  const response = await api.get<MedicalHistory>(endpoints.medicalHistoryById(id));
  return response.data;
};

/**
 * Get medical history records for a patient
 * @param patientId - Patient ID
 * @returns Array of medical history records for the patient
 */
export const getPatientHistory = async (patientId: number): Promise<MedicalHistory[]> => {
  const response = await api.get<MedicalHistory[]>(endpoints.medicalHistoryByPatient(patientId));
  return response.data;
};

/**
 * Get active medical conditions for a patient
 * @param patientId - Patient ID
 * @returns Array of active medical conditions
 */
export const getActiveConditions = async (patientId: number): Promise<MedicalHistory[]> => {
  const response = await api.get<MedicalHistory[]>(endpoints.activeConditions(patientId));
  return response.data;
};

/**
 * Create a new medical history record
 * @param medicalHistory - Medical history data without ID
 * @returns Created medical history record
 */
export const createMedicalHistory = async (medicalHistory: Omit<MedicalHistory, 'id'>): Promise<MedicalHistory> => {
  const response = await api.post<MedicalHistory>(endpoints.medicalHistories, medicalHistory);
  return response.data;
};

/**
 * Update an existing medical history record
 * @param id - Medical history ID
 * @param medicalHistory - Updated medical history data
 */
export const updateMedicalHistory = async (id: number, medicalHistory: MedicalHistory): Promise<void> => {
  await api.put(endpoints.medicalHistoryById(id), medicalHistory);
};

/**
 * Delete a medical history record
 * @param id - Medical history ID
 */
export const deleteMedicalHistory = async (id: number): Promise<void> => {
  await api.delete(endpoints.medicalHistoryById(id));
}; 