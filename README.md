# 🎓 Extensión de Asistencia y Notas Automática UCV

Esta extensión de Chrome te permite marcar automáticamente las asistencias y llenar notas de los estudiantes en el sistema UCV, basándose en listas que proporciones.

## 📋 Características

### 📊 Gestión de Asistencias
- ✅ Marcar automáticamente estudiantes como presentes
- ❌ Marcar todos los estudiantes como ausentes
- 💾 Guardar automáticamente tu lista de estudiantes
- 🔍 Búsqueda inteligente de nombres (ignora espacios extra, mayúsculas/minúsculas)

### 📝 Gestión de Notas
- 📊 Escaneo automático de columnas de notas (PA1, PA2, PA3, EP, EF, etc.)
- 🎯 Selector de columna para elegir cuál llenar
- 📝 Llenado masivo de notas por nombre de estudiante
- 📈 Estadísticas de notas llenadas
- 🔄 Normalización de nombres para mejor coincidencia

### 🎨 Interfaz
- 🎨 Interfaz moderna con sistema de tabs
- 📱 Diseño responsive y fácil de usar
- 📋 Logs detallados del proceso
- ⚡ Herramientas avanzadas de depuración

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

### 📊 Gestión de Asistencias

1. **Navega a la página de asistencias** del sistema UCV
2. **Haz clic en el icono de la extensión** en tu barra de herramientas
3. **Ve al tab "Asistencias"** (por defecto)
4. **Ingresa la lista de estudiantes presentes** en el área de texto:
   ```
   ALAYO SALCEDO, CRISTHIAN JESUS
   ALVARADO PEREZ, CIRO RIMSKY
   AMAYA LEON, ASTRID POEMA
   ```
5. **Haz clic en "✅ Marcar Presentes"** para marcar automáticamente
6. **O haz clic en "❌ Marcar Todos Ausentes"** para marcar todos como ausentes

### 📝 Gestión de Notas

1. **Navega a la página de notas** del sistema UCV
2. **Haz clic en el icono de la extensión** en tu barra de herramientas
3. **Ve al tab "Notas"**
4. **Haz clic en "Escanear"** para detectar las columnas disponibles
5. **Selecciona la columna** donde quieres llenar las notas (PA1, PA2, EP, EF, etc.)
6. **Ingresa las notas** en formato "NOMBRE: NOTA":
   ```
   ALAYO SALCEDO, CRISTHIAN JESUS: 18
   ALVARADO PEREZ, CIRO RIMSKY: 16
   AMAYA LEON, ASTRID POEMA: 17
   ```
7. **Haz clic en "📝 Llenar Notas"** para llenar automáticamente

## 🎯 Formatos de datos

### 📊 Para Asistencias
Los nombres deben estar en el formato exacto que aparece en el sistema UCV:
- **Formato:** `APELLIDO, NOMBRE`
- **Ejemplo:** `ALAYO SALCEDO, CRISTHIAN JESUS`

### 📝 Para Notas
Las notas deben estar en el formato:
- **Formato:** `APELLIDO, NOMBRE: NOTA`
- **Ejemplo:** `ALAYO SALCEDO, CRISTHIAN JESUS: 18`
- **Nota:** Debe ser un número entre 0 y 20 (puede incluir decimales)

## 🔧 Funcionalidades

### 📊 Gestión de Asistencias

#### Marcar Presentes
- Busca automáticamente los estudiantes en la tabla
- Marca como "A" (Asistencia) a los estudiantes encontrados
- Muestra un resumen de cuántos fueron marcados
- Indica qué estudiantes no se encontraron

#### Marcar Todos Ausentes
- Marca como "F" (Falta) a todos los estudiantes de la tabla
- Útil para limpiar la lista antes de marcar los presentes

#### Guardado Automático
- Tu lista de estudiantes se guarda automáticamente
- Se recupera la próxima vez que abras la extensión

### 📝 Gestión de Notas

#### Escaneo de Columnas
- Detecta automáticamente las columnas de notas disponibles
- Soporta columnas como PA1, PA2, PA3, PA4, EP, EF, EX, PROMEDIO
- Muestra estadísticas de estudiantes en la tabla

#### Llenado Masivo
- Llena notas por nombre de estudiante
- Normalización inteligente de nombres
- Validación de formato de notas
- Logs detallados del proceso

#### Selector de Columna
- Permite elegir qué columna llenar
- Interfaz intuitiva con dropdown
- Validación de columna seleccionada

## 🛠️ Archivos de la extensión

- `manifest.json` - Configuración de la extensión
- `popup.html` - Interfaz del popup
- `popup.js` - Lógica del popup
- `content.js` - Script que se ejecuta en la página web
- `README.md` - Este archivo de documentación

## ⚠️ Notas importantes

### 📊 Para Asistencias
- **Solo funciona en páginas de asistencias del sistema UCV**
- Los nombres deben coincidir exactamente con los de la tabla
- La extensión detecta automáticamente si estás en la página correcta

### 📝 Para Notas
- **Solo funciona en páginas de notas del sistema UCV**
- Detecta automáticamente las columnas de notas disponibles
- Los nombres deben coincidir con los de la tabla
- Las notas deben estar en el rango de 0 a 20

### 🎯 General
- Se muestra un indicador visual cuando la extensión está activa
- Usa el tab correspondiente según la funcionalidad que necesites

## 🐛 Solución de problemas

### La extensión no funciona
- Asegúrate de estar en la página correcta del sistema UCV (asistencias o notas)
- Verifica que la tabla de estudiantes esté visible
- Revisa la consola del navegador para mensajes de error

### No encuentra estudiantes
- Verifica que los nombres estén escritos exactamente como aparecen en la tabla
- Asegúrate de usar el formato correcto:
  - Asistencias: `APELLIDO, NOMBRE`
  - Notas: `APELLIDO, NOMBRE: NOTA`
- Revisa que no haya espacios extra al inicio o final

### Problemas con notas
- Asegúrate de haber escaneado las columnas primero
- Verifica que la columna seleccionada sea correcta
- Comprueba que las notas estén en el formato correcto

### Error de permisos
- Asegúrate de que la extensión tenga permisos para acceder a la página
- Intenta recargar la página y la extensión

## 📝 Licencia

Esta extensión es de uso libre para fines educativos.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request si encuentras algún problema o tienes sugerencias de mejora.

---

**Desarrollado para facilitar el proceso de toma de asistencias en el sistema UCV** 🎓
