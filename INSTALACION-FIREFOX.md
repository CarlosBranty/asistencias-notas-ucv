# 🦊 Instalación en Mozilla Firefox

## 📋 Requisitos Previos

- **Mozilla Firefox** versión 57 o superior
- Acceso a páginas web del sistema UCV

## 🚀 Pasos de Instalación

### 1. Descargar los Archivos

Asegúrate de tener todos los archivos necesarios para Firefox:
- `manifest-firefox.json` (renombrar a `manifest.json`)
- `background-firefox.js` (renombrar a `background.js`)
- `popup-firefox.html` (renombrar a `popup.html`)
- `popup-firefox.js` (renombrar a `popup.js`)
- `content-firefox.js` (renombrar a `content.js`)
- `icon16.png`, `icon48.png`, `icon128.png`

### 2. Preparar los Archivos

1. **Renombrar archivos específicos de Firefox:**
   ```bash
   # Renombrar manifest
   mv manifest-firefox.json manifest.json
   
   # Renombrar background script
   mv background-firefox.js background.js
   
   # Renombrar popup
   mv popup-firefox.html popup.html
   mv popup-firefox.js popup.js
   
   # Renombrar content script
   mv content-firefox.js content.js
   ```

2. **Verificar estructura de archivos:**
   ```
   asistencias-notas-ucv-firefox/
   ├── manifest.json
   ├── background.js
   ├── popup.html
   ├── popup.js
   ├── content.js
   ├── icon16.png
   ├── icon48.png
   └── icon128.png
   ```

### 3. Instalar en Firefox

#### Método 1: Instalación Temporal (Desarrollo)

1. Abre Firefox y ve a `about:debugging`
2. Haz clic en **"Este Firefox"** en el panel izquierdo
3. Haz clic en **"Cargar complemento temporal..."**
4. Selecciona el archivo `manifest.json` de tu extensión
5. La extensión se instalará temporalmente y aparecerá en la lista

#### Método 2: Instalación Permanente

1. Abre Firefox y ve a `about:addons`
2. Haz clic en el ícono de engranaje ⚙️ en la esquina superior derecha
3. Selecciona **"Instalar complemento desde archivo..."**
4. Selecciona el archivo `manifest.json` de tu extensión
5. Confirma la instalación

### 4. Verificar la Instalación

1. Busca el ícono de la extensión en la barra de herramientas de Firefox
2. Haz clic en el ícono para abrir el popup
3. Deberías ver la interfaz con el título "Asistencia Automática UCV - Firefox"

## 🔧 Configuración Inicial

### 1. Permisos

Firefox puede solicitar permisos adicionales:
- **Permisos de pestañas**: Para acceder a las páginas web
- **Permisos de almacenamiento**: Para guardar configuraciones
- **Permisos de scripting**: Para ejecutar scripts en páginas web

### 2. Configuración de Sitios

La extensión está configurada para funcionar en:
- `*://*/*` (todas las páginas web)

## 🎯 Uso de la Extensión

### Funcionalidades Principales

1. **📋 Gestión de Asistencias**
   - Escanear páginas de asistencias
   - Marcar estudiantes como presentes
   - Marcar todos como ausentes

2. **📊 Gestión de Notas**
   - Escanear columnas de notas
   - Llenar notas automáticamente
   - Limpiar formularios

3. **🛠️ Herramientas Avanzadas**
   - Depuración de páginas
   - Prueba de conexión
   - Generación de reportes

### Pasos de Uso

1. **Navegar a la página de asistencias del sistema UCV**
2. **Hacer clic en el ícono de la extensión**
3. **Usar las funciones según necesites:**
   - **Escanear**: Analiza la página actual
   - **Marcar Presentes**: Marca estudiantes de tu lista
   - **Marcar Ausentes**: Marca todos como ausentes

## 🔍 Solución de Problemas

### Problemas Comunes

#### 1. La extensión no aparece
- Verifica que el `manifest.json` esté correctamente formateado
- Asegúrate de que todos los archivos estén en la misma carpeta
- Revisa la consola de Firefox para errores

#### 2. No funciona en páginas específicas
- Verifica que la página esté en el dominio correcto
- Asegúrate de que la página tenga la estructura esperada
- Usa la función de depuración para diagnosticar

#### 3. Errores de permisos
- Ve a `about:addons` y verifica los permisos
- Reinstala la extensión si es necesario

### Logs y Depuración

1. **Abrir las herramientas de desarrollador** (F12)
2. **Ir a la pestaña "Consola"**
3. **Buscar mensajes que empiecen con "🎓"**
4. **Usar la función "Depurar" en la extensión**

## 📝 Notas Importantes

### Diferencias con Chrome

- **Manifest V2**: Firefox usa Manifest V2 en lugar de V3
- **APIs**: Usa `browser.*` en lugar de `chrome.*`
- **Permisos**: Algunos permisos pueden ser diferentes
- **Service Workers**: Manejo diferente de background scripts

### Compatibilidad

- ✅ **Firefox 57+**: Compatible
- ✅ **Firefox Quantum**: Compatible
- ✅ **Firefox ESR**: Compatible
- ❌ **Firefox < 57**: No compatible

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa los logs** en la consola del navegador
2. **Usa la función de depuración** de la extensión
3. **Verifica la estructura de archivos**
4. **Reinstala la extensión** si es necesario

## 📄 Licencia

Esta extensión es desarrollada con ❤️ por @branty para la comunidad UCV.

---

**🎓 ¡Disfruta usando la extensión de Asistencia Automática UCV en Firefox!**
