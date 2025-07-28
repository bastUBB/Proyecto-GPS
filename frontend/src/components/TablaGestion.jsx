import React, { useState, useMemo } from 'react';
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const TablaGestion = ({
  data = [],
  columns = [],
  title = "Tabla de Datos",
  icon = null,
  onEdit = null,
  onDelete = null,
  onCreate = null, // Nueva prop para manejar creación
  createButtonText = "Nuevo", // Texto personalizable del botón
  searchPlaceholder = "Buscar...",
  itemsPerPage = 10,
  showActions = true,
  showCreateButton = true, // Nueva prop para mostrar/ocultar botón
  emptyMessage = "No hay datos disponibles"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar datos basado en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(item =>
      columns.some(column => {
        const value = item[column.key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambie el filtro
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const renderCellContent = (item, column) => {
    if (column.render) {
      return column.render(item);
    }
    return item[column.key];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          {icon}
          {title} ({filteredData.length})
        </h2>
      </div>

      {/* Barra de búsqueda y botón de crear */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900 placeholder-blue-400"
          />
        </div>
        
        {showCreateButton && onCreate && (
          <button
            onClick={onCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            {createButtonText}
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`border border-blue-200 px-4 py-3 text-blue-900 font-medium text-sm ${column.align === 'center' ? 'text-center' :
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                >
                  {column.title}
                </th>
              ))}
              {showActions && (
                <th className="border border-blue-200 px-4 py-3 text-center text-blue-900 font-medium text-sm">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-blue-50 border-b border-blue-200">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-4 border-r border-blue-200 text-sm ${column.align === 'center' ? 'text-center' :
                          column.align === 'right' ? 'text-right' : 'text-left'
                        } ${column.className || 'text-blue-700'}`}
                    >
                      {renderCellContent(item, column)}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="px-6 py-8 text-center text-blue-600"
                >
                  {searchTerm ? 'No se encontraron resultados que coincidan con la búsqueda' : emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-blue-200">
          <div className="text-sm text-blue-700">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} resultados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <span className="text-sm text-blue-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaGestion;
