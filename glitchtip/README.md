# GlitchTip — suivi des erreurs

Ce dossier accueillera la configuration et les scripts de la phase **GlitchTip** du projet :

- Création de l'organisation et du projet GlitchTip, récupération du **DSN** ;
- Intégration du SDK (compatible Sentry) dans l'application web pour capturer les erreurs du tunnel d'achat ;
- Configuration des alertes et documentation associée.

L'infrastructure est déjà en place : GlitchTip tourne sur [http://localhost:8398](http://localhost:8398) (voir `compose.yml` à la racine : services `glitchtip-web`, `glitchtip-worker`, `glitchtip-migrate`, `glitchtip-postgres`, `glitchtip-redis`).
