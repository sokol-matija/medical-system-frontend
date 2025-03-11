import api from './apiClient';
import endpoints from './endpoints';
import { Doctor } from '../types';

/**
 * Get all doctors
 * @returns Array of doctors
 */
export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await api.get<Doctor[]>(endpoints.doctors);
  return response.data;
};

/**
 * Get doctor by ID
 * @param id - Doctor ID
 * @returns Doctor
 */
export const getDoctorById = async (id: number): Promise<Doctor> => {
  const response = await api.get<Doctor>(endpoints.doctorById(id));
  return response.data;
};

/**
 * Get doctor with details (examinations, prescriptions)
 * @param id - Doctor ID
 * @returns Doctor with related data
 */
export const getDoctorDetails = async (id: number): Promise<Doctor> => {
  const response = await api.get<Doctor>(endpoints.doctorDetails(id));
  return response.data;
};

/**
 * Get all doctors with their examinations
 * @returns Array of doctors with examination data
 */
export const getDoctorsWithExaminations = async (): Promise<Doctor[]> => {
  const response = await api.get<Doctor[]>(endpoints.doctorsWithExaminations);
  return response.data;
};

/**
 * Create a new doctor
 * @param doctor - Doctor data without ID
 * @returns Created doctor
 */
export const createDoctor = async (doctor: Omit<Doctor, 'id'>): Promise<Doctor> => {
  const response = await api.post<Doctor>(endpoints.doctors, doctor);
  return response.data;
};

/**
 * Update an existing doctor
 * @param id - Doctor ID
 * @param doctor - Updated doctor data
 */
export const updateDoctor = async (id: number, doctor: Doctor): Promise<void> => {
  await api.put(endpoints.doctorById(id), doctor);
};

/**
 * Delete a doctor
 * @param id - Doctor ID
 */
export const deleteDoctor = async (id: number): Promise<void> => {
  await api.delete(endpoints.doctorById(id));
}; 