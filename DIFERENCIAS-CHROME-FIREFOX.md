# 🔄 Diferencias entre Chrome y Firefox

## 📋 Resumen de Cambios

Para hacer que tu extensión sea compatible con Mozilla Firefox, se realizaron los siguientes cambios principales:

## 🏗️ Manifest.json

### Chrome (Manifest V3)
```json
{
  "manifest_version": 3,
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  },
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "tabs"
  ]
}
```

### Firefox (Manifest V2)
```json
{
  "manifest_version": 2,
  "browser_action": {
    "default_popup": "popup.html"
  },
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  },
  "permissions": [
    "activeTab",
    "storage",
    "tabs",
    "*://*/*"
  ]
}
```

### Cambios Principales:
- ✅ `manifest_version`: 3 → 2
- ✅ `action` → `browser_action`
- ✅ `service_worker` → `scripts` con `persistent: false`
- ✅ Agregado permiso `*://*/*` para Firefox

## 🔧 APIs de Extensión

### Chrome APIs
```javascript
// Background script
chrome.runtime.onInstalled.addListener(() => {});
chrome.action.onClicked.addListener((tab) => {});
chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ["content.js"]
});

// Popup script
chrome.tabs.query({ active: true, currentWindow: true });
chrome.tabs.sendMessage(tab.id, { action: "test" });
chrome.storage.local.get(["key"]);

// Content script
chrome.runtime.sendMessage({ action: "log" });
```

### Firefox APIs
```javascript
// Background script
browser.runtime.onInstalled.addListener(() => {});
browser.browserAction.onClicked.addListener((tab) => {});
browser.tabs.executeScript(tabId, {
  file: "content.js"
});

// Popup script
browser.tabs.query({ active: true, currentWindow: true });
browser.tabs.sendMessage(tab.id, { action: "test" });
browser.storage.local.get(["key"]);

// Content script
browser.runtime.sendMessage({ action: "log" });
```

### Cambios Principales:
- ✅ `chrome.*` → `browser.*`
- ✅ `chrome.action` → `browser.browserAction`
- ✅ `chrome.scripting.executeScript` → `browser.tabs.executeScript`
- ✅ Sintaxis de parámetros diferente para `executeScript`

## 📁 Estructura de Archivos

### Chrome (Original)
```
asistencias-notas-ucv/
├── manifest.json (V3)
├── background.js (Chrome APIs)
├── popup.html
├── popup.js (Chrome APIs)
├── content.js (Chrome APIs)
└── icon*.png
```

### Firefox (Compatible)
```
asistencias-notas-ucv-firefox/
├── manifest.json (V2)
├── background.js (Firefox APIs)
├── popup.html
├── popup.js (Firefox APIs)
├── content.js (Firefox APIs)
└── icon*.png
```

## 🔄 Proceso de Conversión

### 1. Manifest.json
```javascript
// Cambios automáticos
manifest.manifest_version = 2;
manifest.browser_action = manifest.action;
manifest.background = {
  scripts: [manifest.background.service_worker],
  persistent: false
};
```

### 2. Scripts
```javascript
// Reemplazos automáticos
content.replace(/chrome\./g, 'browser.')
       .replace(/chrome\.action/g, 'browser.browserAction')
       .replace(/chrome\.scripting\.executeScript/g, 'browser.tabs.executeScript');
```

### 3. Sintaxis de executeScript
```javascript
// Chrome
chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ["content.js"]
});

// Firefox
browser.tabs.executeScript(tabId, {
  file: "content.js"
});
```

## 🚀 Instalación

### Chrome
1. Abrir `chrome://extensions/`
2. Activar "Modo desarrollador"
3. Hacer clic en "Cargar descomprimida"
4. Seleccionar carpeta de la extensión

### Firefox
1. Abrir `about:debugging`
2. Hacer clic en "Este Firefox"
3. Hacer clic en "Cargar complemento temporal..."
4. Seleccionar `manifest.json`

## 🔍 Compatibilidad

### Chrome
- ✅ Chrome 88+ (Manifest V3)
- ✅ Edge 88+ (Chromium)
- ✅ Opera 74+ (Chromium)

### Firefox
- ✅ Firefox 57+ (Manifest V2)
- ✅ Firefox Quantum
- ✅ Firefox ESR

## 🛠️ Herramientas de Conversión

### Script Automático
```bash
node convert-to-firefox.js
```

### Conversión Manual
1. Renombrar archivos con sufijo `-firefox`
2. Aplicar cambios de APIs
3. Actualizar manifest.json
4. Probar en Firefox

## 📝 Notas Importantes

### Diferencias de Comportamiento
- **Service Workers**: Firefox maneja los service workers de manera diferente
- **Permisos**: Firefox puede requerir permisos adicionales
- **APIs**: Algunas APIs pueden tener comportamientos ligeramente diferentes
- **Rendimiento**: Las extensiones en Firefox pueden tener un rendimiento ligeramente diferente

### Mejores Prácticas
- ✅ Mantener ambas versiones separadas
- ✅ Usar el script de conversión para actualizaciones
- ✅ Probar en ambos navegadores
- ✅ Documentar diferencias específicas

## 🔧 Solución de Problemas

### Problemas Comunes en Firefox
1. **Permisos insuficientes**: Agregar `*://*/*` al manifest
2. **APIs no disponibles**: Usar APIs equivalentes de Firefox
3. **Service workers**: Convertir a background scripts
4. **Sintaxis diferente**: Adaptar parámetros de funciones

### Debugging
```javascript
// Chrome
console.log('Chrome extension loaded');

// Firefox
console.log('Firefox extension loaded');
```

## 📚 Recursos Adicionales

- [Firefox Extension Development](https://extensionworkshop.com/)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Manifest V2 vs V3](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

**🎓 ¡Tu extensión ahora es compatible con ambos navegadores!**
