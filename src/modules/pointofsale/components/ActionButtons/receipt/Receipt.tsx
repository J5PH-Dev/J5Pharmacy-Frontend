import React from 'react';
import format from 'date-fns/format';
import { Box, Typography, Divider, Table, TableBody, TableCell, TableRow, useTheme } from '@mui/material';
import { ReceiptProps } from './types';

export const Receipt: React.FC<ReceiptProps> = ({
  transactionId,
  customerName,
  starPointsId,
  items,
  subtotal,
  discountType,
  discountAmount,
  discountedSubtotal,
  vat,
  total,
  starPointsEarned,
  timestamp,
  paymentMethod,
  amountTendered,
  change,
  paymentReferenceId,
  cashierName = '',
  branchId = '',
  branchAddress = 'Bagong Silang, Caloocan City',
  branchContact = 'Tel: (123) 456-7890',
  pointsRedeemed,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 2, fontFamily: 'monospace' }}>
      {/* Header */}
      <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
        J5 PHARMACY
      </Typography>
      <Typography variant="body2" align="center" sx={{ mb: 0.5 }}>
        {branchAddress}
      </Typography>
      <Typography variant="body2" align="center" sx={{ mb: 1 }}>
        {branchContact}
      </Typography>
      <Divider sx={{ my: 1 }} />

      {/* Transaction Info */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Transaction ID: {transactionId}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Date: {format(timestamp, 'MM/dd/yyyy hh:mm:ss a')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Cashier: {cashierName}
        </Typography>
        {customerName && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Customer: {customerName}
          </Typography>
        )}
        {starPointsId && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            StarPoints ID: {starPointsId}
          </Typography>
        )}
      </Box>

      {/* Items */}
      <Table size="small">
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell sx={{ border: 'none', py: 0.5, pl: 0 }}>
                <Typography variant="body2">
                  {item.name}
                  <br />
                  {item.quantity} x ₱{item.price.toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ border: 'none', py: 0.5, pr: 0 }}>
                <Typography variant="body2">₱{(item.price * item.quantity).toFixed(2)}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Divider sx={{ my: 1 }} />

      {/* Totals */}
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell sx={{ border: 'none', py: 0.5, pl: 0 }}>
              <Typography variant="body2">Subtotal:</Typography>
            </TableCell>
            <TableCell align="right" sx={{ border: 'none', py: 0.5, pr: 0 }}>
              <Typography variant="body2">₱{subtotal.toFixed(2)}</Typography>
            </TableCell>
          </TableRow>
          {discountAmount > 0 && (
            <>
              <TableRow>
                <TableCell sx={{ border: 'none', py: 0.5, pl: 0 }}>
                  <Typography variant="body2">Discount ({discountType}):</Typography>
                </TableCell>
                <TableCell align="right" sx={{ border: 'none', py: 0.5, pr: 0 }}>
                  <Typography variant="body2">-₱{discountAmount.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: 'none', py: 0.5, pl: 0 }}>
                  <Typography variant="body2">Discounted Subtotal:</Typography>
                </TableCell>
                <TableCell align="right" sx={{ border: 'none', py: 0.5, pr: 0 }}>
                  <Typography variant="body2">₱{discountedSubtotal.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
            </>
          )}
          <TableRow>
            <TableCell sx={{ border: 'none', py: 0.5, pl: 0 }}>
              <Typography variant="body2">VAT (12%):</Typography>
            </TableCell>
            <TableCell align="right" sx={{ border: 'none', py: 0.5, pr: 0 }}>
              <Typography variant="body2">₱{vat.toFixed(2)}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ border: 'none', py: 0.5, pl: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Total:
              </Typography>
            </TableCell>
            <TableCell align="right" sx={{ border: 'none', py: 0.5, pr: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ₱{total.toFixed(2)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Divider sx={{ my: 1 }} />

      {/* Payment Details */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Payment Method: {paymentMethod}
        </Typography>
        {paymentMethod === 'CASH' && amountTendered !== undefined && (
          <>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Amount Tendered: ₱{amountTendered.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Change: ₱{(change || 0).toFixed(2)}
            </Typography>
          </>
        )}
        {paymentReferenceId && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Reference ID: {paymentReferenceId}
          </Typography>
        )}
      </Box>

      {/* StarPoints */}
      {starPointsEarned !== undefined && starPointsEarned > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            StarPoints Earned: {starPointsEarned}
          </Typography>
        </Box>
      )}

      {/* Points Redeemed */}
      {pointsRedeemed && pointsRedeemed > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Points Redeemed: {pointsRedeemed} (₱{pointsRedeemed * 20})
          </Typography>
        </Box>
      )}

      {/* Footer */}
      <Divider sx={{ my: 1 }} />
      <Typography variant="body2" align="center" sx={{ mb: 0.5 }}>
        Thank you for shopping at J5 Pharmacy!
      </Typography>
      <Typography variant="body2" align="center" sx={{ mb: 0.5 }}>
        This serves as your official receipt.
      </Typography>
    </Box>
  );
};
