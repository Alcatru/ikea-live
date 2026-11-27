# IKEA live – « public is client »

Page web interactive pour la présentation du cas IKEA (Innovation Strategy, Université de Fribourg).
Projet étudiant, sans lien avec IKEA. Aucune donnée personnelle n'est collectée.

## Liens

- **Public (QR code)** : https://alcatru.github.io/ikea-live/
- **Télécommande de secours** : https://alcatru.github.io/ikea-live/control.html
- Écran de la salle (pour test) : https://alcatru.github.io/ikea-live/screen.html?phase=join

## Les trois pages

| Page | Pour qui | Rôle |
|---|---|---|
| `index.html` | le public (QR code) | se placer sur la carte, répondre aux questions ; affiche « Look up! » le reste du temps |
| `screen.html?phase=…` | le PowerPoint (complément « IKEA live ») | fait avancer tous les téléphones **et** affiche les résultats de la salle |
| `control.html` | un présentateur (secours) | télécommande manuelle + bouton « New session » |

**4 moments seulement** : `join` (QR + premier vote, slide 1), `s0` (Step 0), `s3` (Step 3), `end` (vote final après les recommandations).

## Pilotage depuis PowerPoint

Le deck contient le complément gratuit **IKEA live** (`addin/ikea-live-manifest.xml` → `addin.html`) sur les 4 slides live.
Installation unique sur le PC qui projette : `installer_ikea_live.bat` (en administrateur).
Quand une slide live s'affiche, tous les téléphones passent au moment correspondant. Le pilotage n'avance que vers l'avant (`&force=1` l'autorise).

Sans réseau, l'écran passe tout seul en version « mains levées » après 7 s ; des slides de secours cachées suivent chaque slide live.

**Avant de présenter** : ouvrir la [télécommande](https://alcatru.github.io/ikea-live/control.html) et appuyer deux fois sur **New session**.

Options d'adresse de `screen.html` :
- `&demo=40` : données fictives, sans réseau (répétitions).
- `&offline=1` : force la version « mains levées ».
- `&room=xxx` : salle séparée (tests, sans déranger la vraie salle).

## Technique

Pages statiques (GitHub Pages) + temps réel via un broker MQTT public (`broker.hivemq.com`, WebSocket sécurisé).
Bibliothèques incluses dans `lib/` (mqtt.js 5.10.1, qrcode-generator 1.4.4).
