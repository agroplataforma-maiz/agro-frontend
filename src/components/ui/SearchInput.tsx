import React from 'react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Buscar...', className = '', icon = '🔍', ...props }) => {
  return (
    <div className={`search-wrap${className ? ' ' + className : ''}`}>
      <span className="search-ico">{icon}</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default SearchInput;
