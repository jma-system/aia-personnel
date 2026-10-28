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
