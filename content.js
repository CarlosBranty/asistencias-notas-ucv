// Content script para marcar asistencias automáticamente en el sistema UCV
console.log("🎓 Extensión de Asistencia Automática UCV cargada");
console.log("🎓 URL actual:", window.location.href);
console.log("🎓 Título de la página:", document.title);

// Enviar log de prueba al popup
setTimeout(() => {
  console.log("🎓 Enviando log de prueba al popup...");
  sendLogToPopup("🎓 Content script cargado correctamente", "success");
}, 1000);

// Enviar log adicional después de 2 segundos
setTimeout(() => {
  console.log("🎓 Enviando segundo log de prueba...");
  sendLogToPopup(
    "🎓 Segundo log de prueba - Content script funcionando",
    "info"
  );
}, 2000);

// Función para enviar logs al popup
function sendLogToPopup(message, type = "info") {
  try {
    console.log("📤 Enviando log al popup:", message);
    chrome.runtime.sendMessage({
      action: "log",
      message: message,
      type: type,
    });
    console.log("✅ Log enviado exitosamente");
  } catch (error) {
    console.log("❌ Error enviando log al popup:", error);
  }
}

// Función para normalizar nombres (quitar espacios extra, convertir a mayúsculas, manejar diferentes formatos)
function normalizeName(name) {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ") // Reemplazar múltiples espacios con uno solo
    .replace(/\s*,\s*/g, ", ") // Normalizar espacios alrededor de comas
    .replace(/\s+/g, " "); // Limpiar espacios extra nuevamente
}

// Función para escanear completamente la página y obtener información
function scanPageForStudents() {
  const logMessage =
    "🔍 ESCANEO COMPLETO: Analizando estructura de la página...";
  console.log(logMessage);
  sendLogToPopup(logMessage, "info");

  const scanResult = {
    isAttendancePage: false,
    totalStudents: 0,
    students: [],
    radioButtonGroups: {},
    pageInfo: {
      url: window.location.href,
      title: document.title,
      hasTables: false,
      tableCount: 0,
    },
  };

  // 1. Verificar si es una página de asistencias
  sendLogToPopup(
    "🔍 Paso 1: Verificando si es página de asistencias...",
    "info"
  );

  const attendanceInputs = document.querySelectorAll(
    'input[name^="rbl_asistencia"]'
  );
  const allRadioButtons = document.querySelectorAll('input[type="radio"]');
  const tables = document.querySelectorAll("table");

  scanResult.pageInfo.tableCount = tables.length;
  scanResult.pageInfo.hasTables = tables.length > 0;

  sendLogToPopup(
    `📊 Encontrados: ${tables.length} tablas, ${allRadioButtons.length} radio buttons`,
    "info"
  );

  // 2. Buscar patrones de radio buttons de asistencia
  sendLogToPopup("🔍 Paso 2: Buscando radio buttons de asistencia...", "info");

  let attendanceRadioButtons = [];

  // Buscar con patrón específico primero
  if (attendanceInputs.length > 0) {
    attendanceRadioButtons = Array.from(attendanceInputs);
    sendLogToPopup(
      `✅ Encontrados ${attendanceRadioButtons.length} radio buttons con patrón 'rbl_asistencia'`,
      "success"
    );
  } else {
    // Buscar cualquier radio button que contenga "asistencia"
    const asistenciaRadios = document.querySelectorAll(
      'input[type="radio"][name*="asistencia"]'
    );
    if (asistenciaRadios.length > 0) {
      attendanceRadioButtons = Array.from(asistenciaRadios);
      sendLogToPopup(
        `✅ Encontrados ${attendanceRadioButtons.length} radio buttons con 'asistencia' en nombre`,
        "success"
      );
    } else {
      // Como último recurso, usar todos los radio buttons
      attendanceRadioButtons = Array.from(allRadioButtons);
      sendLogToPopup(
        `⚠️ Usando todos los ${attendanceRadioButtons.length} radio buttons como último recurso`,
        "warning"
      );
    }
  }

  if (attendanceRadioButtons.length === 0) {
    sendLogToPopup("❌ No se encontraron radio buttons en la página", "error");
    return scanResult;
  }

  // 3. Agrupar radio buttons por estudiante
  sendLogToPopup(
    "🔍 Paso 3: Agrupando radio buttons por estudiante...",
    "info"
  );

  const radioGroups = {};
  attendanceRadioButtons.forEach((radio) => {
    const groupName = radio.name;
    if (!radioGroups[groupName]) {
      radioGroups[groupName] = [];
    }
    radioGroups[groupName].push(radio);
  });

  scanResult.radioButtonGroups = radioGroups;
  const studentCount = Object.keys(radioGroups).length;
  scanResult.totalStudents = studentCount;

  sendLogToPopup(`📊 Agrupados en ${studentCount} estudiantes únicos`, "info");

  // 4. Para cada grupo, extraer información del estudiante
  sendLogToPopup("🔍 Paso 4: Extrayendo información de estudiantes...", "info");

  Object.keys(radioGroups).forEach((groupName, index) => {
    const radios = radioGroups[groupName];
    const firstRadio = radios[0];

    // Buscar la fila que contiene este radio button
    let row = firstRadio.closest("tr");
    if (!row) {
      sendLogToPopup(
        `⚠️ No se encontró fila para grupo ${groupName}`,
        "warning"
      );
      return;
    }

    // Extraer información del estudiante
    const studentInfo = extractStudentInfoFromRow(row, groupName, index);

    if (studentInfo) {
      scanResult.students.push({
        ...studentInfo,
        radioButtons: radios,
        row: row,
        groupName: groupName,
        index: index,
      });

      sendLogToPopup(
        `✅ Estudiante ${index + 1}: "${studentInfo.name}"`,
        "success"
      );
    } else {
      sendLogToPopup(
        `⚠️ No se pudo extraer información para grupo ${groupName}`,
        "warning"
      );
    }
  });

  // 5. Determinar si es página de asistencias
  scanResult.isAttendancePage = scanResult.students.length > 0;

  const finalMessage = `📊 ESCANEO COMPLETADO: ${scanResult.students.length} estudiantes encontrados`;
  sendLogToPopup(
    finalMessage,
    scanResult.isAttendancePage ? "success" : "error"
  );

  return scanResult;
}

// Función auxiliar para extraer información del estudiante de una fila
function extractStudentInfoFromRow(row, groupName, index) {
  // Buscar en las celdas de la fila
  const cells = row.querySelectorAll("td");
  let studentName = null;
  let studentCode = null;
  let additionalInfo = {};

  // Buscar nombre en las celdas
  cells.forEach((cell, cellIndex) => {
    const text = cell.textContent.trim();

    // Buscar nombre (formato: APELLIDO, NOMBRE)
    if (text && text.includes(",") && text.length > 10 && !studentName) {
      studentName = normalizeName(text);
      additionalInfo.nameCellIndex = cellIndex;
    }

    // Buscar código de estudiante (números)
    if (text && /^\d+$/.test(text) && text.length >= 6 && !studentCode) {
      studentCode = text;
      additionalInfo.codeCellIndex = cellIndex;
    }
  });

  // Si no se encontró en las celdas, buscar en todo el texto de la fila
  if (!studentName) {
    const rowText = row.textContent.trim();

    // Patrones para nombres
    const namePatterns = [
      /([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]+,\s*[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]+)/g,
      /([A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+,\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+)/g,
    ];

    for (const pattern of namePatterns) {
      const matches = rowText.match(pattern);
      if (matches && matches.length > 0) {
        studentName = normalizeName(matches[0]);
        break;
      }
    }
  }

  if (studentName) {
    return {
      name: studentName,
      code: studentCode,
      groupName: groupName,
      index: index,
      additionalInfo: additionalInfo,
    };
  }

  return null;
}

// Función para encontrar todos los estudiantes en la página (mantener compatibilidad)
function findAllStudents() {
  const scanResult = scanPageForStudents();
  return scanResult.students;
}

// Función para marcar un estudiante como presente
function markStudentPresent(student) {
  const markLog = `🎯 Marcando como presente: ${student.name}`;
  console.log(markLog);
  sendLogToPopup(markLog, "info");

  // Usar la nueva estructura de radioButtons
  const radioButtons = student.radioButtons || student.inputs;

  if (!radioButtons || radioButtons.length === 0) {
    const errorLog = `❌ No se encontraron radio buttons para ${student.name}`;
    console.log(errorLog);
    sendLogToPopup(errorLog, "error");
    return false;
  }

  // Buscar el radio button de "A" (Asistencia) - primer radio button del grupo
  const presentRadio = radioButtons[0]; // El primer radio button es siempre "A"

  if (presentRadio) {
    const radioLog = `✅ Radio button encontrado para ${student.name} (${presentRadio.name})`;
    console.log(radioLog);
    sendLogToPopup(radioLog, "success");

    try {
      // Marcar como seleccionado
      presentRadio.checked = true;

      // Simular click
      presentRadio.click();

      // Trigger eventos adicionales para asegurar que se registre
      const changeEvent = new Event("change", { bubbles: true });
      presentRadio.dispatchEvent(changeEvent);

      const inputEvent = new Event("input", { bubbles: true });
      presentRadio.dispatchEvent(inputEvent);

      const successLog = `✅ Marcado completado para ${student.name}`;
      sendLogToPopup(successLog, "success");
      return true;
    } catch (error) {
      const errorLog = `❌ Error al marcar ${student.name}: ${error.message}`;
      console.log(errorLog);
      sendLogToPopup(errorLog, "error");
      return false;
    }
  } else {
    const errorLog = `❌ No se encontró radio button para ${student.name}`;
    console.log(errorLog);
    sendLogToPopup(errorLog, "error");
    return false;
  }
}

// Función para marcar un estudiante como ausente
function markStudentAbsent(student) {
  console.log(`❌ Marcando como ausente: ${student.name}`);

  // Buscar el radio button de "F" (Falta) - segundo radio button del grupo
  const absentRadio = student.inputs[1]; // El segundo radio button es "F"

  if (absentRadio) {
    console.log(`✅ Radio button de ausencia encontrado para ${student.name}`);
    absentRadio.checked = true;
    absentRadio.click();

    // Trigger eventos adicionales
    const changeEvent = new Event("change", { bubbles: true });
    absentRadio.dispatchEvent(changeEvent);

    return true;
  } else {
    console.log(
      `❌ No se encontró radio button de ausencia para ${student.name}`
    );
    return false;
  }
}

// Función para marcar estudiantes específicos como presentes
function markStudentsPresent(studentList) {
  try {
    const logMessage =
      "🎯 PROCESO COMPLETO: Iniciando marcado de asistencias...";
    console.log(logMessage);
    sendLogToPopup(logMessage, "info");

    // PASO 1: ESCANEO COMPLETO DE LA PÁGINA
    sendLogToPopup(
      "🔍 PASO 1: Escaneando página para obtener información completa...",
      "info"
    );
    const scanResult = scanPageForStudents();

    if (!scanResult.isAttendancePage) {
      const errorMessage = "❌ No se detectó una página de asistencias válida.";
      sendLogToPopup(errorMessage, "error");
      return {
        success: false,
        message: errorMessage,
        scanResult: scanResult,
      };
    }

    // PASO 2: PROCESAR LISTA DE ESTUDIANTES
    sendLogToPopup(
      "📋 PASO 2: Procesando lista de estudiantes a marcar...",
      "info"
    );

    const studentsToMark = studentList
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map(normalizeName);

    sendLogToPopup(
      `📊 Lista procesada: ${studentsToMark.length} estudiantes a buscar`,
      "info"
    );

    // Mostrar primeros 5 estudiantes para verificación
    const previewList = studentsToMark.slice(0, 5).join(", ");
    sendLogToPopup(
      `📋 Primeros 5: ${previewList}${studentsToMark.length > 5 ? "..." : ""}`,
      "info"
    );

    // PASO 3: COMPARACIÓN Y BÚSQUEDA
    sendLogToPopup(
      "🔍 PASO 3: Comparando lista con estudiantes encontrados...",
      "info"
    );

    const foundStudents = [];
    const notFoundStudents = [];
    const comparisonResults = [];

    studentsToMark.forEach((studentName, index) => {
      const searchLog = `🔍 Buscando: "${studentName}"`;
      sendLogToPopup(searchLog, "info");

      // Buscar coincidencia exacta primero
      let found = scanResult.students.find((s) => s.name === studentName);

      // Si no se encuentra, buscar coincidencia parcial
      if (!found) {
        sendLogToPopup(
          `  🔍 Búsqueda exacta falló, intentando coincidencia parcial...`,
          "warning"
        );

        found = scanResult.students.find((s) => {
          const normalizedStudent = s.name.replace(/\s+/g, " ").trim();
          const normalizedSearch = studentName.replace(/\s+/g, " ").trim();

          const isMatch =
            normalizedStudent === normalizedSearch ||
            normalizedStudent.includes(normalizedSearch) ||
            normalizedSearch.includes(normalizedStudent);

          if (isMatch) {
            sendLogToPopup(
              `    ✅ Coincidencia parcial: "${normalizedStudent}"`,
              "success"
            );
          }

          return isMatch;
        });
      } else {
        sendLogToPopup(`    ✅ Coincidencia exacta encontrada`, "success");
      }

      if (found) {
        foundStudents.push(found);
        const foundLog = `✅ Encontrado: "${studentName}" -> "${found.name}"`;
        sendLogToPopup(foundLog, "success");
        comparisonResults.push({
          original: studentName,
          found: found.name,
          matchType: found.name === studentName ? "exact" : "partial",
        });
      } else {
        notFoundStudents.push(studentName);
        const notFoundLog = `❌ No encontrado: "${studentName}"`;
        sendLogToPopup(notFoundLog, "error");
        comparisonResults.push({
          original: studentName,
          found: null,
          matchType: "not_found",
        });
      }
    });

    // PASO 4: VERIFICAR RESULTADOS DE BÚSQUEDA
    if (foundStudents.length === 0) {
      const noFoundLog =
        "❌ No se encontraron estudiantes de la lista en la página.";
      sendLogToPopup(noFoundLog, "error");
      return {
        success: false,
        message: noFoundLog,
        scanResult: scanResult,
        comparisonResults: comparisonResults,
      };
    }

    // PASO 5: MARCAR ASISTENCIAS
    sendLogToPopup(
      `🎯 PASO 4: Marcando ${foundStudents.length} estudiantes como presentes...`,
      "info"
    );

    let markedCount = 0;
    const markingResults = [];

    foundStudents.forEach((student, index) => {
      const markLog = `🎯 Marcando ${index + 1}/${foundStudents.length}: "${
        student.name
      }"`;
      sendLogToPopup(markLog, "info");

      const markResult = markStudentPresent(student);
      markingResults.push({
        student: student.name,
        success: markResult,
        groupName: student.groupName,
      });

      if (markResult) {
        markedCount++;
        const successLog = `✅ Marcado exitoso: "${student.name}"`;
        sendLogToPopup(successLog, "success");
      } else {
        const failLog = `❌ Fallo al marcar: "${student.name}"`;
        sendLogToPopup(failLog, "error");
      }
    });

    // PASO 6: RESUMEN FINAL
    const finalLog = `📊 RESUMEN FINAL: ${markedCount} marcados, ${foundStudents.length} encontrados, ${notFoundStudents.length} no encontrados`;
    sendLogToPopup(finalLog, "success");

    // Crear mensaje de resultado detallado
    let message = `✅ ${markedCount} estudiantes marcados como presentes.`;
    if (notFoundStudents.length > 0) {
      message += `\n❌ No encontrados: ${notFoundStudents
        .slice(0, 5)
        .join(", ")}${notFoundStudents.length > 5 ? "..." : ""}`;
    }

    const result = {
      success: true,
      markedCount: markedCount,
      totalFound: foundStudents.length,
      notFoundCount: notFoundStudents.length,
      message: message,
      scanResult: scanResult,
      comparisonResults: comparisonResults,
      markingResults: markingResults,
    };

    // Guardar el resultado para el reporte
    lastMarkingResult = result;

    return result;
  } catch (error) {
    console.error("❌ Error al marcar estudiantes:", error);
    sendLogToPopup(`❌ Error crítico: ${error.message}`, "error");
    return {
      success: false,
      message: error.message,
    };
  }
}

// Función para marcar todos los estudiantes como ausentes
function markAllStudentsAbsent() {
  try {
    console.log("❌ Iniciando proceso de marcar todos como ausentes...");

    const allStudents = findAllStudents();

    if (allStudents.length === 0) {
      return {
        success: false,
        message: "No se encontraron estudiantes en la página.",
      };
    }

    let markedCount = 0;
    allStudents.forEach((student) => {
      if (markStudentAbsent(student)) {
        markedCount++;
      }
    });

    return {
      success: true,
      markedCount: markedCount,
      message: `Todos los estudiantes (${markedCount}) marcados como ausentes.`,
    };
  } catch (error) {
    console.error("❌ Error al marcar ausencias:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// Función de depuración mejorada
function getDebugInfo() {
  const attendanceInputs = document.querySelectorAll(
    'input[name^="rbl_asistencia"]'
  );
  const allStudents = findAllStudents();

  // Buscar otros tipos de inputs que podrían ser de asistencia
  const allRadioButtons = document.querySelectorAll("input[type='radio']");
  const radioButtonNames = Array.from(allRadioButtons)
    .map((input) => input.name)
    .slice(0, 10);

  // Buscar elementos que contengan "asistencia" en el texto
  const attendanceElements = document.querySelectorAll("*");
  const attendanceTexts = [];
  attendanceElements.forEach((el) => {
    if (el.textContent && el.textContent.toLowerCase().includes("asistencia")) {
      attendanceTexts.push(el.textContent.trim().substring(0, 50));
    }
  });

  return {
    url: window.location.href,
    title: document.title,
    hasAttendanceInputs: attendanceInputs.length > 0,
    totalAttendanceInputs: attendanceInputs.length,
    totalStudents: allStudents.length,
    allTables: document.querySelectorAll("table").length,
    allRadioButtons: allRadioButtons.length,
    radioButtonNames: radioButtonNames,
    studentNames: allStudents.map((s) => s.name).slice(0, 5), // Primeros 5 nombres
    attendanceTexts: attendanceTexts.slice(0, 5), // Primeros 5 textos con "asistencia"
    pageHTML: document.body.innerHTML.substring(0, 1000), // Primeros 1000 caracteres del HTML
  };
}

// Escuchar mensajes del popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Mensaje recibido:", request);

  // Enviar log inmediato al popup
  sendLogToPopup("📨 Mensaje recibido: " + request.action, "info");

  // Log adicional para verificar que el listener funciona
  console.log("🎯 Procesando mensaje:", request.action);

  if (request.action === "markPresent") {
    sendLogToPopup("🎯 Procesando solicitud de marcar presentes...", "info");
    console.log("🎯 Procesando solicitud de marcar presentes...");

    // Log de prueba simple
    sendLogToPopup("🔍 Iniciando búsqueda de estudiantes...", "info");

    const result = markStudentsPresent(request.studentList);
    console.log("📊 Resultado:", result);
    sendLogToPopup("📊 Proceso completado", "success");
    sendResponse(result);
  } else if (request.action === "markAbsent") {
    sendLogToPopup("❌ Procesando solicitud de marcar ausentes...", "info");
    console.log("❌ Procesando solicitud de marcar ausentes...");
    const result = markAllStudentsAbsent();
    console.log("📊 Resultado:", result);
    sendResponse(result);
  } else if (request.action === "debug") {
    sendLogToPopup("🔍 Ejecutando depuración...", "info");
    console.log("🔍 Ejecutando depuración...");
    const debugInfo = getDebugInfo();
    console.log("🔍 Información de depuración:", debugInfo);
    sendResponse({ success: true, debugInfo: debugInfo });
  } else if (request.action === "scan") {
    sendLogToPopup("🔍 Ejecutando escaneo manual...", "info");
    console.log("🔍 Ejecutando escaneo manual...");
    const scanResult = scanPageForStudents();
    console.log("🔍 Resultado del escaneo:", scanResult);
    sendResponse({ success: true, scanResult: scanResult });
  } else if (request.action === "test") {
    sendLogToPopup("🧪 Prueba de comunicación exitosa", "success");
    console.log("🧪 Prueba de comunicación recibida");
    sendResponse({
      success: true,
      message: "Content script funcionando correctamente",
    });
  } else if (request.action === "generateReport") {
    sendLogToPopup("📄 Generando reporte completo...", "info");
    console.log("📄 Generando reporte completo...");

    const report = generateCompleteReport();
    sendResponse({
      success: true,
      report: report,
    });
  }

  return true; // Mantener el canal de comunicación abierto
});

// Verificar si estamos en una página de asistencias
function checkIfAttendancePage() {
  const attendanceInputs = document.querySelectorAll(
    'input[name^="rbl_asistencia"]'
  );
  const hasAttendanceInputs = attendanceInputs.length > 0;

  console.log("🔍 Verificando página de asistencias:");
  console.log("- Inputs de asistencia encontrados:", attendanceInputs.length);
  console.log("- Es página de asistencias:", hasAttendanceInputs);

  return hasAttendanceInputs;
}

// Función para hacer escaneo inicial de la página
function performInitialScan() {
  sendLogToPopup("🔍 ESCANEO INICIAL: Analizando página al cargar...", "info");

  const scanResult = scanPageForStudents();

  if (scanResult.isAttendancePage) {
    console.log(
      "✅ Página de asistencias detectada - Extensión lista para usar"
    );
    sendLogToPopup(
      `✅ Página válida detectada: ${scanResult.students.length} estudiantes disponibles`,
      "success"
    );

    // Agregar un indicador visual sutil
    const indicator = document.createElement("div");
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(76, 175, 80, 0.9);
      color: white;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: bold;
      z-index: 10000;
      pointer-events: none;
      opacity: 0.8;
    `;
    indicator.textContent = `🎓 Asistencia Automática (${scanResult.students.length} estudiantes)`;
    document.body.appendChild(indicator);

    // Ocultar después de 5 segundos
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 5000);

    return scanResult;
  } else {
    console.log("⚠️ No se detectó la página de asistencias del sistema UCV");
    sendLogToPopup("⚠️ No se detectó página de asistencias válida", "warning");
    return null;
  }
}

// Realizar escaneo inicial después de que la página se cargue completamente
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(performInitialScan, 1000);
  });
} else {
  setTimeout(performInitialScan, 1000);
}

// Variable global para almacenar el último resultado de marcación
let lastMarkingResult = null;

// Función para generar reporte completo
function generateCompleteReport() {
  const scanResult = scanPageForStudents();
  const now = new Date().toLocaleString("es-ES");

  let report = "";
  report += "🎓 REPORTE DE ASISTENCIA AUTOMÁTICA UCV\n";
  report += "=".repeat(60) + "\n";
  report += `📅 Fecha y hora: ${now}\n`;
  report += `🌐 URL: ${window.location.href}\n`;
  report += `📄 Título: ${document.title}\n\n`;

  if (scanResult.isAttendancePage) {
    report += `✅ PÁGINA VÁLIDA DETECTADA\n`;
    report += `📊 Total de estudiantes en la página: ${scanResult.students.length}\n\n`;

    // Si hay un resultado de marcación previo, mostrarlo
    if (lastMarkingResult) {
      report += "📊 ÚLTIMA MARCACIÓN REALIZADA:\n";
      report += "-".repeat(50) + "\n";
      report += `✅ Marcados exitosamente: ${lastMarkingResult.markedCount}\n`;
      report += `❌ Falló al marcar: ${
        lastMarkingResult.markingResults.filter((r) => !r.success).length
      }\n`;
      report += `⚠️ No encontrados: ${lastMarkingResult.notFoundCount}\n\n`;

      if (
        lastMarkingResult.markingResults &&
        lastMarkingResult.markingResults.length > 0
      ) {
        const successful = lastMarkingResult.markingResults.filter(
          (r) => r.success
        );
        const failed = lastMarkingResult.markingResults.filter(
          (r) => !r.success
        );

        if (successful.length > 0) {
          report += "✅ ESTUDIANTES MARCADOS EXITOSAMENTE:\n";
          successful.forEach((result, index) => {
            report += `  ${index + 1}. ${result.student}\n`;
          });
          report += "\n";
        }

        if (failed.length > 0) {
          report += "❌ ESTUDIANTES QUE FALLARON AL MARCAR:\n";
          report += "   (Marcar manualmente estos):\n";
          failed.forEach((result, index) => {
            report += `  ${index + 1}. ${result.student}\n`;
          });
          report += "\n";
        }
      }

      if (lastMarkingResult.notFoundCount > 0) {
        report += "⚠️ ESTUDIANTES NO ENCONTRADOS EN LA PÁGINA:\n";
        report += "   (Verificar si están en la lista):\n";
        lastMarkingResult.comparisonResults
          .filter((r) => r.matchType === "not_found")
          .forEach((result, index) => {
            report += `  ${index + 1}. ${result.original}\n`;
          });
        report += "\n";
      }
    }

    report += "📋 LISTA COMPLETA DE ESTUDIANTES EN LA PÁGINA:\n";
    report += "-".repeat(50) + "\n";
    scanResult.students.forEach((student, index) => {
      report += `${(index + 1).toString().padStart(3, "0")}. ${student.name}`;
      if (student.code) {
        report += ` (Código: ${student.code})`;
      }
      report += "\n";
    });

    report += "\n" + "=".repeat(60) + "\n";
    report += "📝 INSTRUCCIONES PARA MARCACIÓN MANUAL:\n";
    report += "-".repeat(50) + "\n";
    report += "1. Busca cada estudiante en la lista de arriba\n";
    report += "2. Marca manualmente como 'A' (Asistencia) o 'F' (Falta)\n";
    report += "3. Guarda los cambios en el sistema\n\n";

    report += "🔍 INFORMACIÓN TÉCNICA:\n";
    report += "-".repeat(30) + "\n";
    report += `• Tablas encontradas: ${scanResult.pageInfo.tableCount}\n`;
    report += `• Grupos de radio buttons: ${
      Object.keys(scanResult.radioButtonGroups).length
    }\n`;
    report += `• Estado de la página: ${
      scanResult.isAttendancePage ? "Válida" : "No válida"
    }\n`;
  } else {
    report += "❌ NO SE DETECTÓ UNA PÁGINA DE ASISTENCIAS VÁLIDA\n";
    report += "🔍 Información de depuración:\n";
    report += `• Tablas encontradas: ${scanResult.pageInfo.tableCount}\n`;
    report += `• Estudiantes detectados: ${scanResult.students.length}\n`;
    report += `• URL actual: ${window.location.href}\n`;
  }

  report += "\n" + "=".repeat(60) + "\n";
  report += "🎓 Extensión de Asistencia Automática UCV\n";
  report += "Generado automáticamente\n";

  return report;
}

// Verificar que el content script se cargó correctamente
console.log("🎓 Content script cargado en:", window.location.href);
console.log("🎓 Document ready state:", document.readyState);
