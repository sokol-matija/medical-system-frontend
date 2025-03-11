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
  return examinationTypeMap[typeNumber] || 'Unknown';
};

// Get a human-readable description for an examination type
export const getExaminationTypeDescription = (typeNumber: number): string => {
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
  return typeName ? typeNames[typeName] : 'Unknown Examination Type';
}; 