import { FunctionHandlerProps } from '../types';

export const handleHoldTransaction = (props: FunctionHandlerProps) => {
  return () => {
    // Implement hold transaction logic here
    console.log('Hold transaction handler called');
  };
}; 