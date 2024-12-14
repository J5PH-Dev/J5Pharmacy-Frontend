import { FunctionHandlerProps } from '../types';

export const handleProcessReturn = (props: FunctionHandlerProps) => {
  return () => {
    const { setProcessReturnDialogOpen } = props;
    
    // Open the process return dialog
    setProcessReturnDialogOpen?.(true);
  };
}; 