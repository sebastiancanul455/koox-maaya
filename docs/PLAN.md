# Plan de mejora de Ko'ox Maaya

Ko'ox Maaya es un «Duolingo de maya»: una app gratuita para que cualquier persona aprenda maya yucateco
por gusto. Este plan se marca a medida que avanza; cada casilla es una mejora concreta.

**Principios.** Diversión con propósito (nada de trampas para enganchar) · la voz de los hablantes al
centro, con su consentimiento y su crédito · nada de maya sin respaldo de una fuente o de un hablante ·
lo simple primero · sin cuentas, sin rastreo y sin servidor.

## Fase 0 · Preparar las grabaciones de un hablante mayor
- [x] Modo acompañado en `grabar.html` y guía para grabar ([`docs/GRABAR.md`](GRABAR.md))
- [x] Permisos por capas y licencia «Solo para Ko'ox Maaya» ([`docs/PERMISO-VOCES.md`](PERMISO-VOCES.md))
- [x] Racha amable (día de gracia semanal, «días con maya» que nunca baja) y modo tranquilo
- [x] Exportar e importar el progreso (sirve entre el sitio y claude.ai)
- [x] Unidad 7 con tono de vida diaria
- [x] Integración continua (`.github/workflows/ci.yml`)
- [ ] Archivo LICENSE (decisión pendiente: código, texto del curso y audios)

## Fase 1 · La voz de un hablante nativo
- [ ] Voz nativa en las unidades 1 a 3 y pares mínimos (vocal larga, tono, saltillo, glotalizadas)
- [ ] Validar las palabras «por confirmar» con hablantes y guardar las variantes por región
- [x] Sección «Voces» en Perfil con la meta compartida («N palabras con voz nativa»)
- [x] Logros «Puedo…», uno por unidad
- [x] Lecturas con glosas al tocar y «Escucha y sigue» (hoy con los diálogos del curso)
- [ ] Biblioteca inicial de 3 cuentos de otras fuentes, revisados por un hablante
- [x] Repaso con FSRS-6 y historial de repasos

## Fase 2 · Juego y lectura
- [ ] Lotería exprés, «Escucha al abuelo» (un relato al terminar cada unidad), «Mi milpa», reto semanal
- [ ] Glosas al tocar, lecturas por nivel («conoces el 92 % de esta historia») y personajes recurrentes
- [ ] Historias de «elige qué decir» y un diálogo en cada unidad
- [ ] Unidades 10 a 13 para completar A1: ubicación, querer y gustar, imperativo, hora y fechas
- [ ] Ruta para quienes ya entienden maya (prueba de ubicación por escucha)
- [ ] Publicar en Google Play (app web empaquetada)

## Fase 3 · A2 y creatividad
- [ ] Unidades A2: pasado, progresivo, perfecto, futuro, rutina, visitas, planes, narración
- [ ] Mapa de Yucatán con historias, «arma tu historia», diario y postales en maya
- [ ] Más hablantes y regiones, adivinanzas, trabalenguas y bombas con permiso de quien las aporta

## Fase 4 · Comunidad e IA
- [ ] Alineación por palabra de las grabaciones, evaluación de pronunciación y tutor cerrado
- [ ] Mozilla Common Voice para maya yucateco (solo si los hablantes lo aprueban)

## Lo que no haremos
Ligas o clasificaciones · monedas, tiendas o cofres aleatorios · mensajes que culpan por perder la racha ·
logros por volumen o secretos · símbolos sagrados como premio sin aval de los hablantes · generar maya con IA.

## Medición (sin analítica de terceros)
Palabras con voz nativa · palabras validadas por hablantes · ejercicios de elegir opción ≤ 40 % ·
retención de los repasos ≥ 90 % · historias leídas · días con maya.
