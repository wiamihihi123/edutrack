# EduTrack - Plateforme de gestion des étudiants

## 🎯 Objectif
EduTrack est une plateforme complète permettant aux écoles et centres de formation de gérer efficacement les étudiants, classes, enseignants et cours, tout en offrant un espace personnel aux élèves.

## ✨ Fonctionnalités principales

### 🏛️ Espace Administration
- **Gestion des étudiants** : Ajout, modification, suppression
- **Gestion des classes** : Nom, filière, niveau, effectif
- **Gestion des enseignants** : Matières, emploi du temps
- **Gestion des matières et cours**
- **Planning** : Création/modification du calendrier des cours
- **Saisie des notes et absences**
- **Tableau de bord** : Statistiques (nombre d'étudiants, absences, moyenne générale)

### 👨‍🎓 Espace Étudiant
- Consultation des notes par matière
- Emploi du temps personnel
- Suivi des absences
- Notifications email/SMS (résultats, changements de cours, rappels d'examen)

### 👨‍🏫 Espace Enseignant
- Consultation des cours assignés
- Marquage des présences/absences
- Saisie des notes des étudiants
- Consultation de l'emploi du temps

## 🛠️ Technologies utilisées

### Backend
- **Node.js** avec **Express.js**
- **SQLite** pour la base de données
- **JWT** pour l'authentification
- **bcrypt** pour le chiffrement des mots de passe
- **Nodemailer** pour l'envoi d'emails

### Frontend
- **React.js** avec **Hooks**
- **Material-UI** pour l'interface utilisateur
- **React Router** pour la navigation
- **Axios** pour les requêtes API
- **Chart.js** pour les graphiques et statistiques

## 🚀 Installation et démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation
1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd edutrack
   ```

2. **Installer les dépendances**
   ```bash
   npm run install-all
   ```

3. **Configuration de l'environnement**
   ```bash
   cp .env.example .env
   # Modifier les variables dans .env
   ```

4. **Démarrer l'application**
   ```bash
   npm run dev
   ```

L'application sera accessible sur :
- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:5000

## 📁 Structure du projet

```
edutrack/
├── client/                 # Application React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   ├── utils/         # Utilitaires
│   │   └── App.js
│   └── package.json
├── server/                 # Serveur Node.js backend
│   ├── config/            # Configuration de la base de données
│   ├── controllers/       # Contrôleurs des routes
│   ├── middleware/        # Middleware personnalisé
│   ├── models/            # Modèles de données
│   ├── routes/            # Définition des routes
│   └── index.js           # Point d'entrée du serveur
├── database/              # Fichiers de base de données
├── package.json
└── README.md
```

## 🔐 Authentification et rôles

L'application gère trois types d'utilisateurs avec des permissions différentes :

- **Administrateur** : Accès complet à toutes les fonctionnalités
- **Enseignant** : Gestion des cours, notes et présences
- **Étudiant** : Consultation des informations personnelles

## 📧 Notifications

Le système de notifications inclut :
- Emails automatiques pour les résultats
- Rappels d'examens
- Notifications de changements de cours
- Alertes d'absences

## 📊 Base de données

La base de données SQLite contient les tables suivantes :
- `users` : Utilisateurs (admin, enseignants, étudiants)
- `classes` : Classes et filières
- `subjects` : Matières enseignées
- `courses` : Cours et planning
- `grades` : Notes des étudiants
- `attendance` : Présences et absences
- `notifications` : Notifications système

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub ou contacter l'équipe de développement.

---

**EduTrack** - Simplifiez la gestion de votre établissement éducatif ! 🎓
