# 🎓 Extensión de Asistencia Automática UCV

Esta extensión de Chrome te permite marcar automáticamente las asistencias de los estudiantes en el sistema UCV, basándose en una lista de nombres que proporciones.

## 📋 Características

- ✅ Marcar automáticamente estudiantes como presentes
- ❌ Marcar todos los estudiantes como ausentes
- 💾 Guardar automáticamente tu lista de estudiantes
- 🎨 Interfaz moderna y fácil de usar
- 🔍 Búsqueda inteligente de nombres (ignora espacios extra, mayúsculas/minúsculas)

## 🚀 Instalación

### Método 1: Cargar como extensión no empaquetada

1. Descarga o clona este repositorio
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo desarrollador" (toggle en la esquina superior derecha)
4. Haz clic en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta que contiene los archivos de la extensión
6. ¡Listo! La extensión aparecerá en tu barra de herramientas

### Método 2: Instalar desde Chrome Web Store (cuando esté disponible)

*Próximamente disponible en Chrome Web Store*

## 📖 Cómo usar

1. **Navega a la página de asistencias** del sistema UCV
2. **Haz clic en el icono de la extensión** en tu barra de herramientas
3. **Ingresa la lista de estudiantes presentes** en el área de texto:
   ```
   ALAYO SALCEDO, CRISTHIAN JESUS
   ALVARADO PEREZ, CIRO RIMSKY
   AMAYA LEON, ASTRID POEMA
   ```
4. **Haz clic en "✅ Marcar Presentes"** para marcar automáticamente
5. **O haz clic en "❌ Marcar Todos Ausentes"** para marcar todos como ausentes

## 🎯 Formato de nombres

Los nombres deben estar en el formato exacto que aparece en el sistema UCV:
- **Formato:** `APELLIDO, NOMBRE`
- **Ejemplo:** `ALAYO SALCEDO, CRISTHIAN JESUS`

## 🔧 Funcionalidades

### Marcar Presentes
- Busca automáticamente los estudiantes en la tabla
- Marca como "A" (Asistencia) a los estudiantes encontrados
- Muestra un resumen de cuántos fueron marcados
- Indica qué estudiantes no se encontraron

### Marcar Todos Ausentes
- Marca como "F" (Falta) a todos los estudiantes de la tabla
- Útil para limpiar la lista antes de marcar los presentes

### Guardado Automático
- Tu lista de estudiantes se guarda automáticamente
- Se recupera la próxima vez que abras la extensión

## 🛠️ Archivos de la extensión

- `manifest.json` - Configuración de la extensión
- `popup.html` - Interfaz del popup
- `popup.js` - Lógica del popup
- `content.js` - Script que se ejecuta en la página web
- `README.md` - Este archivo de documentación

## ⚠️ Notas importantes

- **Solo funciona en páginas de asistencias del sistema UCV**
- Los nombres deben coincidir exactamente con los de la tabla
- La extensión detecta automáticamente si estás en la página correcta
- Se muestra un indicador visual cuando la extensión está activa

## 🐛 Solución de problemas

### La extensión no funciona
- Asegúrate de estar en la página de asistencias del sistema UCV
- Verifica que la tabla de estudiantes esté visible
- Revisa la consola del navegador para mensajes de error

### No encuentra estudiantes
- Verifica que los nombres estén escritos exactamente como aparecen en la tabla
- Asegúrate de usar el formato "APELLIDO, NOMBRE"
- Revisa que no haya espacios extra al inicio o final

### Error de permisos
- Asegúrate de que la extensión tenga permisos para acceder a la página
- Intenta recargar la página y la extensión

## 📝 Licencia

Esta extensión es de uso libre para fines educativos.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request si encuentras algún problema o tienes sugerencias de mejora.

---

**Desarrollado para facilitar el proceso de toma de asistencias en el sistema UCV** 🎓
