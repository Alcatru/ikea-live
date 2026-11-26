# IKEA live – « public is client »

Page web interactive pour la présentation du cas IKEA (Innovation Strategy, Université de Fribourg).
Projet étudiant, sans lien avec IKEA. Aucune donnée personnelle n'est collectée.

## Les trois pages

| Page | Pour qui | Rôle |
|---|---|---|
| `index.html` | le public (QR code) | carte client tirée au hasard + plan du magasin qui s'allume à chaque Step |
| `screen.html?phase=…` | le PowerPoint (complément Web Viewer) | fait avancer tous les téléphones **et** affiche les résultats de la salle |
| `control.html` | un présentateur (secours) | télécommande manuelle + bouton « New session » |

Phases : `join` (QR), `s0` … `s5` (une par Step), `end` (revote final, à mettre sur la dernière slide des recommandations).

## Pilotage depuis PowerPoint

Sur la slide d'ouverture de chaque Step : Insertion › Compléments › **Web Viewer**, avec l'adresse
`https://alcatru.github.io/ikea-live/screen.html?phase=s0` (puis `s1`, `s2`…).
Quand la slide s'affiche, tous les téléphones passent au Step correspondant.
Le pilotage n'avance que vers l'avant (revenir en arrière dans le diaporama ne recule pas les téléphones) ; `&force=1` l'autorise.

Options d'adresse :
- `&view=none` : déclenche sans rien afficher (petit cadre discret).
- `&view=map` : affiche seulement le plan.
- `&drive=0` : affiche sans déclencher.
- `&demo=40` : données fictives, sans réseau (répétitions, captures de secours).
- `&room=xxx` : salle séparée (pour les tests, sans déranger la vraie salle).

Avant de présenter : ouvrir `control.html` et appuyer sur **New session** (deux fois).

## Technique

Pages statiques (GitHub Pages) + temps réel via un broker MQTT public (`broker.hivemq.com`, WebSocket sécurisé).
Bibliothèques incluses dans `lib/` (mqtt.js 5.10.1, qrcode-generator 1.4.4).
