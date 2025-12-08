import React from 'react'
import { Input } from './input'

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
}

export const FormInput: React.FC<FormInputProps> = ({ label, helperText, ...props }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium">
        {label}
      </label>
    )}
    <Input {...props} />
    {helperText && (
      <p className="text-xs text-muted-foreground">{helperText}</p>
    )}
  </div>
)

export default FormInput
