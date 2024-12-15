import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Modal, TextField, FormControl, Select, MenuItem, InputLabel, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper as MuiPaper } from '@mui/material';
import Slide from '@mui/material/Slide';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit'; // Optional edit icon if desired
import DeleteIcon from '@mui/icons-material/Delete'; // Optional delete icon if desired
import AddIcon from '@mui/icons-material/Add'; // Add icon
import { useNavigate } from 'react-router-dom';

const BranchesPage = () => {
  // State for branches, modal, new branch form, and contact editing
  const [branches, setBranches] = useState([
    {
      id: 1,
      name: 'Branch 1',
      address: 'Ph. 10, Pcg 2, Bag..',
      branchCode: 'PH349TY228',
      city: 'New York',
      dateOpen: '2020-01-01',
      contacts: [{ id: 1, name: 'John Doe', contactNumber: '123-456-7890', position: 'Manager', email: 'john@example.com' }]
    },
    {
      id: 2,
      name: 'Branch 3',
      address: 'Ph. 10, Pcg 2, Bag..',
      branchCode: 'PH349TY228',
      city: 'Los Angeles',
      dateOpen: '2018-06-15',
      contacts: [{ id: 2, name: 'Jane Smith', contactNumber: '987-654-3210', position: 'Assistant', email: 'jane@example.com' }]
    },
  ]);
  
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false); // Modal for branch details
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal for editing contact info
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false); // Modal for adding a new contact
  const [selectedBranch, setSelectedBranch] = useState<any>(null); // Store selected branch details
  const [selectedContact, setSelectedContact] = useState<any>(null); // Store selected contact for editing
  const [contactForm, setContactForm] = useState({
    name: '',
    position: '',
    employeeId: '',
    email: '',
    username: '',
    contactNumber: '',
  });  
  const [newBranch, setNewBranch] = useState<{ name: string; branchCode: string; address: string;  manager: string; city: string; email: string; dateOpen: string; contactNumber: string; }>({
    name: '',
    branchCode: '',
    address: '',
    manager: '',
    email: '',
    city: '',
    dateOpen: '',
    contactNumber: '',
  });
  const [filter, setFilter] = useState<string>('All');
  const navigate = useNavigate();

  // Handle the opening of the branch modal when a branch is clicked
  const handleBranchClick = (branch: any) => {
    setSelectedBranch(branch);
    setIsBranchModalOpen(true);
  };

  // Function to close the branch modal when done
  const handleCloseBranchModal = () => {
    setIsBranchModalOpen(false);
    setSelectedBranch(null); // Clear selected branch when modal closes
    
  };

  // Handle filter change
  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    setFilter(e.target.value);
  };

  // Handle new branch form input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    // Update the state for the new branch data
    setNewBranch((prevBranch) => ({
      ...prevBranch,
      [name]: value, // Dynamically set the field that changed
    }));
    setValidationErrors((prev) => ({ ...prev, [name]: false })); // Clear error for this field
  };
  

  // Function to handle adding a new branch
  const [validationErrors, setValidationErrors] = useState({
    name: false,
    branchCode: false,
    address: false,
    manager: false,
    city: false,
    email: false,
    dateOpen: false,
    contactNumber: false,
  });
  const handleAddBranch = () => {
    const errors = {
      name: !newBranch.name.trim(),
      branchCode: !newBranch.branchCode.trim(),
      address: !newBranch.address.trim(),
      manager: !newBranch.manager.trim(),
      city: !newBranch.city.trim(),
      email: !newBranch.email.trim(),
      dateOpen: !newBranch.dateOpen.trim(),
      contactNumber: !newBranch.contactNumber.trim(),
    };
  
    if (Object.values(errors).some((error) => error)) {
      setValidationErrors(errors);
      return;
    }
  
    // Assuming contactForm holds the contact details for the manager
    const newContact = {
      id: Date.now(), // Unique ID based on timestamp
      name: contactForm.name,
      position: contactForm.position,
      employeeId: contactForm.employeeId,
      email: contactForm.email,
      username: contactForm.username,
      contactNumber: contactForm.contactNumber,
    };
  
    const newBranchObject = {
      id: branches.length + 1, // Unique ID
      name: newBranch.name,
      branchCode: newBranch.branchCode,
      address: newBranch.address,
      city: newBranch.city,
      email: newBranch.email,
      dateOpen: newBranch.dateOpen,
      contactNumber: newBranch.contactNumber,
      manager: newBranch.manager, // Can store manager separately or inside contacts
      contacts: [newContact], // Initialize with the contact information (manager as the first contact)
    };
  
    setBranches((prevBranches) => [...prevBranches, newBranchObject]);
  
    // Reset the form and close the modal
    setNewBranch({
      name: "",
      branchCode: "",
      address: "",
      manager: "",
      city: "",
      email: "",
      dateOpen: "",
      contactNumber: "",
    });
  
    setContactForm({
      name: "",
      position: "",
      employeeId: "",
      email: "",
      username: "",
      contactNumber: "",
    });
  
    setValidationErrors({
      name: false,
      branchCode: false,
      address: false,
      manager: false,
      city: false,
      email: false,
      dateOpen: false,
      contactNumber: false,
    });
  
    setIsBranchModalOpen(false); // Close the branch modal
  };  
  
  // Edit Branch Modal
  const [isEditBranchModalOpen, setIsEditBranchModalOpen] = useState(false); // State for edit branch modal

  const handleOpenEditBranchModal = () => {
    if (selectedBranch) {
      setNewBranch({
        name: selectedBranch.name || "",
        branchCode: selectedBranch.branchCode || "",
        address: selectedBranch.address || "",
        manager: selectedBranch.manager || selectedBranch.contacts[0]?.name || "", // Use existing manager field or first contact
        city: selectedBranch.city || "",
        email: selectedBranch.email || "",
        dateOpen: selectedBranch.dateOpen || "",
        contactNumber: selectedBranch.contactNumber || "",
      });
  
      setValidationErrors({
        name: false,
        branchCode: false,
        address: false,
        manager: false,
        city: false,
        email: false,
        dateOpen: false,
        contactNumber: false,
      });
  
      setIsEditBranchModalOpen(true);
    }
  };  
  
  const handleCloseEditBranchModal = () => {
    setIsEditBranchModalOpen(false);
  };
  
  const handleSaveEditedBranch = () => {
    const errors = {
      name: !newBranch.name.trim(),
      branchCode: !newBranch.branchCode.trim(),
      address: !newBranch.address.trim(),
      manager: !newBranch.manager.trim(), // Validate manager
      city: !newBranch.city.trim(),
      email: !newBranch.email.trim(),
      dateOpen: !newBranch.dateOpen.trim(),
      contactNumber: !newBranch.contactNumber.trim(),
    };
  
    if (Object.values(errors).some((error) => error)) {
      setValidationErrors(errors);
      return;
    }
  
    if (selectedBranch) {
      // Update the branch data with the new manager and contact number
      const updatedBranch = {
        ...selectedBranch,
        name: newBranch.name,
        branchCode: newBranch.branchCode,
        address: newBranch.address,
        city: newBranch.city,
        email: newBranch.email,
        dateOpen: newBranch.dateOpen,
        contactNumber: newBranch.contactNumber,
        manager: newBranch.manager, // Update the manager
      };
  
      // Update the branches state
      setBranches((prevBranches) =>
        prevBranches.map((branch) =>
          branch.id === selectedBranch.id ? updatedBranch : branch
        )
      );
  
      // Update the selectedBranch state to reflect changes
      setSelectedBranch(updatedBranch);
  
      setIsEditBranchModalOpen(false); // Close modal
      setNewBranch({
        name: "",
        branchCode: "",
        address: "",
        manager: "",
        city: "",
        email: "",
        dateOpen: "",
        contactNumber: "",
      }); // Reset newBranch form state
  
      setValidationErrors({
        name: false,
        branchCode: false,
        address: false,
        manager: false,
        city: false,
        email: false,
        dateOpen: false,
        contactNumber: false,
      }); // Reset validation errors
    }
  };  
  
const [isViewModalOpen, setIsViewModalOpen] = useState(false); // State for the view modal
const [viewedContact, setViewedContact] = useState<any>(null); // Store the selected contact for viewing

const handleViewContact = (contact: any) => {
  setViewedContact(contact);
  setIsViewModalOpen(true);
};

const handleCloseViewModal = () => {
  setIsViewModalOpen(false);
  setViewedContact(null);
};

const handleCloseAddContactModal = () => {
  setIsAddContactModalOpen(false); // Close the modal
  setContactValidationErrors({
    name: false,
    position: false,
    employeeId: false,
    email: false,
    username: false,
    contactNumber: false,
  }); // Reset validation errors
};

  // Function to handle editing contact info
  const handleEditContact = (contact: any) => {
    if (!contact || typeof contact !== 'object') {
      console.error('Invalid contact object:', contact);
      return;
    }
  
    setSelectedContact(contact);
  
    // Prefill the form with existing contact details
    setContactForm({
      name: contact.name || '',
      position: contact.position || '',
      employeeId: contact.employeeId || '',
      email: contact.email || '',
      username: contact.username || '',
      contactNumber: contact.contactNumber || '',
    });
  
    setIsEditModalOpen(true); // Open the edit modal
  };  
  
  // Handle contact input change (for editing)
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactForm({ ...contactForm, [name]: value });
  };  

  // Save the edited contact details
  const handleSaveContact = () => {
    const errors = {
      name: !contactForm.name.trim(),
      position: !contactForm.position.trim(),
      employeeId: !contactForm.employeeId.trim(),
      email: !contactForm.email.trim(),
      username: !contactForm.username.trim(),
      contactNumber: !contactForm.contactNumber.trim(),
    };
  
    if (Object.values(errors).some((error) => error)) {
      setContactValidationErrors(errors); // Set errors if validation fails
      return;
    }
  
    if (selectedBranch && selectedContact) {
      const updatedContacts = selectedBranch.contacts.map((contact: any) =>
        contact.id === selectedContact.id
          ? { ...contact, ...contactForm } // Update the contact with the new form values
          : contact
      );
  
      const updatedBranch = { ...selectedBranch, contacts: updatedContacts };
  
      setBranches((prevBranches) =>
        prevBranches.map((branch) =>
          branch.id === selectedBranch.id ? updatedBranch : branch
        )
      );
  
      setSelectedBranch(updatedBranch); // Update the selectedBranch state immediately
  
      // Close the modal and reset the form
      setIsEditModalOpen(false);
      setContactForm({
        name: "",
        position: "",
        employeeId: "",
        email: "",
        username: "",
        contactNumber: "",
      });
      setContactValidationErrors({
        name: false,
        position: false,
        employeeId: false,
        email: false,
        username: false,
        contactNumber: false,
      });
    }
  };  

  const [isDeleteContactConfirmOpen, setIsDeleteContactConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<any>(null);
  
// Function to handle deleting a contact
const handleDeleteContact = (contact: any) => {
  // Set the contact to delete in state
  setContactToDelete(contact);
  setIsDeleteContactConfirmOpen(true); // Open the delete confirmation modal
};

// Function to confirm deletion of the contact
const confirmDeleteContact = () => {
  if (selectedBranch && contactToDelete) {
    // Remove the contact from the selected branch's contacts
    const updatedContacts = selectedBranch.contacts.filter(
      (contact: any) => contact.id !== contactToDelete.id
    );

    // Update the branch with the new list of contacts
    const updatedBranch = { ...selectedBranch, contacts: updatedContacts };

    // Immediately update the branches state
    setBranches((prevBranches) =>
      prevBranches.map((branch) =>
        branch.id === selectedBranch.id ? updatedBranch : branch
      )
    );

    // Update selectedBranch state to reflect the contact removal in the UI
    setSelectedBranch(updatedBranch);

    // Close the delete confirmation modal
    setIsDeleteContactConfirmOpen(false);

    // Clear contact to delete
    setContactToDelete(null);
  }
};

// Function to handle closing the delete confirmation modal
const handleCloseDeleteContactConfirm = () => {
  setContactToDelete(null); // Clear the contact to delete
  setIsDeleteContactConfirmOpen(false); // Close the modal
};
  
  const [contactValidationErrors, setContactValidationErrors] = useState({
    name: false,
    position: false,
    employeeId: false,
    email: false,
    username: false,
    contactNumber: false,
  });
  
  const handleAddNewContact = () => {
    // Validate required fields
    const errors = {
      name: !contactForm.name.trim(),
      position: !contactForm.position.trim(),
      employeeId: !contactForm.employeeId.trim(),
      email: !contactForm.email.trim(),
      username: !contactForm.username.trim(),
      contactNumber: !contactForm.contactNumber.trim(),
    };
  
    if (Object.values(errors).some((error) => error)) {
      setContactValidationErrors(errors);
      return;
    }
  
    if (selectedBranch) {
      // Create the new contact object
      const newContact = {
        id: Date.now(), // Unique ID based on timestamp
        ...contactForm,
      };
  
      // Update the selected branch with the new contact
      const updatedBranch = {
        ...selectedBranch,
        contacts: [...selectedBranch.contacts, newContact],
      };
  
      // Update branches state
      setBranches((prevBranches) =>
        prevBranches.map((branch) =>
          branch.id === selectedBranch.id ? updatedBranch : branch
        )
      );
  
      // Update selectedBranch state for real-time UI update
      setSelectedBranch(updatedBranch);
  
      // Reset contact form and close modal
      setContactForm({
        name: "",
        position: "",
        employeeId: "",
        email: "",
        username: "",
        contactNumber: "",
      });
  
      setContactValidationErrors({
        name: false,
        position: false,
        employeeId: false,
        email: false,
        username: false,
        contactNumber: false,
      });
  
      // Close the modal
      setIsAddContactModalOpen(false);
    }
  };  
  
// Add a state for managing delete confirmation
const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

const handleOpenDeleteConfirm = () => {
  setIsDeleteConfirmOpen(true);
};

const handleCloseDeleteConfirm = () => {
  setIsDeleteConfirmOpen(false);
};

const handleDeleteBranch = () => {
  if (selectedBranch) {
    setBranches((prevBranches) =>
      prevBranches.filter((branch) => branch.id !== selectedBranch.id)
    );
    setIsDeleteConfirmOpen(false);
    setIsBranchModalOpen(false);
  }
};
  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
      {/* Title and Filter Dropdown */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Branches
          </Typography>
          <Typography variant="body1">
            Branches Management and Contacts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Filter</InputLabel>
            <Select value={filter} onChange={handleFilterChange} label="Filter">
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Branches">Branches</MenuItem>
              <MenuItem value="Inactive Branches">Inactive Branches</MenuItem>
            </Select>
          </FormControl>
          <Button
  variant="contained"
  onClick={() => {
    setNewBranch({
      name: '',
      branchCode: '',
      address: '',
      manager: '',
      email: '',
      city: '',
      dateOpen: '',
      contactNumber: '',
    });
    setValidationErrors({
      name: false,
      branchCode: false,
      address: false,
      manager: false,
      city: false,
      email: false,
      dateOpen: false,
      contactNumber: false,
    });
    setIsBranchModalOpen(true);
  }}
  sx={{
    backgroundColor: '#01A768', // Green color
    color: '#fff', // White text color
    fontWeight: 'medium',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#017F4A', // Slightly darker green on hover
    },
  }}
>
  <AddIcon /> Add New Branch
</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
  {branches.map((branch) => (
    <Grid item xs={12} sm={6} md={4} key={branch.id}>
      <Paper
        elevation={3}
        sx={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '220px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
          },
        }}
        onClick={() => handleBranchClick(branch)} // Open branch modal on click
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center' }}
        >
          {branch.name} &nbsp;
          <Typography
            component="span"
            variant="body2"
            sx={{
              backgroundColor: '#01A768',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.8rem',
            }}
          >
            {branch.branchCode}
          </Typography>
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '8px' }}>
          <strong>Address:</strong> {branch.address}
        </Typography>

        {/* Ensure manager and contact number are rendered correctly */}
        {branch.contacts && branch.contacts.length > 0 ? (
          <>
            <Typography variant="body2" sx={{ marginBottom: '4px' }}>
              <strong>Manager:</strong> {branch.contacts[0].name}
            </Typography>
            <Typography variant="body2">
              <strong>Contact Number:</strong> {branch.contacts[0].contactNumber}
            </Typography>
          </>
        ) : (
          <Typography variant="body2">
            <em>No contact information available</em>
          </Typography>
        )}
      </Paper>
    </Grid>
  ))}
</Grid>

<Modal
  open={isBranchModalOpen && !selectedBranch} // Show this modal only for adding a new branch
  onClose={(event, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setIsBranchModalOpen(false);
  }}
  aria-labelledby="add-branch-modal"
  aria-describedby="add-branch-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '600px',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      borderRadius: '16px', // Rounded border
    }}
  >
    <Typography variant="h6" component="h2" sx={{ marginBottom: '16px', textAlign: 'center' }}>
      Add New Branch
    </Typography>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr', // Two columns
        gap: '16px', // Spacing between fields
      }}
    >
<TextField
  label="Branch Name"
  variant="outlined"
  fullWidth
  name="name"
  value={newBranch.name}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, name: false })); // Clear error
  }}
  error={validationErrors.name}
  helperText={validationErrors.name ? "Branch Name is required" : ""}
/>

<TextField
  label="Branch Code"
  variant="outlined"
  fullWidth
  name="branchCode"
  value={newBranch.branchCode}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, branchCode: false })); // Clear error
  }}
  error={validationErrors.branchCode}
  helperText={validationErrors.branchCode ? "Branch Code is required" : ""}
/>
<TextField
  label="Branch Manager"
  variant="outlined"
  fullWidth
  name="manager"
  value={newBranch.manager}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, manager: false })); // Clear error
  }}
  error={validationErrors.manager}
  helperText={validationErrors.manager ? "Branch Manager is required" : ""}
/>

<TextField
  label="Address"
  variant="outlined"
  fullWidth
  name="address"
  value={newBranch.address}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, address: false })); // Clear error
  }}
  error={validationErrors.address}
  helperText={validationErrors.address ? "Address is required" : ""}
/>

<TextField
  label="City"
  variant="outlined"
  fullWidth
  name="city"
  value={newBranch.city}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, city: false })); // Clear error
  }}
  error={validationErrors.city}
  helperText={validationErrors.city ? "City is required" : ""}
/>

<TextField
  label="Email"
  variant="outlined"
  fullWidth
  name="email"
  value={newBranch.email}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, email: false })); // Clear error
  }}
  error={validationErrors.email}
  helperText={validationErrors.email ? "Email is required" : ""}
/>

<TextField
  label="Date Open"
  variant="outlined"
  fullWidth
  name="dateOpen"
  value={newBranch.dateOpen}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, dateOpen: false })); // Clear error
  }}
  error={validationErrors.dateOpen}
  helperText={validationErrors.dateOpen ? "Date Open is required" : ""}
/>

<TextField
  label="Contact Number"
  variant="outlined"
  fullWidth
  name="contactNumber"
  value={newBranch.contactNumber}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, contactNumber: false })); // Clear error
  }}
  error={validationErrors.contactNumber}
  helperText={validationErrors.contactNumber ? "Contact Number is required" : ""}
/>
</Box>
<Box
      sx={{
        display: 'flex',          // Align buttons horizontally
        justifyContent: 'flex-end', // Align buttons to the left
        gap: '16px',              // Space between buttons
        marginTop: '24px',
      }}
    >
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setIsBranchModalOpen(false)}
        sx={{ textTransform: 'none' }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddBranch}
        sx={{ textTransform: 'none' }}
      >
        Add Branch
      </Button>
    </Box>
  </Box>
</Modal>

<Modal
  open={isBranchModalOpen && !!selectedBranch} // Show this modal only for viewing branch details
  onClose={handleCloseBranchModal}
  aria-labelledby="branch-details-modal"
  aria-describedby="branch-details-description"
>
  <Slide direction="left" timeout={750} in={isBranchModalOpen && !!selectedBranch} mountOnEnter unmountOnExit>
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100vh',
        width: '60%',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        overflowY: 'auto',
        borderRadius: '8px',
      }}
    >
      {selectedBranch && (
        <>
          {/* Upper Section Box */}
          <Box
            sx={{
              border: '1px solid #000000',
              borderRadius: '8px',
              padding: '64px',
              marginBottom: '24px',
            }}
          >
            {/* Header with Branch Name, Code, and Edit Button */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              {/* Left Side: Name and Code */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 'bold', marginRight: '8px' }}
                >
                  {selectedBranch.name}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'medium',
                    color: 'text.secondary',
                    backgroundColor: '#f0f0f0',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {selectedBranch.branchCode}
                </Typography>
              </Box>

              {/* Right Side: Edit Button */}
              <Button
                variant="outlined"
                onClick={handleOpenEditBranchModal}
                sx={{ textTransform: 'none' }}
              >
                Edit Branch
              </Button>
            </Box>

            {/* Two Columns for Additional Info */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
              <Typography variant="body1">
  <strong>Branch Manager:</strong>{" "}
  {selectedBranch.manager || "No Manager Assigned"} {/* Display manager directly */}
</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Address:</strong> {selectedBranch.address}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>City:</strong> {selectedBranch.city}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Email:</strong> {selectedBranch.email}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Date Open:</strong> {selectedBranch.dateOpen}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Contact Number:</strong> {selectedBranch.contactNumber}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Modal
  open={isEditBranchModalOpen}
  onClose={(event, reason) => {
    if (reason === "backdropClick") {
      return;
    }
    setIsEditBranchModalOpen(false);
  }}
  aria-labelledby="edit-branch-modal"
  aria-describedby="edit-branch-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '600px',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      borderRadius: '16px', // Rounded border
    }}
  >
    <Typography variant="h6" component="h2" sx={{ marginBottom: '16px', textAlign: 'center' }}>
      Edit Branch
    </Typography>
    <Box
  sx={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr", // Two columns
    gap: "16px", // Spacing between fields
  }}
>
  <TextField
    label="Branch Name"
    variant="outlined"
    fullWidth
    name="name" // Must match newBranch.name
    value={newBranch.name}
    onChange={handleInputChange}
    error={validationErrors.name}
    helperText={validationErrors.name ? "Branch Name is required" : ""}
  />

  <TextField
    label="Branch Code"
    variant="outlined"
    fullWidth
    name="branchCode" // Must match newBranch.branchCode
    value={newBranch.branchCode}
    onChange={handleInputChange}
    error={validationErrors.branchCode}
    helperText={validationErrors.branchCode ? "Branch Code is required" : ""}
  />
<TextField
  label="Branch Manager"
  variant="outlined"
  fullWidth
  name="manager" // Ensure this matches the name field in newBranch
  value={newBranch.manager}
  onChange={handleInputChange} // Update newBranch manager
  error={validationErrors.manager}
  helperText={validationErrors.manager ? "Branch Manager is required" : ""}
/>


  <TextField
    label="Address"
    variant="outlined"
    fullWidth
    name="address" // Must match newBranch.address
    value={newBranch.address}
    onChange={handleInputChange}
    error={validationErrors.address}
    helperText={validationErrors.address ? "Address is required" : ""}
  />

  <TextField
    label="City"
    variant="outlined"
    fullWidth
    name="city" // Must match newBranch.city
    value={newBranch.city}
    onChange={handleInputChange}
    error={validationErrors.city}
    helperText={validationErrors.city ? "City is required" : ""}
  />

  <TextField
    label="Email"
    variant="outlined"
    fullWidth
    name="email" // Must match newBranch.email
    value={newBranch.email}
    onChange={handleInputChange}
    error={validationErrors.email}
    helperText={validationErrors.email ? "Email is required" : ""}
  />

  <TextField
    label="Date Open"
    variant="outlined"
    fullWidth
    name="dateOpen" // Must match newBranch.dateOpen
    value={newBranch.dateOpen}
    onChange={handleInputChange}
    error={validationErrors.dateOpen}
    helperText={validationErrors.dateOpen ? "Date Open is required" : ""}
  />

<TextField
  label="Contact Number"
  variant="outlined"
  fullWidth
  name="contactNumber" // Ensure this matches the name field in newBranch
  value={newBranch.contactNumber}
  onChange={handleInputChange} // Update newBranch contactNumber
  error={validationErrors.contactNumber}
  helperText={validationErrors.contactNumber ? "Contact Number is required" : ""}
/>
</Box>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '16px',
        marginTop: '24px',
      }}
    >
      <Button
  variant="outlined"
  color="secondary"
  onClick={() => {
    setIsEditBranchModalOpen(false);
    setValidationErrors({
      name: false,
      branchCode: false,
      address: false,
      manager: false,
      city: false,
      email: false,
      dateOpen: false,
      contactNumber: false,
    });
  }}
  sx={{ textTransform: 'none', marginRight: '8px' }}
>
  Cancel
</Button>
      <Button
  variant="contained"
  color="primary"
  onClick={handleSaveEditedBranch}
  sx={{ textTransform: "none" }}
>
  Save Changes
</Button>

    </Box>
  </Box>
</Modal>

          {/* Lower Section Box */}
          <Box
            sx={{
              border: '1px solid #000000',
              borderRadius: '8px',
              padding: '64px',
            }}
          >
            {/* Contacts Table */}
            <TableContainer component={MuiPaper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Contact Number</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedBranch.contacts.map((contact: any) => (
                    <TableRow key={contact.id}>
                      <TableCell>{contact.name}</TableCell>
                      <TableCell>{contact.contactNumber}</TableCell>
                      <TableCell>{contact.position}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>
                      <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    {/* View Button with Icon */}
    <Button
      onClick={() => handleViewContact(contact)}
      variant="outlined"
      color="primary"
      sx={{
        minWidth: '40px',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'none',
      }}
    >
      <VisibilityIcon />
    </Button>

    {/* Edit Button with Consistent Style */}
    <Button
      onClick={() => handleEditContact(contact)}
      variant="outlined"
      color="primary"
      sx={{
        minWidth: '40px',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'none',
      }}
    >
      Edit
    </Button>

    {/* Delete Button with Consistent Style */}
    <Button
  onClick={() => handleDeleteContact(contact)}
  variant="outlined"
  color="error"
  sx={{
    minWidth: '40px',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'none',
  }}
>
  Delete
</Button>
<Modal
  open={isDeleteContactConfirmOpen}
  onClose={handleCloseDeleteContactConfirm}
  aria-labelledby="delete-contact-confirmation"
  aria-describedby="delete-contact-confirmation-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '400px',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      borderRadius: '8px',
      textAlign: 'center',
    }}
  >
    <Typography variant="h6" component="h2" sx={{ marginBottom: '16px' }}>
      Confirm Deletion
    </Typography>
    <Typography variant="body1" sx={{ marginBottom: '16px' }}>
      Are you sure you want to delete the contact "{contactToDelete?.name}"?
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleCloseDeleteContactConfirm}
        sx={{ textTransform: 'none' }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={confirmDeleteContact}
        sx={{ textTransform: 'none' }}
      >
        Delete
      </Button>
    </Box>
  </Box>
</Modal>
  </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      marginTop: '16px',
    }}
  >
    <Button
  variant="contained"
  color="primary"
  onClick={() => {
    setContactForm({
      name: '',
      position: '',
      employeeId: '',
      email: '',
      username: '',
      contactNumber: '',
    }); // Clear the contact form fields
    setContactValidationErrors({
      name: false,
      position: false,
      employeeId: false,
      email: false,
      username: false,
      contactNumber: false,
    }); // Reset validation errors
    setIsAddContactModalOpen(true); // Open the modal
  }}
  sx={{
    backgroundColor: '#01A768',
    color: 'white',
    '&:hover': {
      backgroundColor: '#017F4A',
    },
  }}
>
  Add Contact
</Button>
  </Box>
          </Box>
        </>
      )}
     <Box
  sx={{
    display: 'flex',
    justifyContent: 'flex-end', // Aligns content to the right
    marginTop: '24px', // Adds spacing above the button
  }}
>
  <Button
    variant="outlined"
    color="error"
    onClick={handleOpenDeleteConfirm}
    sx={{
      textTransform: 'none',
      padding: '12px 24px', // Increases the size of the button
      fontSize: '16px', // Slightly larger font
      minWidth: '150px', // Ensures the button is wide enough
    }}
  >
    Delete Branch
  </Button>
</Box>

<Modal
  open={isDeleteConfirmOpen}
  onClose={handleCloseDeleteConfirm}
  aria-labelledby="delete-branch-confirmation"
  aria-describedby="delete-branch-confirmation-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '400px',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      borderRadius: '8px',
      textAlign: 'center',
    }}
  >
    <Typography variant="h6" component="h2" sx={{ marginBottom: '16px' }}>
      Confirm Deletion
    </Typography>
    <Typography variant="body1" sx={{ marginBottom: '16px' }}>
      Are you sure you want to delete the branch "{selectedBranch?.name}"?
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleCloseDeleteConfirm}
        sx={{ textTransform: 'none' }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={handleDeleteBranch}
        sx={{ textTransform: 'none'}}
      >
        Delete
      </Button>
    </Box>
  </Box>
</Modal>
    </Box>
  </Slide>
</Modal>

<Modal
  open={isViewModalOpen}
  onClose={(event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return; // Prevent closing the modal by clicking outside or pressing escape
    }
    setIsViewModalOpen(false);
  }}
  aria-labelledby="view-contact-modal"
  aria-describedby="view-contact-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '600px',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      borderRadius: '8px',
    }}
  >
    <Typography variant="h6" component="h2" sx={{ marginBottom: '16px', textAlign: 'center' }}>
      Contact Information
    </Typography>
    {viewedContact && (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Full Name:</strong> {viewedContact.name || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Position:</strong> {viewedContact.position || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Employee ID:</strong> {viewedContact.employeeId || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Email:</strong> {viewedContact.email || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Username:</strong> {viewedContact.username || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Contact Number:</strong> {viewedContact.contactNumber || 'N/A'}
          </Typography>
        </Grid>
      </Grid>
    )}
    <Box sx={{ textAlign: 'center', marginTop: '16px' }}>
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setIsViewModalOpen(false)}
        sx={{ textTransform: 'none' }}
      >
        Close
      </Button>
    </Box>
  </Box>
</Modal>

      {/* Modal for Editing Contact */}
      <Modal
  open={isEditModalOpen}
  onClose={(event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return;
    }
    setIsEditModalOpen(false);
  }}
  aria-labelledby="edit-contact-modal"
  aria-describedby="edit-contact-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '600px',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      borderRadius: '8px',
    }}
  >
    <Typography variant="h6" component="h2" sx={{ marginBottom: '16px', textAlign: 'center' }}>
      Edit Contact Information
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label="Full Name"
          variant="outlined"
          fullWidth
          name="name"
          value={contactForm.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleContactInputChange(e);
            setContactValidationErrors((prev) => ({ ...prev, name: false }));
          }}
          error={contactValidationErrors.name}
          helperText={contactValidationErrors.name ? "Full Name is required" : ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Position"
          variant="outlined"
          fullWidth
          name="position"
          value={contactForm.position}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleContactInputChange(e);
            setContactValidationErrors((prev) => ({ ...prev, position: false }));
          }}
          error={contactValidationErrors.position}
          helperText={contactValidationErrors.position ? "Position is required" : ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Employee ID"
          variant="outlined"
          fullWidth
          name="employeeId"
          value={contactForm.employeeId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleContactInputChange(e);
            setContactValidationErrors((prev) => ({ ...prev, employeeId: false }));
          }}
          error={contactValidationErrors.employeeId}
          helperText={contactValidationErrors.employeeId ? "Employee ID is required" : ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          name="email"
          value={contactForm.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleContactInputChange(e);
            setContactValidationErrors((prev) => ({ ...prev, email: false }));
          }}
          error={contactValidationErrors.email}
          helperText={contactValidationErrors.email ? "Email is required" : ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          name="username"
          value={contactForm.username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleContactInputChange(e);
            setContactValidationErrors((prev) => ({ ...prev, username: false }));
          }}
          error={contactValidationErrors.username}
          helperText={contactValidationErrors.username ? "Username is required" : ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Contact Number"
          variant="outlined"
          fullWidth
          name="contactNumber"
          value={contactForm.contactNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleContactInputChange(e);
            setContactValidationErrors((prev) => ({ ...prev, contactNumber: false }));
          }}
          error={contactValidationErrors.contactNumber}
          helperText={contactValidationErrors.contactNumber ? "Contact Number is required" : ""}
        />
      </Grid>
    </Grid>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '16px',
      }}
    >
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => {
          setIsEditModalOpen(false);
          setContactValidationErrors({
            name: false,
            position: false,
            employeeId: false,
            email: false,
            username: false,
            contactNumber: false,
          });
        }}
        sx={{ textTransform: 'none', marginRight: '8px' }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveContact}
        sx={{ textTransform: 'none' }}
      >
        Save Changes
      </Button>
    </Box>
  </Box>
</Modal>

      {/* Modal for Adding New Contact */}
      <Modal
  open={isAddContactModalOpen}
  onClose={handleCloseAddContactModal}
  aria-labelledby="add-contact-modal"
  aria-describedby="add-contact-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '600px',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      borderRadius: '8px',
    }}
  >
    <Typography variant="h6" component="h2" sx={{ marginBottom: '16px', textAlign: 'center' }}>
      Add New Contact
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={6}>
      <TextField
  label="Full Name"
  variant="outlined"
  fullWidth
  name="name"
  value={contactForm.name}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    handleContactInputChange(e);
    setContactValidationErrors((prev) => ({ ...prev, name: false }));
  }}
  error={contactValidationErrors.name}
  helperText={contactValidationErrors.name ? "Full Name is required" : ""}
/>

      </Grid>
      <Grid item xs={6}>
      <TextField
  label="Position"
  variant="outlined"
  fullWidth
  name="position"
  value={contactForm.position}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    handleContactInputChange(e);
    setContactValidationErrors((prev) => ({ ...prev, position: false }));
  }}
  error={contactValidationErrors.position}
  helperText={contactValidationErrors.position ? "Position is required" : ""}
/>
      </Grid>
      <Grid item xs={6}>
      <TextField
  label="Employee ID"
  variant="outlined"
  fullWidth
  name="employeeId"
  value={contactForm.employeeId}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    handleContactInputChange(e);
    setContactValidationErrors((prev) => ({ ...prev, employeeId: false }));
  }}
  error={contactValidationErrors.employeeId}
  helperText={contactValidationErrors.employeeId ? "Employee ID is required" : ""}
/>
      </Grid>
      <Grid item xs={6}>
      <TextField
  label="Email"
  variant="outlined"
  fullWidth
  name="email"
  value={contactForm.email}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    handleContactInputChange(e);
    setContactValidationErrors((prev) => ({ ...prev, email: false }));
  }}
  error={contactValidationErrors.email}
  helperText={contactValidationErrors.email ? "Email is required" : ""}
/>
      </Grid>
      <Grid item xs={6}>
      <TextField
  label="Username"
  variant="outlined"
  fullWidth
  name="username"
  value={contactForm.username}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    handleContactInputChange(e);
    setContactValidationErrors((prev) => ({ ...prev, username: false }));
  }}
  error={contactValidationErrors.username}
  helperText={contactValidationErrors.username ? "Username is required" : ""}
/>
      </Grid>
      <Grid item xs={6}>
      <TextField
  label="Contact Number"
  variant="outlined"
  fullWidth
  name="contactNumber"
  value={contactForm.contactNumber}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    handleContactInputChange(e);
    setContactValidationErrors((prev) => ({ ...prev, contactNumber: false }));
  }}
  error={contactValidationErrors.contactNumber}
  helperText={contactValidationErrors.contactNumber ? "Contact Number is required" : ""}
/>
      </Grid>
    </Grid>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '16px',
      }}
    >
    <Button
  variant="outlined"
  color="secondary"
  onClick={handleCloseAddContactModal}
  sx={{ textTransform: 'none', marginRight: '8px' }}
>
  Cancel
</Button>

      <Button
        variant="contained"
        color="primary"
        onClick={handleAddNewContact}
        sx={{ textTransform: 'none' }}
      >
        Add Contact
      </Button>
    </Box>
  </Box>
</Modal>
    </Box>
  );
};

export default BranchesPage;