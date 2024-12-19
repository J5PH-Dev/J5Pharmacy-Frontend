import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Box,
    Paper,
    Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface Denomination {
    value: number;
    count: number;
    label: string;
}

interface CashReconciliationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reconciliationData: any) => void;
    sessionData: {
        totalTransactions: number;
        totalAmount: number;
        pharmacistName: string;
        pharmacistCode: string;
        branchId: number;
        branchName: string;
        sessionId: number;
    };
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default
}));

const AmountDisplay = styled(Typography)<{ colorVariant?: 'positive' | 'negative' | 'neutral' }>(({ theme, colorVariant }) => ({
    fontWeight: 'bold',
    color: colorVariant === 'positive' 
        ? theme.palette.success.main 
        : colorVariant === 'negative' 
            ? theme.palette.error.main 
            : theme.palette.text.primary
}));

const CashReconciliationDialog: React.FC<CashReconciliationDialogProps> = ({
    open,
    onClose,
    onConfirm,
    sessionData
}) => {
    const denominations: Denomination[] = [
        { value: 1000, count: 0, label: '₱1000' },
        { value: 500, count: 0, label: '₱500' },
        { value: 200, count: 0, label: '₱200' },
        { value: 100, count: 0, label: '₱100' },
        { value: 50, count: 0, label: '₱50' },
        { value: 20, count: 0, label: '₱20' },
        { value: 10, count: 0, label: '₱10' },
        { value: 5, count: 0, label: '₱5' },
        { value: 1, count: 0, label: '₱1' },
        { value: 0.1, count: 0, label: '10¢' }
    ];

    const [counts, setCounts] = useState<{ [key: number]: number }>(
        denominations.reduce((acc, d) => ({ ...acc, [d.value]: 0 }), {})
    );
    
    const [totalCounted, setTotalCounted] = useState(0);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        // Calculate total counted amount
        const total = Object.entries(counts).reduce(
            (sum, [value, count]) => sum + (parseFloat(value) * count),
            0
        );
        setTotalCounted(total);
        setBalance(total - sessionData.totalAmount);
    }, [counts, sessionData.totalAmount]);

    const handleCountChange = (value: number, newCount: string) => {
        const count = parseInt(newCount) || 0;
        if (count >= 0) {
            setCounts(prev => ({ ...prev, [value]: count }));
        }
    };

    const handleConfirm = () => {
        const reconciliationData = {
            pharmacist_session_id: sessionData.sessionId,
            total_transactions: sessionData.totalTransactions,
            total_amount: sessionData.totalAmount,
            cash_counted: totalCounted,
            balance: balance,
            denomination_1000: counts[1000],
            denomination_500: counts[500],
            denomination_200: counts[200],
            denomination_100: counts[100],
            denomination_50: counts[50],
            denomination_20: counts[20],
            denomination_10: counts[10],
            denomination_5: counts[5],
            denomination_1: counts[1],
            denomination_cents: counts[0.1],
            status: balance === 0 ? 'balanced' : balance < 0 ? 'shortage' : 'overage'
        };
        onConfirm(reconciliationData);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h5" fontWeight="bold">Cash Reconciliation</Typography>
            </DialogTitle>
            <DialogContent>
                <StyledPaper elevation={0}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="subtitle1">Pharmacist: {sessionData.pharmacistName}</Typography>
                            <Typography variant="subtitle1">Code: {sessionData.pharmacistCode}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle1">Branch: {sessionData.branchName}</Typography>
                            <Typography variant="subtitle1">Branch ID: {sessionData.branchId}</Typography>
                        </Grid>
                    </Grid>
                </StyledPaper>

                <StyledPaper elevation={0}>
                    <Typography variant="h6" gutterBottom>Session Summary</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography>Total Transactions:</Typography>
                            <Typography variant="h6">{sessionData.totalTransactions}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography>Total Amount:</Typography>
                            <Typography variant="h6">₱{sessionData.totalAmount.toFixed(2)}</Typography>
                        </Grid>
                    </Grid>
                </StyledPaper>

                <StyledPaper elevation={0}>
                    <Typography variant="h6" gutterBottom>Cash Count</Typography>
                    <Grid container spacing={2}>
                        {denominations.map((denom) => (
                            <Grid item xs={6} sm={4} key={denom.value}>
                                <TextField
                                    label={denom.label}
                                    type="number"
                                    value={counts[denom.value]}
                                    onChange={(e) => handleCountChange(denom.value, e.target.value)}
                                    fullWidth
                                    InputProps={{
                                        inputProps: { min: 0 }
                                    }}
                                />
                                <Typography variant="caption" color="textSecondary">
                                    Total: ₱{(denom.value * counts[denom.value]).toFixed(2)}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>
                </StyledPaper>

                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle1">Total Counted:</Typography>
                            <Typography variant="h6">₱{totalCounted.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle1">Balance:</Typography>
                            <AmountDisplay 
                                colorVariant={balance === 0 ? 'neutral' : balance > 0 ? 'positive' : 'negative'}
                                variant="h6"
                            >
                                {balance === 0 
                                    ? '₱0.00' 
                                    : balance > 0 
                                        ? `(₱${balance.toFixed(2)})` 
                                        : `-₱${Math.abs(balance).toFixed(2)}`}
                            </AmountDisplay>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button 
                    onClick={handleConfirm} 
                    variant="contained" 
                    color="primary"
                >
                    Confirm & Print Report
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CashReconciliationDialog; 