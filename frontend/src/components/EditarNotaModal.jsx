import { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function EditarNotaModal({ 
    isOpen, 
    onClose, 
    asignatura, 
    currentNote,
    currentSemestre,
    onSave 
}) {
    const [nota, setNota] = useState(currentNote?.toString() || '');
    const [semestre, setSemestre] = useState(currentSemestre?.toString() || '1');
    const [loading, setLoading] = useState(false);

    const isValidNote = (note) => {
        const num = parseFloat(note);
        return !isNaN(num) && num >= 1.0 && num <= 7.0;
    };

    const handleSave = async () => {
        if (!isValidNote(nota)) return;
        
        setLoading(true);
        try {
            await onSave(asignatura, nota, semestre);
            onClose();
        } catch (error) {
            console.error('Error al guardar nota:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && isValidNote(nota)) {
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Editar Nota
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-4">
                        <strong>Asignatura:</strong> {asignatura}
                    </p>
                    <div className="space-y-4">
                        <div>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nota (1.0 - 7.0)
                            </label>
                            <input
                                type="number"
                                min="1.0"
                                max="7.0"
                                step="0.1"
                                value={nota}
                                onChange={(e) => setNota(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: 5.5"
                                autoFocus
                            />
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                <span>Mínimo: 1.0</span>
                                <span>Máximo: 7.0</span>
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
                        disabled={!isValidNote(nota) || loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>

                {nota && !isValidNote(nota) && (
                    <p className="mt-2 text-sm text-red-600">
                        La nota debe estar entre 1.0 y 7.0
                    </p>
                )}
            </div>
        </div>
    );
}
