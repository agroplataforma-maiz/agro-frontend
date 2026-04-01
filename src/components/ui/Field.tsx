import React from 'react';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type?: string;
  as?: 'input' | 'textarea';
  rows?: number;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, name, type = 'text', as: Tag = 'input', rows = 3, value, onChange, placeholder, required, ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}{required && ' *'}</label>
      {Tag === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          placeholder={placeholder}
          required={required}
          rows={rows}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          placeholder={placeholder}
          required={required}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
};

export default Field;
