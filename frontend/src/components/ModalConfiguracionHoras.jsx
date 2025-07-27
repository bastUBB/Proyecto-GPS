import { useState } from 'react';

// Componente Modal para configurar horas de asignatura
const ModalConfiguracionHoras = ({ asignatura, onGuardar, onCerrar }) => {
    const [horasSemanales, setHorasSemanales] = useState(asignatura.horasSemanales || 4);

    const handleSubmit = (e) => {
        e.preventDefault();
        onGuardar(asignatura._id, horasSemanales);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-t-lg">
                    <h3 className="text-lg font-semibold">Configurar Horas Semanales</h3>
                    <p className="text-blue-100 text-sm mt-1">
                        Asignatura: {asignatura.nombreAsignatura}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label htmlFor="horasSemanales" className="block text-sm font-medium text-gray-700 mb-2">
                            Horas por semana:
                        </label>
                        <input
                            type="number"
                            id="horasSemanales"
                            min="1"
                            max="20"
                            value={horasSemanales}
                            onChange={(e) => setHorasSemanales(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Especifica cuántas horas por semana planeas dictar esta asignatura
                        </p>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Guardar Horas
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalConfiguracionHoras;
