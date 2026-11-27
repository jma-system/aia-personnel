# AIA — Standard de reproduction des fiches illustrées
Date : 25 novembre 2026. Statut : **gabarit de référence documenté**, reproduction en série **à tester fiche par fiche**.
Références : fiche **FAMILLE** (modèle visuel strict), fiche **PRIÈRE** (comparaison), fiche **JÉSUS** (pilote accepté par l’utilisateur). Code pilote : `v09-test/fiches/jesus.html`. Module de classement : `v09-test/modules/import-image-test.js`.

## 1. Ce qu'il faut reproduire sans réinventer la maquette
- Visionneuse : fond noir ; fiche centrée, sans occuper tout l’écran ; bouton **X** rond **entièrement dans la zone noire, dégagé du signet** ; fermeture vers le Répertoire et les thèmes, pas vers l’accueil général d’AIA.
- Bandeau bleu : flèche gauche, titre `Thème – [sujet]`, signet blanc visible **non activé pour le moment**.
- Carte bleu très clair, coins arrondis ; bandeau de titre bleu clair avec trait vertical turquoise. **Une seule occurrence du titre/question**, jamais une répétition sous la miniature.
- Composition : **illustration portrait à gauche**, **trois encadrés superposés à droite**. Aligner le haut de l’image sur celui du premier encadré ; conserver la largeur, hauteur, écarts, marges et arrondis du modèle FAMILLE. Recadrer par `object-fit: cover` seulement si cela ne coupe pas un élément essentiel ; ajuster `object-position` pour chaque nouvelle illustration.
- Texte : **Verdana** telle que validée à l’écran pour le Répertoire, noir ; même hiérarchie, taille visuelle, interligne et retours à la ligne que FAMILLE. Référence biblique en **bleu, soulignée, directement sous son paragraphe**, sans tabulation ni espace distribué ; proscrire `justify-content:space-between` dans les encadrés.
- Bas de carte : **QR code**, **PDF** avec symbole de téléchargement et **Partager** avec véritable icône, tous trois alignés, à la taille et dans l’ordre du modèle FAMILLE.
- Ne pas remplacer le gabarit final par une capture d’écran cliquable par coordonnées : créer du **HTML/CSS et de vrais liens** pour l’accessibilité et la robustesse responsive.

## 2. Fiche et liens bibliques
- Pour les six fiches déjà validées, conserver leurs éléments existants sans remplacement. Pour toute **nouvelle** fiche issue d'une publication JW.org, utiliser le PDF comme référence de recherche, mais produire une rédaction et une mise en page originales ; ne pas reproduire automatiquement le texte ni les illustrations protégées. Contrôler chaque référence biblique à partir de la source officielle avant de fabriquer les liens. Les droits d'auteur restent applicables malgré le changement de mise en page.
- Gabarit commun documenté dans `v09-test/standards/gabarit-six-fiches.json`, visible dans **AIA → RÉGLAGES**. Il sert de référence pour de futures fiches, sans application automatique aux six fiches existantes.
- Chaque référence est un élément `<a>` distinct vers la **Traduction du monde nouveau sur JW.org**, ouvrant exactement le bon chapitre/verset ; vérifier avec le téléphone, ne pas se contenter de la présence du lien dans le code.
- Pilote JÉSUS : Matthieu 7:12, Jean 13:34,35, Matthieu 11:28-30 — **les trois destinations ont été validées sur le Honor par l’utilisateur** le 25/11/2026.
- QR : doit pointer vers la fiche réelle ; bouton PDF : tester la génération / impression au format PDF ; Partager : vérifier l’interface de partage Android. Ne pas prétendre ces trois fonctions validées sans test.

## 3. Importation et classement
- Préparer une fiche originale, puis la transposer au gabarit, activer les références et seulement ensuite remplacer/ajuster l’illustration définitive si nécessaire.
- Une fiche = **un contenu source commun**, réutilisé dans plusieurs classements (ex. JÉSUS sous **TRACTS → J** et **THÈMES → Jésus**) ; éviter les doublons d’enregistrement et les liens de navigation parallèles.
- Ne pas ajouter de titre ou lien de test au-dessus des rubriques du Répertoire ; utiliser l’accès normal par sa miniature, sans seconde question en dessous.
- Vérifier aussi la navigation de fermeture pour les deux chemins d’accès ; tester en conditions réelles sur **Honor 400 Lite**.

## 4. Développement et sécurité
- **ACTION → TEST → PREUVE → VALIDATION** : faire un seul module/une seule fiche à la fois ; comparer ses captures au modèle FAMILLE, corriger et faire valider avant la série suivante.
- Avant chaque intervention : lire le code actuel et les ressources ; ne pas accumuler des règles CSS contradictoires ni créer de nouvelles URLs pour contourner un bug non diagnostiqué. Préserver une URL stable, vérifier le commit GitHub et la publication GitHub Pages ; différencier preuve du code et preuve du rendu sur Honor.
- Aucun code à coller par l’utilisateur : modifications effectuées dans GitHub par l’assistant, puis contrôle tactile par l’utilisateur.
- Ne rien changer aux modules AIA CVM, TG ou fiches déjà validées ; ne jamais effacer les contenus existants sans export sécurisé.
- **Aucun nouveau stockage persistant dans le navigateur**. Attention : l’IndexedDB et le localStorage préexistants d’AIA sont encore présents et nécessitent un chantier séparé après sécurisation des exports ; ne pas présenter leur suppression comme réalisée.
- **Signets reportés à plus tard** : conserver le pictogramme visible mais non interactif ; ne pas réactiver `aia-bookmarks.js` dans les pages tant que ce chantier n’est pas validé.

## 5. Checklist d’acceptation pour chaque nouvelle fiche
1. Même dimension et alignement visuel que FAMILLE : cadre, titre, image, trois encadrés, marges, boutons, X séparé du signet.
2. Aucun texte tronqué ni doublon ; référence bleue immédiatement sous le texte, typographie Verdana.
3. Tous les liens de versets ouvrent précisément la bonne référence JW.org.
4. QR code, PDF, Partager et retour au Répertoire testés.
5. Visible aux classements demandés sans doublon ; aucun impact sur les autres fiches.
6. Capture et essai sur Honor ; utilisateur donne **validation explicite** avant duplication en série.

## 6. Statut réel
- Gabarit FAMILLE : référence visuelle acceptée.
- Pilote JÉSUS : apparence et 3 liens JW.org acceptés par l’utilisateur, correction X et double classement TRACTS/J + THÈMES/Jésus explicitement appréciés ; **signets reportés**.
- Production automatisée des autres fiches, PDF et contrôles QR/partage pour chaque nouvelle fiche : **à tester**, pas encore validés en série.
