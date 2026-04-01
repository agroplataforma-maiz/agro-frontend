import Modal from '../ui/Modal';
import Form from '../ui/Form';
import Field from '../ui/Field';
import SelectField from '../ui/SelectField';
import Button from '../ui/Button';

import { useState } from 'react';
import type { Usuario } from '@/types';


interface UsuarioModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Usuario>) => void;
  initialData?: Partial<Usuario>;
}

const UsuarioModal: React.FC<UsuarioModalProps> = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState<Partial<Usuario & { password?: string; confirm?: string }>>(initialData || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      titulo={initialData ? 'Editar usuario' : 'Nuevo usuario'}
      ancho="lg"
      footer={
        <>
          <Button variante="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button variante="primario" type="submit" onClick={handleSubmit}>Guardar usuario</Button>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <div className="modal-body">  
          <div className="form-row">
            <Field label="Nombre completo *" name="nombre_completo" value={form.nombre_completo || ''} onChange={handleChange} placeholder="Ej. Juan Pérez" />
            <Field label="Nombre de usuario *" name="username" value={form.username || ''} onChange={handleChange} placeholder="Ej. juanperez" />
          </div>
          
          
       
        <Field label="Correo electrónico *" name="email" type="email" value={form.email || ''} onChange={handleChange} placeholder="correo@institución.mx" />
        {initialData ? null : (
          <div className="form-row">
            <Field
              label="Contraseña *"
              name="password"
              type="password"
              value={form.password || ''}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
            />
            <Field
              label="Confirmar *"
              name="confirm"
              type="password"
              value={form.confirm || ''}
              onChange={handleChange}
              placeholder="Repite la contraseña"
            />
          </div>
        )}
        
        <SelectField
          label="Rol"
          name="rol"
          value={form.rol || ''}
          onChange={handleChange}
          options={[
            { value: '', label: 'Selecciona un rol' },
            { value: 'administrador', label: '👑 Administrador' },
            { value: 'investigador', label: '🔬 Investigador' },
            { value: 'tecnico_campo', label: '🌾 Técnico de campo' },
            { value: 'visualizador', label: '📊 Consultor' },
            { value: 'productor', label: '🌽 Productor' },
          ]}
        />
        </div>
        
      </Form>
    </Modal>
  );
};

export default UsuarioModal;