import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, Card, CardContent, 
  CardHeader, Tabs, Tab, Divider, Button, CircularProgress, 
  Alert, List, ListItem, ListItemText, Chip, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Snackbar
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/api';

const AnalyticsPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [reports, setReports] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [dataExports, setDataExports] = useState([]);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [currentSearch, setCurrentSearch] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [reportFormData, setReportFormData] = useState({
    title: '',
    description: '',
    report_type: 'voting_patterns',
    is_public: false,
    parameters: {}
  });
  const [searchFormData, setSearchFormData] = useState({
    name: '',
    search_type: 'bills',
    query_parameters: {}
  });
  const [exportFormData, setExportFormData] = useState({
    name: '',
    data_type: 'bills',
    parameters: {}
  });

  useEffect(() => {
    fetchData();
  }, [currentTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (currentTab === 0) {
        const response = await analyticsService.getReports();
        setReports(response.data.results || response.data);
      } else if (currentTab === 1) {
        const response = await analyticsService.getSavedSearches();
        setSavedSearches(response.data.results || response.data);
      } else if (currentTab === 2) {
        const response = await analyticsService.getExports();
        setDataExports(response.data.results || response.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenReportDialog = (report = null) => {
    if (report) {
      setCurrentReport(report);
      setReportFormData({
        title: report.title,
        description: report.description,
        report_type: report.report_type,
        is_public: report.is_public,
        parameters: report.parameters || {}
      });
    } else {
      setCurrentReport(null);
      setReportFormData({
        title: '',
        description: '',
        report_type: 'voting_patterns',
        is_public: false,
        parameters: {}
      });
    }
    setOpenReportDialog(true);
  };

  const handleOpenSearchDialog = (search = null) => {
    if (search) {
      setCurrentSearch(search);
      setSearchFormData({
        name: search.name,
        search_type: search.search_type,
        query_parameters: search.query_parameters || {}
      });
    } else {
      setCurrentSearch(null);
      setSearchFormData({
        name: '',
        search_type: 'bills',
        query_parameters: {}
      });
    }
    setOpenSearchDialog(true);
  };

  const handleOpenExportDialog = () => {
    setExportFormData({
      name: '',
      data_type: 'bills',
      parameters: {}
    });
    setOpenExportDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenReportDialog(false);
    setOpenSearchDialog(false);
    setOpenExportDialog(false);
  };

  const handleReportFormChange = (e) => {
    const { name, value, checked } = e.target;
    setReportFormData({
      ...reportFormData,
      [name]: name === 'is_public' ? checked : value
    });
  };

  const handleSearchFormChange = (e) => {
    const { name, value } = e.target;
    setSearchFormData({
      ...searchFormData,
      [name]: value
    });
  };

  const handleExportFormChange = (e) => {
    const { name, value } = e.target;
    setExportFormData({
      ...exportFormData,
      [name]: value
    });
  };

  const handleSaveReport = async () => {
    try {
      if (currentReport) {
        await analyticsService.updateReport(currentReport.id, reportFormData);
        setSnackbar({ open: true, message: 'Report updated successfully', severity: 'success' });
      } else {
        await analyticsService.createReport(reportFormData);
        setSnackbar({ open: true, message: 'Report created successfully', severity: 'success' });
      }
      handleCloseDialogs();
      fetchData();
    } catch (err) {
      console.error('Error saving report:', err);
      setSnackbar({ open: true, message: 'Failed to save report', severity: 'error' });
    }
  };

  const handleSaveSearch = async () => {
    try {
      if (currentSearch) {
        await analyticsService.updateSavedSearch(currentSearch.id, searchFormData);
        setSnackbar({ open: true, message: 'Search updated successfully', severity: 'success' });
      } else {
        await analyticsService.createSavedSearch(searchFormData);
        setSnackbar({ open: true, message: 'Search saved successfully', severity: 'success' });
      }
      handleCloseDialogs();
      fetchData();
    } catch (err) {
      console.error('Error saving search:', err);
      setSnackbar({ open: true, message: 'Failed to save search', severity: 'error' });
    }
  };

  const handleCreateExport = async () => {
    try {
      await analyticsService.createExport(exportFormData);
      setSnackbar({ open: true, message: 'Export job created successfully', severity: 'success' });
      handleCloseDialogs();
      fetchData();
    } catch (err) {
      console.error('Error creating export:', err);
      setSnackbar({ open: true, message: 'Failed to create export job', severity: 'error' });
    }
  };

  const handleDeleteReport = async (id) => {
    try {
      await analyticsService.deleteReport(id);
      setSnackbar({ open: true, message: 'Report deleted successfully', severity: 'success' });
      fetchData();
    } catch (err) {
      console.error('Error deleting report:', err);
      setSnackbar({ open: true, message: 'Failed to delete report', severity: 'error' });
    }
  };

  const handleDeleteSearch = async (id) => {
    try {
      await analyticsService.deleteSavedSearch(id);
      setSnackbar({ open: true, message: 'Saved search deleted successfully', severity: 'success' });
      fetchData();
    } catch (err) {
      console.error('Error deleting saved search:', err);
      setSnackbar({ open: true, message: 'Failed to delete saved search', severity: 'error' });
    }
  };

  const handleRetryExport = async (id) => {
    try {
      await analyticsService.retryExport(id);
      setSnackbar({ open: true, message: 'Export job restarted successfully', severity: 'success' });
      fetchData();
    } catch (err) {
      console.error('Error retrying export:', err);
      setSnackbar({ open: true, message: 'Failed to restart export job', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportTypeLabel = (type) => {
    const types = {
      'voting_patterns': 'Voting Patterns',
      'mp_activity': 'MP Activity',
      'topic_trends': 'Topic Trends',
      'custom': 'Custom Report'
    };
    return types[type] || type;
  };

  const getSearchTypeLabel = (type) => {
    const types = {
      'bills': 'Bills',
      'mps': 'MPs',
      'votes': 'Votes',
      'speeches': 'Speeches',
      'topics': 'Topics'
    };
    return types[type] || type;
  };

  const getExportStatusLabel = (status) => {
    const statuses = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed'
    };
    return statuses[status] || status;
  };

  const getExportStatusColor = (status) => {
    const colors = {
      'pending': '#f9a825',
      'processing': '#1976d2',
      'completed': '#2e7d32',
      'failed': '#d32f2f'
    };
    return colors[status] || '#757575';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics & Reports
      </Typography>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab label="Reports" />
          <Tab label="Saved Searches" />
          <Tab label="Data Exports" />
        </Tabs>
        
        <Divider sx={{ my: 2 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <Box sx={{ mt: 2 }}>
            {/* Reports Tab */}
            {currentTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenReportDialog()}
                  >
                    Create Report
                  </Button>
                </Box>
                
                {reports.length === 0 ? (
                  <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                    No reports found. Create your first report to get started.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Last Updated</TableCell>
                          <TableCell>Public</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{report.title}</TableCell>
                            <TableCell>{getReportTypeLabel(report.report_type)}</TableCell>
                            <TableCell>{formatDate(report.created_at)}</TableCell>
                            <TableCell>{formatDate(report.updated_at)}</TableCell>
                            <TableCell>{report.is_public ? 'Yes' : 'No'}</TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                onClick={() => handleOpenReportDialog(report)}
                                title="Edit"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteReport(report.id)}
                                title="Delete"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            
            {/* Saved Searches Tab */}
            {currentTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={() => handleOpenSearchDialog()}
                  >
                    Save New Search
                  </Button>
                </Box>
                
                {savedSearches.length === 0 ? (
                  <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                    No saved searches found. Save a search to quickly access it later.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {savedSearches.map((search) => (
                          <TableRow key={search.id}>
                            <TableCell>{search.name}</TableCell>
                            <TableCell>{getSearchTypeLabel(search.search_type)}</TableCell>
                            <TableCell>{formatDate(search.created_at)}</TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                onClick={() => handleOpenSearchDialog(search)}
                                title="Edit"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteSearch(search.id)}
                                title="Delete"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                title="Run Search"
                              >
                                <SearchIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            
            {/* Data Exports Tab */}
            {currentTab === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<DownloadIcon />}
                    onClick={handleOpenExportDialog}
                  >
                    New Export
                  </Button>
                </Box>
                
                {dataExports.length === 0 ? (
                  <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                    No data exports found. Create an export to download data in various formats.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Completed</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataExports.map((exportItem) => (
                          <TableRow key={exportItem.id}>
                            <TableCell>{exportItem.name}</TableCell>
                            <TableCell>{exportItem.data_type}</TableCell>
                            <TableCell>
                              <Chip 
                                label={getExportStatusLabel(exportItem.status)} 
                                size="small"
                                sx={{ 
                                  backgroundColor: getExportStatusColor(exportItem.status),
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                            <TableCell>{formatDate(exportItem.created_at)}</TableCell>
                            <TableCell>{formatDate(exportItem.completed_at)}</TableCell>
                            <TableCell>
                              {exportItem.status === 'completed' ? (
                                <IconButton 
                                  size="small"
                                  href={exportItem.file_url}
                                  download
                                  title="Download"
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              ) : exportItem.status === 'failed' ? (
                                <IconButton 
                                  size="small"
                                  onClick={() => handleRetryExport(exportItem.id)}
                                  title="Retry"
                                >
                                  <FilterAltIcon fontSize="small" />
                                </IconButton>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>
      
      {/* Report Dialog */}
      <Dialog open={openReportDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>{currentReport ? 'Edit Report' : 'Create New Report'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="title"
            label="Report Title"
            type="text"
            fullWidth
            variant="outlined"
            value={reportFormData.title}
            onChange={handleReportFormChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={reportFormData.description}
            onChange={handleReportFormChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="report-type-label">Report Type</InputLabel>
            <Select
              labelId="report-type-label"
              name="report_type"
              value={reportFormData.report_type}
              label="Report Type"
              onChange={handleReportFormChange}
            >
              <MenuItem value="voting_patterns">Voting Patterns</MenuItem>
              <MenuItem value="mp_activity">MP Activity</MenuItem>
              <MenuItem value="topic_trends">Topic Trends</MenuItem>
              <MenuItem value="custom">Custom Report</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="is-public-label">Public</InputLabel>
            <Select
              labelId="is-public-label"
              name="is_public"
              value={reportFormData.is_public}
              label="Public"
              onChange={handleReportFormChange}
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleSaveReport} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Saved Search Dialog */}
      <Dialog open={openSearchDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>{currentSearch ? 'Edit Saved Search' : 'Save Search'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Search Name"
            type="text"
            fullWidth
            variant="outlined"
            value={searchFormData.name}
            onChange={handleSearchFormChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="search-type-label">Search Type</InputLabel>
            <Select
              labelId="search-type-label"
              name="search_type"
              value={searchFormData.search_type}
              label="Search Type"
              onChange={handleSearchFormChange}
            >
              <MenuItem value="bills">Bills</MenuItem>
              <MenuItem value="mps">MPs</MenuItem>
              <MenuItem value="votes">Votes</MenuItem>
              <MenuItem value="speeches">Speeches</MenuItem>
              <MenuItem value="topics">Topics</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleSaveSearch} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={openExportDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Create Data Export</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Export Name"
            type="text"
            fullWidth
            variant="outlined"
            value={exportFormData.name}
            onChange={handleExportFormChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="data-type-label">Data Type</InputLabel>
            <Select
              labelId="data-type-label"
              name="data_type"
              value={exportFormData.data_type}
              label="Data Type"
              onChange={handleExportFormChange}
            >
              <MenuItem value="bills">Bills</MenuItem>
              <MenuItem value="mps">MPs</MenuItem>
              <MenuItem value="votes">Votes</MenuItem>
              <MenuItem value="speeches">Speeches</MenuItem>
              <MenuItem value="topics">Topics</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleCreateExport} variant="contained">Create Export</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default AnalyticsPage; 