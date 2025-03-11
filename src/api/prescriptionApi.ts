import api from './apiClient';
import endpoints from './endpoints';
import { Prescription } from '../types';
import { toISODateTimeString } from '../utils/dateUtils';

/**
 * Get all prescriptions
 * @returns Array of prescriptions
 */
export const getPrescriptions = async (): Promise<Prescription[]> => {
  const response = await api.get<Prescription[]>(endpoints.prescriptions);
  return response.data;
};

/**
 * Get prescription by ID
 * @param id - Prescription ID
 * @returns Prescription
 */
export const getPrescriptionById = async (id: number): Promise<Prescription> => {
  const response = await api.get<Prescription>(endpoints.prescriptionById(id));
  return response.data;
};

/**
 * Get prescriptions for a patient
 * @param patientId - Patient ID
 * @returns Array of prescriptions for the patient
 */
export const getPrescriptionsByPatient = async (patientId: number): Promise<Prescription[]> => {
  const response = await api.get<Prescription[]>(endpoints.prescriptionsByPatient(patientId));
  return response.data;
};

/**
 * Get prescriptions written by a doctor
 * @param doctorId - Doctor ID
 * @returns Array of prescriptions by the doctor
 */
export const getPrescriptionsByDoctor = async (doctorId: number): Promise<Prescription[]> => {
  const response = await api.get<Prescription[]>(endpoints.prescriptionsByDoctor(doctorId));
  return response.data;
};

/**
 * Get prescription as PDF
 * @param id - Prescription ID
 * @returns PDF file as Blob
 */
export const getPrescriptionPdf = async (id: number): Promise<Blob> => {
  const response = await api.get<Blob>(endpoints.prescriptionPdf(id), {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Create a new prescription
 * @param prescription - Prescription data without ID
 * @returns Created prescription
 */
export const createPrescription = async (prescription: Omit<Prescription, 'id'>): Promise<Prescription> => {
  const formattedPrescription = {
    ...prescription,
    prescriptionDate: toISODateTimeString(new Date(prescription.prescriptionDate))
  };
  const response = await api.post<Prescription>(endpoints.prescriptions, formattedPrescription);
  return response.data;
};

/**
 * Update an existing prescription
 * @param id - Prescription ID
 * @param prescription - Updated prescription data
 */
export const updatePrescription = async (id: number, prescription: Prescription): Promise<void> => {
  const formattedPrescription = {
    ...prescription,
    prescriptionDate: toISODateTimeString(new Date(prescription.prescriptionDate))
  };
  try {
    console.log('Sending prescription update request for ID:', id);
    console.log('Update data:', formattedPrescription);
    const response = await api.put(endpoints.prescriptionById(id), formattedPrescription);
    console.log('Update response status:', response.status);
    console.log('Update response:', response.data);
  } catch (error) {
    console.error('Error in updatePrescription:', error);
  }
};

/**
 * Delete a prescription
 * @param id - Prescription ID
 */
export const deletePrescription = async (id: number): Promise<void> => {
  await api.delete(endpoints.prescriptionById(id));
}; 