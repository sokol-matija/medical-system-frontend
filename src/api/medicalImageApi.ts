import api from './apiClient';
import endpoints from './endpoints';
import { MedicalImage } from '../types';

/**
 * Get all medical images for an examination
 * @param examinationId - Examination ID
 * @returns Array of medical images
 */
export const getMedicalImages = async (examinationId: number): Promise<MedicalImage[]> => {
  const response = await api.get<MedicalImage[]>(endpoints.medicalImagesByExamination(examinationId));
  return response.data;
};

/**
 * Get medical image by ID
 * @param id - Medical image ID
 * @returns Medical image
 */
export const getMedicalImageById = async (id: number): Promise<MedicalImage> => {
  const response = await api.get<MedicalImage>(endpoints.medicalImageById(id));
  return response.data;
};

/**
 * Upload a medical image for an examination
 * @param examinationId - Examination ID
 * @param file - File to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Uploaded medical image
 */
export const uploadMedicalImage = async (
  examinationId: number, 
  file: File,
  onProgress?: (progress: number) => void
): Promise<MedicalImage> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<MedicalImage>(
    endpoints.uploadMedicalImage(examinationId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    }
  );
  
  return response.data;
};

/**
 * Get a secure URL for a medical image with SAS token
 * @param id - Medical image ID
 * @returns Secure URL string
 */
export const getMedicalImageSecureUrl = async (id: number): Promise<string> => {
  const response = await api.get<{ url: string }>(endpoints.medicalImageSecureUrl(id));
  return response.data.url;
};

/**
 * Download a medical image directly
 * @param id - Medical image ID
 * @returns Blob of the image file
 */
export const downloadMedicalImage = async (id: number): Promise<Blob> => {
  const response = await api.get(`${endpoints.medicalImageById(id)}/download`, {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Delete a medical image
 * @param id - Medical image ID
 */
export const deleteMedicalImage = async (id: number): Promise<void> => {
  await api.delete(endpoints.medicalImageById(id));
}; 