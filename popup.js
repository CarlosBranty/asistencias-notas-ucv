document.addEventListener("DOMContentLoaded", function () {
  // Elementos de la nueva interfaz
  const toggleToolsBtn = document.getElementById("toggleToolsBtn");
  const toolsContent = document.getElementById("toolsContent");
  const logsPanel = document.getElementById("logsPanel");
  const scanBtn = document.getElementById("scanBtn");
  const markPresentBtn = document.getElementById("markPresentBtn");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const debugBtn = document.getElementById("debugBtn");
  const testBtn = document.getElementById("testBtn");
  const reloadBtn = document.getElementById("reloadBtn");
  const reportBtn = document.getElementById("reportBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const closeBtn = document.getElementById("closeBtn");

  // Elementos funcionales
  const studentListTextarea = document.getElementById("studentList");
  const statusDiv = document.getElementById("status");
  const logsContainer = document.getElementById("logsContainer");
  const clearLogsButton = document.getElementById("clearLogs");

  // Elementos de la UI principal
  const statsTextElement = document.getElementById("statsText");
  const statsPercentageElement = document.getElementById("statsPercentage");

  // Estado de la interfaz
  let isToolsExpanded = false;
  let currentStats = { total: 0, marked: 0 };

  // Función para alternar las herramientas avanzadas
  function toggleTools() {
    isToolsExpanded = !isToolsExpanded;

    if (isToolsExpanded) {
      toolsContent.classList.add("show");
      toggleToolsBtn.textContent = "Ocultar";
      addLog("🛠️ Herramientas avanzadas expandidas", "info");
    } else {
      toolsContent.classList.remove("show");
      toggleToolsBtn.textContent = "Mostrar";
      addLog("🛠️ Herramientas avanzadas ocultadas", "info");
    }
  }

  // Función para mostrar/ocultar logs
  function toggleLogs() {
    logsPanel.classList.toggle("show");
  }

  // Función para actualizar estadísticas en la UI
  function updateStats(total = 0, marked = 0) {
    currentStats = { total, marked };
    const percentage = total > 0 ? Math.round((marked / total) * 100) : 0;

    statsTextElement.textContent = `${marked}/${total}`;
    statsPercentageElement.textContent = `${percentage}%`;
  }

  // Función para agregar logs al panel
  function addLog(message, type = "info") {
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";

    const time = new Date().toLocaleTimeString();
    const timeSpan = document.createElement("span");
    timeSpan.className = "log-time";
    timeSpan.textContent = `[${time}] `;

    const messageSpan = document.createElement("span");
    messageSpan.className = `log-message log-${type}`;
    messageSpan.textContent = message;

    logEntry.appendChild(timeSpan);
    logEntry.appendChild(messageSpan);

    logsContainer.appendChild(logEntry);

    // Auto-scroll al final
    logsContainer.scrollTop = logsContainer.scrollHeight;

    // Limitar a 50 logs para no sobrecargar
    while (logsContainer.children.length > 50) {
      logsContainer.removeChild(logsContainer.firstChild);
    }
  }

  // Función para limpiar logs
  function clearLogs() {
    logsContainer.innerHTML = "";
    addLog("🗑️ Logs limpiados", "info");
  }

  // Función para mostrar mensajes de estado
  function showStatus(message, type = "info") {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = "block";

    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
      statusDiv.style.display = "none";
    }, 5000);

    // También agregar al log
    addLog(message, type);
  }

  // Event listeners para la nueva interfaz
  toggleToolsBtn.addEventListener("click", toggleTools);

  settingsBtn.addEventListener("click", () => {
    showStatus("⚙️ Configuración - Función en desarrollo", "info");
  });

  closeBtn.addEventListener("click", () => {
    window.close();
  });

  // Función para escanear la página
  async function scanPage() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      showStatus("No se pudo acceder a la pestaña actual.", "error");
      return;
    }

    try {
      addLog("🔍 Escaneando página...", "info");

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "scan",
      });

      if (response && response.success) {
        const scanResult = response.scanResult;
        const totalStudents = scanResult.students.length;

        updateStats(totalStudents, 0);

        if (scanResult.isAttendancePage) {
          showStatus(
            `✅ Página escaneada: ${totalStudents} estudiantes encontrados`,
            "success"
          );
          addLog(
            `📊 ${totalStudents} estudiantes detectados en la página`,
            "success"
          );
        } else {
          showStatus(
            "⚠️ No se detectó una página de asistencias válida",
            "warning"
          );
          addLog("⚠️ Página no válida para asistencias", "warning");
        }
      } else {
        showStatus("❌ Error al escanear la página", "error");
      }
    } catch (error) {
      showStatus("❌ Error: Asegúrate de estar en la página correcta", "error");
      addLog(`❌ Error de escaneo: ${error.message}`, "error");
    }
  }

  // Función para marcar estudiantes como presentes
  async function markStudentsPresent() {
    const studentList = studentListTextarea.value.trim();

    if (!studentList) {
      showStatus(
        "Por favor, ingresa la lista de estudiantes presentes.",
        "error"
      );
      return;
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      showStatus("No se pudo acceder a la pestaña actual.", "error");
      return;
    }

    try {
      addLog("🎯 Iniciando marcado de asistencias...", "info");

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "markPresent",
        studentList: studentList,
      });

      if (response && response.success) {
        // Actualizar estadísticas
        updateStats(response.totalFound, response.markedCount);

        // Crear reporte detallado
        let reportMessage = `✅ ${response.markedCount} estudiantes marcados como presentes.\n\n`;

        if (response.markingResults && response.markingResults.length > 0) {
          reportMessage += "📋 DETALLE DE MARCACIÓN:\n";
          reportMessage += "=".repeat(50) + "\n";

          // Agrupar por estado
          const successful = response.markingResults.filter((r) => r.success);
          const failed = response.markingResults.filter((r) => !r.success);

          if (successful.length > 0) {
            reportMessage += `\n✅ MARCADOS EXITOSAMENTE (${successful.length}):\n`;
            successful.forEach((result, index) => {
              reportMessage += `  ${index + 1}. ${result.student}\n`;
            });
          }

          if (failed.length > 0) {
            reportMessage += `\n❌ FALLÓ AL MARCAR (${failed.length}):\n`;
            failed.forEach((result, index) => {
              reportMessage += `  ${index + 1}. ${result.student}\n`;
            });
          }
        }

        if (response.notFoundCount > 0) {
          reportMessage += `\n⚠️ NO ENCONTRADOS EN LA PÁGINA (${response.notFoundCount}):\n`;
          response.comparisonResults
            .filter((r) => r.matchType === "not_found")
            .forEach((result, index) => {
              reportMessage += `  ${index + 1}. ${result.original}\n`;
            });
        }

        showStatus(reportMessage, "info");
        addLog(
          `✅ Proceso completado: ${response.markedCount} marcados`,
          "success"
        );
      } else {
        showStatus(
          response?.message || "Error al marcar asistencias.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error en markPresent:", error);
      showStatus(
        `Error: ${error.message}. Asegúrate de estar en la página de asistencias del sistema UCV.`,
        "error"
      );
      addLog(`❌ Error crítico: ${error.message}`, "error");
    }
  }

  // Función para marcar todos como ausentes
  async function markAllStudentsAbsent() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      showStatus("No se pudo acceder a la pestaña actual.", "error");
      return;
    }

    try {
      addLog("❌ Marcando todos como ausentes...", "info");

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "markAbsent",
      });

      if (response && response.success) {
        showStatus(
          `❌ Todos los estudiantes marcados como ausentes.`,
          "success"
        );
        updateStats(currentStats.total, 0);
        addLog(
          `✅ ${response.markedCount} estudiantes marcados como ausentes`,
          "success"
        );
      } else {
        showStatus(response?.message || "Error al marcar ausencias.", "error");
      }
    } catch (error) {
      showStatus(
        "Error: Asegúrate de estar en la página de asistencias del sistema UCV.",
        "error"
      );
      addLog(`❌ Error al marcar ausencias: ${error.message}`, "error");
    }
  }

  // Event listeners para botones funcionales
  scanBtn.addEventListener("click", scanPage);
  markPresentBtn.addEventListener("click", markStudentsPresent);
  clearAllBtn.addEventListener("click", markAllStudentsAbsent);

  // Función para depurar la página
  debugBtn.addEventListener("click", async function () {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      showStatus("No se pudo acceder a la pestaña actual.", "error");
      return;
    }

    try {
      addLog("🔍 Ejecutando depuración...", "info");

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "debug",
      });

      if (response && response.success) {
        const debugInfo = response.debugInfo;
        const debugMessage = `
🔍 Información de depuración:
• URL: ${debugInfo.url}
• Título: ${debugInfo.title}
• Inputs de asistencia: ${debugInfo.hasAttendanceInputs ? "✅" : "❌"}
• Total inputs: ${debugInfo.totalAttendanceInputs}
• Estudiantes encontrados: ${debugInfo.totalStudents}
• Total tablas: ${debugInfo.allTables}
• Total radio buttons: ${debugInfo.allRadioButtons}

📋 Nombres de radio buttons encontrados:
${debugInfo.radioButtonNames.map((name, i) => `  ${i + 1}. ${name}`).join("\n")}

📋 Estudiantes encontrados:
${debugInfo.studentNames.map((name, i) => `  ${i + 1}. ${name}`).join("\n")}

📋 Textos con "asistencia":
${debugInfo.attendanceTexts.map((text, i) => `  ${i + 1}. ${text}`).join("\n")}
        `;
        showStatus(debugMessage, "info");
      } else {
        showStatus("Error al obtener información de depuración.", "error");
      }
    } catch (error) {
      showStatus("Error: Asegúrate de estar en la página correcta.", "error");
      addLog(`❌ Error de depuración: ${error.message}`, "error");
    }
  });

  // Función para probar la conexión
  testBtn.addEventListener("click", async function () {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      showStatus("No se pudo acceder a la pestaña actual.", "error");
      return;
    }

    try {
      addLog("🧪 Probando conexión...", "info");

      // Primero intentar inyectar el content script manualmente
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      addLog("✅ Content script inyectado, probando conexión...", "success");

      // Esperar un momento para que el script se cargue
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "test",
      });

      if (response && response.success) {
        showStatus("✅ Conexión exitosa con el content script", "success");
        addLog("✅ Prueba de conexión exitosa", "success");
      } else {
        showStatus("❌ Error en la comunicación", "error");
      }
    } catch (error) {
      console.error("Error en test:", error);
      showStatus("❌ No se pudo conectar con el content script", "error");
      addLog(`❌ Error de conexión: ${error.message}`, "error");
    }
  });

  // Función para recargar el content script
  reloadBtn.addEventListener("click", async function () {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      showStatus("No se pudo acceder a la pestaña actual.", "error");
      return;
    }

    try {
      addLog("🔄 Recargando content script...", "info");

      // Recargar la página para forzar la recarga del content script
      await chrome.tabs.reload(tab.id);

      addLog("✅ Página recargada, esperando que se cargue...", "success");

      // Esperar a que la página se cargue completamente
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Intentar inyectar el content script manualmente
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      showStatus("✅ Content script recargado exitosamente", "success");
      addLog("✅ Recarga completada", "success");
    } catch (error) {
      console.error("Error recargando:", error);
      showStatus("❌ Error al recargar el content script", "error");
      addLog(`❌ Error de recarga: ${error.message}`, "error");
    }
  });

  // Función para generar reporte completo
  reportBtn.addEventListener("click", async function () {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      showStatus("No se pudo acceder a la pestaña actual.", "error");
      return;
    }

    try {
      addLog("📄 Generando reporte completo...", "info");

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "generateReport",
      });

      if (response && response.success) {
        const report = response.report;

        // Crear ventana modal con el reporte
        const modal = document.createElement("div");
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          z-index: 10000;
          display: flex;
          justify-content: center;
          align-items: center;
        `;

        const modalContent = document.createElement("div");
        modalContent.style.cssText = `
          background: white;
          color: black;
          padding: 20px;
          border-radius: 10px;
          max-width: 90%;
          max-height: 80%;
          overflow-y: auto;
          font-family: monospace;
          font-size: 12px;
          white-space: pre-line;
        `;

        modalContent.textContent = report;

        const closeButton = document.createElement("button");
        closeButton.textContent = "❌ Cerrar";
        closeButton.style.cssText = `
          position: absolute;
          top: 10px;
          right: 10px;
          background: #f44336;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
        `;

        const copyButton = document.createElement("button");
        copyButton.textContent = "📋 Copiar Reporte";
        copyButton.style.cssText = `
          position: absolute;
          top: 10px;
          right: 80px;
          background: #4caf50;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
        `;

        copyButton.onclick = () => {
          navigator.clipboard.writeText(report).then(() => {
            copyButton.textContent = "✅ Copiado!";
            setTimeout(() => {
              copyButton.textContent = "📋 Copiar Reporte";
            }, 2000);
          });
        };

        closeButton.onclick = () => {
          document.body.removeChild(modal);
        };

        modalContent.appendChild(closeButton);
        modalContent.appendChild(copyButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        showStatus("📄 Reporte generado exitosamente", "success");
        addLog("✅ Reporte generado y mostrado", "success");
      } else {
        showStatus("❌ Error al generar reporte", "error");
      }
    } catch (error) {
      console.error("Error generando reporte:", error);
      showStatus("❌ Error al generar reporte", "error");
      addLog(`❌ Error de reporte: ${error.message}`, "error");
    }
  });

  // Cargar lista guardada si existe
  chrome.storage.local.get(["savedStudentList"], function (result) {
    if (result.savedStudentList) {
      studentListTextarea.value = result.savedStudentList;
    }
  });

  // Guardar lista cuando se modifique
  studentListTextarea.addEventListener("input", function () {
    chrome.storage.local.set({
      savedStudentList: studentListTextarea.value,
    });
  });

  // Event listener para limpiar logs
  clearLogsButton.addEventListener("click", clearLogs);

  // Agregar log inicial
  addLog("🎓 Extensión de Asistencia Automática UCV iniciada", "success");

  // Escuchar logs del content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Popup recibió mensaje:", request);
    if (request.action === "log") {
      console.log("📥 Agregando log al panel:", request.message);
      addLog(request.message, request.type);
    }
  });

  // Escaneo inicial automático
  setTimeout(() => {
    scanPage();
  }, 1000);
});
