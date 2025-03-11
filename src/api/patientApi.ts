import api from './apiClient';
import endpoints from './endpoints';
import { Patient } from '../types';
import { toISODateTimeString } from '../utils/dateUtils';

/**
 * Get all patients from the API
 * @returns Array of patients
 */
export const getPatients = async (): Promise<Patient[]> => {
  const response = await api.get<Patient[]>(endpoints.patients);
  return response.data;
};

/**
 * Get a patient by ID with all related data
 * @param id - Patient ID
 * @returns Patient details including medical history, examinations, and prescriptions
 */
export const getPatientDetails = async (id: number): Promise<Patient> => {
  const response = await api.get<Patient>(endpoints.patientDetails(id));
  return response.data;
};

/**
 * Create a new patient
 * @param patient - Patient data without ID
 * @returns Created patient
 */
export const createPatient = async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
  const formattedPatient = {
    ...patient,
    dateOfBirth: toISODateTimeString(new Date(patient.dateOfBirth))
  };
  const response = await api.post<Patient>(endpoints.patients, formattedPatient);
  return response.data;
};

/**
 * Update an existing patient
 * @param id - Patient ID 
 * @param patient - Updated patient data
 */
export const updatePatient = async (id: number, patient: Patient): Promise<void> => {
  const patientToUpdate = {
    ...patient,
    id, // Force the correct ID
    dateOfBirth: toISODateTimeString(new Date(patient.dateOfBirth))
  };
  try {
    const response = await api.put(endpoints.patientById(id), patientToUpdate);
    console.log('Update response:', response.status, response.statusText);
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

/**
 * Delete a patient by ID
 * @param id - Patient ID
 */
export const deletePatient = async (id: number): Promise<void> => {
  await api.delete(endpoints.patientById(id));
};

/**
 * Search for patients based on search term
 * @param lastName - Last name to search for
 * @returns Array of matching patients
 */
export const searchPatients = async (lastName: string): Promise<Patient[]> => {
  const response = await api.get<Patient[]>(endpoints.patientSearch, {
    params: { lastName }
  });
  return response.data;
};

/**
 * Get a patient by personal ID number (OIB)
 * @param personalIdNumber - Personal ID number
 * @returns Patient
 */
export const getPatientByOib = async (personalIdNumber: string): Promise<Patient> => {
  const response = await api.get<Patient>(endpoints.patientByOib(personalIdNumber));
  return response.data;
}; 