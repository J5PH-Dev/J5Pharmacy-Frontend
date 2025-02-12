import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Grid
} from '@mui/material';
import { DiscountType } from '../../types/discount';

interface TransactionSummaryProps {
  invoiceNumber: string;
  customerName?: string;
  starPointsId?: string;
  subtotal: number;
  pointsEarned: number;
  discountType: DiscountType;
  discountAmount: number;
  total: number;
  branchCode: string;
  pointsBalance: number;
  pointsUsed: number;
}

const calculateFinalTotal = (subtotal: number, discountAmount: number) => {
  return Math.max(subtotal - discountAmount, 0)
}

const SummaryItem: React.FC<{
  label: string;
  value: string | number;
  bold?: boolean;
  valueStyle?: React.CSSProperties;
}> = ({ label, value, bold, valueStyle }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      py: 0.5
    }}
  >
    <Typography 
      variant="body1" 
      fontWeight={bold ? 600 : 400}
      color="text.secondary"
    >
      {label}
    </Typography>
    <Typography 
      variant="body1" 
      fontWeight={bold ? 600 : 400}
      sx={{ color: 'text.primary', ...valueStyle }}
    >
      {typeof value === 'number' 
        ? `₱${value.toFixed(2)}` 
        : value}
    </Typography>
  </Box>
);

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  invoiceNumber,
  customerName,
  starPointsId,
  subtotal,
  pointsEarned,
  discountType,
  discountAmount,
  total,
  branchCode,
  pointsBalance = 0,
  pointsUsed = 0,
}) => {
  // Calculate points discount amount
  const pointsDiscountAmount = discountType === 'Points' ? pointsUsed * 20 : 0;
  const finalTotal = subtotal - (discountType === 'Points' ? pointsDiscountAmount : discountAmount);

  return (
    <Box sx={{ height: '100%', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Transaction Summary
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
          <SummaryItem label="Invoice #" value={invoiceNumber} />
          <SummaryItem label="Customer Name" value={customerName || 'Walk-in Customer'} />
          <SummaryItem label="StarPoints ID" value={starPointsId || '001'} />
          <SummaryItem label="Points Balance" value={pointsBalance.toFixed(2)} />

          <Divider sx={{ my: 2 }} />

          <SummaryItem label="Subtotal" value={subtotal} />
          
          <SummaryItem 
            label="StarPoints Earned" 
            value={`+${pointsEarned.toFixed(2)}`} 
            valueStyle={{ color: 'green' }}
          />

          <SummaryItem label="Discount Type" value={discountType} />
          {discountType === 'Points' ? (
            <>
              <SummaryItem 
                label="Points Used" 
                value={`-${pointsUsed.toFixed(2)}`}
                valueStyle={{ color: 'error.main' }}
              />
              <SummaryItem 
                label="Points Discount Amount" 
                value={-pointsDiscountAmount} 
                valueStyle={{ color: 'error.main' }}
              />
            </>
          ) : (
            <SummaryItem 
              label="Discount Amount" 
              value={-discountAmount}
              valueStyle={{ color: 'error.main' }}
            />
          )}

          <Divider sx={{ my: 2 }} />

          <SummaryItem 
            label="Total" 
            value={Math.max(finalTotal, 0)} 
            bold 
          />
        </Paper>
      </Stack>
    </Box>
  );
};

export default TransactionSummary;
