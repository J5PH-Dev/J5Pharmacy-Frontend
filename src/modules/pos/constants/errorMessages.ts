export const ERROR_MESSAGES = {
    SESSION: {
        INIT_FAILED: 'Failed to initialize sales session',
        END_FAILED: 'Failed to end sales session',
    },
    TRANSACTION: {
        CREATE_FAILED: 'Failed to create transaction',
        HOLD_FAILED: 'Failed to hold transaction',
        RECALL_FAILED: 'Failed to recall transaction',
        DELETE_FAILED: 'Failed to delete held transaction',
    },
    PRODUCT: {
        SEARCH_FAILED: 'Failed to search products',
        NOT_FOUND: 'Product not found',
        OUT_OF_STOCK: 'Product is out of stock',
        INSUFFICIENT_STOCK: 'Insufficient stock available',
    },
    CUSTOMER: {
        SEARCH_FAILED: 'Failed to search customers',
        POINTS_UPDATE_FAILED: 'Failed to update customer points',
    },
    RETURN: {
        PROCESS_FAILED: 'Failed to process return',
        NOT_FOUND: 'Return not found',
    }
}; 