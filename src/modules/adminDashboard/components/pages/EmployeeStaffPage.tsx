import { Box, Typography, Paper, Dialog, DialogContent, DialogTitle, Backdrop, Button, Checkbox, FormControlLabel, FormGroup, Divider, Avatar, TextField, InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import React, { useState, useEffect } from 'react';

// Define the StaffMember interface
interface StaffMember {
  id: number;
  name: string;
  position: string;
  status: string;
  email: string;
  phone: string;
  branch: string;
  imageUrl?: string; // Optional image URL
}

const predefinedPositions = ['Pharmacist', 'Manager', 'Cashier'];
const predefinedBranches = ['Branch A', 'Branch B'];

const EmployeeStaffPage: React.FC = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [editStaffOpen, setEditStaffOpen] = useState(false); // New state for edit dialog
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [newStaff, setNewStaff] = useState<StaffMember>({
    id: 0,
    name: '',
    position: '',
    status: '',
    email: '',
    phone: '',
    branch: '',
    imageUrl: '' // Add this line if not already present
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchStaffMembers = async () => {
      // Mock data
      const data: StaffMember[] = [
        { id: 1, name: 'John Doe', position: 'Pharmacist', status: 'Offline', email: 'john@example.com', phone: '+63 917 123 4567', branch: 'Branch A', imageUrl: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Jane Smith', position: 'Manager', status: 'Online', email: 'jane@example.com', phone: '+63 917 234 5678', branch: 'Branch B' },
        { id: 3, name: 'Alice Johnson', position: 'Cashier', status: 'Offline', email: 'alice@example.com', phone: '+63 917 345 6789', branch: 'Branch A' },
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
  };

  const handleFilterOpen = () => {
    setFilterOpen(true);
  };

  const handleFilterClose = () => {
    setFilterOpen(false);
  };

  const handleAddStaffOpen = () => {
    setAddStaffOpen(true);
  };

  const handleAddStaffClose = () => {
    setAddStaffOpen(false);
  };

  const handlePositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.name;
    setSelectedPositions(prev => 
      prev.includes(value) ? prev.filter(pos => pos !== value) : [...prev, value]
    );
  };

  const handleBranchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.name;
    setSelectedBranches(prev => 
      prev.includes(value) ? prev.filter(branch => branch !== value) : [...prev, value]
    );
  };

  const handleNewStaffChange = (field: keyof StaffMember, value: string) => {
    setNewStaff(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSaveEditStaff = () => {
    setStaffMembers(prev => prev.map(staff => staff.id === newStaff.id ? newStaff : staff));
    setEditStaffOpen(false);
  };

  const handleDeleteStaff = (id: number) => {
    setStaffMembers(prev => prev.filter(staff => staff.id !== id));
  };

  const filteredStaffMembers = staffMembers.filter(staff => 
    (selectedPositions.length ? selectedPositions.includes(staff.position) : true) &&
    (selectedBranches.length ? selectedBranches.includes(staff.branch) : true)
  );

  const selectedStaff = staffMembers.find(staff => staff.id === selectedStaffId);

  return (
    <div className='ml-72'>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Staff Members ({filteredStaffMembers.length})
        </Typography>
        <Box>
          <Button variant="outlined" onClick={handleFilterOpen} sx={{ ml: 2 }}>Filter</Button>
          <Button variant="outlined" onClick={handleAddStaffOpen} sx={{ ml: 2 }}>Add Staff</Button>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {filteredStaffMembers.map((staff) => (
            <Paper 
              key={staff.id}
              sx={{ p: 2, mb: 2, width: { xs: '100%', sm: 'calc(50% - 16px)' }, cursor: 'pointer' }} 
              onClick={() => handleClickOpen(staff.id)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {staff.imageUrl ? (
                  <Avatar src={staff.imageUrl} sx={{ width: 56, height: 56, mr: 2 }} />
                ) : (
                  <Avatar sx={{ width: 56, height: 56, mr: 2 }}>{staff.name[0]}</Avatar>
                )}
                <Box>
                  <Typography variant="h6">{staff.name}</Typography>
                  <Typography variant="subtitle1">{staff.position}</Typography>
                </Box>
              </Box>
              <Typography variant="body2">Branch: {staff.branch}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">Status: {staff.status}</Typography>
              <Typography variant="body2">Email: {staff.email}</Typography>
              <Typography variant="body2">Phone: {staff.phone}</Typography>
              <Button variant="outlined" onClick={() => handleEditClickOpen(staff.id)} sx={{ mt: 1, mr: 1 }}>
                Edit
              </Button>
              <Button variant="outlined" color="error" onClick={() => handleDeleteStaff(staff.id)} sx={{ mt: 1 }}>
                Delete
              </Button>
            </Paper>
          ))}
        </Box>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Details</DialogTitle>
          <DialogContent>
            {selectedStaff && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Name: {selectedStaff.name}</Typography>
                  <Typography variant="body2">Position: {selectedStaff.position}</Typography>
                </Box>
                <Typography variant="body2">Branch: {selectedStaff.branch}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">Status: {selectedStaff.status}</Typography>
                <Typography variant="body2">Email: {selectedStaff.email}</Typography>
                <Typography variant="body2">Phone: {selectedStaff.phone}</Typography>
              </>
            )}
          </DialogContent>
        </Dialog>
        <Backdrop open={open} style={{ zIndex: 1, color: '#fff' }} />
      </Box>

      <Dialog open={filterOpen} onClose={handleFilterClose} maxWidth="sm" fullWidth>
        <DialogTitle>Filter</DialogTitle>
        <DialogContent>
          <FormGroup>
            <Typography variant="h6">Positions</Typography>
            {predefinedPositions.map(position => (
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={selectedPositions.includes(position)} 
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
            {predefinedBranches.map(branch => (
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={selectedBranches.includes(branch)} 
                    onChange={handleBranchChange} 
                    name={branch}
                  />
                }
                label={branch}
                key={branch}
              />
            ))}
          </FormGroup>
          <Button onClick={handleFilterClose} sx={{ mt: 2 }}>Apply Filter</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={addStaffOpen} onClose={handleAddStaffClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Staff</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField 
              label="Name" 
              variant="outlined" 
              fullWidth 
              required 
              sx={{ flex: '1 1 calc(50% - 16px)' }} 
              value={newStaff.name} 
              onChange={(e) => handleNewStaffChange('name', e.target.value)} 
            />
            <FormControl variant="outlined" fullWidth required sx={{ flex: '1 1 calc(50% - 16px)' }}>
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
              name="email" 
            />
            <TextField 
              label="Phone" 
              variant="outlined" 
              fullWidth 
              required 
              sx={{ flex: '1 1 calc(50% - 16px)' }} 
              value={newStaff.phone} 
              onChange={(e) => handleNewStaffChange('phone', e.target.value)} 
              name="phone" 
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
                  overflow: 'hidden'
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, width: '100%' }}>
              <Button onClick={handleAddStaffClose} sx={{ mr: 2 }}>Cancel</Button>
              <Button type="submit" variant="contained">Save</Button>
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
              sx={{ flex: '1 1 calc(50% - 16px)' }} 
              value={newStaff.name} 
              onChange={(e) => handleNewStaffChange('name', e.target.value)} 
            />
            <FormControl variant="outlined" fullWidth required sx={{ flex: '1 1 calc(50% - 16px)' }}>
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
              name="email" 
            />
            <TextField 
              label="Phone" 
              variant="outlined" 
              fullWidth 
              required 
              sx={{ flex: '1 1 calc(50% - 16px)' }} 
              value={newStaff.phone} 
              onChange={(e) => handleNewStaffChange('phone', e.target.value)} 
              name="phone" 
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
                  overflow: 'hidden'
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, width: '100%' }}>
              <Button onClick={handleClose} sx={{ mr: 2 }}>Cancel</Button>
              <Button type="button" variant="contained" onClick={handleSaveEditStaff}>Save</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeStaffPage;