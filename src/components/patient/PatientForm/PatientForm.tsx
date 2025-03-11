import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Grid, 
  Alert 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parse, format } from 'date-fns';
import { Patient } from '../../../types';

/**
 * Props for the PatientForm component
 */
interface PatientFormProps {
  initialValues?: Patient;
  onSubmit: (patient: Omit<Patient, 'id'> | Patient) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Patient form component for adding or editing patients
 * Handles form validation and submission
 */
const PatientForm: React.FC<PatientFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  // Initialize form state with initialValues or defaults
  const [formData, setFormData] = useState<Omit<Patient, 'id'> | Patient>({
    id: initialValues?.id || 0,
    firstName: initialValues?.firstName || '',
    lastName: initialValues?.lastName || '',
    personalIdNumber: initialValues?.personalIdNumber || '',
    dateOfBirth: initialValues?.dateOfBirth || '',
    gender: initialValues?.gender || 'M'
  });
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Form submission error
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  /**
   * Handles form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name}, value: ${value}`);
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      console.log('Updated form data:', updated);
      return updated;
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  /**
   * Handles date of birth change
   */
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ 
        ...prev, 
        dateOfBirth: format(date, 'yyyy-MM-dd') 
      }));
      
      // Clear error for dateOfBirth if it exists
      if (errors.dateOfBirth) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.dateOfBirth;
          return newErrors;
        });
      }
    }
  };
  
  /**
   * Validates the form
   * @returns True if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate OIB (Croatian personal ID)
    if (!formData.personalIdNumber.trim()) {
      newErrors.personalIdNumber = 'Personal ID number is required';
    } else if (!/^\d{11}$/.test(formData.personalIdNumber)) {
      newErrors.personalIdNumber = 'Personal ID number must be exactly 11 digits';
    }
    
    // Validate date of birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      // Check if date is in the future
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time part for comparison
      
      if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    
    setErrors(newErrors);
    console.log("Form validation result:", Object.keys(newErrors).length === 0 ? "Valid" : "Invalid", newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");
    setSubmitError(null);
    
    if (validateForm()) {
      console.log("Form is valid, submitting to parent component:", formData);
      try {
        await onSubmit(formData);
        console.log("Form submission completed successfully");
      } catch (error) {
        console.error("Form submission error:", error);
        setSubmitError(error instanceof Error ? error.message : 'An error occurred saving the patient');
      }
    } else {
      console.log("Form validation failed, not submitting");
    }
  };
  
  // Parse the dateOfBirth string to a Date object for the DatePicker
  const dobDate = formData.dateOfBirth 
    ? parse(formData.dateOfBirth, 'yyyy-MM-dd', new Date()) 
    : null;
    
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            disabled={isLoading}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            disabled={isLoading}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Personal ID Number (OIB)"
            name="personalIdNumber"
            value={formData.personalIdNumber}
            onChange={handleChange}
            error={!!errors.personalIdNumber}
            helperText={errors.personalIdNumber || 'Must be exactly 11 digits'}
            disabled={isLoading}
            required
            inputProps={{ maxLength: 11 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date of Birth"
              value={dobDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.dateOfBirth,
                  helperText: errors.dateOfBirth,
                  required: true,
                  disabled: isLoading
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset" error={!!errors.gender}>
            <FormLabel component="legend">Gender</FormLabel>
            <RadioGroup
              row
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <FormControlLabel 
                value="M" 
                control={<Radio disabled={isLoading} />} 
                label="Male" 
              />
              <FormControlLabel 
                value="F" 
                control={<Radio disabled={isLoading} />} 
                label="Female" 
              />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : initialValues ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Box>
  );
};

export default PatientForm; 