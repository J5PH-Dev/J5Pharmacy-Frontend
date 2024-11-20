import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TransactionSummaryProps } from './types';

const SummaryContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
}));

const ContentContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const SummaryRow = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(0.75),
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const TotalRow = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  marginBottom: theme.spacing(2),
}));

const Label = styled(Typography)({
  fontWeight: 500,
  fontSize: '1.05rem',
});

const Value = styled(Typography)({
  textAlign: 'right',
  fontSize: '1.05rem',
});

const TotalText = styled(Typography)({
  fontSize: '1.35rem',
  fontWeight: 900,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
});

const calculateStarPoints = (subtotal: number): number => {
  return Math.floor(subtotal / 200); // 1 point per 200 PHP
};

const getDiscountLabel = (discountType: string, customValue?: number): string => {
  switch (discountType) {
    case 'Senior':
      return '20% Senior Citizen';
    case 'PWD':
      return '20% PWD';
    case 'Employee':
      return '10% Employee';
    case 'Custom':
      return customValue ? `${customValue}% Custom` : '';
    default:
      return '';
  }
};

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  transactionId,
  customerId,
  customerName,
  starPointsId,
  subtotal,
  discountType,
  discountAmount,
  discountedSubtotal,
  vat,
  total,
  customValue,
}) => {
  const starPointsEarned = calculateStarPoints(subtotal);
  const effectiveCustomerId = customerId || transactionId;
  const effectiveStarPointsId = starPointsId || 'N/A';

  return (
    <SummaryContainer>
      <Box sx={{ p: 2, pb: 0 }}>
        <Typography variant="h6" gutterBottom>
          Transaction Summary
        </Typography>
      </Box>
      
      <ContentContainer>
        <Grid container>
          <SummaryRow container alignItems="center">
            <Grid item xs={6}>
              <Label>Invoice #:</Label>
            </Grid>
            <Grid item xs={6}>
              <Value>{transactionId}</Value>
            </Grid>
          </SummaryRow>

          <SummaryRow container alignItems="center">
            <Grid item xs={6}>
              <Label>Customer ID:</Label>
            </Grid>
            <Grid item xs={6}>
              <Value>{effectiveCustomerId}</Value>
            </Grid>
          </SummaryRow>

          <SummaryRow container alignItems="center">
            <Grid item xs={6}>
              <Label>Customer Name:</Label>
            </Grid>
            <Grid item xs={6}>
              <Value>{customerName || 'Walk-in Customer'}</Value>
            </Grid>
          </SummaryRow>

          <SummaryRow container alignItems="center">
            <Grid item xs={6}>
              <Label>StarPoints ID:</Label>
            </Grid>
            <Grid item xs={6}>
              <Value>{effectiveStarPointsId}</Value>
            </Grid>
          </SummaryRow>

          <Box sx={{ mt: 1, mb: 1, mx: 2, borderTop: '2px solid', borderColor: 'divider' }} />

          <SummaryRow container alignItems="center">
            <Grid item xs={6}>
              <Label>Subtotal:</Label>
            </Grid>
            <Grid item xs={6}>
              <Value>₱{subtotal.toFixed(2)}</Value>
            </Grid>
          </SummaryRow>

          <SummaryRow container alignItems="center">
            <Grid item xs={6}>
              <Label>Discount ({discountType !== 'None' ? getDiscountLabel(discountType, customValue) : 'None'}):</Label>
            </Grid>
            <Grid item xs={6}>
              <Value sx={{ color: 'error.main' }}>-₱{discountAmount.toFixed(2)}</Value>
            </Grid>
          </SummaryRow>

          <SummaryRow container alignItems="center">
            <Grid item xs={6}>
              <Label>Discounted Subtotal:</Label>
            </Grid>
            <Grid item xs={6}>
              <Value>₱{discountedSubtotal.toFixed(2)}</Value>
            </Grid>
          </SummaryRow>

          <SummaryRow container alignItems="center">
            <Grid item xs={6}>
              <Label>VAT (12%):</Label>
            </Grid>
            <Grid item xs={6}>
              <Value>₱{vat.toFixed(2)}</Value>
            </Grid>
          </SummaryRow>

          <SummaryRow container alignItems="center">
            <Grid item xs={6}>
              <Label>StarPoints Earned:</Label>
            </Grid>
            <Grid item xs={6}>
              <Value>{starPointsEarned}</Value>
            </Grid>
          </SummaryRow>
        </Grid>

        <Box sx={{ flex: 1, minHeight: '20px' }} />

        <TotalRow container alignItems="center">
          <Grid item xs={6}>
            <TotalText>TOTAL:</TotalText>
          </Grid>
          <Grid item xs={6}>
            <TotalText align="right">₱{total.toFixed(2)}</TotalText>
          </Grid>
        </TotalRow>
      </ContentContainer>
    </SummaryContainer>
  );
};

export default TransactionSummary;
