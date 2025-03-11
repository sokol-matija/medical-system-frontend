import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormHelperText,
  Paper,
  Typography,
  Divider,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { Doctor } from '../../../types';

// List of common medical specializations
const SPECIALIZATIONS = [
  'General Practice',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Hematology',
  'Neurology',
  'Obstetrics and Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Urology'
];

interface DoctorFormProps {
  initialValues?: Doctor;
  onSubmit: (doctor: Doctor | Omit<Doctor, 'id'>) => Promise<void>;
  onCancel: () => void;
}

/**
 * DoctorForm component for creating or editing doctor information
 * @param initialValues - Optional initial values for editing an existing doctor
 * @param onSubmit - Function to handle form submission
 * @param onCancel - Function to handle cancellation
 */
const DoctorForm: React.FC<DoctorFormProps> = ({
  initialValues,
  onSubmit,
  onCancel
}) => {
  // Form state
  const [formData, setFormData] = useState<Omit<Doctor, 'id'> | Doctor>({
    firstName: '',
    lastName: '',
    specialization: '',
    ...(initialValues || {})
  });
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Update form data when initialValues change
  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    }
  }, [initialValues]);
  
  // Handle input changes for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error for this field when user makes changes
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };
  
  // Handle select changes specifically for Select components
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error for this field when user makes changes
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting doctor form:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {initialValues ? 'Edit Doctor' : 'Add New Doctor'}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!errors.firstName}
              helperText={errors.firstName}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!errors.lastName}
              helperText={errors.lastName}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.specialization}>
              <InputLabel id="specialization-label">Specialization</InputLabel>
              <Select
                labelId="specialization-label"
                name="specialization"
                value={formData.specialization}
                onChange={handleSelectChange}
                label="Specialization"
                disabled={isSubmitting}
              >
                {SPECIALIZATIONS.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {errors.specialization && (
                <FormHelperText>{errors.specialization}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {formData.specialization === 'Other' && (
            <Grid item xs={12}>
              <TextField
                name="specialization"
                label="Custom Specialization"
                value={formData.specialization === 'Other' ? '' : formData.specialization}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!errors.specialization}
                helperText={errors.specialization || 'Please specify the specialization'}
                disabled={isSubmitting}
              />
            </Grid>
          )}
        </Grid>
        
        {submitError && (
          <FormHelperText error sx={{ mt: 2 }}>
            {submitError}
          </FormHelperText>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{ mr: 1 }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (initialValues ? 'Update' : 'Save')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DoctorForm; 