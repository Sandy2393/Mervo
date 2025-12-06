import React from 'react';
import { Input } from '../ui/input';

export interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ value, onChange, ...props }) => {
  return (
    <Input
      label="Password"
      type="password"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};

export default PasswordField;
