import React, { useState, useCallback } from "react";
import Button from "../components/ui/button";
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

export default function SubidaExcel() {
    const [file, setFile] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

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
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array" });

            const result = {};

            workbook.SheetNames.forEach((sheetName) => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                result[sheetName] = jsonData;
            });

            setData(result);
        } catch (error) {
            console.error("Error processing Excel file:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetUpload = () => {
        setFile(null);
        setData(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-2 sm:p-4">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {/* Encabezado responsivo */}
                <div className="text-center space-y-1 sm:space-y-2">
                    <h1 className="text-xl sm:text-3xl font-bold text-blue-900">Procesador de Excel</h1>
                    <p className="text-sm sm:text-base text-blue-700">Sube tu archivo Excel y procésalo con nuestro script</p>
                </div>

                {/* Tarjeta de subida de archivos */}
                <Card className="border-blue-200 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 sm:py-4">
                        <CardTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg">
                            <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
                            Subir Archivo Excel
                        </CardTitle>
                        <CardDescription className="text-blue-100 text-xs sm:text-sm">
                            Arrastra y suelta tu archivo Excel o haz clic para seleccionar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6">
                        {!file ? (
                            <div
                                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-blue-300 hover:border-blue-400 hover:bg-blue-25"}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 mx-auto mb-2 sm:mb-3" />
                                <p className="text-sm sm:text-base font-medium text-blue-900 mb-1 sm:mb-2">Arrastra tu archivo Excel aquí</p>
                                <p className="text-blue-600 mb-2 sm:mb-3">o</p>
                                <label htmlFor="file-upload" className="block">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
                                        Seleccionar archivo
                                    </Button>
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <p className="text-xs text-blue-500 mt-2 sm:mt-3">Formatos soportados: .xlsx, .xls</p>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                        <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-blue-900 text-sm sm:text-base truncate max-w-[150px] sm:max-w-xs">{file.name}</p>
                                            <p className="text-xs text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <Button
                                            onClick={processExcel}
                                            disabled={loading}
                                            className="bg-cyan-600 hover:bg-cyan-700 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 w-full sm:w-auto"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center">
                                                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                                                    Procesando...
                                                </span>
                                            ) : (
                                                "Procesar Excel"
                                            )}
                                        </Button>
                                        <Button
                                            onClick={resetUpload}
                                            variant="outline"
                                            className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 w-full sm:w-auto"
                                        >
                                            Cambiar archivo
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Resultados procesados */}
                {data && (
                    <Card className="border-cyan-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 sm:py-4">
                            <CardTitle className="text-base sm:text-lg">Datos Procesados</CardTitle>
                            <CardDescription className="text-cyan-100 text-xs sm:text-sm">
                                Contenido del archivo Excel procesado por el script
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="space-y-4 sm:space-y-6">
                                {Object.entries(data).map(([sheetName, sheetData]) => (
                                    <div key={sheetName} className="space-y-2 sm:space-y-3">
                                        <h3 className="text-sm sm:text-base font-semibold text-blue-900 border-b border-blue-200 pb-1 sm:pb-2">
                                            Hoja: {sheetName}
                                        </h3>
                                        {sheetData.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <Table className="min-w-[500px] sm:min-w-full">
                                                    <TableHeader>
                                                        <TableRow className="bg-blue-50">
                                                            {sheetData[0] &&
                                                                Array.isArray(sheetData[0]) &&
                                                                sheetData[0].map((header, index) => (
                                                                    <TableHead
                                                                        key={index}
                                                                        className="text-blue-900 font-semibold text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
                                                                    >
                                                                        {header || `Col ${index + 1}`}
                                                                    </TableHead>
                                                                ))}
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {sheetData.slice(1, 6).map((row, rowIndex) => (
                                                            <TableRow key={rowIndex} className="hover:bg-cyan-25">
                                                                {Array.isArray(row) &&
                                                                    row.map((cell, cellIndex) => (
                                                                        <TableCell
                                                                            key={cellIndex}
                                                                            className="text-blue-800 text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
                                                                        >
                                                                            {cell !== null && cell !== undefined ? String(cell) : ""}
                                                                        </TableCell>
                                                                    ))}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                                {sheetData.length > 6 && (
                                                    <p className="text-xs text-blue-600 mt-1 sm:mt-2 text-center">
                                                        Mostrando las primeras 5 filas de {sheetData.length - 1} filas totales
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-blue-600 italic text-xs sm:text-sm">Esta hoja está vacía</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}