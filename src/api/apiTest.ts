import axios from 'axios';

/**
 * This file is for testing API connectivity directly
 * It can be run in the browser console to debug API issues
 */

// Try different URL variations
const testAPIs = async () => {
  const baseUrls = [
    'http://localhost:5164',
    'http://localhost:5164/api',
    'https://localhost:5164',
    'https://localhost:5164/api'
  ];
  
  const endpoints = [
    '/doctors',
    '/patients',
    '/examinations',
    // Try without the leading slash
    'doctors',
    'patients',
    'examinations',
    // Try specific doctor ID
    '/doctors/1',
    'doctors/1',
    // Try with api in the path
    '/api/doctors',
    '/api/patients'
  ];
  
  console.log('===== API CONNECTIVITY TEST =====');
  
  for (const baseUrl of baseUrls) {
    console.log(`\nTesting base URL: ${baseUrl}`);
    
    for (const endpoint of endpoints) {
      const url = `${baseUrl}${endpoint}`;
      try {
        console.log(`Trying ${url}...`);
        const response = await axios.get(url);
        console.log(`✅ SUCCESS: ${url}`);
        console.log(`Status: ${response.status}`);
        console.log(`Data sample:`, response.data.slice ? response.data.slice(0, 1) : response.data);
        
        // If we found a working URL, try one more test with authorization header
        if (response.status === 200) {
          console.log(`Found working URL: ${url} - Your API endpoint structure should match this pattern`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(`❌ ERROR: ${url}`);
          if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`Message: ${error.message}`);
          } else {
            console.log(`Network error: ${error.message}`);
          }
        } else {
          console.log(`❌ ERROR: ${url}`);
          console.log(`Unknown error:`, error);
        }
      }
    }
  }
};

// Export the test function so it can be called from the browser console
export { testAPIs };

// Automatically run the test if this file is imported directly
if (import.meta.url.includes('apiTest')) {
  testAPIs();
} 