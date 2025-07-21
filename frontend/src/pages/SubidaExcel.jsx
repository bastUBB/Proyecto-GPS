import React, { useState, useCallback, useRef } from "react";
import Button from "../components/ui/button";
import axios from 'axios';
import HelpTooltip from "../components/PuntoAyuda";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../components/ui/table";
import { Upload, FileSpreadsheet, Loader2, BarChart3, Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import Alert from "../components/Alert";
import useAlert from "../hooks/useAlert";
import PagGeneral from "../components/PagGeneral";
import TablaGestion from "../components/TablaGestion";

function SubidaExcel() {
    const [file, setFile] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [fileType, setFileType] = useState('horario'); // 'horario' o 'rendimiento'
    const fileInputRef = useRef(null);

    // Hook para manejar alertas
    const { alert, showSuccess, showError, showWarning, showInfo, hideAlert } = useAlert();

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleSelectFileClick = () => {
        fileInputRef.current.click();
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (
                droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                droppedFile.type === "application/vnd.ms-excel"
            ) {
                setFile(droppedFile);
            }
        }
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const processExcel = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("excelFile", file);
            formData.append("fileType", fileType);

            //console.log(`🔄 Enviando archivo de ${fileType} al servidor...`);

            // Seleccionar endpoint según el tipo de archivo
            const endpoint = fileType === 'rendimiento'
                ? "/api/excel/procesar-rendimiento"
                : "/api/excel/procesar-excel";

            const response = await axios.post(endpoint, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            //console.log('✅ Respuesta del servidor:', response.data);

            if (fileType === 'rendimiento') {
                // Estructura de datos para rendimiento
                setData({
                    fileName: response.data.fileName,
                    totalSubjects: response.data.totalSubjects || 0,
                    subjects: response.data.data || [],
                    extractedAt: response.data.extractedAt,
                    jsonFile: response.data.jsonFile,
                    type: 'rendimiento',
                    statistics: response.data.statistics
                });
            } else {
                // Estructura de datos para horario (existente)
                setData({
                    fileName: response.data.fileName,
                    totalSubjects: response.data.totalSubjects,
                    subjects: response.data.data,
                    extractedAt: response.data.extractedAt,
                    jsonFile: response.data.jsonFile,
                    type: 'horario'
                });
            }

            if (response.data.success) {
                //console.log('📄 Formato JSON del script:', JSON.stringify(response.data.data, null, 2));

                const jsonFileInfo = response.data.jsonFile
                    ? `\nArchivo JSON generado: ${response.data.jsonFile.name}\nRuta: ${response.data.jsonFile.path}`
                    : '';

                const title = fileType === 'rendimiento'
                    ? '¡Archivo de rendimiento procesado!'
                    : '¡Archivo de horario procesado!';

                const message = fileType === 'rendimiento'
                    ? `Se procesaron exitosamente ${response.data.totalSubjects} registros de rendimiento académico.`
                    : `Se extrajeron exitosamente ${response.data.totalSubjects} asignaturas del horario.`;

                const details = `${response.data.message}${jsonFileInfo}\n\nPuedes ver los datos procesados en la tabla de abajo y revisar la consola para el formato JSON completo.`;

                showSuccess(title, message, details);
            }

        } catch (error) {
            console.error("Error al procesar:", error);

            let errorMessage = "Error desconocido";
            let errorDetails = "";

            if (error.response) {
                errorMessage = error.response.data.error ||
                    `Error ${error.response.status}: ${error.response.statusText}`;
                errorDetails = `Código de error: ${error.response.status}\nTipo de archivo: ${fileType}\nNombre del archivo: ${file.name}`;
            } else if (error.request) {
                errorMessage = "No se recibió respuesta del servidor";
                errorDetails = "Verifica tu conexión a internet y que el servidor esté funcionando correctamente.";
            } else {
                errorMessage = error.message;
                errorDetails = "Error interno de la aplicación. Intenta recargar la página.";
            }

            showError('Error al procesar archivo', errorMessage, errorDetails);
        } finally {
            setLoading(false);
        }
    };

    const resetUpload = () => {
        setFile(null);
        setData(null);
    };

    // Función para cambiar tipo de archivo y limpiar datos
    const handleFileTypeChange = (newFileType) => {
        setFileType(newFileType);
        // Limpiar datos anteriores cuando se cambia el tipo de archivo
        setData(null);
        // También limpiar el archivo seleccionado para evitar confusión
        setFile(null);
    };

    const getFileTypeInfo = () => {
        if (fileType === 'rendimiento') {
            return {
                title: 'Datos de Rendimiento Académico',
                icon: <BarChart3 className="w-5 h-5" />,
                color: 'from-green-500 to-emerald-500',
                description: 'Datos de aprobación y reprobación'
            };
        } else {
            return {
                title: 'Horarios de Asignaturas',
                icon: <Calendar className="w-5 h-5" />,
                color: 'from-blue-500 to-cyan-500',
                description: 'Archivos con horarios y asignaturas'
            };
        }
    };

    // Configuración de columnas para datos de rendimiento
    const getRendimientoColumns = () => [
        {
            key: 'año',
            title: 'Año',
            align: 'center'
        },
        {
            key: 'semestre',
            title: 'Semestre',
            align: 'center'
        },
        {
            key: 'codigoSeccion',
            title: 'Código',
            align: 'left'
        },
        {
            key: 'nombreAsignatura',
            title: 'Asignatura',
            align: 'left'
        },
        {
            key: 'porcentajeAprobacion',
            title: '% Aprobación',
            align: 'center',
            render: (item) => (
                <span className="font-semibold text-green-700">
                    {item.porcentajeAprobacion}
                </span>
            )
        },
        {
            key: 'inscritos',
            title: 'Inscritos',
            align: 'center'
        },
        {
            key: 'aprobados',
            title: 'Aprobados',
            align: 'center'
        }
    ];

    // Configuración de columnas para datos de horario
    const getHorarioColumns = () => [
        {
            key: 'asignaturaCodigo',
            title: 'Código',
            align: 'left'
        },
        {
            key: 'seccion',
            title: 'Sección',
            align: 'center'
        },
        {
            key: 'asignatura',
            title: 'Asignatura',
            align: 'left'
        },
        {
            key: 'docente',
            title: 'Docente',
            align: 'left'
        },
        {
            key: 'bloques',
            title: 'Bloques',
            align: 'left',
            render: (item) => (
                <div className="space-y-1">
                    {item.bloques.map((bloque, bIndex) => (
                        <div key={bIndex} className="text-xs bg-blue-100 px-2 py-1 rounded">
                            {bloque.tipo}: {bloque.dia} {bloque.horaInicio}-{bloque.horaFin}
                        </div>
                    ))}
                </div>
            )
        }
    ];

    // Procesar datos para agregar ID único requerido por TablaGestion
    const getProcessedData = () => {
        if (!data?.subjects) return [];
        
        return data.subjects.map((subject, index) => ({
            ...subject,
            id: index + 1 // Agregar ID único
        }));
    };

    return (
        <PagGeneral>
            <div className="min-h-screen from-blue-50 to-cyan-50 p-2 sm:p-4">
                <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
                    <div className="text-center space-y-1 sm:space-y-2">
                        <h1 className="text-xl sm:text-3xl font-bold text-blue-900">Procesador de Excel</h1>
                        <p className="text-sm sm:text-base text-blue-700">Sube tu archivo Excel y procésalo con nuestro sistema avanzado</p>
                    </div>

                    {/* Selector de tipo de archivo */}
                    <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
                            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                Tipo de archivo exel
                                <HelpTooltip className="text-white hover:text-yellow-300">
                                    <h3 className="text-blue-700 font-bold text-sm mb-1">Información del procesador</h3>
                                    <p className="text-gray-600 text-xs">
                                        Formatos Soportados Excel (.xlsx, .xls)
                                        Tamaño Máximo 10 MB por archivo
                                    </p>
                                </HelpTooltip>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${fileType === 'horario'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                onClick={() => handleFileTypeChange('horario')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-blue-600">
                                        <Calendar className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-900">Horarios</h4>
                                        <p className="text-sm text-blue-700">Archivos con horarios y asignaturas</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${fileType === 'rendimiento'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                                    }`}
                                onClick={() => handleFileTypeChange('rendimiento')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-green-600">
                                        <BarChart3 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-900">Rendimiento</h4>
                                        <p className="text-sm text-green-700">Datos de aprobación y reprobación</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
                        <div className={`bg-gradient-to-r ${getFileTypeInfo().color} text-white p-3 sm:p-4 rounded-lg mb-4`}>
                            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                {getFileTypeInfo().icon}
                                {getFileTypeInfo().title}
                            </h2>
                            <p className="text-white/90 text-xs sm:text-sm mt-1">
                                {getFileTypeInfo().description}
                            </p>
                        </div>

                        {!file ? (
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-300 ${dragActive
                                    ? "border-blue-500 bg-blue-50 scale-105"
                                    : "border-blue-300 hover:border-blue-400 hover:bg-blue-50"
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-bounce" />
                                <p className="text-base font-medium text-blue-900 mb-2">
                                    Arrastra tu archivo Excel aquí
                                </p>
                                <p className="text-sm text-blue-600 mb-4">
                                    o haz clic para seleccionar desde tu computadora
                                </p>
                                <Button
                                    onClick={handleSelectFileClick}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Seleccionar Archivo
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    id="file-upload"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <p className="font-semibold text-blue-900">{file.name}</p>
                                            <p className="text-sm text-blue-600">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={processExcel}
                                            disabled={loading}
                                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center">
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Procesando...
                                                </span>
                                            ) : (
                                                "Procesar Excel"
                                            )}
                                        </Button>
                                        <Button
                                            onClick={resetUpload}
                                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                        >
                                            Cambiar archivo
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {data && (
                        // <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
                        <div>
                            {/* <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
                                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                    {getFileTypeInfo().icon}
                                    Datos Procesados - {getFileTypeInfo().title}
                                </h2>
                                <p className="text-cyan-100 text-xs sm:text-sm mt-1">
                                    Archivo: {data.fileName} | Total: {data.totalSubjects} {fileType === 'rendimiento' ? 'registros' : 'asignaturas'}
                                </p>
                            </div> */}

                            <div className="p-4 sm:p-6">
                                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-900">Total Extraídas</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-700">{data.totalSubjects}</p>
                                    </div>

                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 text-green-600">📄</span>
                                            <span className="text-sm font-medium text-green-900">
                                                {data.jsonFile ? 'JSON Guardado' : 'JSON Generado'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-green-700">
                                            {data.jsonFile ? data.jsonFile.name : 'Ver abajo ↓'}
                                        </p>
                                    </div>
                                </div> */}

                                {/* Información del archivo JSON generado */}
                                {/* {data.jsonFile && (
                                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                            <span className="text-green-600">💾</span>
                                            Archivo JSON Generado
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="font-medium text-green-800">Nombre:</p>
                                                <p className="text-green-700 break-all">{data.jsonFile.name}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-800">Ruta:</p>
                                                <p className="text-green-700 break-all">{data.jsonFile.path}</p>
                                            </div>
                                        </div>
                                    </div>
                                )} */}

                                <div className="space-y-3">
                                    {data.subjects && data.subjects.length > 0 ? (
                                        <TablaGestion
                                            data={getProcessedData()}
                                            columns={fileType === 'rendimiento' ? getRendimientoColumns() : getHorarioColumns()}
                                            title={fileType === 'rendimiento' ? 'Datos de Rendimiento Académico' : 'Asignaturas Extraídas'}
                                            icon={getFileTypeInfo().icon}
                                            searchPlaceholder={fileType === 'rendimiento' ? 'Buscar por asignatura, código...' : 'Buscar por asignatura, docente...'}
                                            showActions={false}
                                            showCreateButton={false}
                                            itemsPerPage={20}
                                            emptyMessage="No se encontraron datos para mostrar"
                                        />
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p>No se encontraron datos para mostrar</p>
                                        </div>
                                    )}
                                </div>

                                {/* Mostrar JSON crudo del script */}
                                {/* <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="text-blue-600">📄</span>
                                        Formato JSON generado por el script
                                    </h4>
                                    <div className="bg-black text-green-400 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                                        <pre className="text-sm whitespace-pre-wrap">
                                            {JSON.stringify(data.subjects, null, 2)}
                                        </pre>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        💡 Este es el formato exacto que genera el script de extracción - Sin procesamiento de BD
                                    </p>
                                </div> */}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Componente de Alerta */}
            <Alert
                type={alert.type}
                title={alert.title}
                message={alert.message}
                details={alert.details}
                isVisible={alert.isVisible}
                onClose={hideAlert}
                autoCloseTime={alert.autoCloseTime}
            />
        </PagGeneral>
    );
}

export default SubidaExcel;