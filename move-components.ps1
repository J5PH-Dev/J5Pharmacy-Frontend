# Create POS module directories
New-Item -ItemType Directory -Force -Path "src/modules/pos/components"
New-Item -ItemType Directory -Force -Path "src/modules/pos/types"
New-Item -ItemType Directory -Force -Path "src/modules/pos/utils"
New-Item -ItemType Directory -Force -Path "src/modules/pos/hooks"

# Move POS-specific components
Move-Item -Path "src/components/Cart" -Destination "src/modules/pos/components/" -Force
Move-Item -Path "src/components/CheckoutDialog" -Destination "src/modules/pos/components/" -Force
Move-Item -Path "src/components/DiscountDialog" -Destination "src/modules/pos/components/" -Force
Move-Item -Path "src/components/PaymentQRDialog" -Destination "src/modules/pos/components/" -Force
Move-Item -Path "src/components/Receipt" -Destination "src/modules/pos/components/" -Force
Move-Item -Path "src/components/TransactionInfo" -Destination "src/modules/pos/components/" -Force
Move-Item -Path "src/components/TransactionSummary" -Destination "src/modules/pos/components/" -Force
Move-Item -Path "src/components/FunctionKeys" -Destination "src/modules/pos/components/" -Force

# Move shared components to core
Move-Item -Path "src/components/ActionButtons" -Destination "src/core/components/" -Force
Move-Item -Path "src/components/Header" -Destination "src/core/components/" -Force
