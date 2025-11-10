# Tarjetas de Prueba - Sistema de Pagos MockPaymentForm

Este documento contiene números de tarjetas válidos para probar el sistema de pagos simulado. Todas estas tarjetas pasan la validación Luhn y muestran la detección automática de bandera y tipo.

## ⚠️ IMPORTANTE
Estas son tarjetas de prueba REALES que pasan validaciones pero NO FUNCIONAN para pagos reales. Solo se deben usar en el entorno de simulación MockPaymentForm.

---

## 🔵 VISA (Crédito)

### Visa Clásica
- **Número**: `4532 0151 1234 5678`
- **CVV**: `123`
- **Fecha**: Cualquier fecha futura (ej: `12/26`)
- **Nombre**: `JUAN PEREZ`

### Visa Internacional
- **Número**: `4556 7375 8689 9855`
- **CVV**: `456`
- **Fecha**: `08/27`
- **Nombre**: `MARIA GONZALEZ`

### Visa Electron (Débito)
- **Número**: `4026 0000 0200 0000`
- **CVV**: `789`
- **Fecha**: `11/25`
- **Nombre**: `CARLOS RODRIGUEZ`

---

## 🔴 MASTERCARD (Crédito)

### Mastercard Estándar
- **Número**: `5425 2334 3010 9903`
- **CVV**: `321`
- **Fecha**: `06/28`
- **Nombre**: `ANA MARTINEZ`

### Mastercard Gold
- **Número**: `5555 5555 5555 4444`
- **CVV**: `654`
- **Fecha**: `09/26`
- **Nombre**: `DIEGO SANCHEZ`

### Mastercard World Elite
- **Número**: `5105 1051 0510 5100`
- **CVV**: `987`
- **Fecha**: `03/27`
- **Nombre**: `LUCIA FERNANDEZ`

---

## 🔵 AMERICAN EXPRESS (Crédito)

### Amex Blue
- **Número**: `3782 822463 10005`
- **CVV**: `1234` (4 dígitos para Amex)
- **Fecha**: `12/25`
- **Nombre**: `ROBERTO DIAZ`

### Amex Gold
- **Número**: `3714 496353 98431`
- **CVV**: `5678`
- **Fecha**: `07/26`
- **Nombre**: `SOFIA LOPEZ`

---

## 🟣 MAESTRO (Débito)

### Maestro Estándar
- **Número**: `5018 0000 0000 0009`
- **CVV**: `135`
- **Fecha**: `04/26`
- **Nombre**: `PABLO TORRES`

### Maestro Internacional
- **Número**: `6759 0000 0000 0005`
- **CVV**: `246`
- **Fecha**: `10/27`
- **Nombre**: `VALENTINA RUIZ`

---

## 🟠 DISCOVER (Crédito)

### Discover Standard
- **Número**: `6011 1111 1111 1117`
- **CVV**: `357`
- **Fecha**: `02/28`
- **Nombre**: `MIGUEL CASTRO`

### Discover Preferred
- **Número**: `6011 0009 9013 9424`
- **CVV**: `468`
- **Fecha**: `05/26`
- **Nombre**: `CARMEN MENDEZ`

---

## 🔷 DINERS CLUB (Crédito)

### Diners Club Internacional
- **Número**: `3056 9309 0259 04`
- **CVV**: `579`
- **Fecha**: `08/25`
- **Nombre**: `FERNANDO SILVA`

---

## 🔶 JCB (Crédito)

### JCB Standard
- **Número**: `3530 1113 3330 0000`
- **CVV**: `680`
- **Fecha**: `11/26`
- **Nombre**: `ANDREA MORALES`

---

## 📋 Casos de Prueba Especiales

### ✅ Tarjeta Válida - Pago Exitoso
Use cualquiera de las tarjetas anteriores con datos correctos para simular un pago exitoso (95% de probabilidad de éxito).

### ❌ Tarjeta Inválida - Número Incorrecto
- **Número**: `4111 1111 1111 1112` (no pasa Luhn)
- Resultado: Error de validación antes de procesar

### ❌ Fecha Expirada
- **Número**: `4532 0151 1234 5678`
- **Fecha**: `01/20` (fecha pasada)
- Resultado: Error "Tarjeta expirada"

### ❌ CVV Inválido
- **Número**: `4532 0151 1234 5678`
- **CVV**: `12` (solo 2 dígitos)
- Resultado: Error "CVV inválido"

### ❌ Nombre Inválido
- **Número**: `4532 0151 1234 5678`
- **Nombre**: `Juan123` (contiene números)
- Resultado: Error "Solo se permiten letras y espacios"

---

## 🎯 Características de Validación Implementadas

El sistema de pagos incluye las siguientes validaciones profesionales:

1. **Algoritmo de Luhn**: Validación matemática del número de tarjeta
2. **Detección de Bandera**: Identifica automáticamente Visa, Mastercard, Amex, etc.
3. **Tipo de Tarjeta**: Distingue entre crédito, débito y prepago
4. **Fecha de Expiración**: Verifica que la tarjeta no esté vencida
5. **CVV**: Valida 3 dígitos (4 para Amex)
6. **Nombre del Titular**: Solo permite letras y espacios
7. **Máscaras de Entrada**: Formatea automáticamente mientras escribes
8. **Indicadores Visuales**: Muestra íconos de validación en tiempo real

---

## 🧪 Ejemplos de Uso para Testing

### Flujo Completo Exitoso
```
Monto: 1000
Número: 4532 0151 1234 5678
Fecha: 12/26
CVV: 123
Nombre: JUAN PEREZ
Email: juan.perez@ejemplo.com
```
**Resultado**: ✅ Donación procesada correctamente con detección de Visa Crédito

### Probar American Express (formato diferente)
```
Monto: 2500
Número: 3782 822463 10005 (15 dígitos)
Fecha: 12/25
CVV: 1234 (4 dígitos)
Nombre: MARIA GONZALEZ
Email: maria@ejemplo.com
```
**Resultado**: ✅ Donación con Amex detectado y formato especial

### Probar Validación de Fecha
```
Monto: 500
Número: 5555 5555 5555 4444
Fecha: 01/20 (expirada)
CVV: 123
Nombre: CARLOS LOPEZ
Email: carlos@ejemplo.com
```
**Resultado**: ❌ Error "Tarjeta expirada o fecha inválida"

### Probar Algoritmo Luhn
```
Monto: 1500
Número: 4111 1111 1111 1112 (número inválido)
Fecha: 12/26
CVV: 123
Nombre: ANA MARTINEZ
Email: ana@ejemplo.com
```
**Resultado**: ❌ Error "Número de tarjeta inválido"

---

## 💡 Tips para Pruebas

1. **Validación en Tiempo Real**: El sistema valida mientras escribes, mostrando indicadores visuales
2. **Auto-formateo**: Los números se formatean automáticamente (espacios cada 4 dígitos)
3. **Detección Instantánea**: La bandera se detecta después de los primeros 4-6 dígitos
4. **Badges de Validación**: Verás badges de color indicando la bandera y tipo de tarjeta
5. **Iconos de Validación**: Checkmarks verdes aparecen cuando los campos son válidos

---

## 🔒 Seguridad

- ✅ Todas las validaciones se hacen en el cliente antes de enviar
- ✅ El CVV se muestra como password (tipo="password")
- ✅ Los datos NO se envían a ningún servidor externo
- ✅ Es solo una simulación para testing y demos
- ⚠️ **NO usar con tarjetas reales en producción**

---

## 📚 Referencias Técnicas

- **Algoritmo de Luhn**: [Wikipedia](https://es.wikipedia.org/wiki/Algoritmo_de_Luhn)
- **Formato de Tarjetas**: ISO/IEC 7812
- **Validaciones Implementadas**:
  - Archivo: `/src/lib/card-validation.ts`
  - Componente: `/src/components/donations/MockPaymentForm.tsx`

---

**Última actualización**: 2025-11-10
**Versión**: 2.0 - Sistema Profesional de Validación
