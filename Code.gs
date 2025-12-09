/**
 * ═══════════════════════════════════════════════════════════════
 * SISTEMA DE GESTIÓN DE PATENTES DOM LA SERENA - VERSIÓN V9
 * Archivo: Code.gs
 * Descripción: Backend completo para Google Apps Script
 * ═══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN GLOBAL
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  HOJA_BD: 'BD_PATENTES',
  HOJA_SECTORES: 'SECTORES',
  CARPETA_DOCS: 'Documentos Patentes'
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE INTERFAZ
// ═══════════════════════════════════════════════════════════════

/**
 * Muestra la interfaz web principal
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('interfaz_V9')
    .setTitle('Sistema Patentes DOM La Serena')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ═══════════════════════════════════════════════════════════════
// REGISTRO DE USUARIOS - V9 SIMPLIFICADO
// ═══════════════════════════════════════════════════════════════

/**
 * Registra nuevo usuario con solo 3 campos: REG, Nombre, Email
 * VERSIÓN V9 - SIMPLIFICADA
 */
function registrarUsuarioSimple(reg, nombre, email) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName(CONFIG.HOJA_BD);

    if (!hoja) {
      return {
        exito: false,
        msg: 'Error: No se encuentra la hoja ' + CONFIG.HOJA_BD
      };
    }

    // Validar campos requeridos
    if (!reg || !nombre || !email) {
      return {
        exito: false,
        msg: 'Todos los campos son requeridos'
      };
    }

    // Validar email
    if (!email.includes('@')) {
      return {
        exito: false,
        msg: 'Email inválido'
      };
    }

    // Verificar si REG ya existe
    const datos = hoja.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] === reg) {
        return {
          exito: false,
          msg: 'El número de registro ' + reg + ' ya existe en el sistema'
        };
      }
    }

    // Crear nueva fila con timestamp
    const timestamp = new Date();
    const nuevaFila = [
      reg,              // A: REG
      timestamp,        // B: TIMESTAMP
      nombre,           // C: NOMBRE
      email,            // D: EMAIL
      '',               // E: RUT (vacío por ahora)
      '',               // F: TELEFONO (vacío por ahora)
      '',               // G: DIRECCION (vacío por ahora)
      '',               // H: SECTOR (vacío por ahora)
      '',               // I: TIPO_TRAMITE (vacío por ahora)
      'PENDIENTE',      // J: ESTADO
      '',               // K: FECHA_PROGRAMACION
      '',               // L: INSPECTOR
      '',               // M: RESULTADO_INSPECCION
      ''                // N: OBSERVACIONES
    ];

    // Agregar a la hoja
    hoja.appendRow(nuevaFila);

    // Enviar formulario por email
    try {
      enviarFormularioInicial(email, nombre, reg);
    } catch (error) {
      Logger.log('Error enviando email: ' + error);
      // No falla el registro si falla el email
    }

    Logger.log('Usuario registrado: ' + reg);

    return {
      exito: true,
      reg: reg,
      msg: 'Registro creado exitosamente'
    };

  } catch (error) {
    Logger.log('Error en registrarUsuarioSimple: ' + error);
    return {
      exito: false,
      msg: 'Error del servidor: ' + error.message
    };
  }
}

/**
 * Envía email con formulario para completar datos
 */
function enviarFormularioInicial(email, nombre, reg) {
  try {
    const asunto = 'Formulario Patente Comercial - REG ' + reg;

    const cuerpo = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a73e8;">Formulario de Patente Comercial</h2>

          <p>Estimado/a <strong>${nombre}</strong>,</p>

          <p>Su solicitud de patente comercial ha sido registrada con el número <strong>${reg}</strong>.</p>

          <p>Para continuar con el proceso, por favor complete el siguiente formulario con los datos de su local:</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Datos Pendientes:</h3>
            <ul>
              <li>RUT del titular</li>
              <li>Teléfono de contacto</li>
              <li>Dirección completa del local</li>
              <li>Sector</li>
              <li>Tipo de trámite (Nueva, Renovación, etc.)</li>
              <li>Actividad comercial</li>
              <li>Documentos requeridos</li>
            </ul>
          </div>

          <p><a href="#" style="display: inline-block; background: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Completar Formulario</a></p>

          <hr style="border: none; border-top: 1px solid #dadce0; margin: 30px 0;">

          <p style="font-size: 12px; color: #5f6368;">
            Dirección de Obras Municipales - La Serena<br>
            Este es un correo automático, por favor no responder.
          </p>
        </body>
      </html>
    `;

    MailApp.sendEmail({
      to: email,
      subject: asunto,
      htmlBody: cuerpo
    });

    Logger.log('Email enviado a: ' + email);

  } catch (error) {
    Logger.log('Error en enviarFormularioInicial: ' + error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// PROGRAMACIÓN DE INSPECCIONES
// ═══════════════════════════════════════════════════════════════

/**
 * Obtiene casos listos para programar visita
 */
function obtenerListosParaVisita() {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA_BD);
    const datos = hoja.getDataRange().getValues();
    const casos = [];

    for (let i = 1; i < datos.length; i++) {
      const estado = datos[i][9]; // Columna J: ESTADO

      if (estado === 'LISTO_VISITA' || estado === 'FORM_ENVIADO') {
        casos.push({
          reg: datos[i][0],
          nombre: datos[i][2],
          direccion: datos[i][6],
          sector: datos[i][7],
          fechaProg: datos[i][10] || ''
        });
      }
    }

    return casos;

  } catch (error) {
    Logger.log('Error en obtenerListosParaVisita: ' + error);
    return [];
  }
}

/**
 * Programa inspecciones para casos seleccionados
 */
function programarInspecciones(regsArray, fecha, inspector) {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA_BD);
    const datos = hoja.getDataRange().getValues();
    let contador = 0;

    for (let i = 1; i < datos.length; i++) {
      const reg = datos[i][0];

      if (regsArray.indexOf(reg) !== -1) {
        // Actualizar fecha y inspector
        hoja.getRange(i + 1, 11).setValue(fecha); // Columna K: FECHA_PROGRAMACION
        hoja.getRange(i + 1, 12).setValue(inspector || ''); // Columna L: INSPECTOR
        hoja.getRange(i + 1, 10).setValue('PROGRAMADO'); // Columna J: ESTADO
        contador++;
      }
    }

    return {
      exito: true,
      msg: 'Se programaron ' + contador + ' inspecciones para el ' + fecha
    };

  } catch (error) {
    Logger.log('Error en programarInspecciones: ' + error);
    return {
      exito: false,
      msg: 'Error: ' + error.message
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// INSPECCIÓN iPAD
// ═══════════════════════════════════════════════════════════════

/**
 * Obtiene casos programados para una fecha específica
 */
function obtenerCasosProgramados(fecha) {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA_BD);
    const datos = hoja.getDataRange().getValues();
    const casos = [];

    for (let i = 1; i < datos.length; i++) {
      const fechaProg = datos[i][10]; // Columna K: FECHA_PROGRAMACION

      if (fechaProg && formatearFecha(fechaProg) === fecha) {
        casos.push({
          reg: datos[i][0],
          nombre: datos[i][2],
          direccion: datos[i][6],
          hora: '09:00', // Puedes agregar lógica para asignar horas
          estado: datos[i][9]
        });
      }
    }

    return casos;

  } catch (error) {
    Logger.log('Error en obtenerCasosProgramados: ' + error);
    return [];
  }
}

/**
 * Envía lista de inspección por email
 */
function enviarListaInspeccionEmail(fecha, emailDestino) {
  try {
    const email = emailDestino || Session.getActiveUser().getEmail();
    const casos = obtenerCasosProgramados(fecha);

    if (casos.length === 0) {
      return {
        exito: false,
        msg: 'No hay casos programados para la fecha ' + fecha
      };
    }

    let lista = '<ul>';
    casos.forEach(function(c) {
      lista += '<li><strong>' + c.reg + '</strong> - ' + c.nombre + ' (' + c.direccion + ')</li>';
    });
    lista += '</ul>';

    const asunto = 'Lista de Inspecciones - ' + fecha;
    const cuerpo = '<h2>Inspecciones Programadas</h2>' +
                   '<p>Fecha: <strong>' + fecha + '</strong></p>' +
                   '<p>Total de casos: <strong>' + casos.length + '</strong></p>' +
                   lista;

    MailApp.sendEmail({
      to: email,
      subject: asunto,
      htmlBody: cuerpo
    });

    return {
      exito: true,
      msg: 'Email enviado a ' + email
    };

  } catch (error) {
    Logger.log('Error en enviarListaInspeccionEmail: ' + error);
    return {
      exito: false,
      msg: 'Error: ' + error.message
    };
  }
}

/**
 * Envía link para iPad
 */
function enviarLinkIPad(fecha, emailDestino) {
  try {
    const email = emailDestino || Session.getActiveUser().getEmail();
    const webAppUrl = ScriptApp.getService().getUrl();

    const asunto = 'Link iPad - Inspecciones ' + fecha;
    const cuerpo = '<h2>Link para iPad</h2>' +
                   '<p>Abra el siguiente enlace en su iPad:</p>' +
                   '<p><a href="' + webAppUrl + '?fecha=' + fecha + '">' + webAppUrl + '</a></p>';

    MailApp.sendEmail({
      to: email,
      subject: asunto,
      htmlBody: cuerpo
    });

    return {
      exito: true,
      msg: 'Link enviado a ' + email
    };

  } catch (error) {
    Logger.log('Error en enviarLinkIPad: ' + error);
    return {
      exito: false,
      msg: 'Error: ' + error.message
    };
  }
}

/**
 * Genera documento de archivo
 */
function generarDocumentoArchivo(fecha) {
  try {
    const casos = obtenerCasosProgramados(fecha);

    if (casos.length === 0) {
      return { msg: 'No hay casos para generar documento' };
    }

    // Crear documento en Google Docs
    const doc = DocumentApp.create('Archivo Inspecciones - ' + fecha);
    const body = doc.getBody();

    body.appendParagraph('LISTADO DE INSPECCIONES').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('Fecha: ' + fecha);
    body.appendParagraph('Total: ' + casos.length + ' casos');
    body.appendParagraph('');

    casos.forEach(function(c, index) {
      body.appendParagraph((index + 1) + '. ' + c.reg + ' - ' + c.nombre);
      body.appendParagraph('   Dirección: ' + c.direccion);
      body.appendParagraph('');
    });

    doc.saveAndClose();

    return {
      url: doc.getUrl(),
      msg: 'Documento generado exitosamente'
    };

  } catch (error) {
    Logger.log('Error en generarDocumentoArchivo: ' + error);
    return { msg: 'Error: ' + error.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// GENERACIÓN DE DOCUMENTOS
// ═══════════════════════════════════════════════════════════════

/**
 * Busca un registro por REG
 */
function buscarPorReg(reg) {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA_BD);
    const datos = hoja.getDataRange().getValues();

    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] === reg) {
        return {
          REG: datos[i][0],
          TIMESTAMP: datos[i][1],
          NOMBRE: datos[i][2],
          EMAIL: datos[i][3],
          RUT: datos[i][4],
          TELEFONO: datos[i][5],
          DIRECCION: datos[i][6],
          SECTOR: datos[i][7],
          TIPO_TRAMITE: datos[i][8],
          ESTADO: datos[i][9],
          FECHA_PROGRAMACION: datos[i][10],
          INSPECTOR: datos[i][11],
          RESULTADO: datos[i][12],
          OBSERVACIONES: datos[i][13]
        };
      }
    }

    return null;

  } catch (error) {
    Logger.log('Error en buscarPorReg: ' + error);
    return null;
  }
}

/**
 * Genera documento Contracara
 */
function generarContracara(reg) {
  try {
    const datos = buscarPorReg(reg);

    if (!datos) {
      return { msg: 'No se encontró el registro ' + reg };
    }

    const doc = DocumentApp.create('Contracara - ' + reg);
    const body = doc.getBody();

    body.appendParagraph('FORMULARIO DE INSPECCIÓN').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('REG: ' + reg);
    body.appendParagraph('Nombre: ' + datos.NOMBRE);
    body.appendParagraph('Dirección: ' + datos.DIRECCION);
    body.appendParagraph('');
    body.appendParagraph('[ ] LOCAL APTO');
    body.appendParagraph('[ ] OBSERVACIONES');
    body.appendParagraph('[ ] DENEGADO');

    doc.saveAndClose();

    return {
      url: doc.getUrl(),
      msg: 'Contracara generada'
    };

  } catch (error) {
    Logger.log('Error en generarContracara: ' + error);
    return { msg: 'Error: ' + error.message };
  }
}

/**
 * Genera Acta de Patente
 */
function generarActaPatente(reg) {
  try {
    const datos = buscarPorReg(reg);

    if (!datos) {
      return { msg: 'No se encontró el registro ' + reg };
    }

    const doc = DocumentApp.create('Acta Patente - ' + reg);
    const body = doc.getBody();

    body.appendParagraph('ACTA DE PATENTE COMERCIAL').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('REG: ' + reg);
    body.appendParagraph('Nombre: ' + datos.NOMBRE);
    body.appendParagraph('RUT: ' + datos.RUT);
    body.appendParagraph('Dirección: ' + datos.DIRECCION);
    body.appendParagraph('');
    body.appendParagraph('Se certifica que el local cumple con todos los requisitos.');
    body.appendParagraph('');
    body.appendParagraph('Fecha: ' + new Date().toLocaleDateString());

    doc.saveAndClose();

    return {
      url: doc.getUrl(),
      msg: 'Acta de patente generada'
    };

  } catch (error) {
    Logger.log('Error en generarActaPatente: ' + error);
    return { msg: 'Error: ' + error.message };
  }
}

/**
 * Genera Acta de Observaciones
 */
function generarActaObservaciones(reg) {
  try {
    const datos = buscarPorReg(reg);

    if (!datos) {
      return { msg: 'No se encontró el registro ' + reg };
    }

    const doc = DocumentApp.create('Acta Observaciones - ' + reg);
    const body = doc.getBody();

    body.appendParagraph('ACTA DE OBSERVACIONES').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('REG: ' + reg);
    body.appendParagraph('Nombre: ' + datos.NOMBRE);
    body.appendParagraph('Dirección: ' + datos.DIRECCION);
    body.appendParagraph('');
    body.appendParagraph('OBSERVACIONES:');
    body.appendParagraph(datos.OBSERVACIONES || '(Completar observaciones)');

    doc.saveAndClose();

    return {
      url: doc.getUrl(),
      msg: 'Acta de observaciones generada'
    };

  } catch (error) {
    Logger.log('Error en generarActaObservaciones: ' + error);
    return { msg: 'Error: ' + error.message };
  }
}

/**
 * Genera Acta de Denegación
 */
function generarActaDenegacion(reg) {
  try {
    const datos = buscarPorReg(reg);

    if (!datos) {
      return { msg: 'No se encontró el registro ' + reg };
    }

    const doc = DocumentApp.create('Acta Denegación - ' + reg);
    const body = doc.getBody();

    body.appendParagraph('ACTA DE DENEGACIÓN').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('REG: ' + reg);
    body.appendParagraph('Nombre: ' + datos.NOMBRE);
    body.appendParagraph('Dirección: ' + datos.DIRECCION);
    body.appendParagraph('');
    body.appendParagraph('Se deniega la patente comercial por los siguientes motivos:');
    body.appendParagraph(datos.OBSERVACIONES || '(Completar motivos)');

    doc.saveAndClose();

    return {
      url: doc.getUrl(),
      msg: 'Acta de denegación generada'
    };

  } catch (error) {
    Logger.log('Error en generarActaDenegacion: ' + error);
    return { msg: 'Error: ' + error.message };
  }
}

/**
 * Genera informes post inspección
 */
function generarInformesPostInspeccion(reg) {
  try {
    const datos = buscarPorReg(reg);

    if (!datos) {
      return { msg: 'No se encontró el registro ' + reg };
    }

    const doc = DocumentApp.create('Informe Post-Inspección - ' + reg);
    const body = doc.getBody();

    body.appendParagraph('INFORME POST-INSPECCIÓN').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('REG: ' + reg);
    body.appendParagraph('Nombre: ' + datos.NOMBRE);
    body.appendParagraph('Dirección: ' + datos.DIRECCION);
    body.appendParagraph('Resultado: ' + (datos.RESULTADO || 'Pendiente'));
    body.appendParagraph('');
    body.appendParagraph('Observaciones: ' + (datos.OBSERVACIONES || 'Sin observaciones'));

    doc.saveAndClose();

    return {
      url: doc.getUrl(),
      msg: 'Informe post-inspección generado'
    };

  } catch (error) {
    Logger.log('Error en generarInformesPostInspeccion: ' + error);
    return { msg: 'Error: ' + error.message };
  }
}

/**
 * Genera reporte para jefatura
 */
function generarReporteJefatura() {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA_BD);
    const datos = hoja.getDataRange().getValues();

    const stats = calcularEstadisticas(datos);

    const doc = DocumentApp.create('Reporte Jefatura - ' + new Date().toLocaleDateString());
    const body = doc.getBody();

    body.appendParagraph('REPORTE ESTADÍSTICO').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('Fecha: ' + new Date().toLocaleDateString());
    body.appendParagraph('');
    body.appendParagraph('RESUMEN GENERAL:');
    body.appendParagraph('Total registros: ' + stats.total);
    body.appendParagraph('Pendientes: ' + stats.pendientes);
    body.appendParagraph('Listos para visita: ' + stats.listosVisita);
    body.appendParagraph('Locales aptos: ' + stats.aptos);
    body.appendParagraph('Observados: ' + stats.observados);
    body.appendParagraph('Desistidos: ' + stats.desistidos);

    doc.saveAndClose();

    return {
      url: doc.getUrl(),
      msg: 'Reporte de jefatura generado'
    };

  } catch (error) {
    Logger.log('Error en generarReporteJefatura: ' + error);
    return { msg: 'Error: ' + error.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// CONSULTAS Y BÚSQUEDAS
// ═══════════════════════════════════════════════════════════════

/**
 * Busca registros por campo y valor
 */
function buscarRegistros(campo, valor) {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA_BD);
    const datos = hoja.getDataRange().getValues();
    const resultados = [];

    const indices = {
      'REG': 0,
      'NOMBRE': 2,
      'RUT': 4,
      'DIRECCION': 6
    };

    const indice = indices[campo] || 0;

    for (let i = 1; i < datos.length; i++) {
      const valorCelda = String(datos[i][indice]).toLowerCase();
      const valorBuscar = String(valor).toLowerCase();

      if (valorCelda.indexOf(valorBuscar) !== -1) {
        resultados.push({
          REG: datos[i][0],
          NOMBRE: datos[i][2],
          DIRECCION: datos[i][6],
          ESTADO: datos[i][9],
          TIMESTAMP: datos[i][1]
        });
      }
    }

    return resultados;

  } catch (error) {
    Logger.log('Error en buscarRegistros: ' + error);
    return [];
  }
}

/**
 * Filtra registros por estado
 */
function filtrarPorEstado(estado) {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA_BD);
    const datos = hoja.getDataRange().getValues();
    const resultados = [];

    for (let i = 1; i < datos.length; i++) {
      if (!estado || datos[i][9] === estado) {
        resultados.push({
          REG: datos[i][0],
          NOMBRE: datos[i][2],
          DIRECCION: datos[i][6],
          ESTADO: datos[i][9],
          TIMESTAMP: datos[i][1]
        });
      }
    }

    return resultados;

  } catch (error) {
    Logger.log('Error en filtrarPorEstado: ' + error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// ESTADÍSTICAS
// ═══════════════════════════════════════════════════════════════

/**
 * Obtiene estadísticas generales del sistema
 */
function obtenerEstadisticas() {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA_BD);
    const datos = hoja.getDataRange().getValues();

    return calcularEstadisticas(datos);

  } catch (error) {
    Logger.log('Error en obtenerEstadisticas: ' + error);
    return {
      total: 0,
      pendientes: 0,
      listosVisita: 0,
      aptos: 0,
      observados: 0,
      desistidos: 0,
      porSector: []
    };
  }
}

/**
 * Calcula estadísticas de datos
 */
function calcularEstadisticas(datos) {
  const stats = {
    total: datos.length - 1,
    pendientes: 0,
    listosVisita: 0,
    aptos: 0,
    observados: 0,
    desistidos: 0,
    porSector: []
  };

  const sectores = {};

  for (let i = 1; i < datos.length; i++) {
    const estado = datos[i][9];
    const sector = datos[i][7] || 'SIN SECTOR';

    // Contar por estado
    if (estado === 'PENDIENTE') stats.pendientes++;
    else if (estado === 'LISTO_VISITA') stats.listosVisita++;
    else if (estado === 'LOCAL_APTO') stats.aptos++;
    else if (estado === 'OBSERVADO') stats.observados++;
    else if (estado === 'DESISTIDO') stats.desistidos++;

    // Contar por sector
    if (!sectores[sector]) {
      sectores[sector] = {
        sector: sector,
        total: 0,
        pendientes: 0,
        aptos: 0,
        observados: 0
      };
    }

    sectores[sector].total++;
    if (estado === 'PENDIENTE') sectores[sector].pendientes++;
    if (estado === 'LOCAL_APTO') sectores[sector].aptos++;
    if (estado === 'OBSERVADO') sectores[sector].observados++;
  }

  // Convertir objeto sectores a array
  for (const key in sectores) {
    stats.porSector.push(sectores[key]);
  }

  return stats;
}

/**
 * Obtiene lista de sectores
 */
function obtenerSectores() {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA_SECTORES);

    if (!hoja) {
      return [
        { codigo: 'S1', nombre: 'Sector 1' },
        { codigo: 'S2', nombre: 'Sector 2' },
        { codigo: 'S3', nombre: 'Sector 3' }
      ];
    }

    const datos = hoja.getDataRange().getValues();
    const sectores = [];

    for (let i = 1; i < datos.length; i++) {
      sectores.push({
        codigo: datos[i][0],
        nombre: datos[i][1]
      });
    }

    return sectores;

  } catch (error) {
    Logger.log('Error en obtenerSectores: ' + error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

/**
 * Formatea fecha a string YYYY-MM-DD
 */
function formatearFecha(fecha) {
  try {
    if (!fecha) return '';
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  } catch (error) {
    return '';
  }
}

/**
 * Función de prueba para inicializar hoja
 */
function inicializarHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName(CONFIG.HOJA_BD);

  if (!hoja) {
    hoja = ss.insertSheet(CONFIG.HOJA_BD);

    // Agregar encabezados
    const encabezados = [
      'REG', 'TIMESTAMP', 'NOMBRE', 'EMAIL', 'RUT', 'TELEFONO',
      'DIRECCION', 'SECTOR', 'TIPO_TRAMITE', 'ESTADO',
      'FECHA_PROGRAMACION', 'INSPECTOR', 'RESULTADO', 'OBSERVACIONES'
    ];

    hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
    hoja.getRange(1, 1, 1, encabezados.length).setFontWeight('bold');

    Logger.log('Hoja ' + CONFIG.HOJA_BD + ' inicializada');
  }
}
