# Umami — analytics

Ce dossier accueillera la configuration et les scripts de la phase **Umami** du projet :

- Création du site dans Umami et récupération du **website ID** / script de tracking ;
- Intégration du tracking dans l'application web (pages vues + événements personnalisés du tunnel d'achat) ;
- Définition des événements métier à suivre et documentation associée.

L'infrastructure est déjà en place : Umami tourne sur [http://localhost:8399](http://localhost:8399) (voir `compose.yml` à la racine : services `umami` et `umami-postgres`).
