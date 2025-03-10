import React, { useState } from 'react';
import { 
  Container, Typography, Box, Paper, Stepper, Step, StepLabel,
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Checkbox, FormControlLabel, FormHelperText, Alert, Divider,
  CircularProgress, Card, CardContent, Grid, List, ListItem,
  ListItemIcon, ListItemText, Tooltip, IconButton
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import GavelIcon from '@mui/icons-material/Gavel';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/Help';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const steps = ['Report Information', 'Evidence Upload', 'Verification', 'Submission'];

const WhistleblowingPage = () => {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    reportType: '',
    entityName: '',
    description: '',
    date: '',
    location: '',
    additionalInfo: '',
    anonymous: true,
    contactMethod: 'secure-platform',
    contactDetails: '',
    termsAgreed: false
  });
  const [files, setFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [reportId, setReportId] = useState(null);
  
  const handleNext = () => {
    const errors = validateStep(activeStep);
    if (Object.keys(errors).length === 0) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      window.scrollTo(0, 0);
    } else {
      setFormErrors(errors);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    window.scrollTo(0, 0);
  };

  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // If changing anonymity, reset contact-related fields
    if (name === 'anonymous') {
      if (value === true) {
        setFormData(prev => ({
          ...prev,
          contactMethod: 'secure-platform',
          contactDetails: ''
        }));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!formData.reportType) errors.reportType = "Please select a report type";
      if (!formData.entityName) errors.entityName = "Please provide the name of the entity";
      if (!formData.description || formData.description.trim().length < 20) {
        errors.description = "Please provide a detailed description (at least 20 characters)";
      }
      if (!formData.date) errors.date = "Please provide the approximate date";
    } 
    else if (step === 2) {
      if (!formData.anonymous && formData.contactMethod === 'email' && !formData.contactDetails) {
        errors.contactDetails = "Please provide your contact email";
      }
      if (!formData.termsAgreed) {
        errors.termsAgreed = "You must agree to the terms to proceed";
      }
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      // In a real application, this would be an API call
      // const formDataWithFiles = new FormData();
      // Object.entries(formData).forEach(([key, value]) => {
      //   formDataWithFiles.append(key, value);
      // });
      // files.forEach((file) => {
      //   formDataWithFiles.append('files', file);
      // });
      // const response = await api.post('/whistleblowing/reports', formDataWithFiles);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful response
      const mockResponse = {
        reportId: 'WB-' + Math.floor(100000 + Math.random() * 900000),
        status: 'submitted',
        submissionDate: new Date().toISOString()
      };
      
      setReportId(mockResponse.reportId);
      setSubmitSuccess(true);
      setActiveStep(4); // Move to success step
    } catch (error) {
      console.error('Error submitting report:', error);
      setSubmitError('There was an error submitting your report. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Report Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  error={!!formErrors.reportType}
                  required
                >
                  <InputLabel>Type of Misconduct</InputLabel>
                  <Select
                    name="reportType"
                    value={formData.reportType}
                    onChange={handleFormChange}
                    label="Type of Misconduct"
                  >
                    <MenuItem value="corruption">Corruption</MenuItem>
                    <MenuItem value="fraud">Fraud</MenuItem>
                    <MenuItem value="waste">Waste of Public Funds</MenuItem>
                    <MenuItem value="abuse">Abuse of Power</MenuItem>
                    <MenuItem value="ethics">Ethics Violations</MenuItem>
                    <MenuItem value="safety">Public Safety Concerns</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {formErrors.reportType && (
                    <FormHelperText>{formErrors.reportType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="entityName"
                  label="Name of Entity/Individual Involved"
                  value={formData.entityName}
                  onChange={handleFormChange}
                  error={!!formErrors.entityName}
                  helperText={formErrors.entityName}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="date"
                  label="When did it occur?"
                  type="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.date}
                  helperText={formErrors.date}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="location"
                  label="Where did it occur?"
                  value={formData.location}
                  onChange={handleFormChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={6}
                  name="description"
                  label="Detailed Description"
                  value={formData.description}
                  onChange={handleFormChange}
                  error={!!formErrors.description}
                  helperText={formErrors.description || "Please provide as much detail as possible about what happened, who was involved, and any impacts"}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="additionalInfo"
                  label="Additional Information"
                  value={formData.additionalInfo}
                  onChange={handleFormChange}
                  helperText="Any other relevant information that may be helpful for the investigation"
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Evidence Upload</Typography>
            <Typography paragraph>
              Supporting evidence strengthens your report and helps with verification. 
              You can upload documents, photos, or other relevant files (maximum 5 files, 10MB each).
            </Typography>
            
            <Box 
              sx={{ 
                border: '2px dashed #ccc', 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                textAlign: 'center'
              }}
            >
              <input
                type="file"
                multiple
                id="evidence-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="evidence-upload">
                <Button 
                  variant="contained" 
                  component="span"
                  startIcon={<UploadFileIcon />}
                >
                  Select Files
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Drag and drop files here or click to browse
              </Typography>
            </Box>
            
            {files.length > 0 && (
              <List>
                {files.map((file, index) => (
                  <ListItem 
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={file.name} 
                      secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} 
                    />
                  </ListItem>
                ))}
              </List>
            )}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                No evidence to upload? Don't worry, you can still submit your report without attachments.
              </Typography>
            </Alert>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Privacy and Contact Options</Typography>
            
            <Box mb={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.anonymous}
                    onChange={handleFormChange}
                    name="anonymous"
                  />
                }
                label="I wish to remain anonymous"
              />
              <Typography variant="body2" color="text.secondary">
                Your identity will be protected and not disclosed to the reported entities
              </Typography>
            </Box>
            
            {!formData.anonymous && (
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Contact Method
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  How would you prefer to be contacted regarding your report if necessary?
                </Typography>
                
                <FormControl 
                  fullWidth 
                  margin="normal"
                >
                  <InputLabel>Preferred Contact Method</InputLabel>
                  <Select
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleFormChange}
                    label="Preferred Contact Method"
                  >
                    <MenuItem value="secure-platform">Secure Platform Messages Only</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                  </Select>
                </FormControl>
                
                {formData.contactMethod !== 'secure-platform' && (
                  <TextField
                    fullWidth
                    margin="normal"
                    name="contactDetails"
                    label={formData.contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
                    value={formData.contactDetails}
                    onChange={handleFormChange}
                    error={!!formErrors.contactDetails}
                    helperText={formErrors.contactDetails}
                  />
                )}
              </Box>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>Terms and Verification</Typography>
            
            <Box mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.termsAgreed}
                    onChange={handleFormChange}
                    name="termsAgreed"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I confirm that the information provided is accurate and truthful to the best of my knowledge
                  </Typography>
                }
              />
              {formErrors.termsAgreed && (
                <FormHelperText error>{formErrors.termsAgreed}</FormHelperText>
              )}
            </Box>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              Knowingly making false allegations may have legal consequences.
            </Alert>
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Submission Review</Typography>
            <Typography paragraph>
              Please review your report details before submitting. 
              Once submitted, you won't be able to edit this report.
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Type of Misconduct</Typography>
                  <Typography variant="body1" mb={2}>
                    {formData.reportType.charAt(0).toUpperCase() + formData.reportType.slice(1)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Entity/Individual</Typography>
                  <Typography variant="body1" mb={2}>{formData.entityName}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date</Typography>
                  <Typography variant="body1" mb={2}>{formData.date}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Location</Typography>
                  <Typography variant="body1" mb={2}>{formData.location || "Not specified"}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body1" mb={2}>{formData.description}</Typography>
                </Grid>
                
                {formData.additionalInfo && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Additional Information</Typography>
                    <Typography variant="body1" mb={2}>{formData.additionalInfo}</Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Reporting Method</Typography>
                  <Typography variant="body1" mb={2}>
                    {formData.anonymous ? "Anonymous" : "Non-anonymous"}
                  </Typography>
                </Grid>
                
                {!formData.anonymous && formData.contactMethod !== 'secure-platform' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Contact Details</Typography>
                    <Typography variant="body1" mb={2}>
                      {`${formData.contactMethod}: ${formData.contactDetails}`}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Evidence Files</Typography>
                  {files.length > 0 ? (
                    <Box component="ul" sx={{ pl: 2 }}>
                      {files.map((file, index) => (
                        <li key={index}>
                          <Typography variant="body2">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body1">No files attached</Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                After submission, you'll receive a unique report reference number. 
                Keep this number safe to check the status of your report later.
              </Typography>
            </Alert>
            
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}
          </Box>
        );
      
      case 4: // Success case
        return (
          <Box textAlign="center">
            <VerifiedUserIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Report Successfully Submitted
            </Typography>
            <Typography variant="body1" paragraph>
              Thank you for helping to maintain integrity in government.
              Your report has been received and will be reviewed by our independent team.
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="h6" gutterBottom>
                Your Report Reference Number:
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {reportId}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please save this number for checking your report status
              </Typography>
            </Paper>
            
            <Typography variant="body1" paragraph>
              What happens next?
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><LocalPoliceIcon /></ListItemIcon>
                <ListItemText primary="Your report will be assessed by our independent review team" />
              </ListItem>
              <ListItem>
                <ListItemIcon><GavelIcon /></ListItemIcon>
                <ListItemText primary="If needed, we may request additional information" />
              </ListItem>
              <ListItem>
                <ListItemIcon><ShieldIcon /></ListItemIcon>
                <ListItemText primary="Your identity will remain protected throughout the process" />
              </ListItem>
            </List>
            
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => window.location.href = '/engagement/forums'}
            >
              Back to Forums
            </Button>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          borderRadius: 2
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <SecurityIcon sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" component="h1">
            Secure Whistleblowing Portal
          </Typography>
        </Box>
        <Typography variant="body1">
          This secure platform allows you to confidentially report government misconduct, corruption, or other serious concerns.
          Your report will be handled by an independent ethics committee.
        </Typography>
      </Paper>
      
      {/* Security Information */}
      {activeStep === 0 && (
        <Alert severity="info" icon={<ShieldIcon />} sx={{ mb: 4 }}>
          <Typography variant="subtitle2">
            Your Privacy is Protected
          </Typography>
          <Typography variant="body2">
            This platform uses end-to-end encryption. Your IP address is not logged, and all submitted data is encrypted.
          </Typography>
        </Alert>
      )}
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Main Content */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        {renderStepContent(activeStep)}
      </Paper>
      
      {/* Information Cards */}
      {activeStep < 4 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">What to Report</Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Corruption and bribery" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Serious breaches of public service codes" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Misuse of public funds" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Abuse of position or power" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Serious threats to public safety" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <InfoIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Whistleblower Protections</Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Protection from retaliation" 
                      secondary="Legal safeguards against employment consequences"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Confidentiality" 
                      secondary="Your identity is protected by law"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Legal support" 
                      secondary="Access to independent legal advice"
                    />
                  </ListItem>
                </List>
                <Box textAlign="right" mt={1}>
                  <Tooltip title="Learn more about your rights and protections as a whistleblower">
                    <Button 
                      size="small" 
                      endIcon={<HelpIcon />}
                    >
                      Learn More
                    </Button>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Navigation Buttons */}
      {activeStep < 4 && (
        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : null}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default WhistleblowingPage; 