import fs from 'fs';

// Script para limpiar y deduplicar los datos extraídos
const limpiarDatos = () => {
    console.log('🧹 Limpiando y deduplicando datos extraídos...');
    
    try {
        // Leer datos completos
        const datosCompletos = JSON.parse(fs.readFileSync('datos_completos_final.json', 'utf8'));
        
        console.log('📊 Datos originales:');
        console.log(`   📈 Rendimiento por carrera: ${datosCompletos.rendimientoPorCarrera.length} registros`);
        console.log(`   📚 Rendimiento por asignatura: ${datosCompletos.rendimientoPorAsignatura.length} registros`);
        
        // Deduplicar datos por carrera
        const carreraUnicos = [];
        const carreraVistos = new Set();
        
        datosCompletos.rendimientoPorCarrera.forEach(dato => {
            const clave = `${dato.año}-${dato.codigoCarrera}-${dato.carrera}`;
            if (!carreraVistos.has(clave)) {
                carreraVistos.add(clave);
                carreraUnicos.push(dato);
            }
        });
        
        // Deduplicar datos por asignatura
        const asignaturasUnicas = [];
        const asignaturasVistas = new Set();
        
        datosCompletos.rendimientoPorAsignatura.forEach(dato => {
            const clave = `${dato.año || 'N/A'}-${dato.semestre}-${dato.codigoSeccion}-${dato.nombreAsignatura}`;
            if (!asignaturasVistas.has(clave)) {
                asignaturasVistas.add(clave);
                asignaturasUnicas.push(dato);
            }
        });
        
        console.log('\n🧹 Datos después de deduplicación:');
        console.log(`   📈 Rendimiento por carrera: ${carreraUnicos.length} registros únicos`);
        console.log(`   📚 Rendimiento por asignatura: ${asignaturasUnicas.length} registros únicos`);
        
        // Crear datos limpios
        const datosLimpios = {
            rendimientoPorCarrera: carreraUnicos,
            rendimientoPorAsignatura: asignaturasUnicas,
            estadisticas: {
                fechaLimpieza: new Date().toISOString(),
                datosOriginales: {
                    carrera: datosCompletos.rendimientoPorCarrera.length,
                    asignaturas: datosCompletos.rendimientoPorAsignatura.length
                },
                datosLimpios: {
                    carrera: carreraUnicos.length,
                    asignaturas: asignaturasUnicas.length
                },
                eliminados: {
                    carrera: datosCompletos.rendimientoPorCarrera.length - carreraUnicos.length,
                    asignaturas: datosCompletos.rendimientoPorAsignatura.length - asignaturasUnicas.length
                }
            }
        };
        
        // Calcular estadísticas adicionales
        const añosDisponibles = [...new Set(carreraUnicos.map(d => d.año))].sort();
        const asignaturasDisponibles = [...new Set(asignaturasUnicas.map(d => d.nombreAsignatura))].sort();
        
        datosLimpios.resumen = {
            añosDisponibles: añosDisponibles,
            totalAños: añosDisponibles.length,
            asignaturasDisponibles: asignaturasDisponibles,
            totalAsignaturas: asignaturasDisponibles.length,
            promedioAprobacionCarrera: carreraUnicos.length > 0 ? 
                (carreraUnicos.reduce((sum, d) => sum + d.porcentajeAprobacion, 0) / carreraUnicos.length).toFixed(2) : 0,
            promedioAprobacionAsignaturas: asignaturasUnicas.length > 0 ? 
                (asignaturasUnicas.reduce((sum, d) => sum + d.porcentajeAprobacion, 0) / asignaturasUnicas.length).toFixed(2) : 0
        };
        
        // Guardar datos limpios
        fs.writeFileSync('datos_limpios_final.json', JSON.stringify(datosLimpios, null, 2));
        console.log('\n💾 Datos limpios guardados en: datos_limpios_final.json');
        
        // Crear CSVs limpios
        const csvCarreraLimpio = carreraUnicos
            .map(d => `${d.año},${d.codigoCarrera},"${d.carrera}",${d.inscritosSinActa},${d.numeroAprobadas},${d.porcentajeAprobacion},${d.numeroReprobadas},${d.porcentajeReprobacion},${d.numeroNCR},${d.porcentajeNCR}`)
            .join('\n');
        
        const csvAsignaturasLimpio = asignaturasUnicas
            .map(d => `${d.año || 'N/A'},"${d.semestre}","${d.codigoSeccion}","${d.nombreAsignatura}",${d.inscritosSinActa},${d.numeroAprobadas},${d.porcentajeAprobacion}`)
            .join('\n');
        
        fs.writeFileSync('rendimiento_carrera_limpio.csv', 
            'Año,Código Carrera,Carrera,Inscritos,Aprobados,% Aprobación,Reprobados,% Reprobación,NCR,% NCR\n' + csvCarreraLimpio);
        
        fs.writeFileSync('rendimiento_asignaturas_limpio.csv', 
            'Año,Semestre,Código Sección,Asignatura,Inscritos,Aprobados,% Aprobación\n' + csvAsignaturasLimpio);
        
        console.log('📄 CSVs limpios generados:');
        console.log('   - rendimiento_carrera_limpio.csv');
        console.log('   - rendimiento_asignaturas_limpio.csv');
        
        // Mostrar resumen
        console.log('\n📊 Resumen final:');
        console.log(`   📅 Años disponibles: ${añosDisponibles.join(', ')}`);
        console.log(`   🎯 Total años: ${añosDisponibles.length}`);
        console.log(`   📚 Total asignaturas: ${asignaturasDisponibles.length}`);
        console.log(`   📈 Promedio aprobación carrera: ${datosLimpios.resumen.promedioAprobacionCarrera}%`);
        console.log(`   📖 Promedio aprobación asignaturas: ${datosLimpios.resumen.promedioAprobacionAsignaturas}%`);
        
        // Mostrar algunas asignaturas
        console.log('\n📚 Asignaturas encontradas:');
        asignaturasDisponibles.forEach((asignatura, i) => {
            console.log(`   ${i + 1}. ${asignatura}`);
        });
        
        // Mostrar rendimiento por año
        console.log('\n📈 Rendimiento por año (sin duplicados):');
        carreraUnicos
            .sort((a, b) => b.año - a.año)
            .forEach(dato => {
                console.log(`   ${dato.año}: ${dato.porcentajeAprobacion}% (${dato.numeroAprobadas}/${dato.inscritosSinActa})`);
            });
        
        // Mostrar algunas asignaturas con sus datos
        console.log('\n📖 Ejemplos de asignaturas con datos:');
        asignaturasUnicas
            .filter(a => a.año && a.nombreAsignatura)
            .slice(0, 5)
            .forEach((asignatura, i) => {
                console.log(`   ${i + 1}. ${asignatura.nombreAsignatura} (${asignatura.año}): ${asignatura.porcentajeAprobacion}% (${asignatura.numeroAprobadas}/${asignatura.inscritosSinActa})`);
            });
        
        console.log('\n✅ Limpieza completada exitosamente');
        console.log('🎯 Datos listos para usar en el sistema académico');
        
        return datosLimpios;
        
    } catch (error) {
        console.error('❌ Error al limpiar datos:', error);
        return null;
    }
};

// Ejecutar limpieza
const resultado = limpiarDatos();

if (resultado) {
    console.log('\n🎉 ¡LIMPIEZA COMPLETADA EXITOSAMENTE!');
    console.log('📁 Archivos finales generados:');
    console.log('   - datos_limpios_final.json (datos estructurados)');
    console.log('   - rendimiento_carrera_limpio.csv (CSV carrera)');
    console.log('   - rendimiento_asignaturas_limpio.csv (CSV asignaturas)');
    console.log('\n🚀 Datos optimizados y listos para integración');
} else {
    console.log('❌ Error en el proceso de limpieza');
}
