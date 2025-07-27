import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

export default function EditarNotasParcialesModal({ 
    isOpen, 
    onClose, 
    asignatura, 
    currentNote,
    currentSemestre,
    notasParciales = [],
    onSave,
    tipo = 'inscribible' // Agregar tipo para saber si es inscribible o cursada
}) {
    const [semestre, setSemestre] = useState(currentSemestre?.toString() || '1');
    const [parciales, setParciales] = useState([]);
    const [notaFinalCalculada, setNotaFinalCalculada] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Inicializar con notas parciales existentes o una evaluación por defecto
            if (notasParciales.length > 0) {
                setParciales([...notasParciales]);
            } else {
                setParciales([
                    { evaluacion: 'Certamen 1', nota: '', ponderacion: 30 },
                    { evaluacion: 'Certamen 2', nota: '', ponderacion: 30 },
                    { evaluacion: 'Certamen 3', nota: '', ponderacion: 40 }
                ]);
            }
        }
    }, [isOpen, notasParciales]);

    useEffect(() => {
        calcularNotaFinal();
    }, [parciales]);

    const calcularNotaFinal = () => {
        let notaTotal = 0;
        let ponderacionTotal = 0;
        let todasTienenNota = true;

        parciales.forEach(parcial => {
            if (parcial.nota && !isNaN(parseFloat(parcial.nota))) {
                notaTotal += (parseFloat(parcial.nota) * parseFloat(parcial.ponderacion)) / 100;
                ponderacionTotal += parseFloat(parcial.ponderacion);
            } else {
                todasTienenNota = false;
            }
        });

        if (todasTienenNota && ponderacionTotal > 0) {
            setNotaFinalCalculada(notaTotal);
        } else {
            setNotaFinalCalculada(0);
        }
    };

    const isValidNote = (note) => {
        const num = parseFloat(note);
        return !isNaN(num) && num >= 1.0 && num <= 7.0;
    };

    const isValidPonderacion = (ponderacion) => {
        const num = parseFloat(ponderacion);
        return !isNaN(num) && num >= 0 && num <= 100;
    };

    // Función para aplicar redondeo académico
    const aplicarRedondeoAcademico = (nota) => {
        if (nota >= 3.95 && nota < 4.0) {
            return 4.0;
        }
        return nota;
    };

    // Función para obtener la nota final para mostrar (con redondeo)
    const getNotaFinalParaMostrar = () => {
        return aplicarRedondeoAcademico(notaFinalCalculada);
    };

    // Función para saber si se aplicó redondeo
    const seAplicoRedondeo = () => {
        return notaFinalCalculada >= 3.95 && notaFinalCalculada < 4.0;
    };

    const calcularNotaNecesaria = () => {
        let notaTotal = 0;
        let ponderacionTotal = 0;
        let notasFaltantes = 0;
        let indiceFaltante = -1;
        let notasCompletas = 0;

        parciales.forEach((parcial, index) => {
            const tieneNota = parcial.nota && !isNaN(parseFloat(parcial.nota)) && parseFloat(parcial.nota) > 0;
            const tienePonderacion = parseFloat(parcial.ponderacion || 0) > 0;
            
            if (tieneNota && tienePonderacion) {
                notaTotal += (parseFloat(parcial.nota) * parseFloat(parcial.ponderacion)) / 100;
                ponderacionTotal += parseFloat(parcial.ponderacion);
                notasCompletas++;
            } else if (tienePonderacion && !tieneNota) {
                notasFaltantes++;
                indiceFaltante = index;
            }
        });

        // Solo mostrar sugerencia si:
        // 1. Falta exactamente una nota
        // 2. Ya hay al menos 2 notas completas (para que tenga sentido la sugerencia)
        // 3. Las ponderaciones suman cerca del 100%
        const ponderacionFaltante = indiceFaltante !== -1 ? parseFloat(parciales[indiceFaltante].ponderacion || 0) : 0;
        const ponderacionCompleta = ponderacionTotal + ponderacionFaltante;
        const ponderacionEsValida = Math.abs(ponderacionCompleta - 100) < 5; // Tolerancia del 5%

        if (notasFaltantes === 1 && 
            indiceFaltante !== -1 && 
            notasCompletas >= 2 && 
            ponderacionEsValida &&
            ponderacionCompleta > 0) {
            
            const notaPara40 = ((4.0 * ponderacionCompleta) - (notaTotal * 100)) / ponderacionFaltante;
            const notaPara395 = ((3.96 * ponderacionCompleta) - (notaTotal * 100)) / ponderacionFaltante;
            
            return {
                para40: Math.max(1.0, Math.min(7.0, notaPara40)),
                para395: Math.max(1.0, Math.min(7.0, notaPara395)),
                evaluacion: parciales[indiceFaltante].evaluacion || `Evaluación ${indiceFaltante + 1}`,
                factible40: notaPara40 >= 1.0 && notaPara40 <= 7.0,
                factible395: notaPara395 >= 1.0 && notaPara395 <= 7.0,
                notasCompletas: notasCompletas,
                ponderacionCompleta: ponderacionCompleta
            };
        }
        return null;
    };

    const notaNecesaria = calcularNotaNecesaria();

    const handleParcialChange = (index, field, value) => {
        const newParciales = [...parciales];
        newParciales[index][field] = value;
        setParciales(newParciales);
    };

    const aplicarNotaNecesaria = (notaObjetivo) => {
        if (notaNecesaria) {
            const indiceFaltante = parciales.findIndex(p => !p.nota || isNaN(parseFloat(p.nota)));
            if (indiceFaltante !== -1) {
                const newParciales = [...parciales];
                newParciales[indiceFaltante].nota = notaObjetivo.toFixed(2);
                setParciales(newParciales);
            }
        }
    };

    const addParcial = () => {
        setParciales([...parciales, { evaluacion: '', nota: '', ponderacion: 0 }]);
    };

    const removeParcial = (index) => {
        if (parciales.length > 1) {
            const newParciales = parciales.filter((_, i) => i !== index);
            setParciales(newParciales);
        }
    };

    const handleSave = async () => {
        // Validar que todas las notas sean válidas
        for (let parcial of parciales) {
            if (parcial.nota && !isValidNote(parcial.nota)) {
                alert('Todas las notas deben estar entre 1.0 y 7.0');
                return;
            }
            if (!isValidPonderacion(parcial.ponderacion)) {
                alert('Todas las ponderaciones deben estar entre 0 y 100');
                return;
            }
            if (!parcial.evaluacion.trim()) {
                alert('Todas las evaluaciones deben tener un nombre');
                return;
            }
        }

        // Verificar que la suma de ponderaciones sea 100
        const sumaPonderaciones = parciales.reduce((sum, p) => sum + parseFloat(p.ponderacion || 0), 0);
        if (Math.abs(sumaPonderaciones - 100) > 0.1) {
            alert('La suma de las ponderaciones debe ser 100%');
            return;
        }

        setLoading(true);
        try {
            // Enviar la nota final con redondeo académico aplicado
            const notaFinalParaGuardar = getNotaFinalParaMostrar();
            await onSave(asignatura, notaFinalParaGuardar.toFixed(2), semestre, parciales);
            onClose();
        } catch (error) {
            console.error('Error al guardar notas parciales:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Editar Notas Parciales
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-4">
                        <strong>Asignatura:</strong> {asignatura}
                    </p>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Semestre
                        </label>
                        <select
                            value={semestre}
                            onChange={(e) => setSemestre(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="1">Primer Semestre</option>
                            <option value="2">Segundo Semestre</option>
                        </select>
                    </div>

                    {/* Advertencia para conversión de estado */}
                    {tipo === 'inscribible' && (
                        <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-medium text-amber-900 mb-2">
                                ⚠️ Conversión a Asignatura Cursada
                            </h4>
                            <p className="text-sm text-amber-800 mb-2">
                                Esta asignatura está marcada como <strong>inscribible</strong>. Al guardar las notas parciales, 
                                se convertirá automáticamente en una asignatura <strong>cursada</strong>.
                            </p>
                            <div className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
                                <p className="mb-1">• Las notas parciales se convertirán en el historial académico formal</p>
                                <p className="mb-1">• Si la nota final es menor a 4.0, se ajustará automáticamente a 4.0</p>
                                <p>• Este cambio será permanente una vez guardado</p>
                            </div>
                        </div>
                    )}

                    {/* Nota final calculada */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Nota Final Calculada</h4>
                        <div className={`text-2xl font-bold ${
                            getNotaFinalParaMostrar() >= 4 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {getNotaFinalParaMostrar().toFixed(2)}
                        </div>
                        {seAplicoRedondeo() && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                <p className="text-xs text-green-700">
                                    ✨ <strong>Redondeo académico aplicado</strong>
                                </p>
                                <p className="text-xs text-green-600">
                                    Nota real: {notaFinalCalculada.toFixed(2)} → Nota final: 4.0
                                </p>
                            </div>
                        )}
                        <p className="text-sm text-blue-700">
                            {getNotaFinalParaMostrar() >= 3.95 ? 'Aprobada' : 'Reprobada'}
                        </p>
                    </div>

                    {/* Calculadora de nota necesaria */}
                    {notaNecesaria && (
                        <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h4 className="font-medium text-yellow-900 mb-3">
                                🎯 Sugerencia para "{notaNecesaria.evaluacion}"
                            </h4>
                            <p className="text-xs text-yellow-700 mb-3">
                                Con {notaNecesaria.notasCompletas} notas ingresadas, necesitas:
                            </p>
                            <div className="space-y-2">
                                {/* <div className="flex items-center justify-between">
                                    <span className="text-sm text-yellow-800">Para obtener 4.0 (aprobación cómoda):</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold text-lg ${
                                            notaNecesaria.factible40 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {notaNecesaria.para40.toFixed(2)}
                                        </span>
                                        {notaNecesaria.factible40 && (
                                            <button
                                                onClick={() => aplicarNotaNecesaria(notaNecesaria.para40)}
                                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                                title="Aplicar esta nota automáticamente"
                                            >
                                                Aplicar
                                            </button>
                                        )}
                                    </div>
                                </div> */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-yellow-800">Para obtener 3.95 (mínimo aprobación):</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold text-lg ${
                                            notaNecesaria.factible395 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {notaNecesaria.para395.toFixed(2)}
                                        </span>
                                        {notaNecesaria.factible395 && (
                                            <button
                                                onClick={() => aplicarNotaNecesaria(notaNecesaria.para395)}
                                                className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                                                title="Aplicar esta nota automáticamente"
                                            >
                                                Aplicar
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {!notaNecesaria.factible40 && !notaNecesaria.factible395 && (
                                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                                        <p className="text-xs text-red-600">
                                            ⚠️ Con las notas actuales no es posible aprobar la asignatura
                                        </p>
                                        <p className="text-xs text-red-500 mt-1">
                                            Se necesitaría una nota mayor a 7.0 para aprobar
                                        </p>
                                    </div>
                                )}
                                {(notaNecesaria.factible40 || notaNecesaria.factible395) && (
                                    <p className="text-xs text-yellow-600 mt-2">
                                        💡 Puedes escribir la nota manualmente o usar los botones "Aplicar"
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notas parciales */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">Evaluaciones</h4>
                            <button
                                onClick={addParcial}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Agregar
                            </button>
                        </div>

                        {parciales.map((parcial, index) => {
                            const tieneNota = parcial.nota && !isNaN(parseFloat(parcial.nota)) && parseFloat(parcial.nota) > 0;
                            const tienePonderacion = parseFloat(parcial.ponderacion || 0) > 0;
                            const estaCompleto = tieneNota && tienePonderacion;
                            
                            return (
                            <div key={index} className={`grid grid-cols-12 gap-2 items-center p-3 border rounded-lg transition-colors ${
                                estaCompleto ? 'bg-green-50 border-green-200' : 'border-gray-300'
                            }`}>
                                <div className="col-span-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={parcial.evaluacion}
                                            onChange={(e) => handleParcialChange(index, 'evaluacion', e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Nombre evaluación"
                                        />
                                        {estaCompleto && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        min="1.0"
                                        max="7.0"
                                        step="0.1"
                                        value={parcial.nota}
                                        onChange={(e) => handleParcialChange(index, 'nota', e.target.value)}
                                        className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                            tieneNota ? 'border-green-300 bg-green-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Nota"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={parcial.ponderacion}
                                            onChange={(e) => handleParcialChange(index, 'ponderacion', e.target.value)}
                                            className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                tienePonderacion ? 'border-green-300 bg-green-50' : 'border-gray-300'
                                            }`}
                                            placeholder="0"
                                        />
                                        <span className="ml-1 text-sm text-gray-500">%</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    {parciales.length > 1 && (
                                        <button
                                            onClick={() => removeParcial(index)}
                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                            title="Eliminar evaluación"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            )
                        })}

                        {/* Resumen de ponderaciones */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between text-sm">
                                <span>Total ponderación:</span>
                                <span className={`font-medium ${
                                    Math.abs(parciales.reduce((sum, p) => sum + parseFloat(p.ponderacion || 0), 0) - 100) < 0.1
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}>
                                    {parciales.reduce((sum, p) => sum + parseFloat(p.ponderacion || 0), 0)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || notaFinalCalculada === 0}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Guardando...' : 'Guardar Notas'}
                    </button>
                </div>
            </div>
        </div>
    );
}
