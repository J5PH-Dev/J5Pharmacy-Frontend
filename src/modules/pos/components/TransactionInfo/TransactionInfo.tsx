import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import format from 'date-fns/format';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const InfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '100%',
  padding: theme.spacing(1, 3),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const LeftSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: theme.spacing(0.5),
}));

const StatusText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  letterSpacing: '0.5px',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.2rem',
  },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  letterSpacing: '0.5px',
  color: theme.palette.text.secondary,
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.2rem',
  },
}));

const TimeText = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '1.8rem',
  letterSpacing: '0.5px',
  lineHeight: 1,
  color: theme.palette.primary.main,
  [theme.breakpoints.up('sm')]: {
    fontSize: '2rem',
  },
}));

const DateText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.3rem',
  letterSpacing: '0.5px',
  opacity: 0.9,
  lineHeight: 1,
  color: theme.palette.text.secondary,
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.5rem',
  },
}));

const StatusContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const BranchContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const StyledLocationIcon = styled(LocationOnIcon)(({ theme }) => ({
  fontSize: '1.3rem',
  color: theme.palette.text.secondary,
}));

const StyledStatusIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '1.3rem',
  },
}));

interface TransactionInfoProps {
  branchId?: string;
}

const generateTransactionId = (branchId: string): string => {
  const now = new Date();
  const dateStr = format(now, 'yyMMdd');
  // In a real application, this number would come from a database or counter service
  const sequenceNumber = '00001';
  return `${branchId}-${dateStr}-${sequenceNumber}`;
};

const TransactionInfo: React.FC<TransactionInfoProps> = ({ 
  branchId = 'B001' // Default branch ID
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [transactionId, setTransactionId] = useState('');
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    // Generate initial transaction ID
    setTransactionId(generateTransactionId(branchId));

    // Update time every second
    const interval = setInterval(() => {
      const newDate = new Date();
      setCurrentDateTime(newDate);
      
      // Update transaction ID at midnight
      if (newDate.getHours() === 0 && newDate.getMinutes() === 0 && newDate.getSeconds() === 0) {
        setTransactionId(generateTransactionId(branchId));
      }

      // Check network status
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    }, 1000);

    // Add network status listeners
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [branchId]);

  return (
    <InfoContainer>
      <LeftSection>
        <TimeText>
          {format(currentDateTime, 'hh:mm:ss a')}
        </TimeText>
        <DateText>
          {format(currentDateTime, 'MMMM dd, yyyy')}
        </DateText>
      </LeftSection>

      <RightSection>
        <StatusContainer>
          <StyledStatusIcon>
            {networkStatus === 'online' 
              ? <CheckCircleIcon color="success" />
              : <CancelIcon color="error" />
            }
          </StyledStatusIcon>
          <StatusText sx={{ color: networkStatus === 'online' ? 'success.main' : 'error.main' }}>
            System {networkStatus.toUpperCase()}
          </StatusText>
        </StatusContainer>
        <BranchContainer>
          <StyledLocationIcon />
          <InfoLabel>
            Branch: Bagong Silang
          </InfoLabel>
        </BranchContainer>
      </RightSection>
    </InfoContainer>
  );
};

export default TransactionInfo;
