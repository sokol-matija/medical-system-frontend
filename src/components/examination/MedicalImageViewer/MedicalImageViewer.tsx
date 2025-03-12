import { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { MedicalImage } from '../../../types';
import { getMedicalImageSecureUrl, downloadMedicalImage, deleteMedicalImage } from '../../../api/medicalImageApi';
import { formatDateTime } from '../../../utils/dateUtils';

/**
 * Props for the MedicalImageViewer component
 */
interface MedicalImageViewerProps {
  image: MedicalImage;
  onDelete?: (imageId: number) => void;
  onError?: (error: Error) => void;
}

/**
 * MedicalImageViewer component
 * Shows a medical image with options to view, download, and delete
 */
const MedicalImageViewer: React.FC<MedicalImageViewerProps> = ({
  image,
  onDelete,
  onError
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Fetch secure URL for viewing the image
   */
  const fetchImageUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = await getMedicalImageSecureUrl(image.id);
      setImageUrl(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load image';
      setError(errorMessage);
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle image download
   */
  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const blob = await downloadMedicalImage(image.id);
      
      // Create object URL
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = image.fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download image';
      setError(errorMessage);
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle image deletion
   */
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the image ${image.fileName}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await deleteMedicalImage(image.id);
      if (onDelete) {
        onDelete(image.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete image';
      setError(errorMessage);
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Open the image in a new tab
   */
  const openImageInNewTab = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    } else {
      fetchImageUrl().then(() => {
        if (imageUrl) {
          window.open(imageUrl, '_blank');
        }
      });
    }
  };
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          {image.fileName}
        </Typography>
        
        <Typography variant="body2" color="textSecondary">
          Uploaded: {formatDateTime(image.uploadDateTime)}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Type: {image.fileType || 'Unknown'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={openImageInNewTab}
            disabled={loading}
          >
            View
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={loading}
          >
            Download
          </Button>
          
          {onDelete && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          )}
          
          {loading && (
            <CircularProgress size={24} sx={{ ml: 1 }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MedicalImageViewer; 