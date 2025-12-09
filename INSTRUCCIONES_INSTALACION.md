# 📦 INSTRUCCIONES DE INSTALACIÓN - SISTEMA PATENTES V9

## ✅ Archivos Necesarios

Solo necesitas **2 archivos**:

1. **`Code.gs`** - Backend completo (todas las funciones)
2. **`interfaz_V9.html`** - Interfaz de usuario

---

## 🚀 INSTALACIÓN PASO A PASO

### **Paso 1: Crear Google Spreadsheet**

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala: **"Sistema Patentes DOM La Serena"**

---

### **Paso 2: Crear Hoja de Base de Datos**

1. Renombra la primera hoja a: **`BD_PATENTES`**
2. En la fila 1, agrega estos encabezados:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REG | TIMESTAMP | NOMBRE | EMAIL | RUT | TELEFONO | DIRECCION | SECTOR | TIPO_TRAMITE | ESTADO | FECHA_PROGRAMACION | INSPECTOR | RESULTADO | OBSERVACIONES |

3. Formatea la fila 1 en **negrita**

---

### **Paso 3: (Opcional) Crear Hoja de Sectores**

1. Crea una nueva hoja llamada: **`SECTORES`**
2. Agrega estos encabezados en la fila 1:

| A | B |
|---|---|
| CODIGO | NOMBRE |

3. Agrega tus sectores, ejemplo:

| CODIGO | NOMBRE |
|--------|--------|
| S1 | Centro |
| S2 | Norte |
| S3 | Sur |

---

### **Paso 4: Abrir Editor de Apps Script**

1. En tu Google Sheet, ve al menú: **Extensiones → Apps Script**
2. Se abrirá el editor de código

---

### **Paso 5: Agregar el Archivo Code.gs**

1. Si existe un archivo `Code.gs`, haz clic en él
2. **Borra todo el contenido** que tenga
3. Abre el archivo **`Code.gs`** de este repositorio
4. Copia **TODO** el contenido
5. Pega en el editor de Apps Script
6. Haz clic en **💾 Guardar** (Ctrl+S)

---

### **Paso 6: Agregar el Archivo HTML**

1. En el editor de Apps Script, haz clic en el botón **+** junto a "Archivos"
2. Selecciona **HTML**
3. Nómbralo exactamente: **`interfaz_V9`** (sin extensión .html)
4. Abre el archivo **`interfaz_V9.html`** de este repositorio
5. Copia **TODO** el contenido
6. Pega en el editor (reemplazando el contenido existente)
7. Haz clic en **💾 Guardar**

---

### **Paso 7: Implementar como Web App**

1. En el editor de Apps Script, haz clic en **Implementar → Nueva implementación**
2. Haz clic en el ícono de engranaje ⚙️ junto a "Seleccionar tipo"
3. Selecciona **Aplicación web**
4. Configura:
   - **Descripción**: Sistema Patentes V9
   - **Ejecutar como**: Yo (tu email)
   - **Acceso**: Cualquier usuario
5. Haz clic en **Implementar**
6. **Importante**: Copia la URL de la Web App que aparece
7. Haz clic en **Listo**

---

### **Paso 8: Autorizar Permisos**

1. La primera vez que ejecutes, Google pedirá permisos
2. Haz clic en **Revisar permisos**
3. Selecciona tu cuenta de Google
4. Haz clic en **Configuración avanzada**
5. Haz clic en **Ir a [nombre del proyecto] (no seguro)**
6. Haz clic en **Permitir**

---

### **Paso 9: (Opcional) Inicializar la Hoja**

Si no creaste la hoja manualmente, puedes usar la función automática:

1. En el editor de Apps Script, selecciona la función: **`inicializarHoja`**
2. Haz clic en **▶ Ejecutar**
3. Esto creará automáticamente la hoja `BD_PATENTES` con los encabezados

---

### **Paso 10: Probar el Sistema**

1. Abre la URL de la Web App que copiaste en el Paso 7
2. Verás la interfaz del sistema
3. Ve a la pestaña **"📝 Registro"**
4. Ingresa datos de prueba:
   - **REG**: TEST-001
   - **Nombre**: Juan Pérez
   - **Email**: tu_email@gmail.com
5. Haz clic en **"✉️ Registrar y Enviar Formulario"**
6. Deberías ver el mensaje de éxito ✅
7. Revisa tu Google Sheet - debe aparecer el nuevo registro
8. Revisa tu email - debe llegar el formulario

---

## 🎯 VERIFICACIÓN COMPLETA

### ✅ Checklist de Instalación

- [ ] Google Sheet creado
- [ ] Hoja `BD_PATENTES` con encabezados correctos
- [ ] Archivo `Code.gs` copiado y guardado
- [ ] Archivo `interfaz_V9` (HTML) copiado y guardado
- [ ] Web App implementada
- [ ] Permisos autorizados
- [ ] URL de Web App guardada
- [ ] Registro de prueba exitoso
- [ ] Datos aparecen en la hoja
- [ ] Email recibido correctamente

---

## 🔧 FUNCIONES PRINCIPALES

### **1. Registro (Tab 1)**
- Solo requiere: REG, Nombre, Email
- Envía formulario automático por email
- Crea registro en estado PENDIENTE

### **2. Programación (Tab 2)**
- Lista casos en estado LISTO_VISITA
- Permite seleccionar múltiples casos
- Asigna fecha de inspección
- Cambia estado a PROGRAMADO

### **3. Inspección (Tab 3)**
- Filtra casos por fecha
- Envía lista por email automáticamente
- Genera link para iPad
- Crea documento de archivo

### **4. Documentos (Tab 4)**
- Busca por número REG
- Genera Contracara
- Genera Actas (Patente, Observaciones, Denegación)
- Genera Informes Post-Inspección
- Genera Reporte de Jefatura

### **5. Consultas (Tab 5)**
- Busca por: REG, Nombre, RUT, Dirección
- Filtra por estado
- Muestra resultados en tabla

### **6. Estadísticas (Tab 6)**
- Total de registros
- Contadores por estado
- Resumen por sector

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Error: "No se encuentra la hoja BD_PATENTES"**
**Solución:** Verifica que la hoja se llame exactamente `BD_PATENTES` (mayúsculas)

### **Error: "registrarUsuarioSimple is not defined"**
**Solución:** Verifica que copiaste todo el archivo `Code.gs` completo

### **No envía emails**
**Solución:**
1. Verifica que autorizaste los permisos de Gmail
2. Revisa la carpeta de Spam
3. Confirma que el email sea válido

### **"Acceso denegado" al abrir la Web App**
**Solución:**
1. En la implementación, verifica que "Acceso" esté en "Cualquier usuario"
2. Re-implementa la Web App

### **Los cambios no se ven**
**Solución:**
1. Guarda todos los archivos (Ctrl+S)
2. Crea una **Nueva implementación** (no uses la misma)
3. Usa la nueva URL generada
4. Refresca el navegador (Ctrl+Shift+R)

---

## 📧 CONFIGURACIÓN DE EMAILS

Por defecto, los emails se envían desde tu cuenta de Google conectada.

### Para personalizar los emails, edita en `Code.gs`:

```javascript
// Busca la función: enviarFormularioInicial
function enviarFormularioInicial(email, nombre, reg) {
  const asunto = 'Tu asunto aquí';
  const cuerpo = `Tu HTML aquí`;
  // ...
}
```

---

## 🎨 PERSONALIZACIÓN DE INTERFAZ

### Cambiar colores:

Edita en `interfaz_V9.html` las variables CSS:

```css
:root {
  --primary: #1a73e8;        /* Color principal */
  --success: #34a853;        /* Color éxito */
  --warning: #fbbc04;        /* Color advertencia */
  --danger: #ea4335;         /* Color peligro */
}
```

### Cambiar título:

```html
<h1>🏛️ Tu Título Aquí</h1>
```

---

## 📊 ESTRUCTURA DE ESTADOS

El sistema maneja estos estados automáticamente:

1. **PENDIENTE** - Registro inicial
2. **FORM_ENVIADO** - Formulario enviado por email
3. **LISTO_VISITA** - Listo para programar inspección
4. **PROGRAMADO** - Inspección programada
5. **INSPECCIONADO** - Ya fue inspeccionado
6. **LOCAL_APTO** - Aprobado
7. **OBSERVADO** - Con observaciones
8. **DENEGADO** - Rechazado
9. **DESISTIDO** - Usuario desistió

---

## 🔒 SEGURIDAD

- ✅ Solo usuarios con acceso a Google Sheet pueden editar datos
- ✅ La Web App es de solo lectura para usuarios externos
- ✅ Validación de emails en el frontend
- ✅ Sanitización de inputs
- ✅ Verificación de duplicados de REG

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisa la consola del navegador (F12)
2. Revisa los logs en Apps Script: **Vista → Registros**
3. Verifica que todos los nombres de hojas sean exactos
4. Confirma que autorizaste todos los permisos

---

## 🎉 ¡LISTO!

Tu sistema está instalado y funcionando.

**URL de tu Web App**: [Pega aquí la URL que copiaste]

**Próximos pasos:**
1. Personaliza los emails
2. Agrega tus sectores
3. Configura tus inspectores
4. Comienza a registrar casos reales

---

**Versión:** V9
**Última actualización:** 2025-12-09
**Tipo de instalación:** Completa (2 archivos)
