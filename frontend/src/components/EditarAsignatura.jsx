import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { AlertCircle, Loader2 } from "lucide-react";

const EditarAsignatura = ({ visible, onClose, onSave, asignatura, submitting = false }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    creditos: "",
    semestre: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (asignatura) {
      setFormData({
        nombre: asignatura.nombre || "",
        creditos: asignatura.creditos || "",
        semestre: asignatura.semestre || ""
      });
    } else {
      setFormData({
        nombre: "",
        creditos: "",
        semestre: ""
      });
    }
    setErrors({});
  }, [asignatura]);

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

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la asignatura es requerido';
    }
    
    if (!formData.creditos || formData.creditos < 1) {
      newErrors.creditos = 'Los créditos deben ser un número mayor a 0';
    }
    
    if (!formData.semestre || formData.semestre < 1 || formData.semestre > 10) {
      newErrors.semestre = 'El semestre debe estar entre 1 y 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({
      ...asignatura,
      nombre: formData.nombre.trim(),
      creditos: parseInt(formData.creditos),
      semestre: parseInt(formData.semestre)
    });
    
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      nombre: asignatura?.nombre || "",
      creditos: asignatura?.creditos || "",
      semestre: asignatura?.semestre || ""
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
            Editar Asignatura
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Asignatura
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nombre ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Ingresa el nombre de la asignatura"
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Créditos
              </label>
              <input
                type="number"
                name="creditos"
                value={formData.creditos}
                onChange={handleInputChange}
                min="1"
                max="12"
                className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.creditos ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Número de créditos"
              />
              {errors.creditos && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.creditos}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semestre
              </label>
              <select
                name="semestre"
                value={formData.semestre}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.semestre ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Selecciona un semestre</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Semestre {i + 1}
                  </option>
                ))}
              </select>
              {errors.semestre && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.semestre}
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
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EditarAsignatura.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  asignatura: PropTypes.object,
  submitting: PropTypes.bool
};

export default EditarAsignatura;
