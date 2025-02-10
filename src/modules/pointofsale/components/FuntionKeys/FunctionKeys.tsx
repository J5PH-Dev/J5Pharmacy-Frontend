import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Stack, 
  Typography,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import RestoreIcon from '@mui/icons-material/Restore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import UndoIcon from '@mui/icons-material/Undo';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

import { CartItem } from '../../types/cart';
import NewTransaction from './dialogs/NewTransaction';
import SearchProduct from './dialogs/SearchProduct';
import HoldTransaction from './dialogs/HoldTransaction';
import RecallTransaction from './dialogs/RecallTransaction';
import ViewReports from './dialogs/ViewReports';
import Prescription from './dialogs/Prescription';
import ProcessReturn from './dialogs/ProcessReturn';
import { useAuth } from '../../../auth/contexts/AuthContext';

interface FunctionKeysProps {
  onLogout: () => void;
  onAddProduct: (product: CartItem) => void;
  currentItems: CartItem[];
  currentTotal: number;
  branchId: number;
  onRecallTransaction: (items: CartItem[]) => void;
  onHoldSuccess: () => void;
}

const FunctionKeys: React.FC<FunctionKeysProps> = ({
  onLogout,
  onAddProduct,
  currentItems,
  currentTotal,
  branchId,
  onRecallTransaction,
  onHoldSuccess
}) => {
  const [openNewTransaction, setOpenNewTransaction] = useState(false);
  const [openSearchProduct, setOpenSearchProduct] = useState(false);
  const [openHoldTransaction, setOpenHoldTransaction] = useState(false);
  const [openRecallTransaction, setOpenRecallTransaction] = useState(false);
  const [openViewReports, setOpenViewReports] = useState(false);
  const [openPrescription, setOpenPrescription] = useState(false);
  const [openProcessReturn, setOpenProcessReturn] = useState(false);

  const { currentSession } = useAuth();


  const handleLogout = async () => {
    try {
      if (currentSession?.salesSessionId) {
        console.log('Ending session:', currentSession.salesSessionId);
        console.log('Ending session with:', {
          salesSessionId: currentSession?.salesSessionId,
          pharmacistSessionId: currentSession?.pharmacistSessionId
        });
        
        await axios.post(
          '/api/auth/end-pharmacist-session', 
          {},
          { 
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            withCredentials: true
          }
        );
      }
    } catch (error) {
      console.error('Session end error:', error);
    } finally {
      localStorage.removeItem('token');
      onLogout();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.match(/F\d+/)) {
        event.preventDefault();
      }

      switch (event.key) {
        case 'F1':
          setOpenNewTransaction(true);
          break;
        case 'F2':
          setOpenSearchProduct(true);
          break;
        case 'F3':
          setOpenHoldTransaction(true);
          break;
        case 'F4':
          setOpenRecallTransaction(true);
          break;
        case 'F5':
          setOpenViewReports(true);
          break;
        case 'F6':
          setOpenPrescription(true);
          break;
        case 'F7':
          setOpenProcessReturn(true);
          break;
        case 'F12':
          handleLogout();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLogout]);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Function Keys
      </Typography>
      
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenNewTransaction(true)}
        >
          F1 - New Transaction
        </Button>

        <Button
          fullWidth
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={() => setOpenSearchProduct(true)}
        >
          F2 - Search Product
        </Button>

        <Divider />

        <Button
          fullWidth
          variant="contained"
          startIcon={<PauseCircleIcon />}
          onClick={() => setOpenHoldTransaction(true)}
        >
          F3 - Hold Transaction
        </Button>

        <Button
          fullWidth
          variant="contained"
          startIcon={<RestoreIcon />}
          onClick={() => setOpenRecallTransaction(true)}
        >
          F4 - Recall Transaction
        </Button>

        <Divider />

        <Button
          fullWidth
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={() => setOpenViewReports(true)}
        >
          F5 - View Reports
        </Button>

        <Button
          fullWidth
          variant="contained"
          startIcon={<MedicalInformationIcon />}
          onClick={() => setOpenPrescription(true)}
        >
          F6 - Prescription
        </Button>

        <Button
          fullWidth
          variant="contained"
          startIcon={<UndoIcon />}
          onClick={() => setOpenProcessReturn(true)}
        >
          F7 - Process Return
        </Button>

        {/* <Button
          fullWidth
          variant="contained"
          startIcon={<ReceiptLongIcon />}
          onClick={() => }
        >
          Reprint Receipt
        </Button> */}
      </Stack>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ my: 2 }} />

      <Button
        fullWidth
        variant="contained"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{
          bgcolor: 'error.main',
          '&:hover': {
            bgcolor: 'error.dark'
          }
        }}
      >
        F12 - Logout
      </Button>

      {/* Dialogs */}
      <NewTransaction
        open={openNewTransaction}
        onClose={() => setOpenNewTransaction(false)}
        currentItems={currentItems}
      />

      <SearchProduct
        open={openSearchProduct}
        onClose={() => setOpenSearchProduct(false)}
        onAddProduct={onAddProduct}
        branchId={branchId}
      />

      <HoldTransaction
        open={openHoldTransaction}
        onClose={() => setOpenHoldTransaction(false)}
        currentItems={currentItems}
        currentTotal={currentTotal}
        onHoldSuccess={onHoldSuccess}
      />

      <RecallTransaction
        open={openRecallTransaction}
        onClose={() => setOpenRecallTransaction(false)}
        onRecall={onRecallTransaction}
      />


      <ViewReports
        open={openViewReports}
        onClose={() => setOpenViewReports(false)}
      />

      <Prescription
        open={openPrescription}
        onClose={() => setOpenPrescription(false)}
        onSave={() => {}}
        customerId={0}
        prescriptionItems={[]}
      />

      <ProcessReturn
        open={openProcessReturn}
        onClose={() => setOpenProcessReturn(false)}
      />
    </Box>
  );
};

export default FunctionKeys; 