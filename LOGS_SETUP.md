# 🔧 Guía: Configurar Log Rotation en VPS

## ⚠️ Por qué es importante

Sin log rotation, PM2 guarda TODOS los `console.log()` en archivos que crecen sin límite. Con el tiempo, esto puede llenar los 40GB de tu VPS.

## 📋 Pasos a seguir en tu VPS

### PASO 1: Verificar el estado actual

```bash
# Conectar a tu VPS
ssh usuario@tu-vps

# Ejecutar script de diagnóstico
bash <(cat << 'EOF'
echo "📊 Espacio en disco:"
df -h | grep -E "/$"
echo ""
echo "📁 Logs de PM2:"
du -sh ~/.pm2/logs/ 2>/dev/null || echo "No hay logs"
echo ""
echo "📄 Archivos más grandes:"
du -h ~/.pm2/logs/* 2>/dev/null | sort -hr | head -5 || echo "Sin logs"
EOF
)
```

### PASO 2: Hacer git pull

```bash
cd /ruta/a/linkkk
git pull origin main
```

Esto traerá el archivo `backend/ecosystem.config.js` con la configuración de log rotation.

### PASO 3: Aplicar configuración

```bash
cd /ruta/a/linkkk/backend

# Detener app actual
pm2 stop v2

# Limpiar logs viejos (opcional pero recomendado)
pm2 flush

# Iniciar con nueva configuración
pm2 start ecosystem.config.js

# Guardar configuración
pm2 save
```

### PASO 4: Verificar que funciona

```bash
# Ver estado
pm2 list

# Ver logs en tiempo real
pm2 logs v2

# Ver info de la app (debe mostrar max_size, max_files, compress)
pm2 info v2
```

## ✅ Qué hace la configuración

- **max_size: 10M** → Cuando un log llega a 10MB, se rota automáticamente
- **max_files: 5** → Solo mantiene los últimos 5 archivos rotados
- **compress: true** → Comprime logs viejos para ahorrar espacio

**Resultado:** Tus logs nunca ocuparán más de ~50MB (5 archivos × 10MB)

## 🧹 Limpieza manual (si ya tienes logs grandes)

Si tus logs actuales ya son muy grandes:

```bash
# Ver tamaño actual
du -sh ~/.pm2/logs/

# Detener PM2
pm2 stop all

# BORRAR todos los logs viejos
pm2 flush

# O borrarlos manualmente
rm -rf ~/.pm2/logs/*

# Reiniciar con nueva config
pm2 start ecosystem.config.js
pm2 save
```

## 📊 Monitoreo continuo

Para prevenir problemas futuros:

```bash
# Ver espacio en disco (hazlo mensualmente)
df -h

# Ver tamaño de logs PM2
du -sh ~/.pm2/logs/

# Ver logs del sistema
sudo du -sh /var/log/nginx/
sudo du -sh /var/log/postgresql/
```

## 🚨 Si tu VPS se queda sin espacio

```bash
# 1. Verificar qué está ocupando espacio
df -h
du -sh /* | sort -hr | head -10

# 2. Limpiar logs de PM2
pm2 flush

# 3. Limpiar logs del sistema (con precaución)
sudo journalctl --vacuum-time=7d  # Logs de sistema > 7 días
sudo find /var/log -name "*.gz" -mtime +30 -delete  # Logs comprimidos > 30 días

# 4. Limpiar cache de npm/apt
npm cache clean --force
sudo apt-get clean
```

## 🎯 Resumen

| Antes | Después |
|-------|---------|
| ❌ Logs crecen sin límite | ✅ Máximo 50MB |
| ❌ Pueden llenar el VPS | ✅ Rotación automática |
| ❌ Sin compresión | ✅ Logs comprimidos |
| ❌ Sin gestión | ✅ Solo últimos 5 archivos |

**Espacio total de logs con esta config: ~50MB** (despreciable en 40GB)
