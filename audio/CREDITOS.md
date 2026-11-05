# Créditos de audio

Atribución de cada audio de Ko'ox Maaya. Este archivo lo genera `node tools/creditos.mjs` a partir de
`audio/catalogo.json`: no se edita a mano.

En total hay **225** audios: 24 sonidos de referencia (AFI), 0 de voces nativas y 201 de voz sintética (aproximada).

**Cambios hechos a todos los audios.** `tools/audio-import.mjs` recorta el silencio del inicio y del final,
normaliza el volumen (unos -18 LUFS, pico de -1.5 dB, como ganancia lineal), agrega 60 ms de silencio a
cada lado y lo convierte a MP3 mono de 44.1 kHz y 64 kbps. No se cambia nada más: ni el tono, ni la velocidad, ni
el contenido. Cada audio derivado conserva la licencia de su original; los de licencia CC BY-SA se publican con
la misma licencia (CC BY-SA, «compartir igual»), con la atribución que sigue.

## Sonidos de referencia (AFI)

Sonidos aislados del Alfabeto Fonético Internacional, de Wikimedia Commons. No son grabaciones de hablantes de
maya: ilustran el sonido de una letra de la guía de pronunciación.

| Archivo | Sonido | Letra de la guía | Original (título y página en Commons) | Autor | Licencia | Cambios |
| --- | --- | --- | --- | --- | --- | --- |
| `audio/afi-a.mp3` | [ä] | «a e i o u» | [Open central unrounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Open_central_unrounded_vowel.ogg) | Denelson83 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-africada-alveolar.mp3` | [ts] | «ts» | [Voiceless alveolar sibilant affricate.oga](https://commons.wikimedia.org/wiki/File:Voiceless_alveolar_sibilant_affricate.oga) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-africada-postalveolar.mp3` | [tʃ] | «ch» | [Voiceless palato-alveolar affricate.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_palato-alveolar_affricate.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-aproximante-labiovelar.mp3` | [w] | «w» | [Voiced labio-velar approximant.ogg](https://commons.wikimedia.org/wiki/File:Voiced_labio-velar_approximant.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-aproximante-palatal.mp3` | [j] | «y» | [Palatal approximant.ogg](https://commons.wikimedia.org/wiki/File:Palatal_approximant.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-e.mp3` | [e̞] | «a e i o u» | [Mid front unrounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Mid_front_unrounded_vowel.ogg) | TFighterPilot | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-eyectiva-alveolar.mp3` | [tʼ] | «t'» | [Alveolar ejective plosive.ogg](https://commons.wikimedia.org/wiki/File:Alveolar_ejective_plosive.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-eyectiva-bilabial.mp3` | [pʼ] | «p'» | [Bilabial ejective plosive.ogg](https://commons.wikimedia.org/wiki/File:Bilabial_ejective_plosive.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-eyectiva-velar.mp3` | [kʼ] | «k'» | [Velar ejective plosive.ogg](https://commons.wikimedia.org/wiki/File:Velar_ejective_plosive.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-fricativa-alveolar.mp3` | [s] | «s» | [Voiceless alveolar sibilant.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_alveolar_sibilant.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-fricativa-glotal.mp3` | [h] | «j» | [Voiceless glottal fricative.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_glottal_fricative.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-fricativa-postalveolar.mp3` | [ʃ] | «x» | [Voiceless palato-alveolar sibilant.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_palato-alveolar_sibilant.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-i.mp3` | [i] | «a e i o u» | [Close front unrounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Close_front_unrounded_vowel.ogg) | Denelson83 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-implosiva-bilabial.mp3` | [ɓ] | «b» | [Voiced bilabial implosive.ogg](https://commons.wikimedia.org/wiki/File:Voiced_bilabial_implosive.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-lateral-alveolar.mp3` | [l] | «l» | [Alveolar lateral approximant.ogg](https://commons.wikimedia.org/wiki/File:Alveolar_lateral_approximant.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-nasal-alveolar.mp3` | [n] | «n» | [Alveolar nasal.ogg](https://commons.wikimedia.org/wiki/File:Alveolar_nasal.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-nasal-bilabial.mp3` | [m] | «m» | [Bilabial nasal.ogg](https://commons.wikimedia.org/wiki/File:Bilabial_nasal.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-o.mp3` | [o̞] | «a e i o u» | [Mid back rounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Mid_back_rounded_vowel.ogg) | TFighterPilot | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-oclusiva-alveolar.mp3` | [t] | «t» | [Voiceless alveolar plosive.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_alveolar_plosive.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-oclusiva-bilabial.mp3` | [p] | «p» | [Voiceless bilabial plosive.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_bilabial_plosive.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-oclusiva-glotal.mp3` | [ʔ] | «'» | [Glottal stop.ogg](https://commons.wikimedia.org/wiki/File:Glottal_stop.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-oclusiva-velar.mp3` | [k] | «k» | [Voiceless velar plosive.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_velar_plosive.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-u.mp3` | [u] | «a e i o u» | [Close back rounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Close_back_rounded_vowel.ogg) | Denelson83 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |
| `audio/afi-vibrante-simple.mp3` | [ɾ] | «r» | [Alveolar tap.ogg](https://commons.wikimedia.org/wiki/File:Alveolar_tap.ogg) | Peter Isotalo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Recortado (silencio inicial y final), volumen normalizado y convertido a MP3 |

## Voces nativas

Todavía no hay grabaciones de hablantes. Se agregan con `grabar.html` y `tools/import-recordings.mjs`, o con
`tools/commons/fetch-pendientes.py` (cuatro grabaciones de Wikimedia Commons pendientes de descargar).

## Voz sintética (aproximada)

- **Meta AI (MMS-TTS)**: 201 audios (`audio/s-*.mp3`), generados con el modelo [facebook/mms-tts-yua](https://huggingface.co/facebook/mms-tts-yua) del proyecto Massively Multilingual Speech (Pratap et al., 2023, «Scaling Speech Technology to 1,000+ Languages»).
  Licencia: [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/): solo uso no comercial. Por eso estos audios, y la app que los incluye, son de uso
  no comercial.
  Se generaron con `tools/tts-mms.py` y se aceptó cada uno solo si el reconocedor MMS-1B-all (adaptador yua) lo
  transcribe bien (CER ≤ 0.25, y CER = 0 en palabras de hasta 4 letras). Son aproximados: pueden equivocarse en el tono,
  el saltillo y las consonantes glotalizadas, y no sustituyen la voz de un hablante.
