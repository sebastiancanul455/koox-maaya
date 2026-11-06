/* Service worker de Ko'ox Maaya (versión web independiente, para GitHub Pages).
   Plantilla: build-web.mjs reemplaza la versión (hash del contenido) y la lista de precarga
   al escribir site/sw.js.
   - Precarga index.html, el manifest y los íconos en una caché con la versión en el nombre.
   - Navegación: primero la red (para recibir actualizaciones) y, sin red o si tarda, la copia guardada.
   - Fuentes de Google: stale-while-revalidate en una caché aparte que sobrevive a las versiones.
   - Audio (audio/<key>.mp3?v=<hash>): primero la caché, en otra caché que sobrevive a las versiones
     (la URL cambia cuando cambia el archivo). Si todo el audio suma 8 MB o menos, build-web.mjs
     pone la lista en AUDIO_PRECACHE y se descarga al instalar; si no, se guarda al escucharlo.
     Responde los pedidos con Range (los usa <audio>) con 206 a partir de la copia completa.
   - activate: borra las cachés viejas de esta app (solo las suyas: en usuario.github.io el origen
     es compartido con otros proyectos) y los audios que ya no están en el catálogo, toma el
     control y avisa a la página. */
"use strict";

const VERSION = "f4a712e1cb6d";
const PRECACHE = ["index.html","grabar.html","manifest.webmanifest","icons/favicon.svg","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png"];
const AUDIO_PRECACHE = ["audio/afi-a.mp3?v=9abd7814fc","audio/afi-africada-alveolar.mp3?v=901c6f0d1e","audio/afi-africada-postalveolar.mp3?v=a9cf25e942","audio/afi-aproximante-labiovelar.mp3?v=790d0c7bf8","audio/afi-aproximante-palatal.mp3?v=c304242a9b","audio/afi-e.mp3?v=cb20379aed","audio/afi-eyectiva-alveolar.mp3?v=21f4ce6de2","audio/afi-eyectiva-bilabial.mp3?v=169a1e6d4a","audio/afi-eyectiva-velar.mp3?v=521a1440df","audio/afi-fricativa-alveolar.mp3?v=ff18e93573","audio/afi-fricativa-glotal.mp3?v=0d760674da","audio/afi-fricativa-postalveolar.mp3?v=85b35c0cad","audio/afi-i.mp3?v=1cd6284d36","audio/afi-implosiva-bilabial.mp3?v=364802d309","audio/afi-lateral-alveolar.mp3?v=2e0eea8e82","audio/afi-nasal-alveolar.mp3?v=dc90c99ef4","audio/afi-nasal-bilabial.mp3?v=4a2cdcf00f","audio/afi-o.mp3?v=2f25213980","audio/afi-oclusiva-alveolar.mp3?v=a1a32b6ce8","audio/afi-oclusiva-bilabial.mp3?v=c53bc218d5","audio/afi-oclusiva-glotal.mp3?v=4818bac6af","audio/afi-oclusiva-velar.mp3?v=ac124ea8ca","audio/afi-u.mp3?v=1ab65b71c2","audio/afi-vibrante-simple.mp3?v=93be0e8472","audio/s-dlg-u2l1-2.mp3?v=ef9587d50b","audio/s-dlg-u2l2-2.mp3?v=940cf9e606","audio/s-dlg-u2l2-4.mp3?v=13d31b01e3","audio/s-dlg-u2l3-3.mp3?v=0f884e77b6","audio/s-dlg-u5l3-2.mp3?v=bf78d891ce","audio/s-dlg-u5l3-3.mp3?v=8edc448487","audio/s-dlg-u5l3-4.mp3?v=ba76a9ab71","audio/s-dlg-u5l3-5.mp3?v=71475cd7ec","audio/s-dlg-u5l3-6.mp3?v=06d115abb9","audio/s-dlg-u6l3-3.mp3?v=e543cab225","audio/s-dlg-u6l3-4.mp3?v=97c2248d80","audio/s-dlg-u6l3-5.mp3?v=cb17993815","audio/s-dlg-u6l3-6.mp3?v=ed5473deed","audio/s-dlg-u7l3-3.mp3?v=74b836091f","audio/s-dlg-u7l3-6.mp3?v=f4bd24bf4c","audio/s-dlg-u7l3-8.mp3?v=54b7e021b4","audio/s-dlg-u7l5-2.mp3?v=e9bd9faca0","audio/s-dlg-u7l5-3.mp3?v=87277ed53f","audio/s-dlg-u7l5-4.mp3?v=5ad5d0ff47","audio/s-dlg-u7l5-5.mp3?v=3ea03b9146","audio/s-dlg-u9l3-1.mp3?v=9c66502fc7","audio/s-dlg-u9l3-4.mp3?v=b64a829870","audio/s-ex-u2-dios-bootik.mp3?v=fc4f162fcd","audio/s-ex-u2-in-kaajale.mp3?v=5bb9ecba7f","audio/s-ex-u2-koox.mp3?v=e9fbe26563","audio/s-ex-u2-maalob.mp3?v=5c65649ad2","audio/s-ex-u2-tene-in-kaaba.mp3?v=9a00b9a977","audio/s-ex-u3-sukuun.mp3?v=06f57e41ae","audio/s-ex-u3-tene.mp3?v=a61d13f701","audio/s-ex-u3-yaan-teen.mp3?v=c984e4bf77","audio/s-ex-u4-jumpeel.mp3?v=134895b75f","audio/s-ex-u4-jumpiit.mp3?v=bb18466949","audio/s-ex-u4-junkuul.mp3?v=976e7479ce","audio/s-ex-u4-juntuul.mp3?v=2a4cf2575c","audio/s-ex-u4-kaatuul.mp3?v=6447815c90","audio/s-ex-u4-yaab.mp3?v=f773743958","audio/s-ex-u5-janal.mp3?v=4b2a9917d3","audio/s-ex-u5-jookol.mp3?v=a4efaff9b1","audio/s-ex-u5-meyaj.mp3?v=cf5c897444","audio/s-ex-u5-taal.mp3?v=fc903af99b","audio/s-ex-u6-keeken.mp3?v=0aecb7e88b","audio/s-ex-u6-kooj.mp3?v=8866fb97fb","audio/s-ex-u6-ma-wiijeni.mp3?v=0bb39e5873","audio/s-ex-u6-maan.mp3?v=ab88545225","audio/s-ex-u6-taakin.mp3?v=2a043eb953","audio/s-ex-u7-ich.mp3?v=b5ddfbd138","audio/s-ex-u7-pool.mp3?v=c9bbb8ab97","audio/s-u1-chaak-lluvia.mp3?v=f69f5f6f4c","audio/s-u1-kaan-cielo.mp3?v=5575bef15f","audio/s-u1-kaan-serpiente.mp3?v=1121238952","audio/s-u1-maaya-taan.mp3?v=81445c3da7","audio/s-u1-taan-frente.mp3?v=d81946bd5e","audio/s-u1-tsikbal.mp3?v=fd608b76d4","audio/s-u1-tuunich.mp3?v=6305cd4518","audio/s-u1-yeetel.mp3?v=e8e35b6bb6","audio/s-u2-baax-ka-waalik.mp3?v=e965c83d5f","audio/s-u2-beyxan-teen.mp3?v=6b0d6d56fc","audio/s-u2-bix-a-beel.mp3?v=5c90e61c12","audio/s-u2-bix-a-beeleex.mp3?v=cb98e63b7d","audio/s-u2-cheen-mixbaal.mp3?v=a3b603b703","audio/s-u2-dios-bootik.mp3?v=bc81522491","audio/s-u2-in-kaajale.mp3?v=6b664951c7","audio/s-u2-jach-maalob.mp3?v=49648aa213","audio/s-u2-ka-xiik-teech-jatsuts.mp3?v=2057ef6551","audio/s-u2-ka-xiik-teech-utsil.mp3?v=d29f608377","audio/s-u2-ka-xiik-teex-utsil.mp3?v=8192527a3f","audio/s-u2-kiimak-in-wool.mp3?v=c5993c3b99","audio/s-u2-kux-teech.mp3?v=9ec8d899aa","audio/s-u2-maalob.mp3?v=49d76fcfb6","audio/s-u2-maalob-aakab.mp3?v=2331eab600","audio/s-u2-maalob-chiinil-kiin.mp3?v=9a4ac60a14","audio/s-u2-maalob-kiin.mp3?v=2ab090d54c","audio/s-u2-meent-uts.mp3?v=ad07a464d6","audio/s-u2-mixbaal.mp3?v=e89a43570c","audio/s-u2-mucho-gusto.mp3?v=f7fdf6af57","audio/s-u2-niib-oolal.mp3?v=3c26f640f4","audio/s-u2-paatik-in-jaan-maan.mp3?v=71d9afee7f","audio/s-u2-tak-saamal.mp3?v=6307c148ee","audio/s-u2-tak-ti-ulaak-kiin.mp3?v=20cc26d394","audio/s-u2-tene-in-kaaba.mp3?v=3572f7d0fc","audio/s-u2-tuux-a-kaajal.mp3?v=643b373e34","audio/s-u2-yuum-bootik.mp3?v=a6725f5484","audio/s-u3-beyxan-teech.mp3?v=8f8003e601","audio/s-u3-chuupal.mp3?v=212690c6da","audio/s-u3-in-wotoch.mp3?v=55354895c5","audio/s-u3-letiob.mp3?v=d9f13a536f","audio/s-u3-minaan.mp3?v=f8bf8ec6a1","audio/s-u3-nojoch-maak.mp3?v=338f84e86c","audio/s-u3-paalal.mp3?v=7fe7f6c45e","audio/s-u3-sukuun.mp3?v=b4a3b31862","audio/s-u3-teche.mp3?v=b36982be06","audio/s-u3-teech.mp3?v=ff8cc80849","audio/s-u3-teex.mp3?v=c4aa516614","audio/s-u3-u-yotoch.mp3?v=f8db28a726","audio/s-u3-wiinik.mp3?v=db1ed9ffb9","audio/s-u3-xiipal.mp3?v=05d88af9b6","audio/s-u3-yaan.mp3?v=78111d4f62","audio/s-u3-yaan-teen.mp3?v=18a69bff57","audio/s-u4-bolon.mp3?v=d12f5ead50","audio/s-u4-bolonlajun.mp3?v=c093d1339f","audio/s-u4-jaypeel.mp3?v=3fdd7cde19","audio/s-u4-jaypeel-jaab.mp3?v=d8bd8a19c0","audio/s-u4-joolajun.mp3?v=8f822fec94","audio/s-u4-jopeel.mp3?v=1be9e1dea1","audio/s-u4-jumpeel.mp3?v=4802781c9b","audio/s-u4-jun.mp3?v=f51a43afd7","audio/s-u4-juntuul.mp3?v=ceb24f9df2","audio/s-u4-kaalajun.mp3?v=09e4e7c1cc","audio/s-u4-kaapeel.mp3?v=9c3d4d0226","audio/s-u4-kaateen.mp3?v=32296fb859","audio/s-u4-kaatuul.mp3?v=9cd4af1cb1","audio/s-u4-kampeel.mp3?v=9ae9c8bfa7","audio/s-u4-kan.mp3?v=c5204cc2d1","audio/s-u4-kanlajun.mp3?v=5eee8720dc","audio/s-u4-lajun.mp3?v=8a903f0b73","audio/s-u4-ooxlajun.mp3?v=4f18994ebb","audio/s-u4-tu-kaateen.mp3?v=614385f576","audio/s-u4-uklajun.mp3?v=33a6ce1e87","audio/s-u4-waklajun.mp3?v=433600ede9","audio/s-u4-waxak.mp3?v=42f2c5e603","audio/s-u4-waxaklajun.mp3?v=7f0a51f0aa","audio/s-u4-yaan-yaab-maak.mp3?v=f74d2b90f7","audio/s-u5-baax.mp3?v=2a87ea7214","audio/s-u5-baaxten.mp3?v=07f7a4d58e","audio/s-u5-chaambeel.mp3?v=5a38b1505d","audio/s-u5-cheen-jumpiit-maaya.mp3?v=e9da6f1a1b","audio/s-u5-janal.mp3?v=260d1834cc","audio/s-u5-ka-taan-waaj.mp3?v=1a4783da19","audio/s-u5-kanik.mp3?v=f91ca0a1de","audio/s-u5-ma-in-woojeli.mp3?v=db45448881","audio/s-u5-ma-tin-bin-mixtuux.mp3?v=039a68d052","audio/s-u5-ma-tin-naatik.mp3?v=cee7619308","audio/s-u5-maax.mp3?v=62c3499d33","audio/s-u5-taal.mp3?v=5f2f2ede75","audio/s-u5-taan-in-kanik-maaya.mp3?v=4080b25b37","audio/s-u5-tuux-ka-bin.mp3?v=8544701c9e","audio/s-u5-wenel.mp3?v=b77a554f7c","audio/s-u6-bajux.mp3?v=8ae5382dc1","audio/s-u6-bajux-u-tojol.mp3?v=e62dadf6c0","audio/s-u6-ma-wiijeni.mp3?v=85bde164c6","audio/s-u6-maan.mp3?v=35c86d62ee","audio/s-u6-manik.mp3?v=cf45cf3ab2","audio/s-u6-tojol.mp3?v=7b0976a11b","audio/s-u6-tsook-in-janal.mp3?v=bfea813c7b","audio/s-u6-yaan-waaj-jaas.mp3?v=94ef2df2f4","audio/s-u7-chiibal.mp3?v=2c3cce7329","audio/s-u7-chiibal-koj.mp3?v=4d4ed2711b","audio/s-u7-chiibal-pool.mp3?v=e67bc51eea","audio/s-u7-chokwil.mp3?v=9158746a86","audio/s-u7-in-tsootsel.mp3?v=dcc3b79d13","audio/s-u7-kaal.mp3?v=46a83bbeda","audio/s-u7-kan-chuuy.mp3?v=b4bfcede19","audio/s-u7-kojaanech-waaj.mp3?v=bbbf0e0d41","audio/s-u7-kulen.mp3?v=2abf632f5a","audio/s-u7-ma-kojaaneni.mp3?v=0d23d8f38b","audio/s-u7-minaan-tsaak.mp3?v=fdd5c184f8","audio/s-u7-paach.mp3?v=8fbf336c3e","audio/s-u7-pool.mp3?v=44ca798c8c","audio/s-u7-puksiikal.mp3?v=94190a58fb","audio/s-u7-toj-oolal.mp3?v=bad3785e57","audio/s-u7-tsak-yaj.mp3?v=d78776a02a","audio/s-u7-tsook-a-janal.mp3?v=e75f68ab4d","audio/s-u7-xikin.mp3?v=9b6e790329","audio/s-u7-yaan-waaj-tsaak.mp3?v=86f1a49888","audio/s-u7-yaj-in-koj.mp3?v=7ab7c3113f","audio/s-u7-yaj-in-nak.mp3?v=425c4cfae8","audio/s-u7-yaj-in-paach.mp3?v=54eb3715cf","audio/s-u7-yaj-in-pool.mp3?v=6699175d95","audio/s-u7-yaj-in-wook.mp3?v=ae8a515c77","audio/s-u7-yaj-waaj-a-pool.mp3?v=cab73a150e","audio/s-u8-chak.mp3?v=0400a80349","audio/s-u8-lool.mp3?v=3298f5cc8d","audio/s-u8-muuch.mp3?v=6919afcf9f","audio/s-u8-muuyal.mp3?v=a3ff16dce7","audio/s-u8-nojol.mp3?v=d0d562e6fd","audio/s-u8-taanil.mp3?v=5e7f7c9064","audio/s-u8-turix.mp3?v=8552d51b43","audio/s-u8-waye.mp3?v=391c6c421a","audio/s-u8-xaman.mp3?v=998ff012c7","audio/s-u8-yaaxche.mp3?v=a9817fe9cc","audio/s-u8-yookol.mp3?v=7b64aa8308","audio/s-u9-biin.mp3?v=b64c351f26","audio/s-u9-biin-in-jaantej.mp3?v=58ba5e13c9","audio/s-u9-binen.mp3?v=fdb230f559","audio/s-u9-janal-pixan.mp3?v=e7e497a931","audio/s-u9-janen.mp3?v=00ba918bf0","audio/s-u9-ka-suunakech.mp3?v=d494d5c121","audio/s-u9-kaabej.mp3?v=7077e5a9ae","audio/s-u9-kiimak-oolal.mp3?v=161208d5c9","audio/s-u9-kiimil.mp3?v=e76ab32443","audio/s-u9-kuxtal.mp3?v=0bb3f1cded","audio/s-u9-ma-tin-meyaj-te-suutukila.mp3?v=3f6fada5d7","audio/s-u9-meyajnajen.mp3?v=2f2a478b54","audio/s-u9-paax.mp3?v=a3156f817c","audio/s-u9-saamal.mp3?v=99430e07bb","audio/s-u9-saamal-in-bin.mp3?v=9974adbee4","audio/s-u9-taalen.mp3?v=33af7ba985","audio/s-u9-taant-in-janale.mp3?v=2577f420c1","audio/s-u9-te-suutukila.mp3?v=e6570b3b34","audio/s-u9-tin-xokaj.mp3?v=ff320f3add","audio/s-u9-yuum-bootik-taalech.mp3?v=ff893811a5"];
const AUDIO_FILES = ["audio/afi-a.mp3?v=9abd7814fc","audio/afi-africada-alveolar.mp3?v=901c6f0d1e","audio/afi-africada-postalveolar.mp3?v=a9cf25e942","audio/afi-aproximante-labiovelar.mp3?v=790d0c7bf8","audio/afi-aproximante-palatal.mp3?v=c304242a9b","audio/afi-e.mp3?v=cb20379aed","audio/afi-eyectiva-alveolar.mp3?v=21f4ce6de2","audio/afi-eyectiva-bilabial.mp3?v=169a1e6d4a","audio/afi-eyectiva-velar.mp3?v=521a1440df","audio/afi-fricativa-alveolar.mp3?v=ff18e93573","audio/afi-fricativa-glotal.mp3?v=0d760674da","audio/afi-fricativa-postalveolar.mp3?v=85b35c0cad","audio/afi-i.mp3?v=1cd6284d36","audio/afi-implosiva-bilabial.mp3?v=364802d309","audio/afi-lateral-alveolar.mp3?v=2e0eea8e82","audio/afi-nasal-alveolar.mp3?v=dc90c99ef4","audio/afi-nasal-bilabial.mp3?v=4a2cdcf00f","audio/afi-o.mp3?v=2f25213980","audio/afi-oclusiva-alveolar.mp3?v=a1a32b6ce8","audio/afi-oclusiva-bilabial.mp3?v=c53bc218d5","audio/afi-oclusiva-glotal.mp3?v=4818bac6af","audio/afi-oclusiva-velar.mp3?v=ac124ea8ca","audio/afi-u.mp3?v=1ab65b71c2","audio/afi-vibrante-simple.mp3?v=93be0e8472","audio/s-dlg-u2l1-2.mp3?v=ef9587d50b","audio/s-dlg-u2l2-2.mp3?v=940cf9e606","audio/s-dlg-u2l2-4.mp3?v=13d31b01e3","audio/s-dlg-u2l3-3.mp3?v=0f884e77b6","audio/s-dlg-u5l3-2.mp3?v=bf78d891ce","audio/s-dlg-u5l3-3.mp3?v=8edc448487","audio/s-dlg-u5l3-4.mp3?v=ba76a9ab71","audio/s-dlg-u5l3-5.mp3?v=71475cd7ec","audio/s-dlg-u5l3-6.mp3?v=06d115abb9","audio/s-dlg-u6l3-3.mp3?v=e543cab225","audio/s-dlg-u6l3-4.mp3?v=97c2248d80","audio/s-dlg-u6l3-5.mp3?v=cb17993815","audio/s-dlg-u6l3-6.mp3?v=ed5473deed","audio/s-dlg-u7l3-3.mp3?v=74b836091f","audio/s-dlg-u7l3-6.mp3?v=f4bd24bf4c","audio/s-dlg-u7l3-8.mp3?v=54b7e021b4","audio/s-dlg-u7l5-2.mp3?v=e9bd9faca0","audio/s-dlg-u7l5-3.mp3?v=87277ed53f","audio/s-dlg-u7l5-4.mp3?v=5ad5d0ff47","audio/s-dlg-u7l5-5.mp3?v=3ea03b9146","audio/s-dlg-u9l3-1.mp3?v=9c66502fc7","audio/s-dlg-u9l3-4.mp3?v=b64a829870","audio/s-ex-u2-dios-bootik.mp3?v=fc4f162fcd","audio/s-ex-u2-in-kaajale.mp3?v=5bb9ecba7f","audio/s-ex-u2-koox.mp3?v=e9fbe26563","audio/s-ex-u2-maalob.mp3?v=5c65649ad2","audio/s-ex-u2-tene-in-kaaba.mp3?v=9a00b9a977","audio/s-ex-u3-sukuun.mp3?v=06f57e41ae","audio/s-ex-u3-tene.mp3?v=a61d13f701","audio/s-ex-u3-yaan-teen.mp3?v=c984e4bf77","audio/s-ex-u4-jumpeel.mp3?v=134895b75f","audio/s-ex-u4-jumpiit.mp3?v=bb18466949","audio/s-ex-u4-junkuul.mp3?v=976e7479ce","audio/s-ex-u4-juntuul.mp3?v=2a4cf2575c","audio/s-ex-u4-kaatuul.mp3?v=6447815c90","audio/s-ex-u4-yaab.mp3?v=f773743958","audio/s-ex-u5-janal.mp3?v=4b2a9917d3","audio/s-ex-u5-jookol.mp3?v=a4efaff9b1","audio/s-ex-u5-meyaj.mp3?v=cf5c897444","audio/s-ex-u5-taal.mp3?v=fc903af99b","audio/s-ex-u6-keeken.mp3?v=0aecb7e88b","audio/s-ex-u6-kooj.mp3?v=8866fb97fb","audio/s-ex-u6-ma-wiijeni.mp3?v=0bb39e5873","audio/s-ex-u6-maan.mp3?v=ab88545225","audio/s-ex-u6-taakin.mp3?v=2a043eb953","audio/s-ex-u7-ich.mp3?v=b5ddfbd138","audio/s-ex-u7-pool.mp3?v=c9bbb8ab97","audio/s-u1-chaak-lluvia.mp3?v=f69f5f6f4c","audio/s-u1-kaan-cielo.mp3?v=5575bef15f","audio/s-u1-kaan-serpiente.mp3?v=1121238952","audio/s-u1-maaya-taan.mp3?v=81445c3da7","audio/s-u1-taan-frente.mp3?v=d81946bd5e","audio/s-u1-tsikbal.mp3?v=fd608b76d4","audio/s-u1-tuunich.mp3?v=6305cd4518","audio/s-u1-yeetel.mp3?v=e8e35b6bb6","audio/s-u2-baax-ka-waalik.mp3?v=e965c83d5f","audio/s-u2-beyxan-teen.mp3?v=6b0d6d56fc","audio/s-u2-bix-a-beel.mp3?v=5c90e61c12","audio/s-u2-bix-a-beeleex.mp3?v=cb98e63b7d","audio/s-u2-cheen-mixbaal.mp3?v=a3b603b703","audio/s-u2-dios-bootik.mp3?v=bc81522491","audio/s-u2-in-kaajale.mp3?v=6b664951c7","audio/s-u2-jach-maalob.mp3?v=49648aa213","audio/s-u2-ka-xiik-teech-jatsuts.mp3?v=2057ef6551","audio/s-u2-ka-xiik-teech-utsil.mp3?v=d29f608377","audio/s-u2-ka-xiik-teex-utsil.mp3?v=8192527a3f","audio/s-u2-kiimak-in-wool.mp3?v=c5993c3b99","audio/s-u2-kux-teech.mp3?v=9ec8d899aa","audio/s-u2-maalob.mp3?v=49d76fcfb6","audio/s-u2-maalob-aakab.mp3?v=2331eab600","audio/s-u2-maalob-chiinil-kiin.mp3?v=9a4ac60a14","audio/s-u2-maalob-kiin.mp3?v=2ab090d54c","audio/s-u2-meent-uts.mp3?v=ad07a464d6","audio/s-u2-mixbaal.mp3?v=e89a43570c","audio/s-u2-mucho-gusto.mp3?v=f7fdf6af57","audio/s-u2-niib-oolal.mp3?v=3c26f640f4","audio/s-u2-paatik-in-jaan-maan.mp3?v=71d9afee7f","audio/s-u2-tak-saamal.mp3?v=6307c148ee","audio/s-u2-tak-ti-ulaak-kiin.mp3?v=20cc26d394","audio/s-u2-tene-in-kaaba.mp3?v=3572f7d0fc","audio/s-u2-tuux-a-kaajal.mp3?v=643b373e34","audio/s-u2-yuum-bootik.mp3?v=a6725f5484","audio/s-u3-beyxan-teech.mp3?v=8f8003e601","audio/s-u3-chuupal.mp3?v=212690c6da","audio/s-u3-in-wotoch.mp3?v=55354895c5","audio/s-u3-letiob.mp3?v=d9f13a536f","audio/s-u3-minaan.mp3?v=f8bf8ec6a1","audio/s-u3-nojoch-maak.mp3?v=338f84e86c","audio/s-u3-paalal.mp3?v=7fe7f6c45e","audio/s-u3-sukuun.mp3?v=b4a3b31862","audio/s-u3-teche.mp3?v=b36982be06","audio/s-u3-teech.mp3?v=ff8cc80849","audio/s-u3-teex.mp3?v=c4aa516614","audio/s-u3-u-yotoch.mp3?v=f8db28a726","audio/s-u3-wiinik.mp3?v=db1ed9ffb9","audio/s-u3-xiipal.mp3?v=05d88af9b6","audio/s-u3-yaan.mp3?v=78111d4f62","audio/s-u3-yaan-teen.mp3?v=18a69bff57","audio/s-u4-bolon.mp3?v=d12f5ead50","audio/s-u4-bolonlajun.mp3?v=c093d1339f","audio/s-u4-jaypeel.mp3?v=3fdd7cde19","audio/s-u4-jaypeel-jaab.mp3?v=d8bd8a19c0","audio/s-u4-joolajun.mp3?v=8f822fec94","audio/s-u4-jopeel.mp3?v=1be9e1dea1","audio/s-u4-jumpeel.mp3?v=4802781c9b","audio/s-u4-jun.mp3?v=f51a43afd7","audio/s-u4-juntuul.mp3?v=ceb24f9df2","audio/s-u4-kaalajun.mp3?v=09e4e7c1cc","audio/s-u4-kaapeel.mp3?v=9c3d4d0226","audio/s-u4-kaateen.mp3?v=32296fb859","audio/s-u4-kaatuul.mp3?v=9cd4af1cb1","audio/s-u4-kampeel.mp3?v=9ae9c8bfa7","audio/s-u4-kan.mp3?v=c5204cc2d1","audio/s-u4-kanlajun.mp3?v=5eee8720dc","audio/s-u4-lajun.mp3?v=8a903f0b73","audio/s-u4-ooxlajun.mp3?v=4f18994ebb","audio/s-u4-tu-kaateen.mp3?v=614385f576","audio/s-u4-uklajun.mp3?v=33a6ce1e87","audio/s-u4-waklajun.mp3?v=433600ede9","audio/s-u4-waxak.mp3?v=42f2c5e603","audio/s-u4-waxaklajun.mp3?v=7f0a51f0aa","audio/s-u4-yaan-yaab-maak.mp3?v=f74d2b90f7","audio/s-u5-baax.mp3?v=2a87ea7214","audio/s-u5-baaxten.mp3?v=07f7a4d58e","audio/s-u5-chaambeel.mp3?v=5a38b1505d","audio/s-u5-cheen-jumpiit-maaya.mp3?v=e9da6f1a1b","audio/s-u5-janal.mp3?v=260d1834cc","audio/s-u5-ka-taan-waaj.mp3?v=1a4783da19","audio/s-u5-kanik.mp3?v=f91ca0a1de","audio/s-u5-ma-in-woojeli.mp3?v=db45448881","audio/s-u5-ma-tin-bin-mixtuux.mp3?v=039a68d052","audio/s-u5-ma-tin-naatik.mp3?v=cee7619308","audio/s-u5-maax.mp3?v=62c3499d33","audio/s-u5-taal.mp3?v=5f2f2ede75","audio/s-u5-taan-in-kanik-maaya.mp3?v=4080b25b37","audio/s-u5-tuux-ka-bin.mp3?v=8544701c9e","audio/s-u5-wenel.mp3?v=b77a554f7c","audio/s-u6-bajux.mp3?v=8ae5382dc1","audio/s-u6-bajux-u-tojol.mp3?v=e62dadf6c0","audio/s-u6-ma-wiijeni.mp3?v=85bde164c6","audio/s-u6-maan.mp3?v=35c86d62ee","audio/s-u6-manik.mp3?v=cf45cf3ab2","audio/s-u6-tojol.mp3?v=7b0976a11b","audio/s-u6-tsook-in-janal.mp3?v=bfea813c7b","audio/s-u6-yaan-waaj-jaas.mp3?v=94ef2df2f4","audio/s-u7-chiibal.mp3?v=2c3cce7329","audio/s-u7-chiibal-koj.mp3?v=4d4ed2711b","audio/s-u7-chiibal-pool.mp3?v=e67bc51eea","audio/s-u7-chokwil.mp3?v=9158746a86","audio/s-u7-in-tsootsel.mp3?v=dcc3b79d13","audio/s-u7-kaal.mp3?v=46a83bbeda","audio/s-u7-kan-chuuy.mp3?v=b4bfcede19","audio/s-u7-kojaanech-waaj.mp3?v=bbbf0e0d41","audio/s-u7-kulen.mp3?v=2abf632f5a","audio/s-u7-ma-kojaaneni.mp3?v=0d23d8f38b","audio/s-u7-minaan-tsaak.mp3?v=fdd5c184f8","audio/s-u7-paach.mp3?v=8fbf336c3e","audio/s-u7-pool.mp3?v=44ca798c8c","audio/s-u7-puksiikal.mp3?v=94190a58fb","audio/s-u7-toj-oolal.mp3?v=bad3785e57","audio/s-u7-tsak-yaj.mp3?v=d78776a02a","audio/s-u7-tsook-a-janal.mp3?v=e75f68ab4d","audio/s-u7-xikin.mp3?v=9b6e790329","audio/s-u7-yaan-waaj-tsaak.mp3?v=86f1a49888","audio/s-u7-yaj-in-koj.mp3?v=7ab7c3113f","audio/s-u7-yaj-in-nak.mp3?v=425c4cfae8","audio/s-u7-yaj-in-paach.mp3?v=54eb3715cf","audio/s-u7-yaj-in-pool.mp3?v=6699175d95","audio/s-u7-yaj-in-wook.mp3?v=ae8a515c77","audio/s-u7-yaj-waaj-a-pool.mp3?v=cab73a150e","audio/s-u8-chak.mp3?v=0400a80349","audio/s-u8-lool.mp3?v=3298f5cc8d","audio/s-u8-muuch.mp3?v=6919afcf9f","audio/s-u8-muuyal.mp3?v=a3ff16dce7","audio/s-u8-nojol.mp3?v=d0d562e6fd","audio/s-u8-taanil.mp3?v=5e7f7c9064","audio/s-u8-turix.mp3?v=8552d51b43","audio/s-u8-waye.mp3?v=391c6c421a","audio/s-u8-xaman.mp3?v=998ff012c7","audio/s-u8-yaaxche.mp3?v=a9817fe9cc","audio/s-u8-yookol.mp3?v=7b64aa8308","audio/s-u9-biin.mp3?v=b64c351f26","audio/s-u9-biin-in-jaantej.mp3?v=58ba5e13c9","audio/s-u9-binen.mp3?v=fdb230f559","audio/s-u9-janal-pixan.mp3?v=e7e497a931","audio/s-u9-janen.mp3?v=00ba918bf0","audio/s-u9-ka-suunakech.mp3?v=d494d5c121","audio/s-u9-kaabej.mp3?v=7077e5a9ae","audio/s-u9-kiimak-oolal.mp3?v=161208d5c9","audio/s-u9-kiimil.mp3?v=e76ab32443","audio/s-u9-kuxtal.mp3?v=0bb3f1cded","audio/s-u9-ma-tin-meyaj-te-suutukila.mp3?v=3f6fada5d7","audio/s-u9-meyajnajen.mp3?v=2f2a478b54","audio/s-u9-paax.mp3?v=a3156f817c","audio/s-u9-saamal.mp3?v=99430e07bb","audio/s-u9-saamal-in-bin.mp3?v=9974adbee4","audio/s-u9-taalen.mp3?v=33af7ba985","audio/s-u9-taant-in-janale.mp3?v=2577f420c1","audio/s-u9-te-suutukila.mp3?v=e6570b3b34","audio/s-u9-tin-xokaj.mp3?v=ff320f3add","audio/s-u9-yuum-bootik-taalech.mp3?v=ff893811a5"];
const PREFIX = "koox-maaya-";
const CACHE = PREFIX + VERSION;
const FONTS = PREFIX + "fonts";
const AUDIO = PREFIX + "audio";
const AUDIO_RE = /\/audio\/[a-z0-9-]+\.mp3$/;
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
const FONT_MAX = 40;            // entradas máximas en la caché de fuentes
const NAV_TIMEOUT_MS = 4000;    // con red lenta, pasado este tiempo se muestra la copia guardada
const SCOPE = self.registration.scope;
const INDEX = new URL("index.html", SCOPE).href;
// Otras páginas del sitio que se guardan (p. ej. grabar.html); sin red se sirve su copia.
const PAGES = PRECACHE.filter((p) => /\.html$/.test(p)).map((p) => new URL(p, SCOPE).href);

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async (p) => {
      const url = new URL(p, SCOPE).href;
      // cache: "reload" evita guardar una copia vieja de la caché HTTP con el nombre de esta versión.
      const res = await fetch(new Request(url, { cache: "reload" }));
      if (!res.ok) throw new Error("precarga de " + p + ": HTTP " + res.status);
      if (url === INDEX && (await res.clone().text()).indexOf(VERSION) < 0) {
        // El CDN aún sirve otro index.html: falla la instalación y el navegador reintenta después.
        throw new Error("index.html no corresponde a la versión " + VERSION);
      }
      await cache.put(url, res);
    }));
    // Audio (pueden ser cientos de archivos cortos): de 6 en 6; lo que ya está guardado no se vuelve
    // a bajar y un fallo no impide instalar la app.
    const audio = await caches.open(AUDIO);
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(6, AUDIO_PRECACHE.length) }, async () => {
      while (next < AUDIO_PRECACHE.length) {
        const url = new URL(AUDIO_PRECACHE[next++], SCOPE).href;
        try {
          if (await audio.match(url)) continue;
          const res = await fetch(url);
          if (res.ok && res.status === 200) await audio.put(url, res);
        } catch (e) { /* se guardará al escucharlo */ }
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((k) => k.startsWith(PREFIX) && k !== CACHE && k !== FONTS && k !== AUDIO)
      .map((k) => caches.delete(k)));
    if (keys.includes(AUDIO)) {
      const audio = await caches.open(AUDIO);
      const keep = new Set(AUDIO_FILES.map((p) => new URL(p, SCOPE).href));
      for (const r of await audio.keys()) if (!keep.has(r.url)) await audio.delete(r);
    }
    await self.clients.claim();
    // La página compara esta versión con la suya (window.KOOX_BUILD) y, si difieren,
    // ofrece «Actualizar».
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) c.postMessage({ type: "koox-sw-updated", version: VERSION });
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") {
    if (req.url.startsWith(SCOPE)) event.respondWith(navigate(event));
    return;
  }
  if (FONT_HOSTS.includes(url.hostname)) { event.respondWith(font(event)); return; }
  if (req.url.startsWith(SCOPE) && AUDIO_RE.test(url.pathname)) { event.respondWith(audio(req)); return; }
  if (req.url.startsWith(SCOPE)) event.respondWith(asset(req));
});

function isIndex(href) {
  const u = new URL(href);
  u.search = ""; u.hash = "";
  return u.href === SCOPE || u.href === INDEX;
}
// Clave de caché de una navegación: index.html o una de PAGES (sin ?búsqueda ni #); null si no se guarda.
function pageKey(href) {
  if (isIndex(href)) return INDEX;
  const u = new URL(href);
  u.search = ""; u.hash = "";
  return PAGES.includes(u.href) ? u.href : null;
}

function offlinePage() {
  return new Response(
    "<!doctype html><html lang=\"es\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>Ko'ox Maaya</title><body style=\"font:17px system-ui,sans-serif;padding:24px\">" +
    "<p>Sin conexión. Abre Ko'ox Maaya otra vez cuando tengas internet.</p></body></html>",
    { status: 503, headers: { "content-type": "text/html; charset=utf-8" } });
}

// Primero la red; si falla, responde mal o tarda más de NAV_TIMEOUT_MS, la copia guardada.
async function navigate(event) {
  const cache = await caches.open(CACHE);
  let req = event.request;
  try { req = new Request(event.request, { cache: "no-cache" }); } catch (e) { /* se usa la original */ }
  const key = pageKey(event.request.url);
  const fromNet = fetch(req).then(async (res) => {
    if (res.ok && res.type === "basic" && key) await cache.put(key, res.clone());
    return res;
  });
  event.waitUntil(fromNet.then(() => {}, () => {}));
  const saved = async () => (key && key !== INDEX && await cache.match(key, { ignoreVary: true })) || cache.match(INDEX, { ignoreVary: true });
  let timer;
  const late = new Promise((resolve) => { timer = setTimeout(() => resolve(null), NAV_TIMEOUT_MS); });
  try {
    const res = await Promise.race([fromNet, late]);
    if (res && (res.ok || res.type === "opaqueredirect")) return res;
    const copy = await saved();
    if (copy) return copy;
    return res || await fromNet;
  } catch (e) {
    return (await saved()) || offlinePage();
  } finally {
    clearTimeout(timer);
  }
}

// Archivos del sitio: de la caché de esta versión; si no están, de la red.
async function asset(req) {
  const hit = await caches.match(req, { cacheName: CACHE, ignoreVary: true });
  return hit || fetch(req);
}

// Audio: primero la copia guardada; si no está, se baja completo (sin Range), se guarda y se responde.
async function audio(req) {
  const cache = await caches.open(AUDIO);
  let res = await cache.match(req.url);
  if (!res) {
    let net;
    try { net = await fetch(req.url, { credentials: "same-origin" }); }
    catch (e) { return Response.error(); }
    if (!net.ok || net.status !== 200) return net;
    try { await cache.put(req.url, net.clone()); } catch (e) { /* sin espacio: se responde igual */ }
    res = net;
  }
  const range = req.headers.get("range");
  return range ? partial(res, range) : res;
}

// Respuesta 206 con el tramo pedido («bytes=inicio-fin»); con un Range que no se entiende, el archivo entero.
async function partial(res, range) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m || (!m[1] && !m[2])) return res;
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  let start, end;
  if (m[1]) { start = Number(m[1]); end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1; }
  else { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { "content-range": "bytes */" + size } });
  }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      "content-type": res.headers.get("content-type") || "audio/mpeg",
      "content-range": "bytes " + start + "-" + end + "/" + size,
      "content-length": String(end - start + 1),
      "accept-ranges": "bytes"
    }
  });
}

// Fuentes: responde con la copia guardada (si hay) y la renueva en segundo plano.
// La hoja de estilos se pide en modo CORS para guardarla como respuesta normal (no opaca).
async function font(event) {
  const cache = await caches.open(FONTS);
  const key = event.request.url;
  const hit = await cache.match(key, { ignoreVary: true });
  const fromNet = fetch(key, { mode: "cors", credentials: "omit" }).then(async (res) => {
    if (res.ok) { await cache.put(key, res.clone()); await trim(cache); }
    return res;
  });
  if (hit) { event.waitUntil(fromNet.then(() => {}, () => {})); return hit; }
  try { return await fromNet; } catch (e) { return Response.error(); }
}

async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - FONT_MAX; i++) await cache.delete(keys[i]);
}
