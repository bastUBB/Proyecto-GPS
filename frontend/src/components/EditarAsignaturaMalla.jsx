import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { AlertCircle, Loader2, X } from "lucide-react";
import axios from "axios";

const EditarAsignaturaMalla = ({ visible, onClose, onSave, asignatura, submitting = false }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    creditos: "",
    semestre: "",
    prerrequisitos: [],
    ambito: "",
    area: ""
  });
  const [errors, setErrors] = useState({});
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);

  // Cargar asignaturas disponibles
  useEffect(() => {
    const cargarAsignaturas = async () => {
      if (visible) {
        try {
          setLoadingAsignaturas(true);
          const response = await axios.get('/api/asignaturas');
          setAsignaturasDisponibles(response.data.data || []);
        } catch (error) {
          console.error('Error al cargar asignaturas:', error);
        } finally {
          setLoadingAsignaturas(false);
        }
      }
    };

    cargarAsignaturas();
  }, [visible]);

  useEffect(() => {
    if (asignatura) {
      setFormData({
        nombre: asignatura.nombre || "",
        codigo: asignatura.codigo || "",
        creditos: asignatura.creditos || "",
        semestre: asignatura.semestre || "",
        prerrequisitos: Array.isArray(asignatura.prerrequisitos) 
          ? asignatura.prerrequisitos 
          : [],
        ambito: asignatura.ambito || "",
        area: asignatura.area || ""
      });
    } else {
      setFormData({
        nombre: "",
        codigo: "",
        creditos: "",
        semestre: "",
        prerrequisitos: [],
        ambito: "",
        area: ""
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

  const handlePrerequisitoAdd = (prerrequisito) => {
    if (prerrequisito && !formData.prerrequisitos.includes(prerrequisito) && formData.prerrequisitos.length < 3) {
      setFormData(prev => ({
        ...prev,
        prerrequisitos: [...prev.prerrequisitos, prerrequisito]
      }));
      
      // Limpiar error si existe
      if (errors.prerrequisitos) {
        setErrors(prev => ({
          ...prev,
          prerrequisitos: ''
        }));
      }
    }
  };

  const handlePrerequisitoRemove = (prerrequisito) => {
    setFormData(prev => ({
      ...prev,
      prerrequisitos: prev.prerrequisitos.filter(p => p !== prerrequisito)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la asignatura es requerido';
    }
    
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código de la asignatura es requerido';
    }
    
    if (!formData.creditos || formData.creditos < 1) {
      newErrors.creditos = 'Los créditos deben ser un número mayor a 0';
    }
    
    if (!formData.semestre || formData.semestre < 1 || formData.semestre > 10) {
      newErrors.semestre = 'El semestre debe estar entre 1 y 10';
    }

    if (!formData.ambito.trim()) {
      newErrors.ambito = 'El ámbito es obligatorio';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'El área es obligatoria';
    }

    if (formData.prerrequisitos.length > 3) {
      newErrors.prerrequisitos = 'Máximo 3 prerrequisitos permitidos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Solo enviar los campos que el backend espera, sin metadata
    const asignaturaData = {
      nombre: formData.nombre.trim(),
      codigo: formData.codigo.trim(),
      creditos: parseInt(formData.creditos),
      semestre: parseInt(formData.semestre),
      prerrequisitos: formData.prerrequisitos,
      ambito: formData.ambito.trim(),
      area: formData.area.trim()
    };

    onSave(asignaturaData);
    
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      nombre: asignatura?.nombre || "",
      codigo: asignatura?.codigo || "",
      creditos: asignatura?.creditos || "",
      semestre: asignatura?.semestre || "",
      prerrequisitos: Array.isArray(asignatura?.prerrequisitos) 
        ? asignatura.prerrequisitos 
        : [],
      ambito: asignatura?.ambito || "",
      area: asignatura?.area || ""
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
            {asignatura ? 'Editar Asignatura' : 'Crear Nueva Asignatura'}
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
                Código
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.codigo ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Código de la asignatura"
              />
              {errors.codigo && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.codigo}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prerrequisitos ({formData.prerrequisitos.length}/3)
              </label>
              
              {/* Mostrar prerrequisitos seleccionados */}
              {formData.prerrequisitos.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {formData.prerrequisitos.map((prereq, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {prereq}
                      <button
                        type="button"
                        onClick={() => handlePrerequisitoRemove(prereq)}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Selector de prerrequisitos */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handlePrerequisitoAdd(e.target.value);
                    e.target.value = ""; // Reset selector
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingAsignaturas || formData.prerrequisitos.length >= 3}
              >
                <option value="">
                  {loadingAsignaturas 
                    ? "Cargando asignaturas..." 
                    : formData.prerrequisitos.length >= 3
                    ? "Máximo 3 prerrequisitos alcanzado"
                    : "Selecciona un prerrequisito (opcional)"
                  }
                </option>
                {asignaturasDisponibles
                  .filter(asig => 
                    // Filtrar la asignatura actual y las ya seleccionadas
                    asig.nombre !== formData.nombre && 
                    !formData.prerrequisitos.includes(asig.nombre)
                  )
                  .map((asig) => (
                    <option key={asig._id} value={asig.nombre}>
                      {asig.codigo} - {asig.nombre}
                    </option>
                  ))}
              </select>
              
              <p className="text-gray-600 text-sm mt-1">
                Máximo 3 prerrequisitos. Selecciona de la lista de asignaturas existentes.
              </p>
              
              {errors.prerrequisitos && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.prerrequisitos}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ámbito
              </label>
              <select
                name="ambito"
                value={formData.ambito}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ambito ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Selecciona un ámbito</option>
                <option value="Ámbito Competencias Genéricas">Ámbito Competencias Genéricas</option>
                <option value="Ámbito Ciencias Básicas y de la Ingeniería">Ámbito Ciencias Básicas y de la Ingeniería</option>
                <option value="Ámbito Ingeniería Aplicada">Ámbito Ingeniería Aplicada</option>
              </select>
              {errors.ambito && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.ambito}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.area ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Selecciona un área</option>
                <option value="Área Form. Integral Profesional">Área Form. Integral Profesional</option>
                <option value="Área Ciencias Básicas">Área Ciencias Básicas</option>
                <option value="Área Ciencias de la Ingeniería">Área Ciencias de la Ingeniería</option>
                <option value="Área Ingeniería de Software y Base de Datos">Área Ingeniería de Software y Base de Datos</option>
                <option value="Área de Sistemas Computacionales">Área de Sistemas Computacionales</option>
                <option value="Área de Gestión Informática">Área de Gestión Informática</option>
                <option value="Una de las áreas anteriores">Una de las áreas anteriores</option>
              </select>
              {errors.area && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.area}
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
                  asignatura ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EditarAsignaturaMalla.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  asignatura: PropTypes.object,
  submitting: PropTypes.bool
};

export default EditarAsignaturaMalla;
