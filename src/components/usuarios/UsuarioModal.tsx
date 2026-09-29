import Modal from '../ui/Modal';
import Form from '../ui/Form';
import Field from '../ui/Field';
import SelectField from '../ui/SelectField';
import Button from '../ui/Button';

import { useEffect, useState } from 'react';
import type { Usuario, Rol } from '@/types';

export type UsuarioFormData = Partial<Usuario> & {
  password?: string;
  confirm?: string;

  // Productor
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  telefono?: string;
  correo_electronico?: string;

  // Técnico / investigador
  institucion?: string;
  especialidad?: string;
  notas?: string;

  // Investigador
  orcid?: string;
};

interface UsuarioModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UsuarioFormData) => void;
  initialData?: Partial<Usuario>;
}

const UsuarioModal: React.FC<UsuarioModalProps> = ({
  open,
  onClose,
  onSave,
  initialData
}) => {
  const [form, setForm] = useState<UsuarioFormData>(initialData || {});

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

  const rol = form.rol;

  const esProductor = rol === 'productor';
  const esTecnico = rol === 'tecnico_campo';
  const esInvestigador = rol === 'investigador';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    /*
     * ────────────────────────────────────────────────────────────────
     * EDICIÓN
     *
     * La edición conserva el flujo existente mediante:
     *
     *   PUT /auth/usuario/:id
     *
     * Por eso solamente aplicamos las validaciones específicas de
     * creación cuando no existe initialData.
     * ────────────────────────────────────────────────────────────────
     */

    if (initialData) {
      const nombreCompleto = form.nombre_completo?.trim() || '';
      const username = form.username?.trim() || '';
      const email = form.email?.trim() || '';
      const rolActual = form.rol?.trim() || '';

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

      if (!rolActual) {
        setError('Debes seleccionar un rol.');
        return;
      }

      const { confirm, ...datosParaGuardar } = form;

      onSave({
        ...datosParaGuardar,
        nombre_completo: nombreCompleto,
        username,
        email,
        rol: rolActual as Rol,
      });

      return;
    }

    /*
     * ────────────────────────────────────────────────────────────────
     * CREACIÓN
     * ────────────────────────────────────────────────────────────────
     */

    if (!rol) {
      setError('Debes seleccionar un rol.');
      return;
    }

    /*
     * PRODUCTOR
     *
     * POST /productores
     */
    if (esProductor) {
      const nombres = form.nombres?.trim() || '';
      const apellidoPaterno = form.apellido_paterno?.trim() || '';
      const apellidoMaterno = form.apellido_materno?.trim() || '';
      const telefono = form.telefono?.trim() || '';
      const correoElectronico = form.correo_electronico?.trim() || '';
      const username = form.username?.trim() || '';
      const password = form.password || '';
      const confirm = form.confirm || '';

      if (!nombres) {
        setError('Los nombres son obligatorios.');
        return;
      }

      if (!apellidoPaterno) {
        setError('El apellido paterno es obligatorio.');
        return;
      }

      if (!apellidoMaterno) {
        setError('El apellido materno es obligatorio.');
        return;
      }

      if (!telefono) {
        setError('El teléfono es obligatorio.');
        return;
      }

      if (!correoElectronico) {
        setError('El correo electrónico es obligatorio.');
        return;
      }

      if (!username) {
        setError('El nombre de usuario es obligatorio.');
        return;
      }

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

      onSave({
        nombres,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        telefono,
        correo_electronico: correoElectronico,
        username,
        password,
        rol: 'productor',
      });

      return;
    }

    /*
     * TÉCNICO / INVESTIGADOR / ADMINISTRADOR / VISUALIZADOR
     *
     * Técnico e investigador utilizan sus endpoints especializados.
     * Administrador y visualizador utilizan /auth/register.
     */
    const nombreCompleto = form.nombre_completo?.trim() || '';
    const username = form.username?.trim() || '';
    const email = form.email?.trim() || '';
    const password = form.password || '';
    const confirm = form.confirm || '';

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

    /*
     * Técnico e investigador requieren información adicional.
     */
    if (esTecnico || esInvestigador) {
      const institucion = form.institucion?.trim() || '';
      const especialidad = form.especialidad?.trim() || '';

      if (!institucion) {
        setError('La institución es obligatoria.');
        return;
      }

      if (!especialidad) {
        setError('La especialidad es obligatoria.');
        return;
      }

      if (esInvestigador && !form.orcid?.trim()) {
        setError('El ORCID es obligatorio.');
        return;
      }
    }

    const { confirm: _, ...datosParaGuardar } = form;

    onSave({
      ...datosParaGuardar,
      nombre_completo: nombreCompleto,
      username,
      email,
      password,
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

          {/* ─────────────────────────────────────────────
              PRODUCTOR
             ───────────────────────────────────────────── */}
          {esProductor && !initialData ? (
            <>
              <div className="form-row">
                <Field
                  label="Nombres *"
                  name="nombres"
                  value={form.nombres || ''}
                  onChange={handleChange}
                  placeholder="Ej. Juan"
                />

                <Field
                  label="Apellido paterno *"
                  name="apellido_paterno"
                  value={form.apellido_paterno || ''}
                  onChange={handleChange}
                  placeholder="Ej. Pérez"
                />
              </div>

              <div className="form-row">
                <Field
                  label="Apellido materno *"
                  name="apellido_materno"
                  value={form.apellido_materno || ''}
                  onChange={handleChange}
                  placeholder="Ej. López"
                />

                <Field
                  label="Teléfono *"
                  name="telefono"
                  type="tel"
                  value={form.telefono || ''}
                  onChange={handleChange}
                  placeholder="Ej. 4811234567"
                />
              </div>

              <Field
                label="Correo electrónico *"
                name="correo_electronico"
                type="email"
                value={form.correo_electronico || ''}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
              />

              <div className="form-row">
                <Field
                  label="Nombre de usuario *"
                  name="username"
                  value={form.username || ''}
                  onChange={handleChange}
                  placeholder="Ej. juanperez"
                />

                <Field
                  label="Contraseña *"
                  name="password"
                  type="password"
                  value={form.password || ''}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <Field
                label="Confirmar contraseña *"
                name="confirm"
                type="password"
                value={form.confirm || ''}
                onChange={handleChange}
                placeholder="Repite la contraseña"
              />
            </>
          ) : (
            <>
              {/* ─────────────────────────────────────────
                  USUARIO / TÉCNICO / INVESTIGADOR
                 ───────────────────────────────────────── */}

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

              {/* ─────────────────────────────────────────
                  TÉCNICO / INVESTIGADOR
                 ───────────────────────────────────────── */}

              {!initialData && (esTecnico || esInvestigador) && (
                <>
                  <div className="form-row">
                    <Field
                      label="Institución *"
                      name="institucion"
                      value={form.institucion || ''}
                      onChange={handleChange}
                      placeholder="Ej. TecNM"
                    />

                    <Field
                      label="Especialidad *"
                      name="especialidad"
                      value={form.especialidad || ''}
                      onChange={handleChange}
                      placeholder="Ej. Sistemas"
                    />
                  </div>

                  {esInvestigador && (
                    <Field
                      label="ORCID *"
                      name="orcid"
                      value={form.orcid || ''}
                      onChange={handleChange}
                      placeholder="Ej. 0000-0000-0000-0000"
                    />
                  )}

                  <Field
                    label="Notas"
                    name="notas"
                    value={form.notas || ''}
                    onChange={handleChange}
                    placeholder="Información adicional"
                  />
                </>
              )}
            </>
          )}

          {/* ─────────────────────────────────────────────
              ROL
             ───────────────────────────────────────────── */}

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