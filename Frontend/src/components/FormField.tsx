import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  id?: string;
}

const FormField = ({ label, error, children, id }: FormFieldProps) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error && <p className="text-rose-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
};

export default FormField;
