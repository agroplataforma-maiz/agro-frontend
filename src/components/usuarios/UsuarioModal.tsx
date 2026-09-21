
import Modal from '../ui/Modal';
import Form from '../ui/Form';
import Field from '../ui/Field';
import SelectField from '../ui/SelectField';
import Button from '../ui/Button';

import { useEffect, useState } from 'react';
import type { Usuario, Rol } from '@/types';

interface UsuarioModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Usuario>) => void;
  initialData?: Partial<Usuario>;
}

const UsuarioModal: React.FC<UsuarioModalProps> = ({
  open,
  onClose,
  onSave,
  initialData
}) => {
  const [form, setForm] = useState<
    Partial<Usuario & { password?: string; confirm?: string }>
  >(initialData || {});

  const [error, setError] = useState('');

  useEffect(() => {
    setForm(initialData || {});
    setError('');
  }, [initialData, open]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm(f => ({
      ...f,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nombreCompleto = form.nombre_completo?.trim() || '';
    const username = form.username?.trim() || '';
    const email = form.email?.trim() || '';
    const rol = form.rol?.trim() || '';

    // Campos obligatorios
    if (!nombreCompleto) {
      setError('El nombre completo es obligatorio.');
      return;
    }

    if (!username) {
      setError('El nombre de usuario es obligatorio.');
      return;
    }

    if (!email) {
      setError('El correo electrónico es obligatorio.');
      return;
    }

    if (!rol) {
      setError('Debes seleccionar un rol.');
      return;
    }

    // Estas validaciones solamente aplican al crear un usuario
    if (!initialData) {
      const password = form.password || '';
      const confirm = form.confirm || '';

      if (!password) {
        setError('La contraseña es obligatoria.');
        return;
      }

      if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return;
      }

      if (!confirm) {
        setError('Debes confirmar la contraseña.');
        return;
      }

      if (password !== confirm) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    // "confirm" solamente se utiliza para validar en frontend.
    // No se envía al backend.
    const { confirm, ...datosParaGuardar } = form;

    onSave({
      ...datosParaGuardar,
      nombre_completo: nombreCompleto,
      username,
      email,
      rol: rol as Rol,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      titulo={initialData ? 'Editar usuario' : 'Nuevo usuario'}
      ancho="lg"
      footer={
        <>
          <Button
            variante="ghost"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            variante="primario"
            type="submit"
            onClick={handleSubmit}
          >
            Guardar usuario
          </Button>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <div className="modal-body">

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: 14,
                padding: '10px 12px',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--rojo)',
                background: 'rgba(180, 50, 50, 0.08)',
                border: '1px solid rgba(180, 50, 50, 0.2)',
              }}
            >
              {error}
            </div>
          )}

          <div className="form-row">
            <Field
              label="Nombre completo *"
              name="nombre_completo"
              value={form.nombre_completo || ''}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
            />

            <Field
              label="Nombre de usuario *"
              name="username"
              value={form.username || ''}
              onChange={handleChange}
              placeholder="Ej. juanperez"
            />
          </div>

          <Field
            label="Correo electrónico *"
            name="email"
            type="email"
            value={form.email || ''}
            onChange={handleChange}
            placeholder="correo@institución.mx"
          />

          {!initialData && (
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
            label="Rol *"
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


