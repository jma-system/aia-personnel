---
name: aia-fiches-pdf
description: Auditer, corriger et valider l'importation des PDF et images dans le Répertoire AIA sur Android, sans régression ni perte de données.
---

# AIA — Skill de fiabilisation des fiches PDF et illustrées (v1)

## Mission
Rendre l'importation PDF et image reproductible, testable et sûre dans `v09-test/`. Ne jamais prétendre qu'un bug est corrigé sans preuve d'un test réel. Ce document est une procédure, non un correctif exécuté.

## Référence et périmètre
- Sources à auditer : `v09-test/modules/fiches-pdf-import-v17.js`, `v09-test/modules/import-image-test.js`, `v09-test/modules/index-interactif.js`, `v09-test/index.html`.
- Cible : navigateur Chrome sur Honor Android, sans abonnement ni service payant.
- Conserver les onglets TRACTS / FICHES / THÈMES, l'alphabet, les fiches existantes et le gabarit visuel FAMILLE.
- Ne pas effacer IndexedDB, le cache, les enregistrements ni les images sans sauvegarde vérifiée.
- La sauvegarde IndexedDB seule n'est pas durable contre l'effacement des données de site. Exiger une sauvegarde externe vérifiable et une procédure de restauration.

## Problèmes repérés dans le code (à confirmer par tests)
1. `extractZone` dépend de coordonnées PDF fixes : échec si mise en page, taille, orientation ou extraction de texte diffèrent.
2. `extractTract` exige titre 12–160 caractères, citation entre guillemets français et référence entre parenthèses : rejets injustifiés possibles, notamment pour le tract « Souffrances ».
3. Découpage de listes par caractères de puces et minimum de trois passages : variantes de police/encodage non prises en charge.
4. Reconnaissance spéciale de Dieu, Avenir et Royaume, dont une branche dépend du nom du fichier : risque de faux négatifs et comportement non généralisable.
5. Découpe photo/QR en proportions fixes, sans contrôle de cadrage ni décodage QR.
6. Deux chemins distincts : prévisualisation PDF sans sauvegarde automatique, stockage des images dans IndexedDB; parcours de validation et de persistance à relier explicitement.
7. Le sélecteur d'image de remplacement dans l'importateur PDF utilise encore `picker.click()` sur un input masqué; comparer avec le correctif natif validé dans `import-image-test.js`.
8. Vérifier les URL JW.org construites depuis `parsedReferences` : accentuation des slugs, références multiples et liens directs exacts.
9. Vérifier les erreurs d'initialisation, l'état `ready`, les échecs IndexedDB, les doublons, les suppressions, les remplacements et le chargement après actualisation.
10. Vérifier le chargement CDN de PDF.js, les PDF scannés sans couche texte, la taille des PDF et les limites mémoire du téléphone.

## Procédure obligatoire
1. Faire l'inventaire des cas avec PDF originaux, captures et résultats attendus. Sans fichier source, ne pas inventer l'extraction ni annoncer un succès.
2. Reproduire chaque échec, conserver le message exact, identifier le module et la cause. Classer : PROUVÉ / SUSPECTÉ / NON TESTÉ.
3. Corriger la cause commune, non chaque tract individuellement. Détecter le type de PDF par contenu et géométrie, avec tolérance contrôlée; si extraction incertaine, proposer une correction manuelle, jamais fabriquer texte ou références.
4. Séparer lecture PDF, extraction structurée, prévisualisation, validation, persistance, classement et export. Aucune sauvegarde avant validation explicite.
5. Prévoir sauvegarde externe et restauration testée avant toute migration ou changement du schéma IndexedDB.
6. Tester sur au moins : Avenir, Dieu, Royaume, Souffrances, un PDF non conforme, un PDF sans couche texte, et une image depuis Galerie.
7. Pour chaque fiche, vérifier : image cadrée, titre, citations, URL JW.org, QR lisible, classements, suppression, remplacement, rechargement et sauvegarde/restauration.
8. Ne pas modifier le design. Livrer un seul changement cohérent, un rapport court et un lien de test. Limiter à 2–3 cycles de corrections par fiche; si échec, arrêter et diagnostiquer la cause générale.

## Critères de validation
- Aucun plantage, écran bloqué, vignette cassée ou perte de fiche existante.
- Import natif Android fonctionnel et fichiers PDF compatibles traités correctement.
- Les PDF non compatibles affichent un diagnostic précis et une option de correction sans perte de données.
- Aucun verset ou QR supposé valide sans vérification.
- Une fiche validée peut être retrouvée après fermeture/actualisation; une sauvegarde externe permet de la restaurer après suppression des données du site.
- Chaque statut doit être rapporté comme DOCUMENTÉ / À TESTER / PROUVÉ EN TEST / VALIDÉ SUR TÉLÉPHONE.

## Automatisation GitHub installée (26/11/2026)
- Workflow : `.github/workflows/aia-pdf-checks.yml`.
- Tests statiques : `scripts/aia-pdf-checks.cjs` (Node.js 22, sans dépendance).
- Déclenchement : push / pull request sur les fichiers concernés et lancement manuel depuis Actions.
- Vérifie la syntaxe JavaScript, la présence des modules et des points d'entrée critiques.
- Ce workflow **ne corrige pas automatiquement** le code, n'importe pas de PDF, ne sauvegarde pas les images et ne simule pas un téléphone Android.
- Un succès CI signifie seulement **contrôles statiques réussis**. Les bugs fonctionnels, PDF réels, QR, versets, sauvegarde externe et ergonomie restent **À TESTER** jusqu'à preuves.
- Ne pas déclencher de déploiement destructif, ni de migration IndexedDB automatique.
