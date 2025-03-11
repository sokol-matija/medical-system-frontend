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
  FormHelperText
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useEffect, useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { getPatients } from '../../../api/patientApi';
import { getDoctors } from '../../../api/doctorApi';
import { createExamination, updateExamination } from '../../../api/examinationApi';
import { Patient, Doctor, Examination, ExaminationType } from '../../../types';

// Define props interface for the form component
interface ExaminationFormProps {
  examination?: Examination;
  onCancel: () => void;
  onSubmit: (examination: Examination | Omit<Examination, 'id'>) => void;
  isSubmitting?: boolean;
}

/**
 * ExaminationForm component
 * Form for creating and editing examinations
 */
const ExaminationForm: React.FC<ExaminationFormProps> = ({
  examination,
  onCancel,
  onSubmit,
  isSubmitting = false
}) => {
  // Track local submission state to prevent duplicate submissions
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  // Combined submission state (either from props or local state)
  const isFormSubmitting = isSubmitting || isSubmittingLocal;
  
  // API hooks for fetching related data
  const { data: patients, loading: loadingPatients, execute: fetchPatients } = useApi<Patient[], []>(getPatients);
  const { data: doctors, loading: loadingDoctors, execute: fetchDoctors } = useApi<Doctor[], []>(getDoctors);
  const { execute: executeCreate } = useApi<Examination, [Omit<Examination, 'id'>]>(createExamination);
  const { execute: executeUpdate } = useApi<void, [number, Examination]>(updateExamination);
  
  // Fetch patients and doctors data when component mounts
  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, [fetchPatients, fetchDoctors]);
  
  // Setup formik for form state management and validation
  const formik = useFormik({
    initialValues: {
      patientId: examination?.patientId || 0,
      doctorId: examination?.doctorId || 0,
      type: examination?.type ? Number(examination.type) : 1,
      examinationDateTime: examination?.examinationDateTime || new Date().toISOString(),
      notes: examination?.notes || ''
    },
    validationSchema: Yup.object({
      patientId: Yup.number()
        .min(1, 'Please select a patient')
        .required('Patient is required'),
      doctorId: Yup.number()
        .min(1, 'Please select a doctor')
        .required('Doctor is required'),
      type: Yup.number()
        .required('Examination type is required'),
      examinationDateTime: Yup.date()
        .required('Examination date and time is required'),
      notes: Yup.string()
        .required('Notes are required')
        .max(1000, 'Notes cannot exceed 1000 characters')
    }),
    onSubmit: async (values) => {
      // Prevent duplicate submissions
      if (isFormSubmitting) return;
      
      setIsSubmittingLocal(true);
      
      console.log('Form values before submission:', values);
      
      // Use values directly, with type already as a number
      const formattedValues = {
        ...values,
        // Convert type back to the ExaminationType for TypeScript compatibility
        type: values.type.toString() as unknown as ExaminationType,
        examinationDateTime: values.examinationDateTime
      };
      
      console.log('Formatted values for submission:', formattedValues);

      try {
        // If editing existing examination, update; otherwise create new
        if (examination?.id) {
          await executeUpdate(examination.id, {
            ...formattedValues,
            id: examination.id
          });
          onSubmit({
            ...formattedValues,
            id: examination.id
          });
        } else {
          // Create new examination - only call executeCreate and pass the result to onSubmit
          const newExamination = await executeCreate(formattedValues);
          if (newExamination) {
            // Pass the newly created examination to onSubmit callback 
            // instead of calling API again through parent component
            onSubmit(newExamination);
          }
        }
      } catch (error) {
        console.error('Error creating/updating examination:', error);
      } finally {
        setIsSubmittingLocal(false);
      }
    }
  });

  // Handle date-time change from DateTimePicker
  const handleDateTimeChange = (value: Date | null) => {
    if (value) {
      formik.setFieldValue('examinationDateTime', value.toISOString());
    }
  };
  
  // Create simplified examination type options as direct numbers
  const examinationTypeOptions = [
    { value: 1, label: 'GP (General Practitioner)' },
    { value: 2, label: 'KRV (Blood Test)' },
    { value: 3, label: 'XRAY (X-Ray)' },
    { value: 4, label: 'CT (Computed Tomography)' },
    { value: 5, label: 'MR (Magnetic Resonance)' },
    { value: 6, label: 'ULTRA (Ultrasound)' },
    { value: 7, label: 'EKG (Electrocardiogram)' },
    { value: 8, label: 'ECHO (Echocardiogram)' },
    { value: 9, label: 'EYE (Eye Examination)' },
    { value: 10, label: 'DERM (Dermatology)' },
    { value: 11, label: 'DENTA (Dental)' },
    { value: 12, label: 'MAMMO (Mammography)' },
    { value: 13, label: 'NEURO (Neurology)' }
  ];
   
  console.log('Examination type options:', examinationTypeOptions);
  console.log('Current selected type:', formik.values.type);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {examination ? 'Edit Examination' : 'New Examination'}
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Patient selection */}
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              error={Boolean(formik.touched.patientId && formik.errors.patientId)}
              disabled={loadingPatients || isFormSubmitting}
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
              disabled={loadingDoctors || isFormSubmitting}
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
          
          {/* Examination Type */}
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              error={Boolean(formik.touched.type && formik.errors.type)}
              disabled={isFormSubmitting}
            >
              <InputLabel id="type-select-label">Examination Type</InputLabel>
              <Select
                labelId="type-select-label"
                id="type"
                name="type"
                value={formik.values.type}
                onChange={(e) => {
                  console.log('Selected examination type:', e.target.value);
                  formik.setFieldValue('type', Number(e.target.value));
                }}
                onBlur={formik.handleBlur}
                label="Examination Type"
              >
                {examinationTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.type && formik.errors.type && (
                <FormHelperText>{formik.errors.type}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Examination Date and Time */}
          <Grid item xs={12} sm={6}>
            <DateTimePicker
              label="Examination Date and Time"
              value={formik.values.examinationDateTime ? new Date(formik.values.examinationDateTime) : null}
              onChange={handleDateTimeChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(formik.touched.examinationDateTime && formik.errors.examinationDateTime),
                  helperText: formik.touched.examinationDateTime && formik.errors.examinationDateTime ? 
                    String(formik.errors.examinationDateTime) : ''
                }
              }}
            />
          </Grid>
          
          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              id="notes"
              name="notes"
              label="Notes"
              multiline
              rows={4}
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.notes && formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes ? formik.errors.notes : ''}
              fullWidth
              placeholder="Detailed notes about the examination"
              disabled={isFormSubmitting}
            />
          </Grid>
          
          {/* Form actions */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isFormSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isFormSubmitting || !(formik.isValid && formik.dirty)}
                startIcon={isFormSubmitting ? <CircularProgress size={20} /> : null}
              >
                {examination ? 'Update' : 'Create'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ExaminationForm;
