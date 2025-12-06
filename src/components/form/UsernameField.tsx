import React from 'react';
import { Input } from '../ui/input';
import { ENV } from '../../config/env';

export interface UsernameFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function normalizeDisplayUsername(v: string) {
  if (!v) return v;
  const s = v.trim().toLowerCase();
  if (!s.includes('@')) return `${s}@${ENV.APP_TAG}`;
  return s;
}

export const UsernameField: React.FC<UsernameFieldProps> = ({ value, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // keep lowercase as user types
    const v = e.target.value.toLowerCase();
    // allow typing without @, but show normalized on blur if needed
    onChange({ ...e, target: { ...e.target, value: v } } as any);
  };

  return (
    <Input
      label="Username"
      placeholder={`username (@${ENV.APP_TAG} will be appended)`}
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
};

export default UsernameField;
