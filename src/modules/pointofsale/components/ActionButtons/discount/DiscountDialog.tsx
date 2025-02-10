import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  IconButton,
} from "@mui/material"
import type { DiscountType } from "../../../types/discount"
import { Close as CloseIcon } from "@mui/icons-material"

interface DiscountDialogProps {
  open: boolean
  onClose: () => void
  currentDiscount: DiscountType
  subtotal: number
  onApplyDiscount: (type: DiscountType, amount?: number, pointsUsed?: number) => void
  pointsBalance?: number
}

export const DiscountDialog: React.FC<DiscountDialogProps> = ({
  open,
  onClose,
  currentDiscount,
  subtotal,
  onApplyDiscount,
  pointsBalance = 0,
}) => {
  const [discountType, setDiscountType] = useState<DiscountType>(currentDiscount)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [customPercent, setCustomPercent] = useState<string>("")
  const [customType, setCustomType] = useState<"amount" | "percent">("amount")
  const [pointsToRedeem, setPointsToRedeem] = useState<string>("")

  const calculateMaxPoints = () => Math.floor(subtotal / 100)

  const getDiscountDescription = (type: DiscountType) => {
    switch (type) {
      case "Senior":
        return "20% discount for Senior Citizens (requires valid ID)"
      case "PWD":
        return "20% discount for Persons with Disabilities (requires valid ID)"
      case "Employee":
        return "10% discount for J5 Pharmacy employees"
      case "Points":
        return `Use StarPoints for discount (1 point = ₱20). Available: ${pointsBalance} points`
      case "Custom":
        return "Set a custom discount amount or percentage"
      default:
        return "No discount applied"
    }
  }

  const handlePointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const numValue = Number.parseFloat(value)
    const maxPoints = Math.min(pointsBalance || 0, calculateMaxPoints())

    if (!value) {
      setPointsToRedeem("")
    } else if (numValue <= maxPoints) {
      setPointsToRedeem(value)
    }
  }

  const handleApply = () => {
    let finalAmount = 0
    let pointsUsed = 0

    switch (discountType) {
      case "Senior":
      case "PWD":
        finalAmount = subtotal * 0.2 // 20% discount
        break
      case "Employee":
        finalAmount = subtotal * 0.1 // 10% discount
        break
      case "Points":
        const pointsValue = Number.parseFloat(pointsToRedeem) || 0
        const maxRedeemable = Math.min(pointsBalance, calculateMaxPoints())
        pointsUsed = Math.min(pointsValue, maxRedeemable)
        finalAmount = pointsUsed * 20 // 1 point = ₱20
        break
      case "Custom":
        if (customType === "amount") {
          // Ensure custom amount doesn't exceed subtotal
          finalAmount = Math.min(Number.parseFloat(customAmount) || 0, subtotal)
        } else {
          // Handle percentage discount
          const percentValue = Math.min(Number.parseFloat(customPercent) || 0, 100)
          finalAmount = (subtotal * percentValue) / 100
        }
        break
      default:
        finalAmount = 0
    }

    // Ensure the discount doesn't exceed the subtotal
    finalAmount = Math.min(finalAmount, subtotal)

    // Calculate final total (should never be negative)
    const finalTotal = Math.max(subtotal - finalAmount, 0)

    console.log("Applying Discount:", {
      type: discountType,
      amount: finalAmount,
      subtotal,
      finalTotal,
      customType: customType,
      customAmount,
      customPercent,
      pointsUsed: discountType === "Points" ? pointsUsed : 0,
    })

    onApplyDiscount(discountType, finalAmount, pointsUsed)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Apply Discount</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ToggleButtonGroup
              value={discountType}
              exclusive
              onChange={(e, value) => value && setDiscountType(value)}
              fullWidth
              orientation="vertical"
              sx={{ mb: 2 }}
            >
              {["None", "Senior", "PWD", "Employee", "Points"].map((type) => (
                <ToggleButton
                  key={type}
                  value={type}
                  sx={{
                    py: 2,
                    justifyContent: "flex-start",
                    borderRadius: "8px !important",
                    mb: 1,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "white",
                      "& .MuiTypography-root": {
                        color: "white",
                      },
                    },
                    "&.Mui-selected:hover": {
                      bgcolor: "primary.dark",
                      "& .MuiTypography-root": {
                        color: "white",
                      },
                    },
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Box width="100%">
                    <Typography variant="subtitle1" fontWeight="medium">
                      {type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {getDiscountDescription(type as DiscountType)}
                    </Typography>
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>

          {/* {discountType === "Custom" && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                <ToggleButtonGroup
                  value={customType}
                  exclusive
                  onChange={(e, value) => {
                    if (value) {
                      setCustomType(value)
                      setCustomAmount("")
                      setCustomPercent("")
                    }
                  }}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="amount">Amount (₱)</ToggleButton>
                  <ToggleButton value="percent">Percentage (%)</ToggleButton>
                </ToggleButtonGroup>

                {customType === "amount" ? (
                  <TextField
                    fullWidth
                    label="Discount Amount"
                    value={customAmount}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value)
                      if (!value || value <= subtotal) {
                        setCustomAmount(e.target.value)
                      }
                    }}
                    type="number"
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>₱</Typography>,
                      inputProps: { min: 0, max: subtotal },
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Discount Percentage"
                    value={customPercent}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value)
                      if (!value || value <= 100) {
                        setCustomPercent(e.target.value)
                      }
                    }}
                    type="number"
                    InputProps={{
                      endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>,
                      inputProps: { min: 0, max: 100 },
                    }}
                  />
                )}
              </Paper>
            </Grid>
          )} */}

          {discountType === "Points" && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      Available Points: {pointsBalance}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Maximum Redeemable: {Math.min(pointsBalance || 0, calculateMaxPoints())} points
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      You can redeem 1 point for every ₱100 of purchase (1 point = ₱20)
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Points to Redeem"
                      type="number"
                      value={pointsToRedeem}
                      onChange={handlePointsChange}
                      InputProps={{
                        inputProps: {
                          min: 0,
                          max: Math.min(pointsBalance || 0, calculateMaxPoints()),
                        },
                      }}
                      helperText={`This will deduct ₱${((Number.parseFloat(pointsToRedeem) || 0) * 20).toFixed(2)} from total`}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "primary.main",
                        color: "white",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2">
                        Discount Amount: ₱{((Number.parseFloat(pointsToRedeem) || 0) * 20).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel

        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={
            discountType === "Custom" &&
            ((customType === "amount" && !Number.parseFloat(customAmount)) ||
              (customType === "percent" && !Number.parseFloat(customPercent)))
          }
        >
          Apply Discount
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DiscountDialog

