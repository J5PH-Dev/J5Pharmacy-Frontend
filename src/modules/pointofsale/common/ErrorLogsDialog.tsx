import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ErrorIcon from '@mui/icons-material/Error';
import { format } from 'date-fns';

export interface ErrorLog {
  id: string;
  timestamp: string;
  error: string;
  details: string;
  component?: string;
  action?: string;
}

interface ErrorLogsDialogProps {
  open: boolean;
  onClose: () => void;
  errors: ErrorLog[];
  onClearAll?: () => void;
  onDeleteError?: (id: string) => void;
}

const ErrorLogsDialog: React.FC<ErrorLogsDialogProps> = ({
  open,
  onClose,
  errors,
  onClearAll,
  onDeleteError
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredErrors = errors.filter(error => 
    error.error.toLowerCase().includes(searchQuery.toLowerCase()) ||
    error.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (error.component && error.component.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (error.action && error.action.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <ErrorIcon color="error" />
            <Typography variant="h6">Error Logs</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search errors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {filteredErrors.length === 0 ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight={200}
          >
            <Typography color="text.secondary">
              {searchQuery ? 'No matching errors found' : 'No errors logged'}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredErrors.map((error, index) => (
              <React.Fragment key={error.id}>
                {index > 0 && <Divider />}
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: 'error.light',
                    borderRadius: 1,
                    mb: 1,
                    opacity: 0.9
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" color="error.main" fontWeight="bold">
                          {error.error}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(error.timestamp), 'MMM d, yyyy HH:mm:ss')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {error.details}
                        </Typography>
                        {(error.component || error.action) && (
                          <Box display="flex" gap={2}>
                            {error.component && (
                              <Typography variant="caption" color="text.secondary">
                                Component: {error.component}
                              </Typography>
                            )}
                            {error.action && (
                              <Typography variant="caption" color="text.secondary">
                                Action: {error.action}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  {onDeleteError && (
                    <IconButton 
                      onClick={() => onDeleteError(error.id)}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        {onClearAll && errors.length > 0 && (
          <Button 
            onClick={onClearAll}
            color="error"
            sx={{ mr: 'auto' }}
          >
            Clear All
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorLogsDialog;
