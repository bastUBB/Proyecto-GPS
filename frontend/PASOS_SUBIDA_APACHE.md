# 🚀 Guía de Despliegue - Frontend en Apache

## 📋 Prerrequisitos
- ✅ Backend ya configurado y funcionando
- ✅ Apache instalado y configurado
- ✅ Node.js y npm instalados

---

## 1️⃣ **Clonar el Proyecto**

Navega al directorio root y clona el repositorio:

```bash
cd 
git clone https://github.com/bastUBB/Proyecto-GPS.git
```

---

## 2️⃣ **Configurar Variables de Entorno**

Entra al directorio del frontend:

```bash
cd Proyecto-GPS/frontend
```

Crea/edita el archivo de configuración:

```bash
nano .env
```

📝 **Agrega la URL del backend** (sin comillas ni espacios):

```env
VITE_BASE_URL=<DIRECCIÓN-BACKEND>
```

> ⚠️ **Importante**: Por ahora la ruta seria `http://146.83.198.35:1227`

---

## 3️⃣ **Construir el Proyecto**

Genera los archivos estáticos para producción:

```bash
npm run build
```

📦 Esto creará la carpeta `dist/` con los archivos optimizados.

---

## 4️⃣ **Preparar el Directorio de Apache**

Vuelve al directorio root:

```bash
cd 
```

🗑️ **Limpia el contenido anterior** del frontend:

```bash
rm -rf /var/www/html/gps/*
```

📂 **Copia los nuevos archivos** al directorio de Apache:

```bash
cp -r Proyecto-GPS/frontend/dist/* /var/www/html/gps/
```

---

## 5️⃣ **Configurar Permisos** (Opcional)

🔒 **Corrige los permisos** para que Apache pueda leer los archivos:

```bash
# Cambiar propietario
chown -R www-data:www-data /var/www/html/gps

# Establecer permisos de lectura
chmod -R 755 /var/www/html/gps
```

---

## 6️⃣ **Reiniciar Apache**

🔄 **Recarga la configuración** de Apache:

```bash
apachectl -k graceful
```

---

## 🎉 **¡Deployment Completado!**

---

## 🐛 **Troubleshooting**

### 🔍 **Problemas Comunes**

| Problema | Solución |
|----------|----------|
| 🚫 **404 Not Found** | Verificar que los archivos estén en `/var/www/html/gps/` |
| 🔒 **403 Forbidden** | Revisar permisos con `chmod -R 755` |
| 🌐 **CORS Error** | Verificar `VITE_BASE_URL` en `.env` |
| 📡 **Network Error** | Confirmar que el backend esté ejecutándose |

### 📊 **Verificar Estado**

```bash
# Verificar archivos del frontend
ls -la /var/www/html/gps/

# Verificar estado de Apache
systemctl status apache2

# Ver logs de errores
tail -f /var/log/apache2/error.log
```

---

## 📝 **Notas Importantes**

- 🔄 **Cada vez que actualices el código**, repite los pasos 3-6
- 💾 **Backup**: Considera hacer respaldo antes de eliminar archivos
- 🔐 **Seguridad**: Asegúrate de que las URLs no expongan información sensible