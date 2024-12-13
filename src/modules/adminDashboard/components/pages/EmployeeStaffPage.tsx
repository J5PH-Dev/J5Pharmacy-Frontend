import { Box, Typography, Paper, Dialog, DialogContent, Backdrop, Button, Checkbox, FormControlLabel, FormGroup, Divider, Avatar, TextField, InputLabel, Select, MenuItem, FormControl, Grid, DialogTitle, DialogActions, Alert } from '@mui/material';
import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add'; // Add Material UI icon
import FilterListIcon from '@mui/icons-material/FilterList';
import MailOutline from '@mui/icons-material/MailOutline';
import Phone from '@mui/icons-material/Phone';
import { format } from 'date-fns';
import { Edit, Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';

// Define the StaffMember interface
interface StaffMember {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  branch: string;
  imageUrl: string;
  hiredDate: string;
}

const predefinedPositions = ['Pharmacist', 'Manager', 'Cashier'];
const predefinedBranches = ['Branch A', 'Branch B', 'Branch C'];

const EmployeeStaffPage: React.FC = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [deleteStaffId, setDeleteStaffId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [editStaffOpen, setEditStaffOpen] = useState(false); // New state for edit dialog
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [newStaff, setNewStaff] = useState<StaffMember>({
    id: 0,
    name: '',
    position: '',
    email: '',
    phone: '',
    branch: '',
    imageUrl: '', // Optional field, initialized as undefined
    hiredDate: '' // Optional field, initialized as undefined
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchStaffMembers = async () => {
      // Mock data
      const data: StaffMember[] = [
        { id: 1, name: 'John Doe', position: 'Pharmacist', hiredDate: '01/15/2020', email: 'john@example.com', phone: '+63 917 123 4567', branch: 'Branch A', imageUrl: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Jane Smith', position: 'Branch Manager', hiredDate: '03/20/2019', email: 'jane@example.com', phone: '+63 917 234 5678', branch: 'Branch B', imageUrl: 'https://via.placeholder.com/150' },
        { id: 3, name: 'Alice Johnson', position: 'Pharmacist', hiredDate: '06/12/2021', email: 'alice@example.com', phone: '+63 917 345 6789', branch: 'Branch A', imageUrl: 'https://via.placeholder.com/150' },
        { id: 4, name: 'Bob Martin', position: 'Area Manager', hiredDate: '05/25/2018', email: 'bob@example.com', phone: '+63 917 456 7890', branch: 'Branch C', imageUrl: 'https://via.placeholder.com/150' },
        { id: 5, name: 'Emma White', position: 'Branch Manager', hiredDate: '08/30/2022', email: 'emma@example.com', phone: '+63 917 567 8901', branch: 'Branch B', imageUrl: 'https://via.placeholder.com/150' },
        { id: 6, name: 'Chris Black', position: 'Pharmacist', hiredDate: '02/18/2020', email: 'chris@example.com', phone: '+63 917 678 9012', branch: 'Branch C', imageUrl: 'https://via.placeholder.com/150' },
        { id: 7, name: 'Olivia Green', position: 'Area Manager', hiredDate: '11/10/2017', email: 'olivia@example.com', phone: '+63 917 789 0123', branch: 'Branch A', imageUrl: 'https://via.placeholder.com/150' },
        { id: 8, name: 'Ethan Blue', position: 'Branch Manager', hiredDate: '07/02/2021', email: 'ethan@example.com', phone: '+63 917 890 1234', branch: 'Branch D', imageUrl: 'https://via.placeholder.com/150' },
        { id: 9, name: 'Sophia Yellow', position: 'Pharmacist', hiredDate: '09/15/2020', email: 'sophia@example.com', phone: '+63 917 901 2345', branch: 'Branch B', imageUrl: 'https://via.placeholder.com/150' }
      ];
      setStaffMembers(data);
    };

    fetchStaffMembers();
  }, []);

  const handleClickOpen = (id: number) => {
    setSelectedStaffId(id);
    setOpen(true);
  };

  const handleEditClickOpen = (id: number) => {
    const staffToEdit = staffMembers.find(staff => staff.id === id);
    if (staffToEdit) {
      setNewStaff(staffToEdit);
      setEditStaffOpen(true);
    }
  };

  const handleClose = () => {
    setSelectedStaffId(null);
    setOpen(false);
    setEditStaffOpen(false);
    setNewStaff({
      id: 0,
      name: '',
      position: '',
      email: '',
      phone: '',
      branch: '',
      imageUrl: '',
      hiredDate: '',
    });
    setFile(null);  // Reset file input when closing modal
  };

  const handleAddStaffOpen = () => {
    setAddStaffOpen(true);
  };

  const handleAddStaffClose = () => {
    setAddStaffOpen(false);
  };

  const handlePositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.name;
    setSelectedPositions((prev) =>
      prev.includes(value) ? prev.filter((pos) => pos !== value) : [...prev, value]
    );
  };

  const handleBranchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.name;
    setSelectedBranches((prev) =>
      prev.includes(value) ? prev.filter((branch) => branch !== value) : [...prev, value]
    );
  };


  const handleNewStaffChange = (field: keyof StaffMember, value: string) => {
    setNewStaff(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleFilterOpen = () => {
    setShowFilters(true);
  };

  const handleFilterClose = () => {
    setShowFilters(false);
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSaveEditStaff = () => {
    setStaffMembers((prev) =>
      prev.map((staff) => (staff.id === newStaff.id ? newStaff : staff))
    );
    setEditStaffOpen(false);
    setSuccessMessage('Staff member successfully updated!'); // Set the success message
  };


  const filteredStaffMembers = staffMembers.filter(staff =>
    (selectedPositions.length ? selectedPositions.includes(staff.position) : true) &&
    (selectedBranches.length ? selectedBranches.includes(staff.branch) : true)
  );

  const handleApplyFilter = () => {
    setShowFilters(false);
  };

  const handleCancelFilter = () => {
    // Reset the selected positions and branches to their initial state (empty arrays)
    setSelectedPositions([]);
    setSelectedBranches([]);

    // Close the filter modal
    setShowFilters(false);
  };


  const selectedStaff = staffMembers.find(staff => staff.id === selectedStaffId);

  const handleDeleteStaff = () => {
    if (deleteStaffId !== null) {
      setStaffMembers(prev => prev.filter(staff => staff.id !== deleteStaffId));
      setSuccessMessage('Staff member deleted successfully!');
      setOpenDeleteModal(false);
      setDeleteStaffId(null);
    }
  };

  const handleClickOpenDeleteModal = (id: number) => {
    setDeleteStaffId(id);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteStaffId(null);
    setOpenDeleteModal(false);
  };


  const handleSaveNewStaff = () => {
    // Validate that all required fields are filled
    if (!newStaff.name || !newStaff.position || !newStaff.email || !newStaff.phone || !newStaff.branch || !newStaff.hiredDate || !file) {
      setErrorMessage('Please fill in all required fields, including the picture.');
      return; // Stop further execution if validation fails
    }

    // Create a new staff object with the current state of newStaff
    const newStaffWithId = { ...newStaff, id: staffMembers.length + 1 };

    // Add the new staff member to the list
    setStaffMembers(prev => [...prev, newStaffWithId]);

    // Show the success message
    setSuccessMessage('New staff member added successfully!');

    // Close the add staff dialog
    setAddStaffOpen(false);

    // Reset newStaff state for the next form submission
    setNewStaff({
      id: 0,
      name: '',
      position: '',
      email: '',
      phone: '',
      branch: '',
      imageUrl: '',
      hiredDate: '',
    });

    // Reset the file input
    setFile(null);
  };



  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null); // Hide the message after 3 seconds
      }, 3000);

      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, [successMessage]);

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1 }}>

      {/* Title and Button Container with Centered Content */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Staff & Employees ({filteredStaffMembers.length})
          </Typography>
          <Typography variant="body1" sx={{ mt: -1 }}>
            Access employee and staff information
          </Typography>
        </Box>
        <Box>
          <Button variant="contained"
            sx={{
              color: 'black',
              backgroundColor: 'white',
              boxShadow: 'none',
              border: '1px solid rgba(29, 36, 46, 0.2)',
              padding: '6px 20px',
              ml: 2,
              '&:hover': {
                transform: 'scale(1.012)',
                backgroundColor: 'white',
                boxShadow: 'none',
              },
            }}
            onClick={handleFilterOpen}
          >
            <FilterListIcon sx={{ mr: 1, fontSize: '16px' }} />
            Filter
          </Button>
          <Button variant="contained" sx={{ backgroundColor: '#01A768', color: '#fff', fontWeight: 'medium', textTransform: 'none', '&:hover': { backgroundColor: '#017F4A' }, ml: 2, alignItems: 'center', gap: 1, justifyContent: 'center' }} onClick={handleAddStaffOpen}>
            <AddIcon sx={{ fontSize: '19px' }} />
            Add New
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 4, mb: 10 }}>
        <Grid container spacing={2}>
          {filteredStaffMembers.map((staff) => (
            <Grid
              item
              xs={12} // 1 column on small screens
              sm={6}  // 2 columns on medium screens
              lg={3}  // 4 columns on large screens
              key={staff.id}
            >
              <Paper sx={{ p: 3, cursor: 'pointer' }} onClick={() => handleClickOpen(staff.id)}>
                {/* First line: Picture and buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {staff.imageUrl ? (
                    <Avatar src={staff.imageUrl} sx={{ width: 56, height: 56, mr: 2 }} />
                  ) : (
                    <Avatar sx={{ width: 56, height: 56, mr: 2 }}>{staff.name[0]}</Avatar>
                  )}
                  <Box>
                    <IconButton onClick={() => handleEditClickOpen(staff.id)} sx={{ color: '#2B7FF5' }}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation(); // Prevents the card's onClick from being triggered
                        handleClickOpenDeleteModal(staff.id);
                      }}
                      sx={{ color: '#D42A4C', ml: '-7px' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {/* Second line: Name (bold) */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {staff.name}
                </Typography>

                {/* Third line: Position */}
                <Typography sx={{ fontWeight: 'normal', mt: '-8px', fontSize: '14px' }}>{staff.position}</Typography>

                {/* Fourth line: Branch and Hired Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Branch:</Typography>
                    <Typography sx={{ fontWeight: 'normal', mt: '-3px', fontSize: '14px' }}>{staff.branch}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date Hired:</Typography>
                    <Typography sx={{ fontWeight: 'normal', mt: '-3px', fontSize: '14px' }}>
                      {staff.hiredDate ? format(new Date(staff.hiredDate), 'MM/dd/yyyy') : 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                {/* Fifth line: Email with email icon */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: '5px' }}>
                  <MailOutline sx={{ mr: 2, fontSize: '19px' }} />
                  <Typography variant="body2">{staff.email}</Typography>
                </Box>

                {/* Sixth line: Phone with phone icon */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 2, fontSize: '19px' }} />
                  <Typography variant="body2">{staff.phone}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Staff Details</DialogTitle>
          <DialogContent sx={{ padding: '20px' }}>
            {selectedStaff && (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Staff Image */}
                  {selectedStaff.imageUrl && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Avatar
                        alt={selectedStaff.name}
                        src={selectedStaff.imageUrl}
                        sx={{ width: 100, height: 100 }}
                      />
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: '500' }}>Name:</Typography>
                    <Typography variant="body2">{selectedStaff.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: '500' }}>Position:</Typography>
                    <Typography variant="body2">{selectedStaff.position}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: '500' }}>Branch:</Typography>
                    <Typography variant="body2">{selectedStaff.branch}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: '500' }}>Hired Date:</Typography>
                    <Typography variant="body2">{selectedStaff.hiredDate}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: '500' }}>Email:</Typography>
                    <Typography variant="body2">{selectedStaff.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: '500' }}>Phone:</Typography>
                    <Typography variant="body2">{selectedStaff.phone}</Typography>
                  </Box>
                </Box>
              </>
            )}
          </DialogContent>
        </Dialog>
        <Backdrop open={open} style={{ zIndex: 1, color: '#fff' }} />
      </Box>

      <Dialog open={showFilters} onClose={handleFilterClose} maxWidth="sm" fullWidth>
        <DialogTitle>Filter</DialogTitle>
        <DialogContent>
          {showFilters && (
            <>
              <FormGroup>
                <Typography variant="h6">Positions</Typography>
                {predefinedPositions.map((position) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPositions.includes(position)} // Dynamically check/uncheck
                        onChange={handlePositionChange}
                        name={position}
                      />
                    }
                    label={position}
                    key={position}
                  />
                ))}
              </FormGroup>

              <FormGroup sx={{ mt: 2 }}>
                <Typography variant="h6">Branches</Typography>
                {predefinedBranches.map((branch) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedBranches.includes(branch)} // Dynamically check/uncheck
                        onChange={handleBranchChange}
                        name={branch}
                      />
                    }
                    label={branch}
                    key={branch}
                  />
                ))}
              </FormGroup>

            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              onClick={handleCancelFilter}
              sx={{
                color: 'gray',
                '&:hover': {
                  color: 'black', // Change color on hover
                },
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleApplyFilter}
              sx={{
                backgroundColor: '#01A768',
                color: '#fff',
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                '&:hover': {
                  backgroundColor: '#019F63', // Change background on hover
                },
              }}
            >
              Apply Filter
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={addStaffOpen} onClose={handleAddStaffClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: 24, color: '#333' }}>Add New Staff</DialogTitle>
        <DialogContent sx={{ paddingTop: 2 }}>
          {/* Display error message if validation fails */}
          {errorMessage && (
            <Box sx={{ color: 'red', marginBottom: 2 }}>
              <Typography variant="body2">{errorMessage}</Typography>
            </Box>
          )}
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Name Input */}
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              required
              sx={{ borderRadius: 1, backgroundColor: '#f9f9f9', mt: '12px', '& .MuiInputBase-root': { borderRadius: 1 } }}
              value={newStaff.name}
              onChange={(e) => handleNewStaffChange('name', e.target.value)}
            />

            {/* Position Input */}
            <FormControl variant="outlined" fullWidth required sx={{ borderRadius: 1 }}>
              <InputLabel htmlFor="position">Position</InputLabel>
              <Select
                label="Position"
                name="position"
                value={newStaff.position}
                onChange={(e) => handleNewStaffChange('position', e.target.value as string)}
                sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
              >
                {predefinedPositions.map(position => (
                  <MenuItem value={position} key={position}>{position}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Email Input */}
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              required
              sx={{ borderRadius: 1, backgroundColor: '#f9f9f9' }}
              value={newStaff.email}
              onChange={(e) => handleNewStaffChange('email', e.target.value)}
              name="email"
            />

            {/* Phone Input */}
            <TextField
              label="Phone"
              variant="outlined"
              fullWidth
              required
              sx={{ borderRadius: 1, backgroundColor: '#f9f9f9' }}
              value={newStaff.phone}
              onChange={(e) => handleNewStaffChange('phone', e.target.value)}
              name="phone"
            />

            {/* Branch Input */}
            <FormControl variant="outlined" fullWidth required sx={{ borderRadius: 1 }}>
              <InputLabel htmlFor="branch">Branch</InputLabel>
              <Select
                label="Branch"
                name="branch"
                value={newStaff.branch}
                onChange={(e) => handleNewStaffChange('branch', e.target.value as string)}
                sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
              >
                {predefinedBranches.map(branch => (
                  <MenuItem value={branch} key={branch}>{branch}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Hired Date Input */}
            <TextField
              label="Hired Date"
              type="date"
              variant="outlined"
              fullWidth
              required
              sx={{ borderRadius: 1, backgroundColor: '#f9f9f9' }}
              value={newStaff.hiredDate}
              onChange={(e) => handleNewStaffChange('hiredDate', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* File Upload Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  border: '2px dashed #4caf50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: '#fafafa',
                }}
              >
                {file ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Upload Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">Upload Picture</Typography>
                )}
              </Box>
              <Button variant="outlined" component="label" sx={{ mt: 2, backgroundColor: '#4caf50', color: 'white', borderRadius: 1 }}>
                Choose File
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </Box>

            {/* Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, width: '100%' }}>
              <Button onClick={handleAddStaffClose} sx={{ mr: 2, color: '#888', borderRadius: 1 }}>Cancel</Button>
              <Button onClick={handleSaveNewStaff} variant="contained" sx={{ borderRadius: 1, backgroundColor: '#4caf50' }}>Save</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>


      <Dialog open={editStaffOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Staff</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              required
              sx={{ flex: '1 1 calc(50% - 16px)', mt: '12px' }}
              value={newStaff.name}
              onChange={(e) => handleNewStaffChange('name', e.target.value)}
            />
            <FormControl variant="outlined" fullWidth required sx={{ flex: '1 1 calc(50% - 16px)', mt: '12px' }}>
              <InputLabel htmlFor="position">Position</InputLabel>
              <Select
                label="Position"
                name="position"
                value={newStaff.position}
                onChange={(e) => handleNewStaffChange('position', e.target.value as string)}
              >
                {predefinedPositions.map(position => (
                  <MenuItem value={position} key={position}>{position}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              required
              sx={{ flex: '1 1 calc(50% - 16px)' }}
              value={newStaff.email}
              onChange={(e) => handleNewStaffChange('email', e.target.value)}
            />
            <TextField
              label="Phone"
              variant="outlined"
              fullWidth
              required
              sx={{ flex: '1 1 calc(50% - 16px)' }}
              value={newStaff.phone}
              onChange={(e) => handleNewStaffChange('phone', e.target.value)}
            />
            <FormControl variant="outlined" fullWidth required sx={{ flex: '1 1 calc(50% - 16px)' }}>
              <InputLabel htmlFor="branch">Branch</InputLabel>
              <Select
                label="Branch"
                name="branch"
                value={newStaff.branch}
                onChange={(e) => handleNewStaffChange('branch', e.target.value as string)}
              >
                {predefinedBranches.map(branch => (
                  <MenuItem value={branch} key={branch}>{branch}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Hired Date"
              variant="outlined"
              fullWidth
              required
              type="date"
              sx={{ flex: '1 1 calc(50% - 16px)' }}
              value={newStaff.hiredDate}
              onChange={(e) => handleNewStaffChange('hiredDate', e.target.value)}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  border: '1px dashed grey',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                {file ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Upload Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">Upload Picture</Typography>
                )}
              </Box>
              <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                Choose File
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSaveEditStaff}
            variant="contained"
            sx={{
              backgroundColor: '#01A768',
              color: '#fff',
              '&:hover': { backgroundColor: '#017F4A' },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
            <DeleteIcon sx={{ fontSize: 40, color: '#D42A4C', mr: 2 }} />
            <Typography variant="h6">Are you sure you want to delete this staff member?</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDeleteStaff()} color="secondary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Box>
        {successMessage && (
          <Alert
            icon={<CheckIcon fontSize="inherit" />}
            severity="success"
            sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1201, // Ensure it's above other content
            }}
          >
            {successMessage}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeStaffPage;
