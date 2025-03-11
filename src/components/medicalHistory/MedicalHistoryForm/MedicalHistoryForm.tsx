import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApi } from '../../../hooks/useApi';
import { getPatients } from '../../../api/patientApi';
import { createMedicalHistory } from '../../../api/medicalHistoryApi';
import { Patient, MedicalHistory } from '../../../types';

// Define props interface for the form component
interface MedicalHistoryFormProps {
  medicalHistory?: MedicalHistory;
  onCancel: () => void;
  onSubmit: (medicalHistory: MedicalHistory | Omit<MedicalHistory, 'id'>) => void;
  isSubmitting?: boolean;
}

/**
 * MedicalHistoryForm component
 * Form for creating and editing medical history records
 */
const MedicalHistoryForm: React.FC<MedicalHistoryFormProps> = ({
  medicalHistory,
  onCancel,
  onSubmit,
  isSubmitting = false
}) => {
  // API hooks for fetching patients
  const { data: patients, loading: loadingPatients } = useApi<Patient[], []>(getPatients);
  const { execute: executeCreate } = useApi<MedicalHistory, [Omit<MedicalHistory, 'id'>]>(createMedicalHistory);
  
  // Setup formik for form state management and validation
  const formik = useFormik({
    initialValues: {
      patientId: medicalHistory?.patientId || 0,
      diseaseName: medicalHistory?.diseaseName || '',
      startDate: medicalHistory?.startDate || new Date().toISOString().split('T')[0],
      endDate: medicalHistory?.endDate || '',
      isOngoing: !medicalHistory?.endDate
    },
    validationSchema: Yup.object({
      patientId: Yup.number()
        .min(1, 'Please select a patient')
        .required('Patient is required'),
      diseaseName: Yup.string()
        .required('Disease or condition name is required')
        .max(100, 'Disease name cannot exceed 100 characters'),
      startDate: Yup.date()
        .required('Start date is required')
        .max(new Date(), 'Start date cannot be in the future'),
      endDate: Yup.date()
        .nullable()
        .test('is-after-start', 'End date must be after start date', function(value) {
          const { startDate, isOngoing } = this.parent;
          if (isOngoing || !value) return true;
          return new Date(value) > new Date(startDate);
        })
        .test('is-required-if-not-ongoing', 'End date is required when not ongoing', function(value) {
          const { isOngoing } = this.parent;
          if (isOngoing) return true;
          return !!value;
        })
        .test('is-not-future', 'End date cannot be in the future', function(value) {
          if (!value) return true;
          return new Date(value) <= new Date();
        })
    }),
    onSubmit: async (values) => {
      // Prepare data for submission
      const submitData = {
        patientId: values.patientId,
        diseaseName: values.diseaseName,
        startDate: values.startDate,
        endDate: values.isOngoing ? undefined : values.endDate
      };
      
      // If editing existing medical history, update; otherwise create new
      if (medicalHistory?.id) {
        onSubmit({
          ...submitData,
          id: medicalHistory.id
        });
      } else {
        try {
          // Create new medical history
          const newMedicalHistory = await executeCreate(submitData);
          if (newMedicalHistory) {
            onSubmit(newMedicalHistory);
          }
        } catch (error) {
          console.error('Error creating medical history:', error);
        }
      }
    }
  });

  // Handle date change from DatePicker for start date
  const handleStartDateChange = (value: Date | null) => {
    if (value) {
      formik.setFieldValue('startDate', value.toISOString().split('T')[0]);
    }
  };
  
  // Handle date change from DatePicker for end date
  const handleEndDateChange = (value: Date | null) => {
    if (value) {
      formik.setFieldValue('endDate', value.toISOString().split('T')[0]);
    } else {
      formik.setFieldValue('endDate', '');
    }
  };
  
  // Handle ongoing checkbox change
  const handleOngoingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isOngoing = event.target.checked;
    formik.setFieldValue('isOngoing', isOngoing);
    if (isOngoing) {
      formik.setFieldValue('endDate', '');
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {medicalHistory ? 'Edit Medical History' : 'New Medical History'}
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Patient selection */}
          <Grid item xs={12}>
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
          
          {/* Disease name */}
          <Grid item xs={12}>
            <TextField
              id="diseaseName"
              name="diseaseName"
              label="Disease or Condition"
              value={formik.values.diseaseName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.diseaseName && formik.errors.diseaseName)}
              helperText={formik.touched.diseaseName && formik.errors.diseaseName ? formik.errors.diseaseName : ''}
              fullWidth
            />
          </Grid>
          
          {/* Start date */}
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Start Date"
              value={formik.values.startDate ? new Date(formik.values.startDate) : null}
              onChange={handleStartDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(formik.touched.startDate && formik.errors.startDate),
                  helperText: formik.touched.startDate && formik.errors.startDate ? 
                    String(formik.errors.startDate) : ''
                }
              }}
            />
          </Grid>
          
          {/* Ongoing checkbox */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.isOngoing}
                  onChange={handleOngoingChange}
                  name="isOngoing"
                />
              }
              label="This is an ongoing condition"
            />
          </Grid>
          
          {/* End date - only show if not ongoing */}
          {!formik.values.isOngoing && (
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={formik.values.endDate ? new Date(formik.values.endDate) : null}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(formik.touched.endDate && formik.errors.endDate),
                    helperText: formik.touched.endDate && formik.errors.endDate ? 
                      String(formik.errors.endDate) : ''
                  }
                }}
              />
            </Grid>
          )}
          
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
                {medicalHistory ? 'Update' : 'Create'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default MedicalHistoryForm; 