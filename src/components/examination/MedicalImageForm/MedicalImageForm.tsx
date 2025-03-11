import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import api from '../../../api/apiClient';
import endpoints from '../../../api/endpoints';
import { MedicalImage } from '../../../types';

// Styled component for file input
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

/**
 * Props for the MedicalImageForm component
 */
interface MedicalImageFormProps {
  examinationId: number;
  onSuccess?: (image: MedicalImage) => void;
  onError?: (error: Error) => void;
}

/**
 * MedicalImageForm component
 * Allows uploading medical images for an examination
 */
const MedicalImageForm: React.FC<MedicalImageFormProps> = ({
  examinationId,
  onSuccess,
  onError
}) => {
  // State for selected file and upload progress
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  /**
   * Handle file selection
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
      setSuccess(false);
    }
  };
  
  /**
   * Handle file upload
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    
    // Allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'application/dicom'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('File type not supported. Please upload JPEG, PNG, or DICOM files.');
      return;
    }
    
    // File size limit (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum allowed size is 10MB.');
      return;
    }
    
    try {
      setUploading(true);
      setProgress(0);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Upload the file with progress tracking
      const response = await api.post<MedicalImage>(
        endpoints.uploadMedicalImage(examinationId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percentCompleted);
            }
          },
        }
      );
      
      setSuccess(true);
      setSelectedFile(null);
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload Medical Image
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Image uploaded successfully!
          </Alert>
        )}
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
              fullWidth
            >
              Select File
              <VisuallyHiddenInput 
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.dcm"
              />
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              fullWidth
            >
              Upload
            </Button>
          </Grid>
        </Grid>
        
        {selectedFile && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
          </Box>
        )}
        
        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              {progress}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicalImageForm; 