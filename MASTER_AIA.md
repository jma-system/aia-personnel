# MASTER AIA — MÉMOIRE PROJET
Mise à jour : 27 octobre 2026

## OBJECTIF
AIA est un assistant personnel d'étude, utilisable sur téléphone Android.
Sources prioritaires : jw.org, WOL et JW Library.

## INTERFACE
- Accueil fixe : poste de commande.
- Calendrier, CVM et TG.
- Choix du sujet ou du discours.
- Trois formats : Tract, Fiche, Étude approfondie.
- Enregistrer plusieurs demandes puis lancer Création.
- Une fiche par page, navigation par flèches et glissement.
- Présentation sobre, lisible, inspirée de JW Library.

## FICHES
- Création et modification de brouillons.
- Validation humaine avant export.
- Sauvegarde persistante à tester sur plusieurs sessions et appareils.
- Saisie texte et dictée vocale du téléphone.
- Génération automatique par IA : non encore opérationnelle.

## PDF
- Export d'une ou plusieurs fiches validées.
- Une fiche par page.
- Chaque résumé dans son propre encadré.
- Fond blanc, texte noir, Arial 12.
- Couleurs uniquement sur les bordures, adaptées aux publications de la semaine.
- Test réel du 27/10/2026 : export groupé de deux fiches, PDF enregistré et ouvert sur Android.

## TECHNIQUE
- Dépôt GitHub : jma-system/aia-personnel.
- Hébergement : GitHub Pages.
- Application actuelle : index.html.
- README.md présent.
- Fonctionnement constaté sur téléphone Android.
- Stockage local : sauvegarde longue durée et restauration à vérifier.
- Aucune clé API dans GitHub ou le navigateur.
- Si backend IA : secret serveur nommé OPENAI_API_KEY.

## MÉTHODE
ACTION → TEST → PREUVE → VALIDATION.
Une seule mission de développement à la fois.
Ne jamais déclarer une fonction validée sans test réel.
Priorité à l'usage, à la simplicité et au coût minimal.

## PROCHAINES ÉTAPES
1. Sécuriser la mémoire du projet.
2. Vérifier la conservation des fiches après fermeture et réouverture.
3. Tester la mise en page PDF sur de vrais contenus.
4. Améliorer l'interface selon les choix validés.
5. Étudier la génération IA sécurisée.
6. Tester le parcours complet de bout en bout.

## CHECKPOINT V08 — 28 octobre 2026
- Accès GitHub en écriture PROUVÉ : branche aia-v08-modules créée après installation du connecteur sur le compte propriétaire.
- Conservation de deux fiches après fermeture de Chrome : confirmée par Phil le 28/10. Conservation longue durée et multi-appareils non validée.
- Couleurs de la nouvelle maquette : décision différée après le build. Aucun nouveau périmètre fonctionnel déduit de la maquette.
- Architecture : fonctionnalités isolées, dépendances explicites, modifications minimales, tests séparés ; méthode applicable aussi à JW Desk puis SCOREIA.

### Blocs et dépendances
| Bloc | Fichier | Dépendances | État |
| --- | --- | --- | --- |
| Base V07 : fiches, navigation, PDF | index.html | localStorage aia-v07-fiches et aia-v07-queue | version fonctionnelle préservée |
| Aperçu V08 | v08/index.html | copie de la base et deux scripts ajoutés | À TESTER sur Honor |
| Programme CVM et cases à cocher | v08/modules/cvm.js | data/cvm.json et AIACvmBridge | tests DOM passés ; téléphone non validé |
| Adaptateur de sélection | v08/modules/cvm-bridge.js | file queue, QKEY, queueStatus existants | écrit uniquement dans la file des demandes |
| Programme officiel vérifié | v08/data/cvm.json | JW.org et WOL | semaine 26/10–01/11/2026 uniquement |
| Clair / Nuit | à créer | préférence locale indépendante | non commencé |

### Preuves et limites du bloc CVM
- Titres et numéros des huit sujets recoupés le 28/10 sur https://wol.jw.org/fr/wol/d/r30/lp-f/202026259 et la page JW.org correspondante liée dans le JSON.
- Instantané vérifié, PAS de recherche ou mise à jour automatique. Pour une autre semaine : message explicite et lien WOL daté ; aucun ancien programme substitué.
- Sélection multiple enregistrée avec date et format choisis. La création reste manuelle comme en V07 ; aucune génération IA ajoutée.
- Tests DOM : huit cases, deux demandes persistées, semaine absente sans sujets périmés, masquage du bouton sous TG, conservation des fiches témoins, navigation, deux entrées d'impression, refus d'écriture localStorage sans modification de la file.
- Tests syntaxiques JS passés. Script applicatif V07 conservé intégralement dans l'aperçu. Navigateur de test indisponible dans le conteneur : contrôle visuel et impression PDF réels À TESTER sur téléphone.
- Aperçu destiné à https://jma-system.github.io/aia-personnel/v08/ ; index.html racine inchangé. Même origine : les fiches et la file de demandes sont partagées avec V07. Le bloc CVM n'écrit jamais dans les fiches.
- Retour à la version habituelle : ouvrir https://jma-system.github.io/aia-personnel/ . Ne pas effacer les données Chrome.
- Aucune suppression de dépôt. Aucune clé API utilisée.

### Prochaine action
Ouvrir l'aperçu V08 sur Honor, sélectionner CVM puis ouvrir le programme ; vérifier l'affichage avant de tester l'enregistrement multiple. Valider uniquement après preuve téléphone. Ensuite bloc Clair / Nuit.

## PREUVE TÉLÉPHONE CVM — 28 octobre 2026, 14 h 06 (heure affichée sur Honor)
- Capture 38677 : programme de la semaine et huit cases affichés sur Honor 400 Lite.
- Phil confirme deux sélections ; capture 38678 : deux demandes en attente.
- Captures 38680/38681 : sujet 1 créé manuellement avec « Test sujet 1 », sauvegardé puis validé ; total trois fiches.
- Capture 38682 : sujet 2 « Perles spirituelles », texte « Test sujet 2 », sauvegardé et validé ; total quatre fiches.
- Après demande de fermeture/réouverture, capture 38683 : quatre fiches validées visibles, dont les deux fiches initiales « Test HTTPS » et « Test pdf 2 ».
- PROUVÉ EN TEST SUR TÉLÉPHONE : affichage CVM, sélection multiple, passage successif des deux demandes à des fiches manuelles et conservation des quatre fiches après réouverture.
- Non démontré séparément : conservation d'une file encore non traitée après réouverture. Non validés : actualisation automatique, génération IA, PDF de V08 sur téléphone.
- Prochaine action : exporter ensemble les deux fiches de test CVM et vérifier le PDF sur Android, puis bloc Clair / Nuit.

## CLÔTURE TEST CVM ET BLOC THÈME — 28 octobre 2026
- Capture 38685 : aperçu d'impression Android de deux sujets CVM, sur deux pages distinctes. Phil confirme ensuite l'enregistrement du PDF (« C fait »). Export groupé de ces deux fiches PROUVÉ sur téléphone. Réouverture du PDF enregistré non testée dans cette séquence.
- Le parcours CVM de cette semaine est PROUVÉ sur Honor : huit sujets affichés, sélection de deux sujets, création manuelle séparée, validation, conservation et export groupé. La mise à jour hebdomadaire automatique et la génération IA restent non implémentées.

### Bloc Clair / Nuit — PRÉPARÉ, validation téléphone en attente
- v08/modules/theme.js : bouton en-tête, état accessible aria-pressed, préférence locale isolée aia-preference-theme ; défaut clair.
- v08/modules/theme.css : styles uniquement écran, palette provisoire sobre ; couleurs finales après le build. La feuille est chargée avec media=screen et ses règles sont dans @media screen.
- Dépendances : header et document.documentElement, localStorage uniquement pour la préférence ; toast message facultatif si mémorisation impossible. Aucun accès aux clés des fiches ou à la file des demandes.
- v08/index.html : ajout du lien CSS et du module ; script V07 préservé intégralement. index.html racine non modifié.
- Tests DOM passés : clair par défaut, bascule nuit, restauration du choix dans une nouvelle page simulée, retour clair, absence de bouton dupliqué, stockage refusé sans blocage, clés fiches et demandes inchangées. Vérification syntaxique JS passée. Tests CVM précédents repassés avec succès.
- Rendu visuel et PDF en mode Nuit À TESTER sur Honor ; ces tests DOM ne valident pas le rendu d'un navigateur réel.
- Prochaine action : ouvrir /v08/?theme=1 sur Honor, appuyer sur Clair et vérifier le passage en Nuit, puis fermer/réouvrir pour contrôler la mémorisation ; ensuite vérifier que le PDF reste blanc.

## VALIDATION THÈME ET CADRAGE V09 — 28 octobre 2026
- Phil confirme le fonctionnement Clair / Sombre ; capture 38686 : accueil sombre.
- Phil confirme que le mode Sombre est conservé après fermeture de l'onglet et réouverture.
- À la demande de vérifier le PDF en mode Sombre (page blanche, texte noir), Phil répond « Oui ». Confirmation utilisateur ; capture 38687 montre la fiche en mode Nuit, pas l'aperçu PDF. Ne pas présenter cette capture comme preuve visuelle du PDF.
- Bloc Clair / Nuit VALIDÉ sur les tests et confirmations de Phil : bascule, préférence mémorisée, PDF annoncé blanc/noir. Les quatre fiches restent visibles sur la capture 38687.
- Chantier V08 actuel terminé pour le périmètre testé : instantané CVM de la semaine, sélection multiple vers création manuelle, conservation des fiches, PDF groupé, thème indépendant.
- Restent hors validation V08 : actualisation hebdomadaire automatique, recherche réelle et génération IA, persistance multi-appareils ou longue durée.

### Cahier des charges V09 reçu — ne vaut PAS autorisation de modifier immédiatement le code
1. Accueil compact suivant maquette : titre Assistant IA, supprimer commentaire de préparation et compteur en en-tête ; garder CVM/TG, formats et actions ; couleurs définitives différées.
2. Accès bas : JW.org dans nouvel onglet, Vidéos (ancien JW Desk), Mes fiches vers dossier externe de PDF AIA, Index vers autre dossier externe de PDF existants ; emplacements à choisir. Ne pas confondre avec bibliothèque locale V08.
3. Recherche multi-IA : saisie, microphone selon compatibilité, choix ChatGPT/Claude/Gemini/DeepSeek et modèles ultérieurs, réponses affichées. Architecture serveur sécurisée, aucune clé navigateur ou dépôt, opérationnalité seulement après tests ; orientation MANDO future.
4. Nouvelle doctrine de stockage : travail temporaire, aucune conservation persistante des fiches dans le navigateur ; PDF exportés manuellement dans dossiers externes. Préserver les quatre fiches existantes jusqu'à sécurisation de leur export. La fermeture du navigateur seule ne garantit pas l'effacement ; mécanisme à concevoir et tester.
5. Aucun coût ou abonnement supplémentaire sans autorisation explicite. Modules autonomes et tests Honor.
- V09 non appliquée. Prochaine proposition à Phil : commencer par le bloc de présentation compacte, puis accès externes et migration des fiches après export sécurisé ; recherche multi-IA après cadrage technique. Attendre son accord sur le prochain bloc avant de coder V09.
