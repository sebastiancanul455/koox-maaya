# Publicar Ko'ox Maaya en Google Play

La app ya es una PWA instalable desde Chrome. Publicarla en Google Play la empaqueta como **Trusted Web
Activity (TWA)**: una app Android que abre el sitio de GitHub Pages a pantalla completa. El contenido sigue
viniendo del sitio, así que cada publicación en `main` actualiza también la app de Play sin subir otro APK.

## Lo que necesitas (lo hace el dueño de la cuenta)
1. **Cuenta de desarrollador de Google Play**: pago único de USD 25 y verificación de identidad.
2. **Prueba cerrada**: las cuentas personales nuevas deben probar la app con **al menos 12 personas durante
   14 días seguidos** antes de poder publicarla para todo el mundo
   ([ayuda de Google](https://support.google.com/googleplay/android-developer/answer/14151465)).
3. **Política de privacidad**: una página pública (puede ser `docs/PRIVACIDAD.md` publicada en el sitio).
   Ko'ox Maaya no recoge datos: todo el progreso vive en el teléfono.
4. **Clasificación de contenido** (cuestionario IARC) y la sección **Seguridad de los datos** («no se
   recopilan ni se comparten datos»). Si la app se dirige también a niñas y niños, aplica la política de
   **Familias** de Google.

## Paso técnico clave: Digital Asset Links
Android solo abre el sitio sin barra de navegador si el dominio declara la app en
`https://sebastiancanul455.github.io/.well-known/assetlinks.json` (en la **raíz** del dominio). Desde la
ruta del proyecto (`/koox-maaya/.well-known/…`) no funciona.

1. Crea un repositorio **`sebastiancanul455.github.io`** (repositorio de usuario de GitHub Pages) que solo
   contenga `.nojekyll` y `.well-known/assetlinks.json`.
2. **No uses un dominio propio** para la app: cambiaría el origen y quienes ya usan el sitio perderían su
   progreso (vive en el almacenamiento del navegador de ese origen). Si algún día hace falta, antes deben
   exportar su avance (Perfil → Copia de seguridad).

`assetlinks.json` (sustituye la huella por la de la clave de firma que muestra Play Console en
«Integridad de la app → Firma de apps»):

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "io.github.sebastiancanul455.kooxmaaya",
    "sha256_cert_fingerprints": ["AA:BB:…"]
  }
}]
```

## Generar el paquete con Bubblewrap
Requiere Node, JDK 17 y el Android SDK (Bubblewrap los puede instalar):

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://sebastiancanul455.github.io/koox-maaya/manifest.webmanifest
#   paquete: io.github.sebastiancanul455.kooxmaaya · nombre: Ko'ox Maaya
bubblewrap build          # genera app-release-bundle.aab y la huella para assetlinks.json
```

Sube el `.aab` a Play Console (prueba cerrada primero). Guarda la clave de firma en un lugar seguro y
**nunca** la subas a este repositorio.

## Antes de publicar, revisar
- Que el micrófono funcione dentro de la TWA en un teléfono real (lo usa `grabar.html`).
- Que el botón Atrás de Android se comporte bien en lecciones, lecturas y Mi milpa.
- Íconos y capturas para la ficha de Play (la carpeta `icons/` trae los íconos de la PWA).
- La licencia de la voz sintética (CC BY-NC 4.0): la app debe seguir siendo gratuita y sin anuncios.
