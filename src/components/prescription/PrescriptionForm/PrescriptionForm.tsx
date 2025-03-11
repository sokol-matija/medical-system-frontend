import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, 
  Button, 
  Grid, 
  TextField, 
  Paper, 
  Typography, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEffect } from 'react';
import { useApi } from '../../../hooks/useApi';
import { getPatients } from '../../../api/patientApi';
import { getDoctors } from '../../../api/doctorApi';
import { getExaminations } from '../../../api/examinationApi';
import { createPrescription } from '../../../api/prescriptionApi';
import { Patient, Doctor, Examination, Prescription } from '../../../types';

// Define props interface for the form component
interface PrescriptionFormProps {
  prescription?: Prescription;
  onCancel: () => void;
  onSubmit: (prescription: Prescription | Omit<Prescription, 'id'>) => void;
  isSubmitting?: boolean;
  examinationId?: number; // Optional examination ID if creating from an examination
}

/**
 * PrescriptionForm component
 * Form for creating and editing prescriptions
 */
const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  prescription,
  onCancel,
  onSubmit,
  isSubmitting = false,
  examinationId
}) => {
  // API hooks for fetching related data
  const { data: patients, loading: loadingPatients, execute: fetchPatients } = useApi<Patient[], []>(getPatients);
  const { data: doctors, loading: loadingDoctors, execute: fetchDoctors } = useApi<Doctor[], []>(getDoctors);
  const { data: examinations, loading: loadingExaminations, execute: fetchExaminations } = useApi<Examination[], []>(getExaminations);
  const { execute: executeCreate } = useApi<Prescription, [Omit<Prescription, 'id'>]>(createPrescription);
  
  // Fetch patients, doctors, and examinations data when component mounts
  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchExaminations();
  }, [fetchPatients, fetchDoctors, fetchExaminations]);
  
  // Setup formik for form state management and validation
  const formik = useFormik({
    initialValues: {
      patientId: prescription?.patientId || examinationId ? (examinations?.find(e => e.id === examinationId)?.patientId || 0) : 0,
      doctorId: prescription?.doctorId || examinationId ? (examinations?.find(e => e.id === examinationId)?.doctorId || 0) : 0,
      examinationId: prescription?.examinationId || examinationId || 0,
      medication: prescription?.medication || '',
      dosage: prescription?.dosage || '',
      instructions: prescription?.instructions || '',
      prescriptionDate: prescription?.prescriptionDate || new Date().toISOString().split('T')[0]
    },
    validationSchema: Yup.object({
      patientId: Yup.number()
        .min(1, 'Please select a patient')
        .required('Patient is required'),
      doctorId: Yup.number()
        .min(1, 'Please select a doctor')
        .required('Doctor is required'),
      medication: Yup.string()
        .required('Medication name is required')
        .max(100, 'Medication name cannot exceed 100 characters'),
      dosage: Yup.string()
        .required('Dosage is required')
        .max(100, 'Dosage cannot exceed 100 characters'),
      instructions: Yup.string()
        .required('Instructions are required')
        .max(1000, 'Instructions cannot exceed 1000 characters'),
      prescriptionDate: Yup.date()
        .required('Prescription date is required')
        .max(new Date(), 'Prescription date cannot be in the future')
    }),
    onSubmit: async (values) => {
      // If editing existing prescription, update; otherwise create new
      if (prescription?.id) {
        onSubmit({
          ...values,
          id: prescription.id
        });
      } else {
        try {
          // Create new prescription
          const prescriptionData = {
            ...values,
            // Make sure examinationId is always set, defaulting to 0 if not provided
            examinationId: values.examinationId || 0
          };
            
          // Make the API call with the prepared data
          const newPrescription = await executeCreate(prescriptionData);
          if (newPrescription) {
            onSubmit(newPrescription);
          }
        } catch (error) {
          console.error('Error creating prescription:', error);
        }
      }
    }
  });

  // Handle date change from DatePicker
  const handleDateChange = (value: Date | null) => {
    if (value) {
      formik.setFieldValue('prescriptionDate', value.toISOString().split('T')[0]);
    }
  };
  
  // Handle examination selection (auto-populate patient and doctor)
  const handleExaminationChange = (event: SelectChangeEvent<number>) => {
    const selectedExaminationId = event.target.value as number;
    formik.setFieldValue('examinationId', selectedExaminationId);
    
    if (selectedExaminationId > 0 && examinations) {
      const selectedExamination = examinations.find(e => e.id === selectedExaminationId);
      if (selectedExamination) {
        formik.setFieldValue('patientId', selectedExamination.patientId);
        formik.setFieldValue('doctorId', selectedExamination.doctorId);
      }
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {prescription ? 'Edit Prescription' : 'New Prescription'}
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Examination selection (optional) */}
          <Grid item xs={12}>
            <FormControl 
              fullWidth 
              disabled={!!prescription || loadingExaminations}
            >
              <InputLabel id="examination-select-label">Related Examination (Optional)</InputLabel>
              <Select
                labelId="examination-select-label"
                id="examinationId"
                name="examinationId"
                value={formik.values.examinationId}
                onChange={handleExaminationChange}
                label="Related Examination (Optional)"
              >
                <MenuItem value={0}>
                  <em>No related examination</em>
                </MenuItem>
                {examinations && examinations.map((examination) => (
                  <MenuItem key={examination.id} value={examination.id}>
                    {`${examination.type} - ${new Date(examination.examinationDateTime).toLocaleDateString()}`}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Selecting an examination will auto-fill patient and doctor</FormHelperText>
            </FormControl>
          </Grid>
          
          {/* Patient selection */}
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              error={Boolean(formik.touched.patientId && formik.errors.patientId)}
              disabled={loadingPatients}
            >
              <InputLabel id="patient-select-label">Patient</InputLabel>
              <Select
                labelId="patient-select-label"
                id="patientId"
                name="patientId"
                value={formik.values.patientId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Patient"
              >
                <MenuItem value={0}>
                  <em>Select a patient</em>
                </MenuItem>
                {patients && patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {`${patient.firstName} ${patient.lastName} (${patient.personalIdNumber})`}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.patientId && formik.errors.patientId && (
                <FormHelperText>{formik.errors.patientId}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Doctor selection */}
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              error={Boolean(formik.touched.doctorId && formik.errors.doctorId)}
              disabled={loadingDoctors}
            >
              <InputLabel id="doctor-select-label">Doctor</InputLabel>
              <Select
                labelId="doctor-select-label"
                id="doctorId"
                name="doctorId"
                value={formik.values.doctorId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Doctor"
              >
                <MenuItem value={0}>
                  <em>Select a doctor</em>
                </MenuItem>
                {doctors && doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {`${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.doctorId && formik.errors.doctorId && (
                <FormHelperText>{formik.errors.doctorId}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Medication name */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="medication"
              name="medication"
              label="Medication"
              value={formik.values.medication}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.medication && formik.errors.medication)}
              helperText={formik.touched.medication && formik.errors.medication ? formik.errors.medication : ''}
              fullWidth
            />
          </Grid>
          
          {/* Dosage */}
          <Grid item xs={12} sm={6}>
            <TextField
              id="dosage"
              name="dosage"
              label="Dosage"
              value={formik.values.dosage}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.dosage && formik.errors.dosage)}
              helperText={formik.touched.dosage && formik.errors.dosage ? formik.errors.dosage : ''}
              fullWidth
              placeholder="e.g., 1 tablet twice daily"
            />
          </Grid>
          
          {/* Prescription date */}
          <Grid item xs={12}>
            <DatePicker
              label="Prescription Date"
              value={formik.values.prescriptionDate ? new Date(formik.values.prescriptionDate) : null}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(formik.touched.prescriptionDate && formik.errors.prescriptionDate),
                  helperText: formik.touched.prescriptionDate && formik.errors.prescriptionDate ? 
                    String(formik.errors.prescriptionDate) : ''
                }
              }}
            />
          </Grid>
          
          {/* Instructions */}
          <Grid item xs={12}>
            <TextField
              id="instructions"
              name="instructions"
              label="Instructions"
              multiline
              rows={4}
              value={formik.values.instructions}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.instructions && formik.errors.instructions)}
              helperText={formik.touched.instructions && formik.errors.instructions ? formik.errors.instructions : ''}
              fullWidth
              placeholder="Detailed instructions for taking this medication"
            />
          </Grid>
          
          {/* Form actions */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !(formik.isValid && formik.dirty)}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {prescription ? 'Update' : 'Create'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default PrescriptionForm; 