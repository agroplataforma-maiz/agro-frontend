import React from 'react';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

// Usa el form global, sin CSS Module
const Form: React.FC<FormProps> = ({ children, ...props }) => {
  return (
    <form {...props}>
      {children}
    </form>
  );
};

export default Form;
