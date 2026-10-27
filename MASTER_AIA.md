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
