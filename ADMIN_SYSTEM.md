# 👑 Système d'Administration - Angers Nature

## ✅ SYSTÈME DE RÔLES ACTIVÉ !

### 🔐 Sécurité et Rôles

Le système utilise maintenant deux rôles :
- **`user`** 👤 - Utilisateur normal (par défaut)
- **`admin`** 👑 - Administrateur avec accès au panel

---

## 🚀 Accès au Panel Admin

### URL d'accès
```
/admin
```

### Conditions d'accès
1. Être connecté avec un compte
2. Avoir le rôle `admin` dans la base de données

### Votre compte admin actuel
- **Email** : `admin@gmail.com`
- **Rôle** : `admin` ✅
- **Statut** : Activé

---

## 🎨 Nouveau Panel Admin

### 📊 Onglet "Aperçu"
- **Statistiques en temps réel** :
  - 👥 Nombre total d'utilisateurs
  - 🗺️ Nombre de balades
  - 📅 Nombre d'événements
  - 💬 Nombre de commentaires
  - 🏆 Badges débloqués
  - 👥 Groupes créés

- **Activité récente** : Actions des dernières heures
- **Tendances** : Graphiques de croissance

---

### 👥 Onglet "Utilisateurs"

**Fonctionnalités** :
- ✅ Liste de tous les utilisateurs
- ✅ Voir l'email et date d'inscription
- ✅ Badge visuel du rôle (👑 Admin / 👤 User)
- ✅ **Toggle pour changer le rôle** (User ↔ Admin)
- ✅ Scroll pour naviguer dans la liste

**Actions possibles** :
- Promouvoir un utilisateur en admin
- Rétrograder un admin en user
- Voir quand ils se sont inscrits

---

### 📦 Onglet "Contenu"

**Gestion du contenu** :
- Balades (avec compteur)
- Événements (avec compteur)
- Jardins partagés
- Associations

**Boutons d'action** :
- Gérer chaque type de contenu
- Ajouter du nouveau contenu
- Modifier/Supprimer

---

### ⚠️ Onglet "Modération"

**Outils de modération** :
- 🚨 Signalements en attente
- 💬 Modération des commentaires
- 🔍 Détection automatique

---

### ⚙️ Onglet "Paramètres"

**Paramètres de la plateforme** :
- ✅ Inscriptions ouvertes/fermées
- 🔧 Mode maintenance
- 🤖 Modération automatique

**Zone de danger** :
- Réinitialiser les statistiques
- Supprimer les commentaires

---

## 🔒 Sécurité

### Protection de la route
La route `/admin` est protégée par `AdminRoute` :
- Vérifie si l'utilisateur est connecté
- Vérifie le rôle dans la base de données
- Redirige vers `/login` si accès refusé
- Affiche un loader pendant la vérification

### Base de données
Table `user_roles` avec RLS (Row Level Security) :
```sql
- Les users peuvent voir leur propre rôle
- Les admins peuvent voir tous les rôles
- Les admins peuvent modifier les rôles
```

---

## 📋 Utilisation

### 1. Accéder au panel
1. Connectez-vous avec `admin@gmail.com`
2. Allez sur `/admin`
3. Vous verrez le panel complet

### 2. Gérer les rôles
1. Allez dans l'onglet **"Utilisateurs"**
2. Trouvez un utilisateur
3. Utilisez le toggle "Admin" pour changer son rôle
4. Le changement est instantané

### 3. Voir les statistiques
1. Restez sur l'onglet **"Aperçu"**
2. Les chiffres sont mis à jour en temps réel
3. Voyez l'activité récente et les tendances

---

## 🛠️ Fonctionnalités avancées

### Hook personnalisé `useUserRole`
```typescript
const { role, isAdmin, loading } = useUserRole();

if (isAdmin) {
  // Afficher contenu admin
}
```

### Composant `AdminRoute`
```typescript
<AdminRoute>
  <AdminPanel />
</AdminRoute>
```

### Vérifier le rôle en SQL
```sql
SELECT is_admin('user_id_here'::uuid);
-- Retourne true/false
```

---

## 👥 Créer d'autres admins

### Via SQL (recommandé)
```sql
-- Promouvoir un utilisateur en admin
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'USER_ID_HERE';
```

### Via le panel admin
1. Allez sur `/admin`
2. Onglet "Utilisateurs"
3. Activez le toggle "Admin" sur un utilisateur

---

## 🎨 Design

Le panel utilise :
- **Tailwind CSS** pour le style
- **Shadcn/UI** pour les composants
- **Lucide Icons** pour les icônes
- **date-fns** pour les dates
- **Design moderne** et responsive

**Couleurs des rôles** :
- 👑 Admin : Badge bleu
- 👤 User : Badge gris

---

## 📊 Statistiques trackées

| Métrique | Source |
|----------|--------|
| Utilisateurs | Table `profiles` |
| Balades | Table `balades` |
| Événements | Table `events` |
| Commentaires | Table `comments` |
| Badges | Table `user_badges` |
| Groupes | Table `user_groups` |

---

## 🔄 Améliorations futures possibles

### Statistiques avancées
- Graphiques interactifs (Chart.js)
- Export CSV des données
- Analyse de l'engagement

### Modération
- File d'attente de modération
- Auto-modération IA
- Historique des actions

### Notifications
- Alertes par email pour les admins
- Tableau de bord des urgences
- Logs d'activité détaillés

---

## 🐛 Dépannage

**Accès refusé au panel ?**
- Vérifiez que vous êtes connecté
- Vérifiez votre rôle dans `user_roles`
- Consultez la console (F12) pour les erreurs

**Les statistiques ne se chargent pas ?**
- Vérifiez la connexion Supabase
- Vérifiez les permissions RLS
- Rechargez la page

**Le toggle ne fonctionne pas ?**
- Vérifiez que vous êtes admin
- Vérifiez les permissions dans Supabase
- Consultez les logs

---

## ✅ Résumé

**Ce qui fonctionne** :
- ✅ Système de rôles (user/admin)
- ✅ Protection de la route /admin
- ✅ Panel admin moderne et complet
- ✅ Gestion des rôles utilisateurs
- ✅ Statistiques en temps réel
- ✅ 5 onglets (Aperçu, Utilisateurs, Contenu, Modération, Paramètres)
- ✅ Design responsive et user-friendly
- ✅ Votre compte est admin ✨

---

## 🎉 C'EST PRÊT !

**Le panel admin est maintenant complètement fonctionnel !**

Allez sur `/admin` pour l'utiliser ! 🚀

**Note** : Pour des raisons de sécurité, le mot de passe n'est pas stocké dans ce fichier. Vous seul le connaissez.
