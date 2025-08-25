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

  // Elementos de tabs
  const tabAsistencias = document.getElementById("tabAsistencias");
  const tabNotas = document.getElementById("tabNotas");
  const asistenciasTab = document.getElementById("asistenciasTab");
  const notasTab = document.getElementById("notasTab");

  // Elementos de notas
  const scanNotasBtn = document.getElementById("scanNotasBtn");
  const fillNotesBtn = document.getElementById("fillNotesBtn");
  const clearNotesBtn = document.getElementById("clearNotesBtn");
  const notesListTextarea = document.getElementById("notesList");
  const columnSelector = document.getElementById("columnSelector");
  const notesStatus = document.getElementById("notesStatus");
  const statsNotasText = document.getElementById("statsNotasText");
  const statsNotasPercentage = document.getElementById("statsNotasPercentage");

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
  let currentNotasStats = { total: 0, filled: 0 };
  let availableColumns = [];
  let selectedColumn = "";

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

  // Función para cambiar entre tabs
  function switchTab(tabName) {
    // Remover clase active de todos los tabs
    tabAsistencias.classList.remove("active");
    tabNotas.classList.remove("active");
    asistenciasTab.classList.remove("active");
    notasTab.classList.remove("active");

    // Agregar clase active al tab seleccionado
    if (tabName === "asistencias") {
      tabAsistencias.classList.add("active");
      asistenciasTab.classList.add("active");
      addLog("📋 Cambiado a tab de Asistencias", "info");
    } else if (tabName === "notas") {
      tabNotas.classList.add("active");
      notasTab.classList.add("active");
      addLog("📊 Cambiado a tab de Notas", "info");
    }
  }

  // Función para actualizar estadísticas de notas
  function updateNotasStats(total = 0, filled = 0) {
    currentNotasStats = { total, filled };
    const percentage = total > 0 ? Math.round((filled / total) * 100) : 0;

    statsNotasText.textContent = `${filled}/${total}`;
    statsNotasPercentage.textContent = `${percentage}%`;
  }

  // Función para escanear columnas de notas
  function scanNotasColumns() {
    addLog("🔍 Escaneando columnas de notas...", "info");
    notesStatus.textContent = "Estado: Escaneando página...";

    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(function (tabs) {
        browser.tabs
          .sendMessage(tabs[0].id, { action: "scanNotasColumns" })
          .then(function (response) {
            if (response && response.success) {
              availableColumns = response.columns || [];
              selectedColumn = "";

              // Actualizar selector de columnas
              columnSelector.innerHTML =
                '<option value="">Selecciona una columna de notas</option>';
              availableColumns.forEach((column) => {
                const option = document.createElement("option");
                option.value = column;
                option.textContent = column;
                columnSelector.appendChild(option);
              });

              columnSelector.style.display =
                availableColumns.length > 0 ? "block" : "none";
              notesStatus.textContent = `Estado: ${availableColumns.length} columnas detectadas`;
              updateNotasStats(response.totalStudents || 0, 0);

              addLog(
                `✅ ${
                  availableColumns.length
                } columnas detectadas: ${availableColumns.join(", ")}`,
                "success"
              );
            } else {
              addLog("❌ No se pudieron detectar columnas de notas", "error");
              notesStatus.textContent = "Estado: No se detectaron columnas";
            }
          })
          .catch(function (error) {
            addLog("❌ Error al escanear columnas: " + error.message, "error");
            notesStatus.textContent = "Estado: Error al escanear página";
          });
      });
  }

  // Función para llenar notas
  function fillNotes() {
    if (!selectedColumn) {
      addLog("❌ Por favor selecciona una columna de notas", "error");
      return;
    }

    const notesText = notesListTextarea.value.trim();
    if (!notesText) {
      addLog("❌ Por favor ingresa las notas", "error");
      return;
    }

    addLog("📝 Llenando notas...", "info");
    notesStatus.textContent = "Estado: Llenando notas...";

    // Parsear las notas
    const notesData = [];
    const lines = notesText.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        const match = trimmedLine.match(/^(.+?):\s*(\d+(?:\.\d+)?)$/);
        if (match) {
          notesData.push({
            name: match[1].trim(),
            note: parseFloat(match[2]),
          });
        } else {
          addLog(`⚠️ Formato incorrecto en línea: "${trimmedLine}"`, "error");
        }
      }
    }

    if (notesData.length === 0) {
      addLog("❌ No se encontraron notas válidas", "error");
      notesStatus.textContent = "Estado: No se encontraron notas válidas";
      return;
    }

    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(function (tabs) {
        browser.tabs
          .sendMessage(tabs[0].id, {
            action: "fillNotes",
            column: selectedColumn,
            notes: notesData,
          })
          .then(function (response) {
            if (response && response.success) {
              const filledCount = response.filledCount || 0;
              const totalCount = response.totalCount || 0;

              updateNotasStats(totalCount, filledCount);
              notesStatus.textContent = `Estado: ${filledCount} notas llenadas de ${totalCount} estudiantes`;

              addLog(
                `✅ ${filledCount} notas llenadas exitosamente`,
                "success"
              );
            } else {
              addLog("❌ Error al llenar las notas", "error");
              notesStatus.textContent = "Estado: Error al llenar notas";
            }
          })
          .catch(function (error) {
            addLog("❌ Error al llenar notas: " + error.message, "error");
            notesStatus.textContent = "Estado: Error al llenar notas";
          });
      });
  }

  // Función para limpiar notas
  function clearNotes() {
    notesListTextarea.value = "";
    addLog("🗑️ Lista de notas limpiada", "info");
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
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tabs || tabs.length === 0) {
        showStatus("No se pudo acceder a la pestaña actual.", "error");
        return;
      }

      const tab = tabs[0];
      addLog("🔍 Escaneando página...", "info");

      const response = await browser.tabs.sendMessage(tab.id, {
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

    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tabs || tabs.length === 0) {
        showStatus("No se pudo acceder a la pestaña actual.", "error");
        return;
      }

      const tab = tabs[0];
      addLog("🎯 Iniciando marcado de asistencias...", "info");

      const response = await browser.tabs.sendMessage(tab.id, {
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
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tabs || tabs.length === 0) {
        showStatus("No se pudo acceder a la pestaña actual.", "error");
        return;
      }

      const tab = tabs[0];
      addLog("❌ Marcando todos como ausentes...", "info");

      const response = await browser.tabs.sendMessage(tab.id, {
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

  // Event listeners para tabs
  tabAsistencias.addEventListener("click", () => switchTab("asistencias"));
  tabNotas.addEventListener("click", () => switchTab("notas"));

  // Event listeners para notas
  scanNotasBtn.addEventListener("click", scanNotasColumns);
  fillNotesBtn.addEventListener("click", fillNotes);
  clearNotesBtn.addEventListener("click", clearNotes);

  // Event listener para selector de columnas
  columnSelector.addEventListener("change", function () {
    selectedColumn = this.value;
    if (selectedColumn) {
      addLog(`📊 Columna seleccionada: ${selectedColumn}`, "info");
    }
  });

  // Función para depurar la página
  debugBtn.addEventListener("click", async function () {
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tabs || tabs.length === 0) {
        showStatus("No se pudo acceder a la pestaña actual.", "error");
        return;
      }

      const tab = tabs[0];
      addLog("🔍 Ejecutando depuración...", "info");

      const response = await browser.tabs.sendMessage(tab.id, {
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
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tabs || tabs.length === 0) {
        showStatus("No se pudo acceder a la pestaña actual.", "error");
        return;
      }

      const tab = tabs[0];
      addLog("🧪 Probando conexión...", "info");

      // Primero intentar inyectar el content script manualmente
      await browser.tabs.executeScript(tab.id, {
        file: "content.js",
      });

      addLog("✅ Content script inyectado, probando conexión...", "success");

      // Esperar un momento para que el script se cargue
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await browser.tabs.sendMessage(tab.id, {
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
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tabs || tabs.length === 0) {
        showStatus("No se pudo acceder a la pestaña actual.", "error");
        return;
      }

      const tab = tabs[0];
      addLog("🔄 Recargando content script...", "info");

      // Recargar la página para forzar la recarga del content script
      await browser.tabs.reload(tab.id);

      addLog("✅ Página recargada, esperando que se cargue...", "success");

      // Esperar a que la página se cargue completamente
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Intentar inyectar el content script manualmente
      await browser.tabs.executeScript(tab.id, {
        file: "content.js",
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
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tabs || tabs.length === 0) {
        showStatus("No se pudo acceder a la pestaña actual.", "error");
        return;
      }

      const tab = tabs[0];
      addLog("📄 Generando reporte completo...", "info");

      const response = await browser.tabs.sendMessage(tab.id, {
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
  browser.storage.local.get(["savedStudentList"]).then(function (result) {
    if (result.savedStudentList) {
      studentListTextarea.value = result.savedStudentList;
    }
  });

  // Guardar lista cuando se modifique
  studentListTextarea.addEventListener("input", function () {
    browser.storage.local.set({
      savedStudentList: studentListTextarea.value,
    });
  });

  // Event listener para limpiar logs
  clearLogsButton.addEventListener("click", clearLogs);

  // Agregar log inicial
  addLog(
    "🎓 Extensión de Asistencia Automática UCV iniciada (Firefox)",
    "success"
  );

  // Escuchar logs del content script
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
