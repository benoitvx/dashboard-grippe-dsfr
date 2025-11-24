# 📊 Tableau de bord Grippe

Suivi en temps réel de l'épidémie de grippe en France : incidence, hospitalisations, vaccination.

🔗 **[Voir le dashboard](https://dashboard-grippe-dsfr.vercel.app)**

## 🎯 Objectif

Ce tableau de bord permet aux citoyens et décideurs de suivre l'évolution de l'épidémie de grippe en France avec des données actualisées quotidiennement. Il regroupe des indicateurs épidémiologiques et de vaccination issus de sources officielles.

## 📈 Fonctionnalités

### Épidémiologie
- **Situation nationale** : Taux d'incidence actuel et évolution
- **Carte régionale** : Intensité de l'épidémie par région
- **Comparaison historique** : Évolution vs saisons précédentes
- **Pression hospitalière** : Hospitalisations après passage aux urgences

### Vaccination
- **Couverture vaccinale** : Nombre de doses délivrées
- **Évolution campagne** : Comparaison entre saisons
- **Rôle des pharmacies** : Actes de vaccination (VGP)
- **Carte interactive** : Lieux de vaccination à proximité

## 📊 Sources de données

- **[Sentiweb](https://www.sentiweb.fr)** : Incidence nationale et régionale
- **[Santé Publique France](https://odisse.santepubliquefrance.fr)** : Hospitalisations
- **[IQVIA](https://www.data.gouv.fr/fr/organizations/iqvia-france/)** : Données de vaccination
- **[data.gouv.fr](https://www.data.gouv.fr)** : Lieux de vaccination

## 🛠️ Technologies

- **Next.js 15** + TypeScript
- **[DSFR](https://www.systeme-de-design.gouv.fr/)** (Système de Design de l'État)
- **Recharts** pour les visualisations
- **Leaflet** pour la cartographie
- **SWR** pour le data fetching

## 🚀 Développement
```bash
# Installation
npm install

# Lancement
npm run dev

# Build
npm run build
```

## 📝 Licence

Projet expérimental d'exploration de données publiques.

---

*Réalisé avec Claude Code & Claude.ai*
