import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { AlertCircle, Loader2 } from "lucide-react";

const EditarUsuario = ({ visible, onClose, onSave, usuario, submitting = false }) => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    rut: '',
    password: '',
    role: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombreCompleto: usuario.nombreCompleto || '',
        email: usuario.email || '',
        rut: usuario.rut || '',
        password: '',
        role: usuario.role || ''
      });
    } else {
      setFormData({
        nombreCompleto: '',
        email: '',
        rut: '',
        password: '',
        role: ''
      });
    }
    setErrors({});
  }, [usuario]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    if (!usuario && !formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    }

    if (!usuario && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(e, formData);
  };

  const handleCancel = () => {
    setFormData({
      nombreCompleto: usuario?.nombreCompleto || '',
      email: usuario?.email || '',
      rut: usuario?.rut || '',
      password: '',
      role: usuario?.role || ''
    });
    setErrors({});
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            {usuario ? 'Editar Usuario' : 'Crear Usuario'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nombreCompleto ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Ingresa el nombre completo"
              />
              {errors.nombreCompleto && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.nombreCompleto}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="ejemplo@email.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RUT
              </label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 ${errors.rut ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="12345678-9"
                disabled={usuario}
              />
              {usuario && (
                <p className="text-gray-600 text-sm mt-1">
                  El RUT no se puede modificar
                </p>
              )}
              {errors.rut && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.rut}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                placeholder={usuario ? "Dejar vacío para mantener actual" : "Ingresa la contraseña"}
              />
              {usuario && (
                <p className="text-gray-600 text-sm mt-1">
                  Deja vacío para mantener la contraseña actual
                </p>
              )}
              {errors.password && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.role ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar rol</option>
                <option value="admin">Administrador</option>
                <option value="profesor">Profesor</option>
                <option value="estudiante">Estudiante</option>
                <option value="jefeDepartamento">Jefe de Departamento</option>
              </select>
              {errors.role && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.role}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  usuario ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EditarUsuario.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  usuario: PropTypes.object,
  submitting: PropTypes.bool
};

export default EditarUsuario;
