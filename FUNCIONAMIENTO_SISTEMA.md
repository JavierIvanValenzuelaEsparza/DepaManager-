# DepaManager - Sistema de Gestión de Departamentos

## Descripción General del Sistema


---

## Arquitectura del Sistema

### Stack Tecnológico

**Frontend:**
- React 18
- React Router v6
- Tailwind CSS
- Axios
- localStorage para persistencia de token

**Backend:**
- Node.js
- Express.js
- Sequelize ORM
- MySQL (Railway - producción)
- JWT para autenticación
- bcrypt para hash de contraseñas
- PDFKit para generación de documentos

**Estructura de Puertos:**
- Frontend: Puerto 3001
- Backend: Puerto 3000
- Base de datos: Railway (remoto)

---

## Modelo de Base de Datos

### Tabla: usuarios
**Descripción:** Almacena tanto administradores como inquilinos
```
Campos principales:
- id_usuario (PK)
- nombre_completo
- dni (único)
- correo (único)
- contrasenia (hasheada)
- telefono
- fecha_nacimiento
- rol (Administrador/Inquilino)
- estado (Activo/Pendiente/Retirado)
- plan (Gratuito/Estándar/Premium)
- fecha_inicio_contrato
- fecha_fin_contrato
- createdAt, updatedAt
```

### Tabla: edificios
**Descripción:** Edificios gestionados por administradores
```
Campos principales:
- id_edificio (PK)
- id_administrador (FK → usuarios)
- nombre
- direccion
- total_departamentos
- createdAt, updatedAt
```

### Tabla: departamentos
**Descripción:** Unidades habitacionales dentro de edificios
```
Campos principales:
- id_departamento (PK)
- id_edificio (FK → edificios)
- id_inquilino (FK → usuarios, nullable)
- numero
- piso
- metros_cuadrados
- habitaciones
- banios
- estado (Disponible/Ocupado/En Mantenimiento)
- createdAt, updatedAt
```

### Tabla: contratos
**Descripción:** Contratos de alquiler entre inquilino y departamento
```
Campos principales:
- id_contrato (PK)
- id_inquilino (FK → usuarios)
- id_departamento (FK → departamentos)
- fecha_inicio
- fecha_fin
- monto_mensual
- deposito_garantia
- duracion_meses
- archivo_pdf (ruta al PDF generado)
- estado (Activo/Finalizado)
- fecha_creacion
- createdAt, updatedAt
```

### Tabla: pagos
**Descripción:** Registro de pagos mensuales y servicios
```
Campos principales:
- id_pago (PK)
- id_inquilino (FK → usuarios)
- id_contrato (FK → contratos)
- concepto (Alquiler/Servicios/Mantenimiento/Otro)
- monto
- fecha_vencimiento
- fecha_pago
- estado (Pendiente/Pagado/Vencido/Pendiente de Verificación)
- metodo_pago
- comprobante (ruta al archivo)
- createdAt, updatedAt
```

### Tabla: incidencias
**Descripción:** Problemas o reparaciones reportadas por inquilinos
```
Campos principales:
- id_incidencia (PK)
- id_inquilino (FK → usuarios)
- tipo_problema
- descripcion
- imagen (ruta)
- urgencia (Baja/Media/Alta)
- categoria
- estado (Abierta/En Revisión/Asignada/En Proceso/Completada)
- id_proveedor (FK → proveedores, nullable)
- mensaje_asignacion
- fecha_reporte
- fecha_cierre
- createdAt, updatedAt
```

### Tabla: proveedores
**Descripción:** Proveedores de servicios de mantenimiento
```
Campos principales:
- id_proveedor (PK)
- id_administrador (FK → usuarios)
- nombre
- especialidad
- telefono
- correo
- direccion
- disponibilidad
- servicios_ofrecidos (JSON)
- calificacion_promedio
- createdAt, updatedAt
```

### Tabla: postulantes
**Descripción:** Personas interesadas en alquilar un departamento
```
Campos principales:
- id_postulante (PK)
- id_administrador (FK → usuarios)
- nombre_completo
- dni
- telefono
- correo
- red_social
- departamento_deseado
- ocupacion
- monto_alquiler
- observaciones
- estado (Pendiente/Aprobado/Rechazado)
- fecha_postulacion
- fecha_aprobacion
- createdAt, updatedAt
```

### Tabla: notificaciones
**Descripción:** Notificaciones del sistema para usuarios
```
Campos principales:
- id_notificacion (PK)
- id_usuario (FK → usuarios)
- tipo
- titulo
- mensaje
- leida (boolean)
- fecha
- createdAt, updatedAt
```

---

## Relaciones entre Tablas

```
usuarios (Administrador) 1:N edificios
edificios 1:N departamentos
departamentos 1:1 usuarios (Inquilino)
usuarios (Inquilino) 1:N contratos
departamentos 1:N contratos
contratos 1:N pagos
usuarios (Inquilino) 1:N incidencias
proveedores 1:N incidencias
usuarios (Administrador) 1:N proveedores
usuarios (Administrador) 1:N postulantes
usuarios 1:N notificaciones
```

---

## Flujos de Procesos Principales

### 1. AUTENTICACIÓN Y SEGURIDAD

**Proceso de Login:**
```
1. Usuario ingresa correo y contraseña
2. POST /auth/login
3. Backend busca usuario en tabla usuarios
4. Compara contraseña con bcrypt.compare(contraseña, hash_bd)
5. Si válido: genera JWT con payload {idUsuario, correo, rol}
6. Token válido por 24 horas
7. Frontend guarda token en localStorage
8. Token se envía en header Authorization: Bearer [token] en cada request
9. Middleware verifyToken valida token en cada petición
10. Middleware verifyAdmin verifica rol=Administrador para rutas admin
```

**Proceso de Registro (Solo Admin puede registrar):**
```
1. POST /auth/register
2. Valida datos únicos (correo, DNI)
3. Hashea contraseña con bcrypt (10 rounds)
4. Crea usuario con rol=Administrador
5. Retorna success
```

---

### 2. GESTIÓN DE EDIFICIOS

**Crear Edificio:**
```
1. Admin completa formulario:
   - Nombre del edificio
   - Dirección
2. POST /admin/buildings
3. Backend crea registro con id_administrador automático
4. Edificio disponible para crear departamentos
```

---

### 3. GESTIÓN DE DEPARTAMENTOS

**Crear Departamentos en Lote:**
```
1. Admin selecciona edificio
2. Ingresa parámetros:
   - Número de pisos: 5
   - Departamentos por piso: 4
   - Numeración desde: 101
   - Numeración hasta: 504
3. POST /admin/departments/batch
4. Backend valida: (pisos × deptos_por_piso) = (hasta - desde + 1)
5. Backend genera departamentos:
   Piso 1: 101, 102, 103, 104
   Piso 2: 201, 202, 203, 204
   ...
   Piso 5: 501, 502, 503, 504
6. Cada departamento creado con:
   - estado: "Disponible"
   - metros_cuadrados: 60 (default)
   - habitaciones: 2 (default)
   - banios: 1 (default)
7. Actualiza total_departamentos en edificio
8. Retorna array de departamentos creados
```

**Crear Departamento Individual:**
```
1. Admin click "Crear Individual"
2. Completa formulario:
   - Edificio (pre-seleccionado el primero)
   - Número
   - Piso
   - Metros cuadrados
   - Habitaciones
   - Baños
   - Estado
3. POST /admin/departments/batch con array de 1 departamento
4. Backend crea departamento único
5. Actualiza contador del edificio
```

**Editar Departamento:**
```
1. Admin click ✏️ en departamento
2. Modal muestra formulario pre-llenado
3. Modifica campos deseados
4. PUT /admin/departments/:id
5. Backend actualiza registro
6. Si está ocupado, no permite cambiar a otro inquilino directamente
```

**Eliminar Departamento:**
```
1. Admin click 🗑️ en departamento
2. Confirmación de eliminación
3. Valida que no tenga inquilino asignado
4. DELETE /admin/departments/:id
5. Backend elimina si está vacío
6. Actualiza contador del edificio
```

---

### 4. GESTIÓN DE INQUILINOS

**Crear Inquilino (Proceso Completo):**
```
1. Admin click "Nuevo Inquilino"
2. Completa formulario:
   
   Sección 1: Datos Personales
   - Nombre completo
   - DNI (único)
   - Correo (único)
   - Teléfono
   - Fecha de nacimiento
   - Contraseña (se hasheará)
   
   Sección 2: Asignación de Departamento
   - Selecciona departamento disponible
   
   Sección 3: Datos del Contrato
   - Fecha inicio contrato
   - Fecha fin contrato
   - Plan (Gratuito/Estándar/Premium)
   
3. POST /admin/tenants
4. Backend inicia transacción:
   
   4.1. Valida correo y DNI únicos
   4.2. Hashea contraseña con bcrypt
   4.3. Crea usuario con rol="Inquilino"
   4.4. Actualiza departamento:
        - id_inquilino = nuevo_usuario_id
        - estado = "Ocupado"
   
5. PROCESO AUTOMÁTICO - Creación de Contrato:
   
   5.1. Extrae fechas del usuario:
        - fecha_inicio_contrato
        - fecha_fin_contrato
   
   5.2. Calcula monto según plan:
        - Premium: S/ 1,000
        - Estándar: S/ 700
        - Gratuito: S/ 500
   
   5.3. Calcula duración en meses:
        duracion = diferencia_en_meses(fecha_fin, fecha_inicio)
   
   5.4. Crea contrato con:
        - id_inquilino
        - id_departamento
        - fecha_inicio
        - fecha_fin
        - monto_mensual (según plan)
        - deposito_garantia (igual al monto_mensual)
        - duracion_meses (calculado)
        - archivo_pdf: NULL
        - estado: "Activo"
   
6. Commit de transacción
7. Retorna inquilino creado con departamento y contrato
```

**Ver Detalles de Inquilino:**
```
1. Admin click 👁️ en inquilino
2. Navigate a /admin/tenants/:id
3. GET /admin/tenants/:id
4. Backend hace 4 queries separadas:
   
   Query 1: Buscar usuario
   - WHERE id_usuario = :id AND rol = 'Inquilino'
   - Excluye contraseña
   
   Query 2: Buscar contratos
   - WHERE id_inquilino = :id
   - INCLUDE departamento (numero, piso, metros)
   
   Query 3: Buscar pagos
   - WHERE id_inquilino = :id
   - ORDER BY fecha_vencimiento DESC
   - LIMIT 10
   
   Query 4: Buscar departamento actual
   - WHERE id_inquilino = :id
   - INCLUDE edificio (nombre, direccion)
   
5. Construye respuesta completa con:
   - Datos personales
   - Departamento asignado
   - Lista de contratos
   - Historial de pagos
   
6. Frontend muestra 3 pestañas:
   - Información General
   - Contrato
   - Pagos
```

**Editar Inquilino:**
```
1. Admin click ✏️ en inquilino
2. Puede modificar:
   - Datos personales
   - Cambiar departamento
   - Cambiar fechas de contrato
   - Cambiar plan
3. PUT /admin/tenants/:id
4. Si cambia departamento:
   - Libera departamento anterior (estado="Disponible")
   - Asigna nuevo departamento (estado="Ocupado")
   - Crea nuevo contrato automáticamente
5. Backend actualiza y retorna datos actualizados
```

---

### 5. GESTIÓN DE CONTRATOS

**Visualización de Contratos:**
```
1. Admin navega a /admin/contratos
2. GET /admin/contratos
3. Backend retorna TODOS los contratos con:
   - Datos del inquilino (nombre, DNI, correo)
   - Datos del departamento (numero, piso, edificio)
   - Fechas (inicio, fin)
   - Montos (mensual, deposito)
   - Estado y archivo_pdf

4. Frontend agrupa por inquilino:
   
   Inquilino A (2 contratos)
   ├─ Contrato 1 - Depto 101
   └─ Contrato 2 - Depto 205
   
   Inquilino B (1 contrato)
   └─ Contrato 3 - Depto 302
   
5. Muestra botones por contrato:
   - Si archivo_pdf es NULL: "🟢 Generar"
   - Si archivo_pdf existe: "🔵 Descargar"
   - "✏️ Editar"
   - "🗑️ Eliminar"
```

**Filtrar Contratos por Inquilino:**
```
1. Desde lista inquilinos → Click "📄 Documentos"
2. Navigate a /admin/contratos?inquilino=13
3. Frontend detecta query param
4. GET /admin/contratos?inquilino=13
5. Backend filtra: WHERE id_inquilino = 13
6. Muestra SOLO contratos de ese inquilino
7. Badge azul: "Filtrando por: Juan Pérez"
8. Botón "Ver todos" para quitar filtro
```

**Generar PDF de Contrato:**
```
1. Admin click "Generar" en un contrato
2. POST /admin/contratos/:id/generate-pdf
3. Backend carga datos completos:
   - Contrato
   - Inquilino (nombre, DNI, etc.)
   - Departamento (numero, piso, metros)
   - Edificio (nombre, dirección)
   
4. PDFKit genera documento con:
   
   ENCABEZADO:
   - Logo/Título "CONTRATO DE ARRENDAMIENTO"
   - Fecha de generación
   
   SECCIÓN 1: DATOS DEL ARRENDADOR
   - Nombre del administrador
   - DNI/RUC
   - Dirección
   
   SECCIÓN 2: DATOS DEL ARRENDATARIO
   - Nombre del inquilino
   - DNI
   - Correo, teléfono
   
   SECCIÓN 3: OBJETO DEL CONTRATO
   - Descripción del inmueble
   - Departamento número X, piso Y
   - Metros cuadrados, habitaciones, baños
   - Edificio y dirección
   
   SECCIÓN 4: DURACIÓN Y VIGENCIA
   - Fecha de inicio (compensación timezone)
   - Fecha de fin (compensación timezone)
   - Duración en meses
   
   SECCIÓN 5: CONDICIONES ECONÓMICAS
   - Monto mensual de alquiler
   - Depósito en garantía
   - Forma y fecha de pago
   
   SECCIÓN 6: OBLIGACIONES DEL ARRENDATARIO
   - Lista de 8 obligaciones legales
   
   SECCIÓN 7: OBLIGACIONES DEL ARRENDADOR
   - Lista de 5 obligaciones legales
   
   SECCIÓN 8: TERMINACIÓN DEL CONTRATO
   - Condiciones de terminación
   - Penalidades
   
   SECCIÓN 9: GARANTÍAS Y DEPÓSITOS
   - Manejo del depósito
   
   SECCIÓN 10: DISPOSICIONES FINALES
   - Cláusulas adicionales
   - Jurisdicción
   
   FIRMAS:
   - Espacio para firma arrendador
   - Espacio para firma arrendatario
   - Fecha
   
5. PDF guardado en:
   uploads/contratos/contrato_[id_contrato]_[timestamp].pdf
   
6. Actualiza BD:
   UPDATE contratos 
   SET archivo_pdf = 'uploads/contratos/contrato_13_1731624512.pdf'
   WHERE id_contrato = 13
   
7. Retorna success
8. Frontend cambia botón a "Descargar"
```

**Descargar PDF de Contrato:**
```
1. Admin click "Descargar"
2. GET /admin/contratos/:id/download
3. Backend:
   - Lee archivo_pdf de BD
   - Busca archivo en filesystem
   - Retorna blob con headers:
     Content-Type: application/pdf
     Content-Disposition: attachment; filename="contrato_X.pdf"
4. Navegador descarga archivo
```

**Editar Contrato:**
```
1. Admin click "✏️ Editar"
2. Modal muestra formulario con datos actuales
3. Puede modificar:
   - Fecha inicio
   - Fecha fin
   - Monto mensual
   - Depósito garantía
   - Duración meses
4. PUT /admin/contratos/:id
5. Backend actualiza y ADEMÁS:
   - SET archivo_pdf = NULL
   (invalida PDF anterior porque datos cambiaron)
6. Frontend cambia botón a "Generar"
7. Admin debe regenerar PDF con nuevos datos
```

**Crear Contratos Faltantes (Batch):**
```
1. Admin click "🔄 Crear Contratos Faltantes"
2. POST /admin/contratos/create-missing
3. Backend busca inquilinos con:
   - Tienen departamento asignado
   - NO tienen contrato activo
4. Por cada inquilino encontrado:
   - Crea contrato con sus datos
   - Monto según su plan
   - Fechas de su registro
5. Retorna cantidad creada
6. Frontend recarga lista
```

---

### 6. GESTIÓN DE PAGOS

**Crear Pago:**
```
1. Admin click "Nuevo Pago"
2. Completa formulario:
   - Inquilino (select)
   - Contrato (select filtrado por inquilino)
   - Concepto (Alquiler/Servicios/Mantenimiento/Otro)
   - Monto
   - Fecha vencimiento
   - Método de pago
3. POST /admin/payments
4. Backend crea pago con:
   - estado: "Pendiente"
   - fecha_pago: NULL
   - comprobante: NULL
5. Inquilino ve pago en su panel
```

**Pago por Parte del Inquilino:**
```
1. Inquilino ve lista de pagos pendientes
2. Click en pago
3. Sube comprobante (imagen/PDF)
4. POST /tenant/payments/:id/upload-proof
5. Backend:
   - Guarda archivo en uploads/comprobantes/
   - Actualiza pago:
     estado: "Pendiente de Verificación"
     comprobante: ruta_archivo
6. Admin recibe notificación
```

**Verificación de Pago:**
```
1. Admin ve pagos "Pendiente de Verificación"
2. Click en pago
3. Ve comprobante subido
4. Click "Aprobar Pago"
5. PUT /admin/payments/:id/verify
6. Backend actualiza:
   - estado: "Pagado"
   - fecha_pago: NOW()
7. Inquilino ve pago como "Pagado"
```

**Estados de Pago:**
```
Pendiente → Inicial, esperando pago
  ↓
Pendiente de Verificación → Inquilino subió comprobante
  ↓
Pagado → Admin verificó y aprobó
  
Vencido → Pasó fecha_vencimiento sin pagar
```

---

### 7. GESTIÓN DE INCIDENCIAS

**Reportar Incidencia (Inquilino):**
```
1. Inquilino click "Reportar Problema"
2. Completa formulario:
   - Tipo de problema
   - Descripción detallada
   - Foto (opcional)
   - Urgencia (Baja/Media/Alta)
   - Categoría
3. POST /tenant/incidents
4. Backend crea incidencia:
   - id_inquilino: automático
   - estado: "Abierta"
   - fecha_reporte: NOW()
5. Admin ve nueva incidencia en dashboard
```

**Gestión de Incidencia (Admin):**
```
1. Admin ve lista de incidencias
2. Click en incidencia
3. Ve detalles completos
4. Cambia estado según progreso:
   
   Abierta → Recién reportada
     ↓
   En Revisión → Admin evaluando
     ↓
   Asignada → Proveedor asignado
     ↓
   En Proceso → Proveedor trabajando
     ↓
   Completada → Problema resuelto

5. PUT /admin/incidents/:id
6. Inquilino ve actualización de estado
```

**Asignar Proveedor:**
```
1. Admin en detalle de incidencia
2. Click "Asignar Proveedor"
3. Selecciona proveedor de lista
4. Escribe mensaje para proveedor
5. PUT /admin/incidents/:id/assign
6. Backend actualiza:
   - id_proveedor: X
   - estado: "Asignada"
   - mensaje_asignacion: "..."
7. Proveedor recibe notificación
```

---

### 8. GESTIÓN DE PROVEEDORES

**Registrar Proveedor:**
```
1. Admin click "Nuevo Proveedor"
2. Completa formulario:
   - Nombre
   - Especialidad (Plomería/Electricidad/Carpintería/etc)
   - Teléfono
   - Correo
   - Dirección
   - Disponibilidad
   - Servicios ofrecidos (array)
3. POST /admin/providers
4. Backend crea proveedor
5. Disponible para asignar a incidencias
```

**Calificación de Proveedor:**
```
1. Cuando incidencia se completa
2. Admin califica proveedor (1-5 estrellas)
3. PUT /admin/providers/:id/rate
4. Backend calcula nuevo promedio:
   - calificacion_promedio = AVG(todas_calificaciones)
5. Muestra en perfil del proveedor
```

---

### 9. GESTIÓN DE POSTULANTES

**Registrar Postulante:**
```
1. Admin click "Nuevo Postulante"
2. Completa formulario:
   - Nombre completo
   - DNI
   - Contacto (teléfono/correo/red social)
   - Departamento deseado
   - Ocupación
   - Monto que puede pagar
   - Observaciones
3. POST /admin/applicants
4. Backend crea postulante:
   - estado: "Pendiente"
   - fecha_postulacion: NOW()
5. Admin puede revisar después
```

**Evaluar Postulante:**
```
1. Admin ve lista de postulantes
2. Filtra por estado (Pendiente/Aprobado/Rechazado)
3. Click en postulante para ver detalles
4. Puede:
   - Aprobar → estado="Aprobado", fecha_aprobacion=NOW()
   - Rechazar → estado="Rechazado"
5. PUT /admin/applicants/:id/status
```

**Convertir Postulante a Inquilino:**
```
1. Admin en postulante aprobado
2. Click "Convertir a Inquilino"
3. Formulario pre-llenado con datos del postulante
4. Admin completa datos faltantes:
   - Contraseña
   - Departamento a asignar
   - Fechas de contrato
   - Plan
5. POST /admin/tenants (con flag from_applicant)
6. Sistema crea inquilino completo
7. Crea contrato automáticamente
8. Postulante queda registrado como origen
```

---

### 10. DASHBOARD Y ESTADÍSTICAS

**Dashboard Admin:**
```
1. Admin login → Redirige a /admin/dashboard
2. GET /admin/dashboard
3. Backend calcula en tiempo real:
   
   MÉTRICAS PRINCIPALES:
   - Total Edificios (COUNT edificios WHERE id_admin=X)
   - Total Departamentos (COUNT deptos en edificios del admin)
   - Departamentos Disponibles (WHERE estado='Disponible')
   - Departamentos Ocupados (WHERE estado='Ocupado')
   - Departamentos en Mantenimiento
   - Total Inquilinos Activos (WHERE rol='Inquilino' AND estado='Activo')
   - Total Proveedores
   - Incidencias Activas (WHERE estado IN ('Abierta','En Revisión','Asignada','En Proceso'))
   - Pagos del Mes (WHERE fecha_vencimiento BETWEEN inicio_mes AND fin_mes)
   - Ingresos Mensuales (SUM monto WHERE estado='Pagado' AND fecha_pago en mes actual)
   - Tasa Ocupación ((ocupados / total) × 100)
   
   ACTIVIDAD RECIENTE (últimos 7 días):
   Query 1: Pagos recibidos
     - WHERE estado='Pagado' AND fecha_pago >= hace_7_dias
     - ORDER BY fecha_pago DESC
     - LIMIT 10
     - Formato: {type:'payment', icon:'💰', color:'green', title:'Pago recibido', description:'Juan - $1000', date}
   
   Query 2: Nuevos inquilinos
     - WHERE rol='Inquilino' AND createdAt >= hace_7_dias
     - ORDER BY createdAt DESC
     - LIMIT 10
     - Formato: {type:'tenant', icon:'👤', color:'blue', title:'Nuevo inquilino', description:'María García', date}
   
   Query 3: Contratos creados
     - WHERE createdAt >= hace_7_dias
     - INCLUDE inquilino, departamento
     - ORDER BY createdAt DESC
     - LIMIT 10
     - Formato: {type:'contract', icon:'📄', color:'purple', title:'Contrato creado', description:'Pedro - Depto 101', date}
   
   Query 4: Postulantes aprobados
     - WHERE estado='Aprobado' AND fecha_aprobacion >= hace_7_dias
     - ORDER BY fecha_aprobacion DESC
     - LIMIT 10
     - Formato: {type:'applicant', icon:'✅', color:'emerald', title:'Postulante aprobado', description:'Ana López', date}
   
   Query 5: Nuevas incidencias
     - WHERE fecha_reporte >= hace_7_dias
     - INCLUDE inquilino
     - ORDER BY fecha_reporte DESC
     - LIMIT 10
     - Formato: {type:'incident', icon:'🚨', color:'red', title:'Nueva incidencia', description:'Carlos - Fuga de agua', date}
   
4. Merge y ordenar todas las actividades por timestamp DESC
5. Tomar las 5 más recientes
6. Retornar al frontend

7. Frontend muestra:
   - 6 tarjetas con métricas
   - 1 tarjeta con actividad reciente
   - Cada actividad con icono colorido y descripción
```

---

## Reglas de Negocio Importantes

### Automatizaciones

**1. Creación Automática de Contrato:**
```
TRIGGER: Cuando se asigna departamento a inquilino
CONDICIÓN: idDepartamento != NULL en usuario inquilino
ACCIÓN:
  1. Extrae fechas: fecha_inicio_contrato, fecha_fin_contrato del usuario
  2. Determina monto según plan del usuario
  3. Calcula duración en meses
  4. Crea contrato con estado="Activo"
  5. archivo_pdf queda NULL (debe generarse manualmente)
```

**2. Invalidación de PDF al Editar:**
```
TRIGGER: Cuando se edita un contrato
ACCIÓN:
  1. Actualiza campos modificados
  2. SET archivo_pdf = NULL
  3. Requiere regenerar PDF con nuevos datos
```

**3. Liberación de Departamento:**
```
TRIGGER: Cuando se elimina inquilino o se cambia de departamento
ACCIÓN:
  1. SET departamento.id_inquilino = NULL
  2. SET departamento.estado = "Disponible"
  3. Contratos se mantienen por historial
```

### Validaciones

**1. Datos Únicos:**
```
- DNI debe ser único en tabla usuarios
- Correo debe ser único en tabla usuarios
- Un departamento solo puede tener 1 inquilino
```

**2. Estados Válidos:**
```
Departamento: Disponible, Ocupado, En Mantenimiento
Usuario: Activo, Pendiente, Retirado
Contrato: Activo, Finalizado
Pago: Pendiente, Pagado, Vencido, Pendiente de Verificación
Incidencia: Abierta, En Revisión, Asignada, En Proceso, Completada
Postulante: Pendiente, Aprobado, Rechazado
```

**3. Planes y Montos:**
```
Gratuito: S/ 500/mes
Estándar: S/ 700/mes
Premium: S/ 1,000/mes

Depósito garantía = Monto mensual
```

### Fechas y Timezone

**Problema de Timezone:**
```
MySQL almacena en UTC
JavaScript maneja en UTC-5 (Perú)
Resultado: Fechas se ven 1 día antes

SOLUCIÓN IMPLEMENTADA:
Frontend: date.getTime() + date.getTimezoneOffset() * 60000
Backend PDF: Misma compensación al formatear fechas
```

---

## Estructura de Archivos del Proyecto

### Backend
```
backend/
├── src/
│   ├── index.js (punto de entrada)
│   ├── config/
│   │   └── sequelize.js (configuración BD)
│   ├── models/
│   │   ├── index.js (carga modelos y asociaciones)
│   │   ├── user.js
│   │   ├── building.js
│   │   ├── department.js
│   │   ├── contract.js
│   │   ├── payment.js
│   │   ├── incident.js
│   │   ├── provider.js
│   │   └── applicant.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── admin/
│   │       ├── dashboard.controller.js
│   │       ├── buildings.controller.js
│   │       ├── departments.controller.js
│   │       ├── tenants.controller.js
│   │       ├── contracts.controller.js
│   │       ├── payments.controller.js
│   │       ├── incidents.controller.js
│   │       ├── providers.controller.js
│   │       └── applicants.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js (verifyToken, verifyAdmin)
│   │   ├── upload.middleware.js (multer config)
│   │   └── error.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   └── tenant.routes.js
│   ├── services/
│   │   ├── pdf.service.js (generación PDFs)
│   │   ├── notification.service.js
│   │   └── upload.service.js
│   └── utils/
│       ├── constants.js
│       ├── helpers.js
│       └── validators.js
├── uploads/ (archivos subidos)
│   ├── contratos/
│   └── comprobantes/
├── .env (variables de entorno)
├── package.json
└── README.md
```

### Frontend
```
frontend/
├── src/
│   ├── index.js (punto de entrada)
│   ├── App.jsx
│   ├── router/
│   │   ├── AppRouter.jsx
│   │   ├── AdminRoutes.jsx
│   │   └── TenantRoutes.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx (manejo autenticación global)
│   ├── services/
│   │   ├── storage.js
│   │   └── api/
│   │       ├── admin.js (todos los endpoints admin)
│   │       └── tenant.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── buildings/
│   │   │   ├── departments/
│   │   │   │   ├── DepartmentsList.jsx
│   │   │   │   ├── DepartmentForm.jsx (crear/editar individual)
│   │   │   │   └── DepartmentDetails.jsx
│   │   │   ├── tenants/
│   │   │   │   ├── TenantsList.jsx
│   │   │   │   ├── TenantDetails.jsx
│   │   │   │   └── TenantForm.jsx
│   │   │   ├── contracts/
│   │   │   │   └── ContractsList.jsx (agrupado por inquilino)
│   │   │   ├── payments/
│   │   │   ├── incidents/
│   │   │   ├── providers/
│   │   │   └── applicants/
│   │   ├── tenant/
│   │   └── auth/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminHeader.jsx
│   │   │   ├── AdminSidebar.jsx
│   │   │   └── TenantLayout.jsx
│   │   └── ui/
│   │       ├── Modal.jsx
│   │       ├── Button.jsx
│   │       └── ...
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useForm.js
│   ├── styles/
│   │   └── globals.css (Tailwind)
│   └── utils/
│       ├── constants.js
│       └── helpers.js
├── public/
├── package.json
└── README.md
```

---

## Variables de Entorno

### Backend (.env)
```
PORT=3000
DB_HOST=tu_host_railway
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=tu_password
JWT_SECRET=tu_clave_secreta_super_segura
```

### Frontend
```
REACT_APP_API_URL=http://localhost:3000
```

---

## Endpoints API Principales

### Autenticación
```
POST /auth/login - Login usuario
POST /auth/register - Registro admin
POST /auth/verify - Verificar token
```

### Admin - Dashboard
```
GET /admin/dashboard - Estadísticas y actividad reciente
```

### Admin - Edificios
```
GET /admin/buildings - Listar edificios
POST /admin/buildings - Crear edificio
```

### Admin - Departamentos
```
GET /admin/departments - Listar departamentos
GET /admin/departments/available - Departamentos disponibles
GET /admin/departments/:id - Detalle departamento
POST /admin/departments/batch - Crear en lote o individual
PUT /admin/departments/:id - Actualizar departamento
DELETE /admin/departments/:id - Eliminar departamento
```

### Admin - Inquilinos
```
GET /admin/tenants - Listar inquilinos
GET /admin/tenants/:id - Detalle inquilino (con contratos, pagos, departamento)
POST /admin/tenants - Crear inquilino (auto-crea contrato)
PUT /admin/tenants/:id - Actualizar inquilino
DELETE /admin/tenants/:id - Eliminar inquilino
PATCH /admin/tenants/:id/status - Cambiar estado
```

### Admin - Contratos
```
GET /admin/contratos - Listar contratos (con filtro opcional ?inquilino=X)
GET /admin/contratos/:id - Detalle contrato
POST /admin/contratos - Crear contrato manual
POST /admin/contratos/create-missing - Crear contratos faltantes
PUT /admin/contratos/:id - Actualizar contrato (invalida PDF)
DELETE /admin/contratos/:id - Eliminar contrato
POST /admin/contratos/:id/generate-pdf - Generar PDF
GET /admin/contratos/:id/download - Descargar PDF
POST /admin/contratos/:id/upload - Subir PDF manual
GET /admin/contratos/tenant/:id - Contratos por inquilino
```

### Admin - Pagos
```
GET /admin/payments - Listar pagos
POST /admin/payments - Crear pago
PUT /admin/payments/:id/verify - Verificar pago
```

### Admin - Incidencias
```
GET /admin/incidencias - Listar incidencias
GET /admin/incidencias/:id - Detalle incidencia
PUT /admin/incidencias/:id - Actualizar incidencia
PUT /admin/incidencias/:id/assign - Asignar proveedor
```

### Admin - Proveedores
```
GET /admin/proveedores - Listar proveedores
GET /admin/proveedores/available - Proveedores disponibles
POST /admin/proveedores - Crear proveedor
PUT /admin/proveedores/:id - Actualizar proveedor
DELETE /admin/proveedores/:id - Eliminar proveedor
```

### Admin - Postulantes
```
GET /admin/applicants - Listar postulantes
GET /admin/applicants/stats - Estadísticas
GET /admin/applicants/search - Buscar postulantes
GET /admin/applicants/:id - Detalle postulante
POST /admin/applicants - Crear postulante
PUT /admin/applicants/:id - Actualizar postulante
PUT /admin/applicants/:id/status - Cambiar estado
DELETE /admin/applicants/:id - Eliminar postulante
```

---

## Casos de Uso Completos

### Caso de Uso 1: Admin Registra Edificio y Departamentos
```
1. Admin hace login → Obtiene JWT
2. Dashboard muestra 0 edificios
3. Admin crea edificio "Torre Central" en Av. Principal 123
4. Admin navega a Departamentos
5. Click "Crear en Lote"
6. Parámetros: 5 pisos, 4 deptos/piso, desde 101 hasta 504
7. Sistema genera 20 departamentos automáticamente
8. Dashboard ahora muestra: 1 edificio, 20 departamentos, 20 disponibles
```

### Caso de Uso 2: Admin Registra Inquilino con Contrato Automático
```
1. Admin click "Nuevo Inquilino"
2. Completa:
   - Nombre: Juan Pérez
   - DNI: 12345678
   - Correo: juan@mail.com
   - Teléfono: 987654321
   - Fecha nacimiento: 15/03/1990
   - Contraseña: temporal123
3. Selecciona Departamento 101
4. Datos contrato:
   - Inicio: 01/11/2025
   - Fin: 01/11/2026
   - Plan: Premium
5. Click "Crear"
6. Sistema ejecuta:
   - Crea usuario Juan con rol=Inquilino
   - Asigna Depto 101 a Juan
   - Cambia Depto 101 estado a "Ocupado"
   - AUTO-CREA contrato:
     * Fechas: 01/11/2025 - 01/11/2026
     * Monto: S/ 1,000 (plan Premium)
     * Depósito: S/ 1,000
     * Duración: 12 meses
     * archivo_pdf: NULL
7. Admin ve mensaje "Inquilino y contrato creados"
8. Dashboard actualiza: 1 inquilino, 1 ocupado, 19 disponibles
```

### Caso de Uso 3: Generar y Descargar Contrato en PDF
```
1. Admin navega a Contratos
2. Ve lista agrupada:
   Juan Pérez (1 contrato)
   └─ Contrato - Depto 101 - Torre Central
      [🟢 Generar] [✏️ Editar] [🗑️ Eliminar]
3. Click "Generar"
4. Sistema:
   - Carga datos completos (inquilino, depto, edificio)
   - Genera PDF de 3 páginas con cláusulas legales
   - Guarda en uploads/contratos/contrato_1_1731600000.pdf
   - Actualiza BD: archivo_pdf = ruta
5. Botón cambia a [🔵 Descargar]
6. Admin click "Descargar"
7. Navegador descarga contrato_1.pdf
8. Admin puede imprimir y firmar físicamente
```

### Caso de Uso 4: Inquilino Paga Alquiler
```
1. Admin crea pago mensual:
   - Inquilino: Juan Pérez
   - Concepto: Alquiler Noviembre
   - Monto: S/ 1,000
   - Vencimiento: 05/11/2025
   - Estado: Pendiente
2. Juan hace login al panel inquilino
3. Ve pago pendiente en dashboard
4. Click en pago → "Subir Comprobante"
5. Selecciona imagen de transferencia bancaria
6. Sistema guarda comprobante
7. Estado cambia a "Pendiente de Verificación"
8. Admin ve notificación
9. Admin revisa comprobante
10. Click "Aprobar Pago"
11. Estado: "Pagado", fecha_pago: hoy
12. Juan ve pago como "Pagado"
13. Dashboard admin: +S/ 1,000 en ingresos del mes
```

### Caso de Uso 5: Inquilino Reporta Incidencia
```
1. Juan (inquilino) en su panel
2. Click "Reportar Problema"
3. Completa:
   - Tipo: Fuga de agua
   - Descripción: "Grifo del baño gotea constantemente"
   - Sube foto del problema
   - Urgencia: Alta
   - Categoría: Plomería
4. Click "Reportar"
5. Incidencia creada con estado "Abierta"
6. Admin ve en dashboard: +1 incidencia activa
7. Admin navega a Incidencias
8. Click en incidencia de Juan
9. Cambia estado a "En Revisión"
10. Click "Asignar Proveedor"
11. Selecciona "Plomería Express"
12. Mensaje: "Revisar fuga en Depto 101"
13. Estado: "Asignada"
14. Proveedor recibe notificación
15. Proveedor marca "En Proceso"
16. Proveedor completa reparación
17. Admin cambia a "Completada"
18. Juan ve incidencia resuelta
```

---

## Consideraciones de Seguridad

### Autenticación JWT
```
- Token expira en 24 horas
- Se almacena en localStorage (frontend)
- Se envía en header Authorization de cada request
- Middleware verifica validez en cada endpoint
- Token contiene: idUsuario, correo, rol
- No contiene contraseña ni datos sensibles
```

### Hash de Contraseñas
```
- bcrypt con 10 rounds de salt
- Contraseña nunca se almacena en texto plano
- Contraseña nunca se retorna en responses
- attributes: { exclude: ['contrasenia'] } en queries
```

### Validación de Permisos
```
- verifyToken: Verifica que usuario esté autenticado
- verifyAdmin: Verifica que rol sea "Administrador"
- Todas las rutas /admin/* protegidas
- Inquilinos solo acceden a sus propios datos
```

### Archivos Subidos
```
- Validación de tipos de archivo (multer)
- Límite de tamaño de archivo
- Nombres únicos con timestamp
- Almacenamiento en carpetas segregadas
```

---

## Flujo de Datos Completo (Ejemplo: Crear Inquilino)

```
FRONTEND:
TenantForm.jsx
├─ Estado: formData con todos los campos
├─ onSubmit → adminAPI.createTenant(formData)

API Client:
admin.js
├─ createTenant(data)
├─ POST http://localhost:3000/admin/tenants
├─ Headers: { Authorization: Bearer [JWT] }
├─ Body: { nombreCompleto, dni, correo, ... }

BACKEND:
admin.routes.js
├─ POST /admin/tenants
├─ Middlewares: verifyToken, verifyAdmin
├─ Controller: tenantsController.createTenant

tenants.controller.js
├─ Extrae datos de req.body
├─ Valida correo y DNI únicos
├─ Inicia transacción SQL
├─ Hashea contraseña con bcrypt
├─ CREATE en tabla usuarios
├─ UPDATE departamento.id_inquilino
├─ UPDATE departamento.estado='Ocupado'
├─ AUTO-CREA contrato:
│   ├─ Extrae fechas del usuario
│   ├─ Calcula monto según plan
│   ├─ Calcula duración
│   └─ CREATE en tabla contratos
├─ Commit transacción
└─ Response: { success: true, data: usuario }

FRONTEND:
TenantForm.jsx
├─ Recibe response
├─ if (response.data.success)
├─ Llama onSuccess()
├─ Cierra modal
├─ TenantsList recarga datos
├─ Muestra mensaje "Inquilino creado"
└─ Lista actualizada con nuevo inquilino
```

---

## Instalación y Configuración

### Requisitos Previos
```
- Node.js 16+ instalado
- MySQL instalado o cuenta Railway
- Git instalado
```

### Instalación Backend
```bash
cd backend
npm install
```

Crear archivo `.env`:
```
PORT=3000
DB_HOST=tu_host
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=tu_password
JWT_SECRET=tu_clave_secreta
```

Iniciar servidor:
```bash
npm start
```

### Instalación Frontend
```bash
cd frontend
npm install
npm start
```

---

## Mantenimiento y Mejoras Futuras

### Características Pendientes
- Sistema de notificaciones en tiempo real (WebSockets)
- Reportes y gráficos avanzados
- Exportación de datos a Excel
- Integración con pasarelas de pago
- Sistema de mensajería entre admin e inquilinos
- Aplicación móvil para inquilinos
- Sistema de respaldo automático de base de datos

### Optimizaciones Recomendadas
- Implementar caché con Redis
- Paginación en todas las listas
- Compresión de imágenes subidas
- Logs estructurados con Winston
- Tests unitarios y de integración
- CI/CD con GitHub Actions
- Migración a TypeScript

---

## Soporte y Contacto

Para preguntas o soporte técnico, contactar al equipo de desarrollo.

**Versión del Sistema:** 1.0.0  
**Última Actualización:** Noviembre 2025
