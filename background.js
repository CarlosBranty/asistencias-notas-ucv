// Background script para la extensión de Asistencia Automática UCV
console.log("🎓 Background script iniciado");

// Escuchar cuando se instala la extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log("🎓 Extensión instalada/actualizada");
});

// Escuchar cuando se hace clic en el icono de la extensión
chrome.action.onClicked.addListener((tab) => {
  console.log("🎓 Icono de extensión clickeado en:", tab.url);
});

// Función para inyectar el content script manualmente si es necesario
async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"],
    });
    console.log("✅ Content script inyectado manualmente en tab:", tabId);
  } catch (error) {
    console.error("❌ Error inyectando content script:", error);
  }
}

// Escuchar mensajes del popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Background recibió mensaje:", request);

  if (request.action === "injectContentScript") {
    injectContentScript(request.tabId)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Mantener el canal abierto
  }
});
