import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

const InfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  height: '100%',
  padding: theme.spacing(1, 3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const InfoRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
});

const InfoText = styled(Typography)({
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const TimeText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.6rem',
  letterSpacing: '0.5px',
  lineHeight: 1,
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.8rem',
  },
}));

const DateText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.2rem',
  letterSpacing: '0.5px',
  opacity: 0.9,
  lineHeight: 1,
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.4rem',
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
    }, 1000);

    return () => clearInterval(interval);
  }, [branchId]);

  return (
    <InfoContainer>
      <Stack spacing={1} width="100%">
        <InfoRow>
          <InfoText sx={{ fontSize: '1.2rem', minWidth: 0, flex: 1, mr: 2 }}>
            Transaction ID: {transactionId}
          </InfoText>
          <TimeText>
            {format(currentDateTime, 'hh:mm:ss a')}
          </TimeText>
        </InfoRow>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <DateText>
            {format(currentDateTime, 'MMMM dd, yyyy')}
          </DateText>
        </Box>
      </Stack>
    </InfoContainer>
  );
};

export default TransactionInfo;
