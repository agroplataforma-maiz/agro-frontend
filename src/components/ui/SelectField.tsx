import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Usa la clase global 'form-group' para estilos legacy
const SelectField: React.FC<SelectFieldProps> = ({ label, name, value, onChange, options, required, className = '', children, ...props }) => {
  return (
    <div className={`form-group${className ? ' ' + className : ''}`}>
      <label htmlFor={name}>{label}{required && ' *'}</label>
      <select
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {children}
    </div>
  );
};

export default SelectField;
