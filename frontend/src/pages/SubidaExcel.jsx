import React, { useState, useCallback, useRef } from "react";
import Button from "../components/ui/button";
import axios from 'axios';
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
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import PagGeneral from "../components/PagGeneral";

export default function SubidaExcel() {
    const [file, setFile] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null); // Añade esta línea

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
        fileInputRef.current.click(); // Activa el input file al hacer clic en el botón
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

            // Usando Axios correctamente
            const response = await axios.post("/api/excel/procesar-excel", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            // Axios pone los datos en response.data
            setData({
                // Usamos el nombre del archivo como "sheetName"
                [file.name]: response.data.data
            });
        } catch (error) {
            console.error("Error al procesar:", error);

            // Manejo detallado de errores de Axios
            let errorMessage = "Error desconocido";
            if (error.response) {
                // El servidor respondió con un código de error
                errorMessage = error.response.data.error ||
                    `Error ${error.response.status}: ${error.response.statusText}`;
            } else if (error.request) {
                // La solicitud fue hecha pero no se recibió respuesta
                errorMessage = "No se recibió respuesta del servidor";
            } else {
                // Error al configurar la solicitud
                errorMessage = error.message;
            }

            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const resetUpload = () => {
        setFile(null);
        setData(null);
    };

    return (
        <PagGeneral>
            <div className="min-h-screen from-blue-50 to-cyan-50 p-2 sm:p-4">
                <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
                    {/* Encabezado */}
                    <div className="text-center space-y-1 sm:space-y-2">
                        <h1 className="text-xl sm:text-3xl font-bold text-blue-900">Procesador de Excel</h1>
                        <p className="text-sm sm:text-base text-blue-700">Sube tu archivo Excel y procésalo con nuestro sistema avanzado</p>
                    </div>

                    {/* Tarjeta de subida de archivos */}
                    <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
                            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5" />
                                Subir Archivo Excel
                            </h2>
                            <p className="text-blue-100 text-xs sm:text-sm mt-1">
                                Arrastra y suelta tu archivo Excel o haz clic para seleccionar
                            </p>
                        </div>

                        {!file ? (
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-300 ${
                                    dragActive 
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
                                <p className="text-blue-600 mb-4 text-sm">o</p>
                                <Button
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                    onClick={handleSelectFileClick}
                                >
                                    Seleccionar archivo
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    id="file-upload"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <p className="text-xs text-blue-500 mt-4">
                                    Formatos soportados: .xlsx, .xls (Máximo 10MB)
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                        <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-blue-900 text-sm sm:text-base">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-blue-600">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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

                    {/* Resultados procesados */}
                    {data && (
                        <div className="bg-white rounded-lg shadow-lg border border-blue-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-3 sm:p-4">
                                <h2 className="text-base sm:text-lg font-semibold">Datos Procesados</h2>
                                <p className="text-cyan-100 text-xs sm:text-sm mt-1">
                                    Contenido del archivo Excel procesado exitosamente
                                </p>
                            </div>
                            
                            <div className="p-4 sm:p-6">
                                <div className="space-y-4 sm:space-y-6">
                                    {Object.entries(data).map(([sheetName, sheetData]) => (
                                        <div key={sheetName} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-semibold text-blue-900 flex items-center gap-2">
                                                    <FileSpreadsheet className="w-4 h-4" />
                                                    Hoja: {sheetName}
                                                </h3>
                                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                    {sheetData.length} filas
                                                </span>
                                            </div>
                                            
                                            {sheetData.length > 0 ? (
                                                <div className="overflow-x-auto bg-white rounded-lg border border-blue-200">
                                                    <Table className="w-full">
                                                        <TableHeader>
                                                            <TableRow className="bg-blue-50">
                                                                {sheetData[0] &&
                                                                    Array.isArray(sheetData[0]) &&
                                                                    sheetData[0].map((header, index) => (
                                                                        <TableHead
                                                                            key={index}
                                                                            className="text-blue-900 font-semibold text-xs sm:text-sm px-3 py-2 border-r border-blue-200"
                                                                        >
                                                                            {header || `Columna ${index + 1}`}
                                                                        </TableHead>
                                                                    ))}
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {sheetData.slice(1, 8).map((row, rowIndex) => (
                                                                <TableRow key={rowIndex} className="hover:bg-blue-50 transition-colors">
                                                                    {Array.isArray(row) &&
                                                                        row.map((cell, cellIndex) => (
                                                                            <TableCell
                                                                                key={cellIndex}
                                                                                className="text-blue-800 text-xs sm:text-sm px-3 py-2 border-r border-blue-100"
                                                                            >
                                                                                {cell !== null && cell !== undefined ? String(cell) : "-"}
                                                                            </TableCell>
                                                                        ))}
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                    
                                                    {sheetData.length > 8 && (
                                                        <div className="bg-blue-50 p-3 text-center border-t border-blue-200">
                                                            <p className="text-xs text-blue-600">
                                                                Mostrando las primeras 7 filas de {sheetData.length - 1} total
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                                    <p className="text-blue-600 italic text-sm">
                                                        Esta hoja está vacía
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información de ayuda */}
                    <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                            Información del Procesador
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="font-semibold text-blue-900 mb-1">Formatos Soportados</p>
                                <p className="text-blue-700">Excel (.xlsx, .xls)</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="font-semibold text-blue-900 mb-1">Tamaño Máximo</p>
                                <p className="text-blue-700">10 MB por archivo</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="font-semibold text-blue-900 mb-1">Procesamiento</p>
                                <p className="text-blue-700">Automático y seguro</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PagGeneral>
    );
}