import { FunctionHandlerProps } from '../types';

export const handleSearchProduct = (props: FunctionHandlerProps) => {
  return () => {
    if (props.setSearchDialogOpen) {
      props.setSearchDialogOpen(true);
    }
  };
}; 