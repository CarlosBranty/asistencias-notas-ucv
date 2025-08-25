#!/usr/bin/env node

/**
 * Script para convertir la extensión de Chrome a Firefox
 * Desarrollado con ❤️ por @branty
 */

const fs = require("fs");
const path = require("path");

console.log("🦊 Iniciando conversión de Chrome a Firefox...\n");

// Función para crear directorio si no existe
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Creado directorio: ${dirPath}`);
  }
}

// Función para copiar archivo
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Error copiando ${source}:`, error.message);
  }
}

// Función para leer y procesar archivo
function processFile(sourcePath, destinationPath, processor) {
  try {
    let content = fs.readFileSync(sourcePath, "utf8");
    if (processor) {
      content = processor(content);
    }
    fs.writeFileSync(destinationPath, content);
    console.log(`✅ Procesado: ${sourcePath} → ${destinationPath}`);
  } catch (error) {
    console.error(`❌ Error procesando ${sourcePath}:`, error.message);
  }
}

// Función para procesar manifest.json
function processManifest(content) {
  // Convertir de Manifest V3 a V2
  let manifest = JSON.parse(content);

  // Cambiar manifest_version
  manifest.manifest_version = 2;

  // Cambiar action por browser_action
  if (manifest.action) {
    manifest.browser_action = manifest.action;
    delete manifest.action;
  }

  // Cambiar background de service_worker a scripts
  if (manifest.background && manifest.background.service_worker) {
    manifest.background = {
      scripts: [manifest.background.service_worker],
      persistent: false,
    };
  }

  // Agregar permisos necesarios para Firefox
  if (!manifest.permissions.includes("*://*/*")) {
    manifest.permissions.push("*://*/*");
  }

  return JSON.stringify(manifest, null, 2);
}

// Función para procesar scripts (chrome.* → browser.*)
function processScript(content) {
  return content
    .replace(/chrome\./g, "browser.")
    .replace(/chrome\.runtime\.lastError/g, "browser.runtime.lastError")
    .replace(/chrome\.scripting\.executeScript/g, "browser.tabs.executeScript")
    .replace(/chrome\.tabs\.reload/g, "browser.tabs.reload")
    .replace(/chrome\.tabs\.query/g, "browser.tabs.query")
    .replace(/chrome\.tabs\.sendMessage/g, "browser.tabs.sendMessage")
    .replace(/chrome\.storage\.local/g, "browser.storage.local")
    .replace(/chrome\.runtime\.onMessage/g, "browser.runtime.onMessage")
    .replace(/chrome\.runtime\.sendMessage/g, "browser.runtime.sendMessage")
    .replace(/chrome\.action\.onClicked/g, "browser.browserAction.onClicked")
    .replace(/chrome\.runtime\.onInstalled/g, "browser.runtime.onInstalled");
}

// Función para procesar popup.html
function processPopupHTML(content) {
  return content
    .replace(/popup\.js/g, "popup-firefox.js")
    .replace(
      /Asistencia Automática UCV/g,
      "Asistencia Automática UCV - Firefox"
    )
    .replace(/Versión Chrome/g, "Versión Firefox");
}

// Función para procesar content script
function processContentScript(content) {
  return content
    .replace(/chrome\./g, "browser.")
    .replace(
      /Content script cargado correctamente/g,
      "Content script cargado correctamente (Firefox)"
    )
    .replace(
      /Segundo log de prueba - Content script funcionando/g,
      "Segundo log de prueba - Content script funcionando (Firefox)"
    )
    .replace(
      /Conexión exitosa con el content script/g,
      "Conexión exitosa con el content script (Firefox)"
    );
}

// Función para procesar background script
function processBackgroundScript(content) {
  return content
    .replace(/chrome\./g, "browser.")
    .replace(
      /Background script iniciado/g,
      "Background script iniciado (Firefox)"
    )
    .replace(
      /Extensión instalada\/actualizada/g,
      "Extensión instalada/actualizada (Firefox)"
    )
    .replace(/chrome\.scripting\.executeScript/g, "browser.tabs.executeScript")
    .replace(/target: { tabId: tabId }/g, "tabId")
    .replace(/files: \["content\.js"\]/g, 'file: "content.js"');
}

// Función para procesar popup script
function processPopupScript(content) {
  return content
    .replace(/chrome\./g, "browser.")
    .replace(/chrome\.runtime\.lastError/g, "browser.runtime.lastError")
    .replace(/chrome\.scripting\.executeScript/g, "browser.tabs.executeScript")
    .replace(/chrome\.tabs\.reload/g, "browser.tabs.reload")
    .replace(/chrome\.tabs\.query/g, "browser.tabs.query")
    .replace(/chrome\.tabs\.sendMessage/g, "browser.tabs.sendMessage")
    .replace(/chrome\.storage\.local/g, "browser.storage.local")
    .replace(/chrome\.runtime\.onMessage/g, "browser.runtime.onMessage")
    .replace(
      /Extensión de Asistencia Automática UCV iniciada/g,
      "Extensión de Asistencia Automática UCV iniciada (Firefox)"
    )
    .replace(/target: { tabId: tab\.id }/g, "tab.id")
    .replace(/files: \["content\.js"\]/g, 'file: "content.js"');
}

// Función principal
function main() {
  const sourceDir = ".";
  const firefoxDir = "./firefox-version";

  // Crear directorio de Firefox
  ensureDirectoryExists(firefoxDir);

  console.log("🔄 Procesando archivos...\n");

  // Procesar manifest.json
  if (fs.existsSync(path.join(sourceDir, "manifest.json"))) {
    processFile(
      path.join(sourceDir, "manifest.json"),
      path.join(firefoxDir, "manifest.json"),
      processManifest
    );
  }

  // Procesar background.js
  if (fs.existsSync(path.join(sourceDir, "background.js"))) {
    processFile(
      path.join(sourceDir, "background.js"),
      path.join(firefoxDir, "background.js"),
      processBackgroundScript
    );
  }

  // Procesar popup.html
  if (fs.existsSync(path.join(sourceDir, "popup.html"))) {
    processFile(
      path.join(sourceDir, "popup.html"),
      path.join(firefoxDir, "popup.html"),
      processPopupHTML
    );
  }

  // Procesar popup.js
  if (fs.existsSync(path.join(sourceDir, "popup.js"))) {
    processFile(
      path.join(sourceDir, "popup.js"),
      path.join(firefoxDir, "popup.js"),
      processPopupScript
    );
  }

  // Procesar content.js
  if (fs.existsSync(path.join(sourceDir, "content.js"))) {
    processFile(
      path.join(sourceDir, "content.js"),
      path.join(firefoxDir, "content.js"),
      processContentScript
    );
  }

  // Copiar iconos
  const iconFiles = ["icon16.png", "icon48.png", "icon128.png"];
  iconFiles.forEach((icon) => {
    if (fs.existsSync(path.join(sourceDir, icon))) {
      copyFile(path.join(sourceDir, icon), path.join(firefoxDir, icon));
    }
  });

  // Copiar archivos de documentación
  const docFiles = ["README.md", "INSTALACION.md"];
  docFiles.forEach((doc) => {
    if (fs.existsSync(path.join(sourceDir, doc))) {
      copyFile(path.join(sourceDir, doc), path.join(firefoxDir, doc));
    }
  });

  // Crear archivo de instrucciones específico para Firefox
  const firefoxInstructions = `# 🦊 Versión Firefox

Esta carpeta contiene la versión de la extensión compatible con Mozilla Firefox.

## 📋 Archivos Incluidos

- \`manifest.json\` - Manifest V2 para Firefox
- \`background.js\` - Background script con APIs de Firefox
- \`popup.html\` - Interfaz de usuario
- \`popup.js\` - Lógica del popup con APIs de Firefox
- \`content.js\` - Content script con APIs de Firefox
- \`icon*.png\` - Iconos de la extensión

## 🚀 Instalación

1. Abre Firefox y ve a \`about:debugging\`
2. Haz clic en "Este Firefox"
3. Haz clic en "Cargar complemento temporal..."
4. Selecciona el archivo \`manifest.json\` de esta carpeta

## 🔧 Diferencias con Chrome

- Usa Manifest V2 en lugar de V3
- Usa APIs \`browser.*\` en lugar de \`chrome.*\`
- Background script como scripts en lugar de service worker
- Permisos adaptados para Firefox

## 📝 Notas

- Compatible con Firefox 57+
- Desarrollado con ❤️ por @branty
- Versión específica para Mozilla Firefox

---

**🎓 ¡Disfruta usando la extensión en Firefox!**
`;

  fs.writeFileSync(
    path.join(firefoxDir, "README-FIREFOX.md"),
    firefoxInstructions
  );
  console.log("✅ Creado: README-FIREFOX.md");

  console.log("\n🎉 ¡Conversión completada exitosamente!");
  console.log(`📁 Los archivos de Firefox están en: ${firefoxDir}`);
  console.log("\n📋 Próximos pasos:");
  console.log("1. Navega a la carpeta firefox-version");
  console.log("2. Abre Firefox y ve a about:debugging");
  console.log("3. Carga el manifest.json como complemento temporal");
  console.log("4. ¡Prueba la extensión en Firefox!");
  console.log("\n🦊 ¡Tu extensión ahora es compatible con Firefox!");
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, processManifest, processScript };
