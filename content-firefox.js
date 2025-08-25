// Content script para marcar asistencias automáticamente en el sistema UCV (Firefox)
console.log("🎓 Extensión de Asistencia Automática UCV cargada (Firefox)");
console.log("🎓 URL actual:", window.location.href);
console.log("🎓 Título de la página:", document.title);

// Enviar log de prueba al popup
setTimeout(() => {
  console.log("🎓 Enviando log de prueba al popup...");
  sendLogToPopup(
    "🎓 Content script cargado correctamente (Firefox)",
    "success"
  );
}, 1000);

// Enviar log adicional después de 2 segundos
setTimeout(() => {
  console.log("🎓 Enviando segundo log de prueba...");
  sendLogToPopup(
    "🎓 Segundo log de prueba - Content script funcionando (Firefox)",
    "info"
  );
}, 2000);

// Función para enviar logs al popup
function sendLogToPopup(message, type = "info") {
  try {
    console.log("📤 Enviando log al popup:", message);
    browser.runtime.sendMessage({
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
        `✅ Encontrados ${attendanceRadioButtons.length} radio buttons con 'asistencia' en el nombre`,
        "success"
      );
    }
  }

  // 3. Si no encontramos radio buttons específicos, buscar en tablas
  if (attendanceRadioButtons.length === 0) {
    sendLogToPopup("🔍 Paso 3: Buscando radio buttons en tablas...", "info");

    const tableRows = document.querySelectorAll("table tr");
    let foundInTables = 0;

    tableRows.forEach((row, rowIndex) => {
      const radioButtons = row.querySelectorAll('input[type="radio"]');
      if (radioButtons.length > 0) {
        foundInTables += radioButtons.length;
        radioButtons.forEach((radio) => {
          attendanceRadioButtons.push(radio);
        });
      }
    });

    if (foundInTables > 0) {
      sendLogToPopup(
        `✅ Encontrados ${foundInTables} radio buttons en tablas`,
        "success"
      );
    }
  }

  // 4. Agrupar radio buttons por nombre (grupo)
  sendLogToPopup("🔍 Paso 4: Agrupando radio buttons...", "info");

  const radioGroups = {};
  attendanceRadioButtons.forEach((radio) => {
    const name = radio.name;
    if (!radioGroups[name]) {
      radioGroups[name] = [];
    }
    radioGroups[name].push(radio);
  });

  scanResult.radioButtonGroups = radioGroups;
  const totalGroups = Object.keys(radioGroups).length;

  sendLogToPopup(
    `📊 Agrupados en ${totalGroups} grupos de radio buttons`,
    "info"
  );

  // 5. Extraer nombres de estudiantes
  sendLogToPopup("🔍 Paso 5: Extrayendo nombres de estudiantes...", "info");

  const students = [];
  const processedNames = new Set();

  // Buscar en diferentes elementos que puedan contener nombres
  const possibleNameElements = [
    ...document.querySelectorAll("td"),
    ...document.querySelectorAll("th"),
    ...document.querySelectorAll("label"),
    ...document.querySelectorAll("span"),
    ...document.querySelectorAll("div"),
  ];

  possibleNameElements.forEach((element) => {
    const text = element.textContent.trim();
    if (text && text.length > 3 && text.length < 100) {
      // Filtrar texto que parece ser un nombre
      const normalizedText = normalizeName(text);

      // Evitar duplicados y elementos que no son nombres
      if (
        !processedNames.has(normalizedText) &&
        !normalizedText.match(
          /^(asistencia|presente|ausente|total|porcentaje|estudiante|alumno|nombre|apellido|cedula|id|codigo|nota|calificacion|puntaje|puntos|fecha|hora|clase|materia|curso|seccion|grupo|profesor|docente|maestro|instructor|facultad|escuela|departamento|universidad|ucv|sistema|plataforma|web|online|virtual|presencial|hibrido|semestre|trimestre|periodo|año|año|mes|dia|lunes|martes|miercoles|jueves|viernes|sabado|domingo|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|guardar|enviar|submit|save|send|ok|aceptar|cancelar|cancel|volver|back|anterior|siguiente|next|primero|ultimo|first|last|inicio|fin|start|end|menu|opciones|settings|configuracion|ayuda|help|informacion|info|contacto|about|acerca|version|v\d+\.\d+|build|release|beta|alpha|dev|development|test|testing|debug|debugging|log|logs|error|errors|warning|warnings|success|info|information|message|messages|notification|notifications|alert|alerts|popup|modal|dialog|window|tab|page|pagina|section|seccion|area|zona|region|parte|componente|elemento|widget|control|button|boton|link|enlace|href|url|address|direccion|path|ruta|route|api|rest|json|xml|html|css|js|javascript|typescript|php|python|java|c#|c\+\+|ruby|go|rust|swift|kotlin|dart|flutter|react|vue|angular|node|express|django|flask|laravel|spring|asp|dotnet|net|framework|library|libreria|package|module|modulo|plugin|extension|addon|add-on|tool|herramienta|utility|utilidad|function|funcion|method|metodo|class|clase|object|objeto|variable|var|const|let|array|arreglo|list|lista|map|diccionario|dictionary|set|conjunto|string|texto|number|numero|integer|entero|float|decimal|double|boolean|bool|true|false|null|undefined|void|any|unknown|never|void|null|undefined|true|false|yes|no|si|no|on|off|enable|disable|active|inactive|visible|hidden|show|hide|display|none|block|inline|flex|grid|table|list|item|items|row|rows|col|cols|column|columns|cell|cells|header|headers|footer|footers|body|main|content|container|wrapper|div|span|p|h1|h2|h3|h4|h5|h6|title|subtitle|heading|headline|text|label|input|form|field|fields|group|groups|section|sections|tab|tabs|panel|panels|card|cards|box|boxes|container|containers|wrapper|wrappers|div|divs|span|spans|p|ps|h1|h1s|h2|h2s|h3|h3s|h4|h4s|h5|h5s|h6|h6s|title|titles|subtitle|subtitles|heading|headings|headline|headlines|text|texts|label|labels|input|inputs|form|forms|field|fields|group|groups|section|sections|tab|tabs|panel|panels|card|cards|box|boxes|container|containers|wrapper|wrappers)$/i
        ) &&
        !normalizedText.match(/^\d+$/) && // No solo números
        !normalizedText.match(/^[A-Z\s]+$/) && // No solo mayúsculas y espacios
        normalizedText.includes(" ") && // Debe tener al menos un espacio
        normalizedText.length > 5 // Debe ser suficientemente largo
      ) {
        students.push({
          original: text,
          normalized: normalizedText,
          element: element,
        });
        processedNames.add(normalizedText);
      }
    }
  });

  // Ordenar por longitud del nombre (los más largos primero)
  students.sort((a, b) => b.normalized.length - a.normalized.length);

  scanResult.students = students;
  scanResult.totalStudents = students.length;

  sendLogToPopup(
    `📊 Extraídos ${students.length} posibles nombres de estudiantes`,
    "success"
  );

  // 6. Determinar si es una página de asistencias
  const isAttendancePage =
    attendanceRadioButtons.length > 0 ||
    document.title.toLowerCase().includes("asistencia") ||
    document.title.toLowerCase().includes("attendance") ||
    window.location.href.toLowerCase().includes("asistencia") ||
    window.location.href.toLowerCase().includes("attendance");

  scanResult.isAttendancePage = isAttendancePage;

  if (isAttendancePage) {
    sendLogToPopup(
      "✅ Página identificada como página de asistencias",
      "success"
    );
  } else {
    sendLogToPopup(
      "⚠️ No se pudo confirmar que sea página de asistencias",
      "warning"
    );
  }

  // 7. Log final del escaneo
  const finalMessage = `
🔍 ESCANEO COMPLETADO:
• Página de asistencias: ${isAttendancePage ? "✅" : "❌"}
• Radio buttons encontrados: ${attendanceRadioButtons.length}
• Grupos de radio buttons: ${totalGroups}
• Estudiantes detectados: ${students.length}
• Tablas en la página: ${tables.length}
• URL: ${window.location.href}
• Título: ${document.title}
  `;

  console.log(finalMessage);
  sendLogToPopup("🔍 Escaneo completado exitosamente", "success");

  return scanResult;
}

// Función para comparar nombres y encontrar coincidencias
function compareNames(studentList, pageStudents) {
  const comparisonResults = [];
  const markedStudents = [];
  const notFoundStudents = [];

  // Normalizar la lista de estudiantes proporcionada
  const normalizedStudentList = studentList
    .split("\n")
    .map((name) => normalizeName(name.trim()))
    .filter((name) => name.length > 0);

  sendLogToPopup(
    `🔍 Comparando ${normalizedStudentList.length} nombres con ${pageStudents.length} estudiantes en la página`,
    "info"
  );

  normalizedStudentList.forEach((originalName) => {
    let bestMatch = null;
    let bestScore = 0;

    // Buscar la mejor coincidencia
    pageStudents.forEach((pageStudent) => {
      const pageName = pageStudent.normalized;

      // Calcular similitud usando diferentes métodos
      const exactMatch = pageName === originalName;
      const containsMatch =
        pageName.includes(originalName) || originalName.includes(pageName);
      const wordMatch = originalName
        .split(" ")
        .some((word) => word.length > 2 && pageName.includes(word));

      let score = 0;
      if (exactMatch) score = 100;
      else if (containsMatch) score = 80;
      else if (wordMatch) score = 60;

      // Bonus por longitud similar
      const lengthDiff = Math.abs(pageName.length - originalName.length);
      if (lengthDiff <= 5) score += 10;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = pageStudent;
      }
    });

    if (bestMatch && bestScore >= 50) {
      comparisonResults.push({
        original: originalName,
        matched: bestMatch.original,
        normalized: bestMatch.normalized,
        score: bestScore,
        matchType: "found",
        element: bestMatch.element,
      });
      markedStudents.push(bestMatch);
    } else {
      comparisonResults.push({
        original: originalName,
        matched: null,
        normalized: null,
        score: 0,
        matchType: "not_found",
        element: null,
      });
      notFoundStudents.push(originalName);
    }
  });

  sendLogToPopup(
    `✅ Encontrados: ${markedStudents.length}, No encontrados: ${notFoundStudents.length}`,
    "success"
  );

  return {
    comparisonResults,
    markedStudents,
    notFoundStudents,
  };
}

// Función para marcar estudiantes como presentes
function markStudentsPresent(studentList) {
  sendLogToPopup("🎯 Iniciando marcado de asistencias...", "info");

  const scanResult = scanPageForStudents();
  if (!scanResult.isAttendancePage) {
    sendLogToPopup(
      "❌ No se detectó una página de asistencias válida",
      "error"
    );
    return {
      success: false,
      message: "No se detectó una página de asistencias válida",
    };
  }

  const comparison = compareNames(studentList, scanResult.students);
  const markingResults = [];

  let markedCount = 0;
  let totalFound = comparison.markedStudents.length;

  // Marcar cada estudiante encontrado
  comparison.markedStudents.forEach((student) => {
    try {
      // Buscar el radio button correspondiente a este estudiante
      const studentElement = student.element;
      const row = studentElement.closest("tr");

      if (row) {
        // Buscar radio buttons en la fila
        const radioButtons = row.querySelectorAll('input[type="radio"]');

        if (radioButtons.length > 0) {
          // Buscar el radio button de "presente" o "asistencia"
          let presentRadio = null;

          // Primero buscar por valor
          radioButtons.forEach((radio) => {
            const value = radio.value.toLowerCase();
            if (
              value.includes("presente") ||
              value.includes("asistencia") ||
              value === "1" ||
              value === "true"
            ) {
              presentRadio = radio;
            }
          });

          // Si no se encuentra por valor, tomar el primero
          if (!presentRadio && radioButtons.length > 0) {
            presentRadio = radioButtons[0];
          }

          if (presentRadio) {
            presentRadio.checked = true;
            presentRadio.click();

            // Trigger change event
            const event = new Event("change", { bubbles: true });
            presentRadio.dispatchEvent(event);

            markingResults.push({
              student: student.original,
              success: true,
              message: "Marcado como presente",
            });

            markedCount++;
            sendLogToPopup(`✅ Marcado: ${student.original}`, "success");
          } else {
            markingResults.push({
              student: student.original,
              success: false,
              message: "No se encontró radio button para marcar",
            });
            sendLogToPopup(
              `❌ No se pudo marcar: ${student.original}`,
              "error"
            );
          }
        } else {
          markingResults.push({
            student: student.original,
            success: false,
            message: "No se encontraron radio buttons en la fila",
          });
          sendLogToPopup(
            `❌ No se encontraron radio buttons para: ${student.original}`,
            "error"
          );
        }
      } else {
        markingResults.push({
          student: student.original,
          success: false,
          message: "No se pudo encontrar la fila del estudiante",
        });
        sendLogToPopup(
          `❌ No se pudo encontrar fila para: ${student.original}`,
          "error"
        );
      }
    } catch (error) {
      markingResults.push({
        student: student.original,
        success: false,
        message: `Error: ${error.message}`,
      });
      sendLogToPopup(
        `❌ Error marcando ${student.original}: ${error.message}`,
        "error"
      );
    }
  });

  const finalMessage = `
🎯 MARCADO COMPLETADO:
• Total estudiantes en lista: ${
    studentList.split("\n").filter((n) => n.trim()).length
  }
• Encontrados en página: ${totalFound}
• Marcados exitosamente: ${markedCount}
• No encontrados: ${comparison.notFoundStudents.length}
  `;

  sendLogToPopup(finalMessage, "success");

  return {
    success: true,
    markedCount: markedCount,
    totalFound: totalFound,
    notFoundCount: comparison.notFoundStudents.length,
    markingResults: markingResults,
    comparisonResults: comparison.comparisonResults,
  };
}

// Función para marcar todos como ausentes
function markAllStudentsAbsent() {
  sendLogToPopup("❌ Marcando todos como ausentes...", "info");

  const scanResult = scanPageForStudents();
  if (!scanResult.isAttendancePage) {
    sendLogToPopup(
      "❌ No se detectó una página de asistencias válida",
      "error"
    );
    return {
      success: false,
      message: "No se detectó una página de asistencias válida",
    };
  }

  let markedCount = 0;

  // Marcar todos los radio buttons como ausentes
  Object.values(scanResult.radioButtonGroups).forEach((group) => {
    group.forEach((radio) => {
      try {
        const value = radio.value.toLowerCase();
        if (
          value.includes("ausente") ||
          value.includes("absent") ||
          value === "0" ||
          value === "false"
        ) {
          radio.checked = true;
          radio.click();

          // Trigger change event
          const event = new Event("change", { bubbles: true });
          radio.dispatchEvent(event);

          markedCount++;
        }
      } catch (error) {
        sendLogToPopup(
          `❌ Error marcando radio button: ${error.message}`,
          "error"
        );
      }
    });
  });

  sendLogToPopup(
    `✅ ${markedCount} estudiantes marcados como ausentes`,
    "success"
  );

  return {
    success: true,
    markedCount: markedCount,
  };
}

// Función para escanear columnas de notas
function scanNotasColumns() {
  sendLogToPopup("🔍 Escaneando columnas de notas...", "info");

  const columns = [];
  const tables = document.querySelectorAll("table");

  tables.forEach((table, tableIndex) => {
    const headers = table.querySelectorAll("th");
    headers.forEach((header, headerIndex) => {
      const headerText = header.textContent.trim().toLowerCase();
      if (
        headerText.includes("nota") ||
        headerText.includes("calificación") ||
        headerText.includes("puntaje") ||
        headerText.includes("puntos")
      ) {
        columns.push(header.textContent.trim());
      }
    });
  });

  const totalStudents = document.querySelectorAll("table tr").length - 1; // Restar headers

  return {
    success: true,
    columns: columns,
    totalStudents: totalStudents,
  };
}

// Función para llenar notas
function fillNotes(column, notes) {
  sendLogToPopup(`📝 Llenando notas en columna: ${column}`, "info");

  let filledCount = 0;
  let totalCount = 0;

  const tables = document.querySelectorAll("table");

  tables.forEach((table) => {
    const headers = Array.from(table.querySelectorAll("th"));
    const columnIndex = headers.findIndex(
      (header) => header.textContent.trim() === column
    );

    if (columnIndex !== -1) {
      const rows = table.querySelectorAll("tr");
      rows.forEach((row, rowIndex) => {
        if (rowIndex > 0) {
          // Saltar header
          const cells = row.querySelectorAll("td");
          if (cells[columnIndex]) {
            totalCount++;

            // Buscar nombre del estudiante en la fila
            const studentNameElement = cells[0]; // Asumir que el nombre está en la primera columna
            if (studentNameElement) {
              const studentName = normalizeName(
                studentNameElement.textContent.trim()
              );

              // Buscar la nota correspondiente
              const noteData = notes.find(
                (note) => normalizeName(note.name) === studentName
              );

              if (noteData) {
                const input = cells[columnIndex].querySelector("input");
                if (input) {
                  input.value = noteData.note;
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  input.dispatchEvent(new Event("change", { bubbles: true }));
                  filledCount++;
                  sendLogToPopup(
                    `✅ Nota ${noteData.note} para ${noteData.name}`,
                    "success"
                  );
                }
              }
            }
          }
        }
      });
    }
  });

  return {
    success: true,
    filledCount: filledCount,
    totalCount: totalCount,
  };
}

// Función para depurar la página
function debugPage() {
  const attendanceInputs = document.querySelectorAll(
    'input[name^="rbl_asistencia"]'
  );
  const allRadioButtons = document.querySelectorAll('input[type="radio"]');
  const tables = document.querySelectorAll("table");
  const students = scanPageForStudents().students;

  const radioButtonNames = Array.from(allRadioButtons).map(
    (radio) => radio.name
  );
  const studentNames = students.map((student) => student.original);

  const attendanceTexts = [];
  document.querySelectorAll("*").forEach((element) => {
    const text = element.textContent;
    if (text && text.toLowerCase().includes("asistencia")) {
      attendanceTexts.push(text.trim());
    }
  });

  return {
    success: true,
    debugInfo: {
      url: window.location.href,
      title: document.title,
      hasAttendanceInputs: attendanceInputs.length > 0,
      totalAttendanceInputs: attendanceInputs.length,
      totalStudents: students.length,
      allTables: tables.length,
      allRadioButtons: allRadioButtons.length,
      radioButtonNames: radioButtonNames,
      studentNames: studentNames,
      attendanceTexts: attendanceTexts,
    },
  };
}

// Función para generar reporte completo
function generateReport() {
  const scanResult = scanPageForStudents();

  let report = `
📄 REPORTE COMPLETO DE LA PÁGINA
${"=".repeat(50)}

🔍 INFORMACIÓN GENERAL:
• URL: ${scanResult.pageInfo.url}
• Título: ${scanResult.pageInfo.title}
• Es página de asistencias: ${scanResult.isAttendancePage ? "✅" : "❌"}
• Total de tablas: ${scanResult.pageInfo.tableCount}

📊 ESTADÍSTICAS:
• Total estudiantes detectados: ${scanResult.totalStudents}
• Total grupos de radio buttons: ${
    Object.keys(scanResult.radioButtonGroups).length
  }

📋 GRUPOS DE RADIO BUTTONS:
${Object.keys(scanResult.radioButtonGroups)
  .map(
    (groupName, index) =>
      `${index + 1}. ${groupName} (${
        scanResult.radioButtonGroups[groupName].length
      } botones)`
  )
  .join("\n")}

👥 ESTUDIANTES DETECTADOS:
${scanResult.students
  .map((student, index) => `${index + 1}. ${student.original}`)
  .join("\n")}

🔧 ELEMENTOS DE LA PÁGINA:
• Total radio buttons: ${
    document.querySelectorAll('input[type="radio"]').length
  }
• Total inputs: ${document.querySelectorAll("input").length}
• Total tablas: ${document.querySelectorAll("table").length}
• Total filas: ${document.querySelectorAll("tr").length}
• Total celdas: ${document.querySelectorAll("td").length}

📝 CONTENIDO CON "ASISTENCIA":
${Array.from(document.querySelectorAll("*"))
  .map((el) => el.textContent)
  .filter((text) => text && text.toLowerCase().includes("asistencia"))
  .map((text) => text.trim())
  .filter((text, index, arr) => arr.indexOf(text) === index)
  .slice(0, 10)
  .map((text, index) => `${index + 1}. ${text}`)
  .join("\n")}

${"=".repeat(50)}
Reporte generado el: ${new Date().toLocaleString()}
  `;

  return {
    success: true,
    report: report,
  };
}

// Función de prueba
function testConnection() {
  return {
    success: true,
    message: "Conexión exitosa con el content script (Firefox)",
    timestamp: new Date().toISOString(),
  };
}

// Escuchar mensajes del popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Content script recibió mensaje:", request);

  try {
    switch (request.action) {
      case "scan":
        const scanResult = scanPageForStudents();
        sendResponse({ success: true, scanResult });
        break;

      case "markPresent":
        const markResult = markStudentsPresent(request.studentList);
        sendResponse(markResult);
        break;

      case "markAbsent":
        const absentResult = markAllStudentsAbsent();
        sendResponse(absentResult);
        break;

      case "scanNotasColumns":
        const columnsResult = scanNotasColumns();
        sendResponse(columnsResult);
        break;

      case "fillNotes":
        const notesResult = fillNotes(request.column, request.notes);
        sendResponse(notesResult);
        break;

      case "debug":
        const debugResult = debugPage();
        sendResponse(debugResult);
        break;

      case "generateReport":
        const reportResult = generateReport();
        sendResponse(reportResult);
        break;

      case "test":
        const testResult = testConnection();
        sendResponse(testResult);
        break;

      default:
        sendResponse({ success: false, message: "Acción no reconocida" });
    }
  } catch (error) {
    console.error("❌ Error en content script:", error);
    sendResponse({ success: false, message: error.message });
  }

  return true; // Mantener el canal abierto para respuestas asíncronas
});
