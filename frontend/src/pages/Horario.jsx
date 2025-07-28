import React, { useState, useRef, useContext, useEffect } from "react";
import PagGeneral from "../components/PagGeneral";
import { UserContext } from "../../context/userContext";
import axios from 'axios';
import HelpTooltip from "../components/PuntoAyuda";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AlertCircle, Loader2 } from "lucide-react";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const hours = [
  "08:10", "08:45", "09:30", "DESCANSO", "09:40", "10:25", "11:00", "DESCANSO",
  "11:10", "11:55", "12:30", "DESCANSO", "12:40", "13:25", "14:00", "DESCANSO",
  "14:10", "14:55", "15:30", "DESCANSO", "15:40", "16:25", "17:00", "DESCANSO",
  "17:10", "17:55", "18:30", "DESCANSO", "18:40", "19:25", "20:00", "DESCANSO",
  "20:10", "20:55", "21:30"
];

// Mapeo de días abreviados a días completos
const diaMapping = {
  'LU': 'Lunes',
  'MA': 'Martes',
  'MI': 'Miércoles',
  'JU': 'Jueves',
  'VI': 'Viernes'
};

export default function Horario() {
  const { user } = useContext(UserContext);
  const [horarios, setHorarios] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const horarioRef = useRef(null);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState(false);
  const [tieneInscripcionesBD, setTieneInscripcionesBD] = useState(false);
  const [form, setForm] = useState({
    dia: "Lunes",
    horaInicio: "08:10",
    horaFin: "09:30",
    asignatura: "",
    sala: "",
  });

  // Configurar axios con token de autenticación
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Verificar si hay inscripciones en la BD (sin cargarlas)
  const verificarInscripcionesBD = async () => {
    if (!user || user.role !== 'alumno') return;

    try {
      const response = await axios.get(`/api/inscripcion/estudiante/${user.rut}`, getAuthConfig());
      setTieneInscripcionesBD(response.data.data.length > 0);
    } catch (error) {
      setTieneInscripcionesBD(false);
    }
  };

  // Cargar inscripciones existentes del estudiante
  const cargarInscripcionesExistentes = async () => {
    if (!user || user.role !== 'alumno') return;

    try {
      const response = await axios.get(`/api/inscripcion/estudiante/${user.rut}`, getAuthConfig());
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        const inscripciones = response.data.data;
        const horariosExistentes = [];

        inscripciones.forEach(inscripcion => {
          inscripcion.bloques.forEach((bloque, index) => {
            horariosExistentes.push({
              id: `${inscripcion._id}-${index}`, // ID único para tracking
              dia: bloque.dia,
              horaInicio: ajustarHoraABloque(bloque.horaInicio),
              horaFin: ajustarHoraABloque(bloque.horaFin),
              asignatura: inscripcion.asignatura,
              sala: bloque.sala,
              profesor: inscripcion.profesor,
              seccion: inscripcion.seccion,
              tipo: bloque.tipo,
              horaOriginalInicio: bloque.horaInicio,
              horaOriginalFin: bloque.horaFin,
              inscripcionId: inscripcion._id, // Para poder eliminar después
              origen: 'bd' // Marca que viene de la base de datos
            });
          });
        });

        setHorarios(horariosExistentes);
        console.log('Inscripciones existentes cargadas:', horariosExistentes);
        setMensaje(`📚 Cargadas ${inscripciones.length} inscripciones existentes`);
        setTieneInscripcionesBD(true); // Hay inscripciones en la BD
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setTieneInscripcionesBD(false); // No hay inscripciones en la BD
      }
    } catch (error) {
      console.error('Error al cargar inscripciones existentes:', error);
      setTieneInscripcionesBD(false); // Error = asumir que no hay inscripciones
      if (error.response?.status !== 404) {
        setMensaje('⚠️ Error al cargar inscripciones existentes');
        setTimeout(() => setMensaje(''), 3000);
      }
    }
  };

  // Cargar recomendaciones del backend
  const cargarRecomendaciones = async () => {
    if (!user || user.role !== 'alumno') return;

    try {
      setLoading(true);
      setMensaje('');

      const response = await axios.post('/api/inscripcion/detail',
        { rutEstudiante: user.rut },
        getAuthConfig()
      );

      // console.log('Recomendaciones cargadas:',response)

      if (response.data && response.data.data) {
        setRecomendaciones(response.data.data);
        console.log('Recomendaciones cargadas:', response.data.data);
        
        // Extraer asignaturas con su información completa de horarios
        const asignaturasConHorarios = new Map();
        if (response.data.data.setsRecomendaciones) {
          Object.values(response.data.data.setsRecomendaciones).forEach(set => {
            const recomendaciones = set.recomendaciones || set;
            recomendaciones.forEach(rec => {
              if (rec.asignatura && rec.bloques) {
                const key = `${rec.asignatura}-${rec.profesor}-${rec.seccion}`;
                
                if (!asignaturasConHorarios.has(key)) {
                  // Formatear horarios de los bloques
                  const horariosFormateados = rec.bloques.map(bloque => {
                    const diaCompleto = diaMapping[bloque.dia] || bloque.dia;
                    return `${diaCompleto} ${bloque.horaInicio}-${bloque.horaFin}`;
                  }).join(', ');
                  
                  asignaturasConHorarios.set(key, {
                    asignatura: rec.asignatura,
                    profesor: rec.profesor,
                    seccion: rec.seccion,
                    horarios: horariosFormateados,
                    bloques: rec.bloques,
                    tipo: rec.bloques.map(b => b.tipo).join('/'),
                    sala: rec.bloques.map(b => b.sala).join(', ')
                  });
                }
              }
            });
          });
        }
        
        // Convertir a array y ordenar alfabéticamente por asignatura
        const asignaturasArray = Array.from(asignaturasConHorarios.values())
          .sort((a, b) => a.asignatura.localeCompare(b.asignatura));
        setAsignaturasDisponibles(asignaturasArray);
        
        setMensaje('Recomendaciones cargadas exitosamente');
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setMensaje('No se pudieron cargar las recomendaciones');
      }
    } catch (error) {
      console.error('Error al cargar recomendaciones:', error);
      if (error.response?.status === 400) {
        setMensaje('No se encontraron datos para tu RUT o no tienes asignaturas inscribibles');
      } else {
        setMensaje('Error al cargar las recomendaciones');
      }
    } finally {
      setLoading(false);
    }
  };

  // Guardar inscripción en el backend
  const guardarInscripcion = async () => {
    if (!user || horarios.length === 0) return;

    try {
      setLoading(true);
      setMensaje('');

      // IMPORTANTE: Solo se toman en cuenta los horarios que están actualmente en el estado 'horarios'
      // Si un bloque fue eliminado del horario visual, NO se incluirá en la inscripción
      console.log('Horarios actuales que se enviarán:', horarios);

      // Agrupar horarios por asignatura, profesor y sección
      const inscripcionesPorAsignatura = {};

      // Iterar solo sobre los horarios que están actualmente visibles/seleccionados
      horarios.forEach(horario => {
        const key = `${horario.asignatura}-${horario.profesor}-${horario.seccion}`;

        if (!inscripcionesPorAsignatura[key]) {
          // Validar que el profesor tenga al menos 15 caracteres como requiere la validación
          let profesorCompleto = horario.profesor || 'Profesor Sin Asignar';
          if (profesorCompleto.length < 15) {
            profesorCompleto = profesorCompleto.padEnd(15, ' '); // Rellenar con espacios si es necesario
          }

          inscripcionesPorAsignatura[key] = {
            profesor: profesorCompleto,
            // rutAlumnos: [user.rut], // Array con el RUT del alumno como requiere el modelo
            rutParaEnviar: user.rut,
            asignatura: horario.asignatura,
            seccion: parseInt(horario.seccion) || 1, // Asegurar que sea número
            semestre: 1, // Valor por defecto - primer semestre
            "año": String(new Date().getFullYear()), // Asegurar que sea string simple
            bloques: [],
            cupos: 30 // Valor por defecto - singular como en validación
          };
        }

        // Agregar bloque a la inscripción
        inscripcionesPorAsignatura[key].bloques.push({
          horaInicio: horario.horaOriginalInicio || horario.horaInicio,
          horaFin: horario.horaOriginalFin || horario.horaFin,
          dia: horario.dia, // Mantener día completo como lo requiere la validación
          tipo: horario.tipo === 'Laboratorio' ? 'LAB' : 'TEO', // Convertir a formato esperado
          sala: horario.sala || 'Sin asignar'
        });
      });

      // Log para mostrar exactamente qué inscripciones se van a enviar
      console.log('📋 Inscripciones agrupadas que se enviarán:', inscripcionesPorAsignatura);
      console.log(`📊 Total de asignaturas a inscribir: ${Object.keys(inscripcionesPorAsignatura).length}`);

      // Enviar cada inscripción al backend
      const resultados = [];
      const errores = [];

      for (const [key, inscripcionData] of Object.entries(inscripcionesPorAsignatura)) {
        try {
          // Validar datos antes de enviar
          if (!inscripcionData.profesor || inscripcionData.profesor.length < 15) {
            throw new Error('El nombre del profesor debe tener al menos 15 caracteres');
          }

          if (!inscripcionData.asignatura || inscripcionData.asignatura.length < 3) {
            throw new Error('El nombre de la asignatura debe tener al menos 3 caracteres');
          }

          if (!inscripcionData.bloques || inscripcionData.bloques.length === 0) {
            throw new Error('Debe haber al menos un bloque de horario');
          }

          // Validar que el RUT tenga formato correcto
          const rutPattern = /^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/;
          if (!rutPattern.test(inscripcionData.rutParaEnviar)) {
            throw new Error('El RUT no tiene un formato válido');
          }

          console.log(`Enviando inscripción para ${key}:`, inscripcionData);
          const response = await axios.post('/api/inscripcion', inscripcionData, getAuthConfig());
          resultados.push(response.data);
          console.log(`✅ Inscripción exitosa para ${key}:`, response.data);
        } catch (error) {
          console.error(`❌ Error al guardar inscripción ${key}:`, error);
          console.error('Datos que se intentaron enviar:', inscripcionData);
          console.error('Respuesta del servidor:', error.response?.data);

          let mensajeError = error.response?.data?.message ||
            error.response?.data?.details ||
            error.message;
          errores.push(`${inscripcionData.asignatura}: ${mensajeError}`);
        }
      }

      if (errores.length === 0) {
        setMensaje(`✅ Inscripciones guardadas exitosamente (${resultados.length} asignaturas) - Semestre 1, ${new Date().getFullYear()}`);
        setTieneInscripcionesBD(true); // Ahora hay inscripciones en la BD
      } else if (resultados.length > 0) {
        setMensaje(`⚠️ Parcialmente guardado: ${resultados.length} exitosas, ${errores.length} con errores`);
        setTieneInscripcionesBD(true); // Al menos algunas se guardaron
      } else {
        setMensaje(`❌ Error al guardar inscripciones: ${errores.join(', ')}`);
      }

      setTimeout(() => setMensaje(''), 5000);

    } catch (error) {
      console.error('Error general al guardar inscripciones:', error);
      setMensaje('❌ Error interno al guardar las inscripciones');
      setTimeout(() => setMensaje(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Función para ajustar hora a bloque más cercano
  const ajustarHoraABloque = (hora) => {
    // Si la hora ya está en el array de horas, devolverla tal como está
    if (hours.includes(hora)) {
      return hora;
    }

    // Convertir hora a minutos para comparación
    const convertirAMinutos = (h) => {
      const [horas, minutos] = h.split(':').map(Number);
      return horas * 60 + minutos;
    };

    const minutosHora = convertirAMinutos(hora);
    const horasDisponibles = hours.filter(h => h !== "DESCANSO");

    // Encontrar la hora más cercana
    let horaMasCercana = horasDisponibles[0];
    let menorDiferencia = Math.abs(convertirAMinutos(horasDisponibles[0]) - minutosHora);

    horasDisponibles.forEach(h => {
      const diferencia = Math.abs(convertirAMinutos(h) - minutosHora);
      if (diferencia < menorDiferencia) {
        menorDiferencia = diferencia;
        horaMasCercana = h;
      }
    });

    return horaMasCercana;
  };

  // Convertir recomendaciones a formato de horario
  const convertirRecomendacionAHorario = (recomendacionSet, tipoSet) => {
    const horarioConvertido = [];

    // Verificar si recomendacionSet tiene la propiedad 'recomendaciones'
    const recomendaciones = recomendacionSet.recomendaciones || recomendacionSet;

    recomendaciones.forEach((recomendacion, recIndex) => {
      recomendacion.bloques.forEach((bloque, bloqueIndex) => {
        horarioConvertido.push({
          id: `${tipoSet}-${recIndex}-${bloqueIndex}-${Date.now()}`, // ID único para tracking
          dia: diaMapping[bloque.dia] || bloque.dia,
          horaInicio: ajustarHoraABloque(bloque.horaInicio),
          horaFin: ajustarHoraABloque(bloque.horaFin),
          asignatura: recomendacion.asignatura,
          sala: bloque.sala,
          profesor: recomendacion.profesor,
          seccion: recomendacion.seccion,
          tipo: bloque.tipo,
          razon: recomendacion.razon,
          puntaje: recomendacion.puntaje,
          detalles: recomendacion.detalles,
          tipoRecomendacion: tipoSet,
          horaOriginalInicio: bloque.horaInicio, // Guardar hora original para referencia
          horaOriginalFin: bloque.horaFin,
          origen: 'recomendacion' // Marca que viene de recomendación
        });
      });
    });

    return horarioConvertido;
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.role === 'alumno') {
      verificarInscripcionesBD(); // Verificar si hay inscripciones
      cargarInscripcionesExistentes(); // Cargar inscripciones primero
      cargarRecomendaciones();
    }
  }, [user]);

  // Paleta de colores para asignaturas
  const coloresAsignaturas = [
    { bg: "from-blue-100 to-blue-50", text: "text-blue-900", border: "border-blue-300", sala: "text-blue-700", hora: "text-blue-600" },
    { bg: "from-green-100 to-green-50", text: "text-green-900", border: "border-green-300", sala: "text-green-700", hora: "text-green-600" },
    { bg: "from-purple-100 to-purple-50", text: "text-purple-900", border: "border-purple-300", sala: "text-purple-700", hora: "text-purple-600" },
    { bg: "from-red-100 to-red-50", text: "text-red-900", border: "border-red-300", sala: "text-red-700", hora: "text-red-600" },
    { bg: "from-yellow-100 to-yellow-50", text: "text-yellow-900", border: "border-yellow-300", sala: "text-yellow-700", hora: "text-yellow-600" },
    { bg: "from-pink-100 to-pink-50", text: "text-pink-900", border: "border-pink-300", sala: "text-pink-700", hora: "text-pink-600" },
    { bg: "from-indigo-100 to-indigo-50", text: "text-indigo-900", border: "border-indigo-300", sala: "text-indigo-700", hora: "text-indigo-600" },
    { bg: "from-teal-100 to-teal-50", text: "text-teal-900", border: "border-teal-300", sala: "text-teal-700", hora: "text-teal-600" },
    { bg: "from-orange-100 to-orange-50", text: "text-orange-900", border: "border-orange-300", sala: "text-orange-700", hora: "text-orange-600" },
    { bg: "from-cyan-100 to-cyan-50", text: "text-cyan-900", border: "border-cyan-300", sala: "text-cyan-700", hora: "text-cyan-600" }
  ];

  // Función para obtener el color de una asignatura
  const obtenerColorAsignatura = (nombreAsignatura) => {
    const asignaturasUnicas = [...new Set(horarios.map(h => h.asignatura))];
    const indice = asignaturasUnicas.indexOf(nombreAsignatura);
    return coloresAsignaturas[indice % coloresAsignaturas.length];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Manejar sugerencias para el campo asignatura
    if (name === 'asignatura') {
      if (value.length > 0 && asignaturasDisponibles.length > 0) {
        const sugerenciasFiltradas = asignaturasDisponibles.filter(asigInfo =>
          asigInfo.asignatura.toLowerCase().includes(value.toLowerCase())
        );
        setMostrandoSugerencias(sugerenciasFiltradas.length > 0 && value !== '');
      } else {
        setMostrandoSugerencias(false);
      }
    }
  };

  const seleccionarAsignatura = (asignaturaInfo) => {
    console.log('===== INICIO seleccionarAsignatura =====');
    console.log('Parámetro recibido:', asignaturaInfo);
    console.log('Tipo:', typeof asignaturaInfo);
    console.log('Es objeto:', typeof asignaturaInfo === 'object');
    console.log('No es null:', asignaturaInfo !== null);
    console.log('Tiene bloques:', asignaturaInfo?.bloques);
    console.log('Bloques es array:', Array.isArray(asignaturaInfo?.bloques));
    console.log('========================================');
    
    // Si se selecciona una asignatura inscribible con bloques, agregar toda su información
    if (typeof asignaturaInfo === 'object' && asignaturaInfo !== null && asignaturaInfo.bloques && Array.isArray(asignaturaInfo.bloques) && asignaturaInfo.bloques.length > 0) {
      console.log('ENTRANDO A RAMA DE AGREGAR COMPLETA');
      
      // Crear array con todas las nuevas clases
      const nuevasClases = asignaturaInfo.bloques.map((bloque, index) => {
        // Asegurar que tenemos valores válidos
        const diaFinal = diaMapping[bloque.dia] || bloque.dia || 'Lunes';
        const horaInicioFinal = bloque.horaInicio && hours.includes(bloque.horaInicio) 
          ? bloque.horaInicio 
          : ajustarHoraABloque(bloque.horaInicio || '08:10');
        const horaFinFinal = bloque.horaFin && hours.includes(bloque.horaFin)
          ? bloque.horaFin
          : ajustarHoraABloque(bloque.horaFin || '09:30');
        
        return {
          id: `manual-${asignaturaInfo.asignatura}-${index}-${Date.now()}`, // ID único para tracking
          dia: diaFinal,
          horaInicio: horaInicioFinal,
          horaFin: horaFinFinal,
          asignatura: asignaturaInfo.asignatura || 'Sin nombre',
          sala: bloque.sala || 'Sin asignar',
          profesor: asignaturaInfo.profesor || 'Sin asignar',
          seccion: asignaturaInfo.seccion || '1',
          tipo: bloque.tipo || 'TEO',
          horaOriginalInicio: bloque.horaInicio,
          horaOriginalFin: bloque.horaFin,
          origen: 'manual' // Marca que fue agregado manualmente
        };
      });
      
      console.log('Nuevas clases creadas:', nuevasClases);
      
      // Agregar todas las clases de una vez
      setHorarios(prev => [...prev, ...nuevasClases]);
      
      // Cerrar modal después de agregar
      setMostrarPopup(false);
      setForm({
        dia: "Lunes",
        horaInicio: "08:10",
        horaFin: "09:30",
        asignatura: "",
        sala: ""
      });
    } else {
      console.log('ENTRANDO A RAMA DE SOLO NOMBRE');
      // Si es solo texto, solo llenar el campo de asignatura
      const nombreAsignatura = typeof asignaturaInfo === 'string' ? asignaturaInfo : asignaturaInfo?.asignatura || '';
      console.log('Nombre a usar:', nombreAsignatura);
      setForm({ ...form, asignatura: nombreAsignatura });
    }
    
    setMostrandoSugerencias(false);
    
    // Limpiar error de asignatura si existe
    if (errors.asignatura) {
      setErrors(prev => ({
        ...prev,
        asignatura: ''
      }));
    }
    
    console.log('===== FIN seleccionarAsignatura =====');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.asignatura.trim()) {
      newErrors.asignatura = 'El nombre de la asignatura es requerido';
    }

    if (!form.sala.trim()) {
      newErrors.sala = 'La sala es requerida';
    }

    // Validar que la hora de fin sea posterior a la hora de inicio
    const inicioIndex = hours.indexOf(form.horaInicio);
    const finIndex = hours.indexOf(form.horaFin);

    if (finIndex <= inicioIndex) {
      newErrors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    // Verificar conflictos de horario - permitir solapamientos parciales y totales
    const clasesConflicto = horarios.filter(horario => {
      if (horario.dia !== form.dia) return false;

      const horarioInicioIndex = hours.indexOf(horario.horaInicio);
      const horarioFinIndex = hours.indexOf(horario.horaFin);

      // Verificar si hay cualquier tipo de solapamiento (parcial o total)
      const haySolapamiento = !(finIndex <= horarioInicioIndex || inicioIndex >= horarioFinIndex);
      
      return haySolapamiento;
    });

    if (clasesConflicto.length > 0) {
      // Mostrar advertencia informativa para solapamientos
      const asignaturasConflicto = clasesConflicto.map(h => `${h.asignatura} (${h.horaInicio}-${h.horaFin})`).join(', ');
      newErrors.dia = `ℹ️ Se superpone con: ${asignaturasConflicto}. Se permitirá el solapamiento parcial.`;
    }

    setErrors(newErrors);
    // Solo bloquear si hay errores reales (no advertencias informativas)
    const erroresReales = Object.entries(newErrors).filter(([key, value]) => !value.startsWith('ℹ️'));
    return erroresReales.length === 0;
  };

  const agregarHorario = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Simular una pequeña demora para mostrar el loading
      await new Promise(resolve => setTimeout(resolve, 500));

      // Agregar ID único al horario creado manualmente
      const nuevoHorario = { 
        ...form, 
        id: `formulario-${Date.now()}`, // ID único para tracking
        origen: 'formulario' // Marca que fue creado desde el formulario
      };
      
      setHorarios([...horarios, nuevoHorario]);
      setForm({
        dia: "Lunes",
        horaInicio: "08:10",
        horaFin: "09:30",
        asignatura: "",
        sala: ""
      });
      setErrors({});
      setMostrandoSugerencias(false);
      setMostrarPopup(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm({
      dia: "Lunes",
      horaInicio: "08:10",
      horaFin: "09:30",
      asignatura: "",
      sala: ""
    });
    setErrors({});
    setMostrandoSugerencias(false);
    setMostrarPopup(false);
  };

  const eliminarHorario = (index) => {
    const nuevosHorarios = horarios.filter((_, i) => i !== index);
    setHorarios(nuevosHorarios);
  };

  const seleccionarHorario = (tipoRecomendacion) => {
    if (!recomendaciones || !recomendaciones.setsRecomendaciones[tipoRecomendacion]) return;

    const horarioConvertido = convertirRecomendacionAHorario(
      recomendaciones.setsRecomendaciones[tipoRecomendacion],
      tipoRecomendacion
    );

    setHorarios(horarioConvertido);
    setHorarioSeleccionado({
      id: tipoRecomendacion,
      nombre: obtenerNombreTipo(tipoRecomendacion),
      descripcion: obtenerDescripcionTipo(tipoRecomendacion),
      tipo: tipoRecomendacion
    });
  };

  const obtenerNombreTipo = (tipo) => {
    switch (tipo) {
      case 'excelenciaAcademica': return 'Excelencia Académica';
      case 'equilibrado': return 'Equilibrado';
      case 'evaluacionDocente': return 'Mejor Evaluado';
      default: return tipo;
    }
  };

  const obtenerDescripcionTipo = (tipo) => {
    switch (tipo) {
      case 'excelenciaAcademica': return 'Prioriza el porcentaje de aprobación de los profesores';
      case 'equilibrado': return 'Balance entre rendimiento académico y evaluación docente';
      case 'evaluacionDocente': return 'Prioriza las mejores evaluaciones de los estudiantes';
      default: return '';
    }
  };

  const limpiarHorario = async () => {
    if (!user || user.role !== 'alumno') {
      setHorarios([]);
      setHorarioSeleccionado(null);
      return;
    }

    try {
      setLoading(true);
      setMensaje('🗑️ Eliminando inscripciones...');

      // Eliminar todas las inscripciones del estudiante de la base de datos
      const response = await axios.delete(`/api/inscripcion/estudiante/${user.rut}`, getAuthConfig());
      
      if (response.data) {
        console.log('Inscripciones eliminadas:', response.data);
        setMensaje(`✅ ${response.data.data.inscripcionesAfectadas} inscripciones eliminadas de la base de datos`);
      }

      // Limpiar el horario visual
      setHorarios([]);
      setHorarioSeleccionado(null);
      setTieneInscripcionesBD(false); // Ya no hay inscripciones en la BD

      setTimeout(() => setMensaje(''), 3000);

    } catch (error) {
      console.error('Error al limpiar inscripciones:', error);
      
      // Aun así limpiar la vista
      setHorarios([]);
      setHorarioSeleccionado(null);
      // No cambiar tieneInscripcionesBD aquí porque no sabemos si se eliminaron
      
      if (error.response?.status === 404) {
        setMensaje('ℹ️ No había inscripciones para eliminar');
        setTieneInscripcionesBD(false); // Si no había nada que eliminar
      } else {
        setMensaje('⚠️ Error al eliminar inscripciones de la BD, pero se limpió la vista');
      }
      
      setTimeout(() => setMensaje(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const descargarHorario = async () => {
    if (!horarioRef.current) return;

    try {
      // Crear un canvas de la tabla del horario
      const canvas = await html2canvas(horarioRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: horarioRef.current.offsetWidth,
        height: horarioRef.current.offsetHeight
      });

      const imgData = canvas.toDataURL('image/png');

      // Crear el PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Añadir título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      const titulo = horarioSeleccionado ? horarioSeleccionado.nombre : 'Horario Personalizado';
      pdf.text(titulo, 10, 15);
      // Que el titulo sea horario_Nombre_Apellido
      // const nombreCompleto = user ? `${user.nombre} ${user.apellido}` : 'Usuario';
      // pdf.text(`Horario de ${nombreCompleto}`, 10, 10);

      // Añadir información adicional
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 10, 25);
      pdf.text(`Total de clases: ${horarios.length}`, 10, 30);

      // Calcular las dimensiones para ajustar la imagen
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // Márgenes de 10mm a cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Verificar si la imagen cabe en la página
      if (imgHeight <= pdfHeight - 50) {
        // La imagen cabe, añadirla
        pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
      } else {
        // La imagen es muy alta, escalarla para que quepa
        const scaledHeight = pdfHeight - 50;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        pdf.addImage(imgData, 'PNG', 10, 40, scaledWidth, scaledHeight);
      }

      // Descargar el PDF
      const nombreArchivo = `horario_${new Date().toLocaleDateString('es-ES').replace(/\\s+/g, '_')}.pdf`;
      pdf.save(nombreArchivo);

    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  // Función para determinar qué horas mostrar basándose en las clases existentes
  const obtenerHorasAMostrar = () => {
    if (horarios.length === 0) {
      // Si no hay horarios, mostrar solo hasta las 17:00 incluyendo descansos
      const indice1700 = hours.indexOf("17:00");
      return hours.slice(0, indice1700 + 1);
    }

    // Encontrar la hora más tardía utilizada
    let ultimaHoraUsada = "17:00"; // Hora por defecto

    horarios.forEach(horario => {
      const finIndex = hours.indexOf(horario.horaFin);
      const ultimaIndex = hours.indexOf(ultimaHoraUsada);

      if (finIndex > ultimaIndex) {
        ultimaHoraUsada = horario.horaFin;
      }
    });

    // Retornar las horas hasta la última hora usada (inclusive)
    // Pero asegurándonos de incluir el descanso siguiente si existe
    const ultimaIndex = hours.indexOf(ultimaHoraUsada);
    let indiceAMostrar = ultimaIndex;

    // Si la siguiente posición es un descanso, incluirlo también
    if (ultimaIndex + 1 < hours.length && hours[ultimaIndex + 1] === "DESCANSO") {
      indiceAMostrar = ultimaIndex + 1;
    }

    return hours.slice(0, indiceAMostrar + 1);
  };

  const renderCelda = (dia, hora, filaIndex = 0) => {
    const key = `${dia}-${hora}-${filaIndex}`;

    // Si es una fila de descanso, renderizar celda especial
    if (hora === "DESCANSO") {
      return (
        <td key={key} className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-500 text-xs text-center align-middle border border-gray-300 min-h-[25px]">
          {/* Sin contenido para evitar puntos suspensivos */}
        </td>
      );
    }

    // Buscar todas las clases que comienzan en esta hora exacta
    const clasesInician = horarios.filter(
      (h) => h.dia === dia && h.horaInicio === hora
    );

    // Buscar si hay una clase que ya está ocupando esta celda (clase activa)
    const claseActiva = horarios.find((h) => {
      if (h.dia !== dia) return false;
      const inicioIndex = hours.indexOf(h.horaInicio);
      const finIndex = hours.indexOf(h.horaFin);
      const horaActualIndex = hours.indexOf(hora);
      // Cambio: ahora incluye la hora de fin (<=) 
      return inicioIndex < horaActualIndex && horaActualIndex <= finIndex;
    });

    // Si hay una clase activa (que empezó antes), esta celda no debe renderizarse
    if (claseActiva) {
      return null;
    }

    if (clasesInician.length > 0) {
      // Usar la primera clase para calcular el rowSpan
      const claseReferencia = clasesInician[0];

      // Calcular rowSpan basado en la duración de la clase - INCLUYE la hora de fin
      const inicioIndex = hours.indexOf(claseReferencia.horaInicio);
      const finIndex = hours.indexOf(claseReferencia.horaFin);
      // Cambio: +1 para incluir la hora de fin
      const rowSpan = Math.max(1, finIndex - inicioIndex + 1);

      // Si hay múltiples clases, usar un color mixto o degradado
      let colorClase;
      if (clasesInician.length === 1) {
        colorClase = obtenerColorAsignatura(clasesInician[0].asignatura);
      } else {
        // Para múltiples clases, usar un color neutro pero distintivo
        colorClase = {
          bg: "from-gray-200 to-gray-100",
          text: "text-gray-900",
          border: "border-gray-400",
          sala: "text-gray-700",
          hora: "text-gray-600"
        };
      }

      return (
        <td
          key={key}
          rowSpan={Math.max(1, rowSpan)}
          className={`px-2 py-2 bg-gradient-to-br ${colorClase.bg} ${colorClase.text} text-sm relative group align-top border ${colorClase.border} shadow-sm`}
          style={{
            maxWidth: '150px',
            wordWrap: 'break-word',
            overflow: 'hidden'
          }}
        >
          <div className="space-y-1 h-full flex flex-col justify-center min-h-[80px]">
            {clasesInician.map((clase, index) => (
              <div key={index} className={`${index > 0 ? 'border-t border-gray-300 pt-1 mt-1' : ''}`}>
                <p className={`font-semibold ${colorClase.text} break-words leading-tight text-center text-xs`} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>
                  {clase.asignatura}
                </p>
                <p className={`${colorClase.sala} text-xs font-medium text-center`} style={{ wordBreak: 'break-word' }}>{clase.sala}</p>
                {index === 0 && (
                  <p className={`${colorClase.hora} text-xs text-center`}>
                    {clase.horaInicio} - {clase.horaFin}
                  </p>
                )}
                {/* Mostrar hora original si fue ajustada */}
                {index === 0 && (clase.horaOriginalInicio && clase.horaOriginalInicio !== clase.horaInicio) && (
                  <p className={`${colorClase.hora} text-xs text-center opacity-75 italic`}>
                    Original: {clase.horaOriginalInicio} - {clase.horaOriginalFin}
                  </p>
                )}
                {clase.profesor && (
                  <p className={`${colorClase.hora} text-xs text-center font-medium`} style={{ wordBreak: 'break-word' }}>
                    👨‍🏫 {clase.profesor}
                  </p>
                )}
              </div>
            ))}
          </div>
          {/* Botones de eliminar para cada clase */}
          <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            {clasesInician.map((clase, index) => (
              <button
                key={index}
                onClick={() => eliminarHorario(horarios.indexOf(clase))}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs shadow-lg z-10"
                title={`Eliminar ${clase.asignatura}`}
              >
                ×
              </button>
            ))}
          </div>
        </td>
      );
    } else {
      // Celda vacía - sin contenido para evitar puntos suspensivos
      return (
        <td 
          key={key} 
          className="px-2 py-1 bg-white min-h-[40px] align-top border border-gray-200 hover:bg-gray-50 transition-colors duration-150"
          style={{ 
            minHeight: '40px',
            maxWidth: '150px',
            overflow: 'hidden',
            wordWrap: 'break-word'
          }}
        >
          {/* Celda intencionalmente vacía */}
        </td>
      );
    }
  };

  return (
    <PagGeneral>
      <div className="min-h-screen from-blue-50 to-cyan-50 p-2 sm:p-4">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Encabezado */}
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl font-bold text-blue-900">Horario UBB</h1>
            <p className="text-sm sm:text-base text-blue-700">Gestiona y visualiza tus horarios de clases</p>
          </div>

          {/* Mensajes */}
          {mensaje && (
            <div className={`p-4 rounded-lg text-center ${mensaje.includes('exitosamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              {mensaje}
            </div>
          )}

          {/* Verificar si el usuario es alumno */}
          {!user || user.role !== 'alumno' ? (
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-6 text-center">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Acceso Restringido
              </h2>
              <p className="text-blue-700">
                Esta funcionalidad está disponible solo para estudiantes.
              </p>
            </div>
          ) : (
            <>
              {/* Botón para cargar recomendaciones */}
              <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    Recomendaciones de Horarios Inteligentes
                    <HelpTooltip>
                      <h3 className="text-blue-700 font-bold text-sm mb-1">¿Qué puedes hacer aquí?</h3>
                      <p className="text-gray-600 text-xs">
                        Obtén recomendaciones personalizadas basadas en el rendimiento y evaluación de profesores. Si no observas recomendaciones asegúrate de haber seleccionado tus asignaturas aprobadas en la malla y presiona el botón "Generar recomendaciones"
                      </p>
                    </HelpTooltip>
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                  </p>
                </div>

                {/* Mostrar información del estudiante si hay recomendaciones */}
                {recomendaciones && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Información del Estudiante</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Estudiante:</span>
                        <p className="font-medium">{recomendaciones.estudiante}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">RUT:</span>
                        <p className="font-medium">{recomendaciones.rut}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Asignaturas disponibles:</span>
                        <p className="font-medium">{recomendaciones.totalasignaturasInscribibles}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Opciones analizadas:</span>
                        <p className="font-medium">{recomendaciones.totalOpcionesAnalizadas}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center mb-4">
                  <button
                    onClick={cargarRecomendaciones}
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                  >
                    {loading ? 'Cargando...' : 'Generar Recomendaciones'}
                  </button>
                </div>
              </div>

              {/* Sección de Recomendaciones */}
              {recomendaciones && (
                <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
                    <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      Tipos de Recomendaciones
                      <HelpTooltip>
                        <h3 className="text-blue-700 font-bold text-sm mb-1">¿Qué puedes hacer aquí?</h3>
                        <p className="text-gray-600 text-xs mb-2">
                          Aquí puedes seleccionar una combinación horaria que más te interese, además de agregar una clase manual o descargar un PDF.
                        </p>
                        <p className="text-gray-600 text-xs">
                          📝 <strong>Paso importante:</strong> Después de seleccionar un horario, haz clic en "Guardar Inscripción" para registrar oficialmente tus asignaturas en la base de datos.
                        </p>
                      </HelpTooltip>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(recomendaciones.setsRecomendaciones).map(([tipo, setData]) => {
                      // Obtener las recomendaciones del nuevo formato
                      const asignaturas = setData.recomendaciones || setData;
                      const detalles = setData.detalles || {};

                      return (
                        <div
                          key={tipo}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${horarioSeleccionado?.tipo === tipo
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-200 bg-gray-50 hover:border-green-300'
                            }`}
                          onClick={() => seleccionarHorario(tipo)}
                        >
                          <div className="space-y-2">
                            <h3 className="font-bold text-green-900 text-sm">{obtenerNombreTipo(tipo)}</h3>
                            <p className="text-gray-600 text-xs">{obtenerDescripcionTipo(tipo)}</p>
                            <div className="text-xs text-gray-500">
                              <p>📚 {asignaturas.length} asignaturas</p>
                              <p>👨‍🏫 {[...new Set(asignaturas.map(a => a.profesor))].length} profesores</p>
                              {detalles.porcentajeAprobacionPromedio && (
                                <p>📈 Aprobación: {parseFloat(detalles.porcentajeAprobacionPromedio).toFixed(1)}%</p>
                              )}
                              {detalles.evaluacionDocentePromedio && (
                                <p>⭐ Evaluación: {parseFloat(detalles.evaluacionDocentePromedio).toFixed(1)}/7.0</p>
                              )}
                              {detalles.promedioFinal && (
                                <p>📊 Promedio: {parseFloat(detalles.promedioFinal).toFixed(1)}</p>
                              )}
                              {detalles.totalBloques && (
                                <p>🕒 Bloques: {detalles.totalBloques}</p>
                              )}
                              {detalles.totalCreditos && (
                                <p>🎓 Créditos: {detalles.totalCreditos}</p>
                              )}
                            </div>
                            {horarioSeleccionado?.tipo === tipo && (
                              <div className="flex items-center text-green-600 text-xs font-medium">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                Seleccionado
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botones de acción principales - aparecen independientemente de la selección */}
                  <div className="mt-6">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {/* Botón Descargar PDF - aparece cuando hay horarios */}
                      {horarios.length > 0 && (
                        <button
                          onClick={descargarHorario}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Descargar PDF
                        </button>
                      )}

                      {/* Botón Limpiar Todo - aparece cuando hay inscripciones en BD */}
                      {tieneInscripcionesBD && (
                        <button
                          onClick={limpiarHorario}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center gap-2 ${
                            loading 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                          }`}
                        >
                          {loading ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Eliminando...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Limpiar Todo
                            </>
                          )}
                        </button>
                      )}

                      {/* Botón para agregar clase manual - aparece siempre */}
                      <button
                        onClick={() => setMostrarPopup(true)}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Agregar Clase Manual
                      </button>

                      {/* Botón guardar inscripción - aparece cuando hay horarios */}
                      {horarios.length > 0 && (
                        <button
                          onClick={guardarInscripcion}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center gap-2 ${
                            loading 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white'
                          }`}
                        >
                          {loading ? (
                            <>
                              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                              </svg>
                              Guardar Inscripción
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tabla de horarios */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                Horario Actual
                <HelpTooltip className="text-white hover:text-yellow-300">
                  <h3 className="text-blue-700 font-bold text-sm mb-1">¿Qué puedes ver aquí?</h3>
                  <p className="text-gray-600 text-xs">
                    Aquí puedes ver tu horario actual con las clases que has agregado.
                  </p>
                </HelpTooltip>
              </h2>
            </div>

            {/* Botones de acción */}
            {/* {horarios.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={descargarHorario}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar PDF
                </button>
                <button
                  onClick={guardarInscripcion}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center gap-2 ${loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                    }`}
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Guardar Inscripción
                    </>
                  )}
                </button>

              </div>
            )} */}

            <div className="p-4 sm:p-6 overflow-x-auto" ref={horarioRef}>
              <table className="w-full min-w-[600px] border-collapse border border-gray-300 table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-100 to-cyan-100">
                    <th className="px-3 py-3 text-blue-900 font-bold text-sm border border-blue-300" style={{ width: '80px' }}>
                      Hora
                    </th>
                    {days.map((dia) => (
                      <th
                        key={dia}
                        className="px-3 py-3 text-blue-900 font-bold text-sm border border-blue-300"
                        style={{ width: `${(100 - 10) / days.length}%` }}
                      >
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {obtenerHorasAMostrar().map((hora, index) => (
                    <tr key={`${hora}-${index}`} className={
                      hora === "DESCANSO"
                        ? 'bg-gradient-to-r from-gray-50 to-gray-100'
                        : index % 2 === 0 ? 'bg-blue-25' : 'bg-white'
                    }>
                      <td className={`px-3 py-2 text-blue-900 font-medium text-sm border border-blue-200 min-w-[60px] ${hora === "DESCANSO"
                        ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 text-center min-h-[25px]'
                        : 'bg-gradient-to-r from-blue-50 to-blue-25 min-h-[40px]'
                        }`}>
                        {hora === "DESCANSO" ? "" : hora}
                      </td>
                      {days.map((dia, diaIndex) => renderCelda(dia, hora, index)).filter(celda => celda !== null)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>



          {/* Resumen de horarios */}
          {horarios.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h3 className="text-lg font-semibold text-blue-900">
                  Resumen de Clases ({horarios.length} clase{horarios.length !== 1 ? 's' : ''})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {horarios.map((horario, index) => {
                  const colores = obtenerColorAsignatura(horario.asignatura);
                  return (
                    <div key={index} className={`bg-gradient-to-br ${colores.bg} p-4 rounded-lg border ${colores.border} hover:shadow-md transition-shadow duration-200`}>
                      <p className={`font-semibold ${colores.text} break-words leading-tight`}>{horario.asignatura}</p>
                      <p className={`${colores.sala} text-sm font-medium mt-1`}>{horario.dia} - {horario.sala}</p>
                      <p className={`${colores.hora} text-xs mt-1`}>
                        {horario.horaInicio} - {horario.horaFin}
                        {(horario.horaOriginalInicio && horario.horaOriginalInicio !== horario.horaInicio) && (
                          <span className="block italic opacity-75">
                            (Original: {horario.horaOriginalInicio} - {horario.horaOriginalFin})
                          </span>
                        )}
                      </p>
                      {horario.profesor && (
                        <p className={`${colores.hora} text-xs mt-1 font-medium`}>
                          👨‍🏫 {horario.profesor}
                        </p>
                      )}
                      {horario.puntaje && (
                        <p className={`${colores.hora} text-xs mt-1`}>
                          ⭐ Puntaje: {parseFloat(horario.puntaje).toFixed(1)}
                        </p>
                      )}
                      {horario.tipoRecomendacion && (
                        <p className={`${colores.hora} text-xs mt-1 font-medium`}>
                          📊 {obtenerNombreTipo(horario.tipoRecomendacion)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Popup Modal para agregar clase */}
        {mostrarPopup && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setMostrandoSugerencias(false);
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Agregar Nueva Clase
                </h2>

                <form onSubmit={agregarHorario} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Día
                    </label>
                    <select
                      name="dia"
                      value={form.dia}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.dia ? (errors.dia.startsWith('ℹ️') ? 'border-blue-300' : 'border-red-300') : 'border-gray-300'
                        }`}
                    >
                      {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.dia && (
                      <p className={`text-sm mt-1 flex items-center gap-1 ${errors.dia.startsWith('ℹ️') ? 'text-blue-600' : 'text-red-600'
                        }`}>
                        <AlertCircle className="w-4 h-4" />
                        {errors.dia}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Inicio
                    </label>
                    <select
                      name="horaInicio"
                      value={form.horaInicio}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.horaInicio ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      {hours.filter(h => h !== "DESCANSO").map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    {errors.horaInicio && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.horaInicio}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Fin
                    </label>
                    <select
                      name="horaFin"
                      value={form.horaFin}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.horaFin ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      {hours.filter(h => h !== "DESCANSO").map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    {errors.horaFin && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.horaFin}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sala
                    </label>
                    <input
                      type="text"
                      name="sala"
                      value={form.sala}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.sala ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Ej: A-101"
                    />
                    {errors.sala && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.sala}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asignatura
                      {asignaturasDisponibles.length > 0 && (
                        <span className="text-xs text-blue-600 ml-2">
                          ({asignaturasDisponibles.length} disponibles)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="asignatura"
                        value={form.asignatura}
                        onChange={handleChange}
                        onFocus={() => {
                          if (asignaturasDisponibles.length > 0 && form.asignatura === '') {
                            setMostrandoSugerencias(true);
                          }
                        }}
                        onBlur={(e) => {
                          // Delay para permitir clicks en sugerencias
                          setTimeout(() => setMostrandoSugerencias(false), 200);
                        }}
                        className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.asignatura ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Busca una asignatura o escribe una nueva..."
                        autoComplete="off"
                      />
                      
                      {/* Dropdown de sugerencias */}
                      {mostrandoSugerencias && asignaturasDisponibles.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
                          {asignaturasDisponibles
                            .filter(asigInfo => asigInfo.asignatura.toLowerCase().includes(form.asignatura.toLowerCase()))
                            .slice(0, 6) // Limitar a 6 sugerencias para dar más espacio
                            .map((asignaturaInfo, index) => (
                              <div key={index} className="border-b border-gray-100 last:border-b-0">
                                {/* Botón principal para agregar toda la asignatura */}
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    console.log('Botón "Agregar completa" clickeado para:', asignaturaInfo);
                                    seleccionarAsignatura(asignaturaInfo);
                                  }}
                                  className="w-full text-left px-3 py-3 hover:bg-green-50 hover:text-green-900 transition-colors duration-150 border-l-4 border-green-500"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-green-900">{asignaturaInfo.asignatura}</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">📚 Inscribible</span>
                                      </div>
                                      <div className="text-xs text-gray-600 space-y-1">
                                        <p><strong>👨‍🏫 Profesor:</strong> {asignaturaInfo.profesor}</p>
                                        <p><strong>📋 Sección:</strong> {asignaturaInfo.seccion}</p>
                                        <p><strong>🕒 Horarios:</strong> {asignaturaInfo.horarios}</p>
                                        <p><strong>🏛️ Salas:</strong> {asignaturaInfo.sala}</p>
                                        <p><strong>📖 Tipo:</strong> {asignaturaInfo.tipo}</p>
                                      </div>
                                    </div>
                                    <div className="text-xs text-green-600 font-medium ml-2">
                                      ➕ Agregar completa
                                    </div>
                                  </div>
                                </button>
                                
                                {/* Botón secundario para solo usar el nombre */}
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    console.log('Botón "Solo usar nombre" clickeado para:', asignaturaInfo.asignatura);
                                    seleccionarAsignatura(asignaturaInfo.asignatura);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-900 transition-colors duration-150 border-t border-gray-100"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-blue-700">
                                      ✏️ Solo usar nombre "{asignaturaInfo.asignatura}" (personalizar horario)
                                    </span>
                                  </div>
                                </button>
                              </div>
                            ))}
                          
                          {form.asignatura && !asignaturasDisponibles.some(asigInfo => 
                            asigInfo.asignatura.toLowerCase().includes(form.asignatura.toLowerCase())
                          ) && (
                            <div className="px-3 py-3 text-sm text-gray-500 border-t border-gray-200">
                              <span className="text-blue-600">💡 Sugerencia:</span> No hay coincidencias. 
                              Puedes crear una asignatura personalizada escribiendo el nombre.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {errors.asignatura && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.asignatura}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-600 mt-1 space-y-1">
                      <p>💡 <strong>Tip:</strong> Escribe para buscar asignaturas inscribibles con horarios completos</p>
                      <p>➕ <strong>Agregar completa:</strong> Agrega todos los bloques de horario automáticamente</p>
                      <p>✏️ <strong>Solo nombre:</strong> Usar solo el nombre para personalizar horarios manualmente</p>
                      {asignaturasDisponibles.length > 0 && (
                        <p>📋 <strong>Disponibles:</strong> {asignaturasDisponibles.length} opciones con horarios definidos</p>
                      )}
                      <p>🎨 Las clases con el mismo nombre tendrán el mismo color automáticamente</p>
                    </div>
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
                          Agregando...
                        </span>
                      ) : (
                        'Agregar Clase'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div >
    </PagGeneral >
  );
}
