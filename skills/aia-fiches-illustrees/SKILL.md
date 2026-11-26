# Skill AIA — fiches illustrées et références bibliques (v1)

## Mission
Réutiliser les corrections validées dans AIA pour importer, enregistrer et rendre interactives les fiches illustrées, sans refaire les mêmes corrections à chaque fiche.

## Périmètre et preuves
- Application : `v09-test/` dans `jma-system/aia-personnel`.
- **Validé visuellement par l'utilisateur (26 novembre 2026)** : la fiche « Le Royaume de Dieu » est présente dans THÈMES avec la bonne illustration.
- **Validé par test utilisateur** : les trois zones de références bibliques de la fiche fonctionnent et ouvrent JW.org ; capture attestant l'ouverture de Daniel 2:44 au verset.
- **Non validé** : import PDF générique de centaines de fiches, résistance à l'effacement des données navigateur, maintien de liens interactifs dans les PNG téléchargés, conformité de tous les autres tracts.

## Sources de code existantes
1. `v09-test/modules/fiches-pdf-import-v17.js` : extraction PDF, visualisation, bouton « Enregistrer dans AIA », génération PNG, téléchargement de sauvegarde, événement `aia:save-pdf-fiche`.
2. `v09-test/modules/import-image-test.js` : réception de l'événement, stockage dans le Répertoire, affichage THÈMES, superposition de liens tactiles et liens de secours vers la Bible d'étude.
3. `v09-test/index.html` : chargement des scripts et invalidation du cache.

## Correctifs réutilisables

### A. Sauvegarde d'une fiche importée
- Dans le visualiseur PDF, l'action « Enregistrer dans AIA » demande le thème, génère une image PNG, télécharge une copie, puis émet `aia:save-pdf-fiche` avec `{requestId, blob, topic, label}`.
- Le Répertoire vérifie les paramètres, ajoute une fiche sans effacer les précédentes, puis répond par `aia:pdf-fiche-saved` ou `aia:pdf-fiche-save-failed`.
- Le stockage actuel du Répertoire est **IndexedDB local au navigateur** : une copie PNG téléchargée n'est pas une sauvegarde automatique du classement, des hotspots ni de tous les métadonnées. Prévoir export/import externe structuré avant de qualifier la conservation de « permanente ».

### B. Liens vers la Bible d'étude
- La fiche « Le Royaume de Dieu » utilise `kingdomReferences` dans `import-image-test.js` : quatre entrées de versets, avec URL et coordonnées des zones tactiles.
- URLs existantes :
  - Psaume 37:10, 11 : `https://www.jw.org/fr/biblioth%C3%A8que/bible/bible-d-etude/livres/psaumes/37/#v19037010`
  - Daniel 2:44 : `https://www.jw.org/fr/biblioth%C3%A8que/bible/bible-d-etude/livres/daniel/2/#v27002044`
  - Daniel 7:14 : `https://www.jw.org/fr/biblioth%C3%A8que/bible/bible-d-etude/livres/daniel/7/#v27007014`
  - Isaïe 65:21-23 : `https://www.jw.org/fr/biblioth%C3%A8que/bible/bible-d-etude/livres/isaie/65/#v23065021`
- Le code crée des ancres `<a>` avec `target="_blank"`, `rel="noopener noreferrer"`, et des libellés accessibles.
- En complément des hotspots superposés à l'image, `kingdomStudyLinks` fournit des liens tactiles visibles indépendants du recadrage.
- **Ne pas réutiliser les coordonnées de « Royaume de Dieu » sur d'autres fiches** : les références, URL et emplacements doivent être calculés et vérifiés fiche par fiche.

### C. Gabarit et remplacement d'image
- Préserver la présentation approuvée : titre, image à gauche, encadrés de références à droite, QR, PDF, Partager.
- Permettre le remplacement de l'illustration sans recréer la fiche.
- Les captures d'écran peuvent inclure des bordures ou l'interface : éviter de les confondre avec l'illustration originale.

## Procédure pour chaque nouvelle fiche
1. Inspecter le PDF source et identifier réellement ses pages, son titre, les citations et les références. Ne pas rejeter un PDF valide sur la seule base de coordonnées fixes d'extraction.
2. Générer la fiche dans le gabarit existant, sans inventer ni modifier les citations.
3. Importer ou remplacer la bonne illustration.
4. Enregistrer dans le thème choisi et vérifier sa présence après réouverture.
5. Construire les URL de la Bible d'étude correspondant à **chaque référence réelle**. Ne pas copier aveuglément les liens d'une autre fiche.
6. Rendre les références tactiles avec des ancres HTML accessibles ; fournir un mécanisme indépendant des coordonnées d'image si nécessaire.
7. Tester l'ouverture au bon livre, chapitre et verset ; vérifier les liens depuis l'emplacement final (THÈMES ou TRACTS).
8. Conserver un export de sauvegarde externe vérifiable.

## Critères d'acceptation avant généralisation
- Import PDF réussi pour plusieurs PDF représentatifs, y compris les PDF en deux pages qui échouaient auparavant.
- Image correcte, sans capture parasite, et mise en page fidèle.
- Tous les versets ouvrent la Bible d'étude au bon passage sur Android.
- Enregistrement et réouverture fonctionnels ; aucun écrasement des autres fiches.
- Export/import de sauvegarde restaurent images, catégories, références et liens, y compris après suppression des données du site.
- Maximum deux ou trois cycles de correction par fiche ; corriger les causes dans le module commun, pas dans chaque fiche.

## Consignes pour l'agent de développement
- Lire le code réel avant de modifier. Faire une modification ciblée, puis un test reproductible.
- Factoriser la définition des références, la génération des URL, les ancres tactiles, le stockage et la restauration dans des modules communs.
- Ne pas déclarer « validé » avant confirmation du test utilisateur.
- Éviter les versions supplémentaires sans nécessité et ne pas changer les fiches existantes sans préserver les données.
- Ne pas supposer que ce fichier SKILL.md s'exécute automatiquement : c'est une procédure persistante versionnée, à invoquer ou intégrer explicitement dans le workflow de développement.
