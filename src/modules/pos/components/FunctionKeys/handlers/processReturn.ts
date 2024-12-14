import { FunctionHandlerProps } from '../types';

export const handleProcessReturn = (props: FunctionHandlerProps) => {
  return () => {
    // Implement return processing logic here
    console.log('Process return handler called');
  };
}; 