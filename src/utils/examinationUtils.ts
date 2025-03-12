/**
 * Examination type mapping utilities
 */

// Map for examination type numbers to string values
const examinationTypeMap: { [key: number]: string } = {
  0: 'GP', // General Practitioner
  1: 'KRV', // Blood Test
  2: 'XRAY', // X-Ray
  3: 'CT', // Computed Tomography
  4: 'MR', // Magnetic Resonance
  5: 'ULTRA', // Ultrasound
  6: 'EKG', // Electrocardiogram
  7: 'ECHO', // Echocardiogram
  8: 'EYE', // Eye Examination
  9: 'DERM', // Dermatology
  10: 'DENTA', // Dental
  11: 'MAMMO', // Mammography
  12: 'NEURO' // Neurology
};

// Function to get examination type name from number
export const getExaminationTypeName = (typeNumber: number): string => {
  console.log('getExaminationTypeName called with:', typeNumber, 'type:', typeof typeNumber);
  
  // Handle string values being passed instead of numbers
  if (typeof typeNumber === 'string') {
    console.log('Converting string type to number:', typeNumber);
    typeNumber = parseInt(typeNumber as unknown as string, 10);
  }
  
  const typeName = examinationTypeMap[typeNumber] || 'Unknown';
  console.log('Mapped to type name:', typeName);
  return typeName;
};

// Get a human-readable description for an examination type
export const getExaminationTypeDescription = (typeNumber: number): string => {
  console.log('getExaminationTypeDescription called with:', typeNumber);
  
  // Handle string values being passed instead of numbers
  if (typeof typeNumber === 'string') {
    typeNumber = parseInt(typeNumber as unknown as string, 10);
  }
  
  const typeNames: { [key: string]: string } = {
    'GP': 'General Practitioner',
    'KRV': 'Blood Test',
    'XRAY': 'X-Ray',
    'CT': 'Computed Tomography',
    'MR': 'Magnetic Resonance',
    'ULTRA': 'Ultrasound',
    'EKG': 'Electrocardiogram',
    'ECHO': 'Echocardiogram',
    'EYE': 'Eye Examination',
    'DERM': 'Dermatology',
    'DENTA': 'Dental',
    'MAMMO': 'Mammography',
    'NEURO': 'Neurology'
  };
  
  const typeName = examinationTypeMap[typeNumber];
  const description = typeName ? typeNames[typeName] : 'Unknown Examination Type';
  console.log('Type description:', description);
  return description;
}; 