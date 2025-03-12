import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  CircularProgress, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { MedicalImage } from '../../../types';
import { getMedicalImages } from '../../../api/medicalImageApi';
import MedicalImageViewer from '../MedicalImageViewer/MedicalImageViewer';
import MedicalImageForm from '../MedicalImageForm/MedicalImageForm';

/**
 * Props for the MedicalImagesGallery component
 */
interface MedicalImagesGalleryProps {
  examinationId: number;
}

/**
 * MedicalImagesGallery component
 * Displays all medical images for an examination with upload functionality
 */
const MedicalImagesGallery: React.FC<MedicalImagesGalleryProps> = ({
  examinationId
}) => {
  const [images, setImages] = useState<MedicalImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  /**
   * Fetch all medical images for the examination
   */
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedImages = await getMedicalImages(examinationId);
      setImages(fetchedImages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load images';
      setError(errorMessage);
      console.error('Error fetching medical images:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch images on component mount and when examinationId changes
  useEffect(() => {
    fetchImages();
  }, [examinationId]);
  
  /**
   * Handle successful image upload
   */
  const handleImageUploadSuccess = (newImage: MedicalImage) => {
    setImages([...images, newImage]);
    setUploadDialogOpen(false);
  };
  
  /**
   * Handle image deletion
   */
  const handleImageDelete = (imageId: number) => {
    setImages(images.filter(img => img.id !== imageId));
  };
  
  /**
   * Handle image upload error
   */
  const handleImageError = (error: Error) => {
    console.error('Image error:', error);
  };
  
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && !images.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {images.length > 0 ? (
            <Grid container spacing={2}>
              {images.map(image => (
                <Grid item xs={12} sm={6} md={4} key={image.id}>
                  <MedicalImageViewer 
                    image={image} 
                    onDelete={handleImageDelete}
                    onError={handleImageError}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ mb: 2 }}>
              No medical images available for this examination.
            </Typography>
          )}
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ mt: 2 }}
          >
            Upload Medical Image
          </Button>
          
          <Dialog 
            open={uploadDialogOpen} 
            onClose={() => setUploadDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Upload Medical Image</DialogTitle>
            <DialogContent>
              <MedicalImageForm 
                examinationId={examinationId} 
                onSuccess={handleImageUploadSuccess}
                onError={handleImageError}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default MedicalImagesGallery; 