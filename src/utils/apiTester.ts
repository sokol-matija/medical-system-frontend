import api from '../api/apiClient';
import endpoints from '../api/endpoints';
import axios from 'axios';

/**
 * Utility to test API connectivity
 * Can be called from the browser console to diagnose issues
 */
export const testApiConnectivity = async () => {
  console.log('=== API CONNECTIVITY TEST ===');
  console.log('API Base URL:', import.meta.env.VITE_API_URL);
  
  // Test endpoints
  const testEndpoints = [
    { name: 'Doctors List', url: endpoints.doctors },
    { name: 'Patients List', url: endpoints.patients },
    { name: 'Doctor by ID', url: endpoints.doctorById(1) },
    { name: 'Patient by ID', url: endpoints.patientById(1) }
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing ${endpoint.name} (${endpoint.url})...`);
      const response = await api.get(endpoint.url);
      console.log('✅ Success:', response.status, response.statusText);
      console.log('Data sample:', response.data);
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
  
  console.log('=== TEST COMPLETE ===');
};

/**
 * Test a specific update operation
 * @param type - The entity type (patient, doctor, etc.)
 * @param id - The entity ID
 */
export const testUpdate = async (type: 'patient' | 'doctor', id: number) => {
  console.log(`=== TESTING ${type.toUpperCase()} UPDATE ===`);
  
  try {
    // First, get the current data
    console.log(`Fetching current ${type} data...`);
    const response = await api.get(
      type === 'patient' ? endpoints.patientById(id) : endpoints.doctorById(id)
    );
    
    const entity = response.data;
    console.log(`Current data:`, entity);
    
    // Create a minimal update payload
    const minimalUpdate = {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName + " (updated)"
    };
    
    console.log(`Sending minimal update:`, minimalUpdate);
    
    // Send the update
    const updateResponse = await api.put(
      type === 'patient' ? endpoints.patientById(id) : endpoints.doctorById(id),
      minimalUpdate
    );
    
    console.log(`Update successful:`, updateResponse.status, updateResponse.statusText);
  } catch (error) {
    console.error('Update failed:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
  
  console.log('=== TEST COMPLETE ===');
};

/**
 * Tests the patient update API endpoint with detailed logging.
 * Use this function to debug API issues with updating patients.
 * 
 * @param patientId - The ID of the patient to update
 * @param patientData - The patient data to send
 */
export const testPatientUpdate = async (patientId: number, patientData: any): Promise<void> => {
  console.log('Testing patient update with data:', patientData);
  
  try {
    // Log the exact request that will be made
    console.log(`Request URL: ${endpoints.patientById(patientId)}`);
    console.log('Request payload:', JSON.stringify(patientData, null, 2));
    
    // Attempt the update
    const result = await api.put(endpoints.patientById(patientId), patientData);
    console.log('Update successful:', result.data);
  } catch (error) {
    console.error('Update failed with error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request data sent:', error.config?.data);
    }
  }
};

// Make it available in the browser console
(window as unknown as Record<string, unknown>).testApiConnectivity = testApiConnectivity;
(window as unknown as Record<string, unknown>).testUpdate = testUpdate;
(window as unknown as Record<string, unknown>).testPatientUpdate = testPatientUpdate; 