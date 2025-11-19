# 🚀 Guide de Déploiement - Ubuntu 24.04

## 📋 Architecture

**Workflow** :
1. Développement en local
2. `git push` vers GitHub
3. `git pull` sur le serveur
4. Rebuild automatique
5. Application mise à jour ! ✅

---

## 🔧 1. Préparer le Serveur Ubuntu 24.04

### Connexion SSH
```bash
ssh user@votre-serveur-ip
```

### Mise à jour du système
```bash
sudo apt update && sudo apt upgrade -y
```

---

## 📦 2. Installer les Dépendances

### Node.js 20.x (LTS)
```bash
# Installer Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node --version  # v20.x.x
npm --version   # 10.x.x
```

### Git
```bash
sudo apt install -y git
git --version
```

### Nginx (serveur web)
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### PM2 (gestionnaire de processus)
```bash
sudo npm install -g pm2
```

---

## 🔐 3. Configurer GitHub SSH (optionnel mais recommandé)

### Générer une clé SSH sur le serveur
```bash
ssh-keygen -t ed25519 -C "votre-email@example.com"
# Appuyez sur Entrée pour tout accepter par défaut

# Afficher la clé publique
cat ~/.ssh/id_ed25519.pub
```

### Ajouter la clé à GitHub
1. Copiez la clé publique affichée
2. Allez sur GitHub → Settings → SSH and GPG keys
3. "New SSH key"
4. Collez la clé
5. Sauvegardez

---

## 📂 4. Cloner le Projet

### Créer le dossier de déploiement
```bash
# Créer un dossier pour vos projets
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
```

### Cloner depuis GitHub
```bash
# Avec SSH (recommandé)
git clone git@github.com:votre-username/angers-green-paths.git

# OU avec HTTPS
git clone https://github.com/votre-username/angers-green-paths.git

cd angers-green-paths
```

---

## ⚙️ 5. Configurer les Variables d'Environnement

### Créer le fichier .env
```bash
nano .env
```

### Ajouter vos variables Supabase
```env
VITE_SUPABASE_URL=https://twvouhocitydrgziegxg.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_ici
```

**Note** : Récupérez ces valeurs depuis votre dashboard Supabase → Project Settings → API

---

## 🏗️ 6. Build Initial

### Installer les dépendances
```bash
npm install --legacy-peer-deps
```

### Build de production
```bash
npm run build
```

Cela crée un dossier `dist/` avec les fichiers optimisés.

---

## 🌐 7. Configurer Nginx

### Créer la configuration
```bash
sudo nano /etc/nginx/sites-available/angers-nature
```

### Coller cette configuration
```nginx
server {
    listen 80;
    server_name votre-domaine.com;  # Remplacez par votre IP ou domaine

    root /var/www/angers-green-paths/dist;
    index index.html;

    # Gestion du routing côté client (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optimisation des fichiers statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compression gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
```

### Activer la configuration
```bash
# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/angers-nature /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## 🔄 8. Script de Déploiement Automatique

### Créer le script
```bash
nano ~/deploy-angers.sh
```

### Ajouter ce contenu
```bash
#!/bin/bash

# Script de déploiement automatique Angers Nature
# Usage: ./deploy-angers.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Début du déploiement..."

# Aller dans le dossier du projet
cd /var/www/angers-green-paths

# Sauvegarder les changements locaux (au cas où)
echo "📦 Stash des changements locaux..."
git stash

# Récupérer les dernières modifications
echo "⬇️  Pull depuis GitHub..."
git pull origin main  # ou 'master' selon votre branche

# Restaurer le .env si nécessaire
echo "🔐 Vérification de .env..."
if [ ! -f .env ]; then
    echo "⚠️  ERREUR: Fichier .env manquant!"
    exit 1
fi

# Installer les nouvelles dépendances
echo "📚 Installation des dépendances..."
npm install --legacy-peer-deps

# Build de production
echo "🏗️  Build de production..."
npm run build

# Redémarrer Nginx pour appliquer les changements
echo "🔄 Redémarrage de Nginx..."
sudo systemctl reload nginx

echo "✅ Déploiement terminé avec succès!"
echo "🌐 Votre site est maintenant à jour!"
```

### Rendre le script exécutable
```bash
chmod +x ~/deploy-angers.sh
```

---

## 🎯 9. Workflow de Mise à Jour

### En local (votre PC)
```bash
# 1. Faire vos modifications
# 2. Commit
git add .
git commit -m "Nouvelle fonctionnalité"

# 3. Push vers GitHub
git push origin main
```

### Sur le serveur
```bash
# 4. Exécuter le script de déploiement
./deploy-angers.sh
```

**C'est tout !** Votre site est mis à jour en ~30 secondes ! ⚡

---

## 🔥 10. (Optionnel) Déploiement Automatique avec Webhook

Pour mettre à jour automatiquement quand vous push sur GitHub :

### Installer le serveur webhook
```bash
sudo npm install -g webhook
```

### Créer le hook
```bash
nano ~/webhook.js
```

```javascript
const { exec } = require('child_process');

const express = require('express');
const app = express();

app.use(express.json());

app.post('/deploy', (req, res) => {
  console.log('🔔 Webhook reçu! Déploiement en cours...');
  
  exec('bash /home/youruser/deploy-angers.sh', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur: ${error}`);
      return res.status(500).send('Échec du déploiement');
    }
    console.log(stdout);
    res.send('Déploiement réussi!');
  });
});

app.listen(3000, () => {
  console.log('🎣 Webhook serveur sur le port 3000');
});
```

### Lancer avec PM2
```bash
pm2 start ~/webhook.js --name angers-webhook
pm2 save
pm2 startup
```

### Configurer GitHub
1. Allez dans votre repo GitHub → Settings → Webhooks
2. Add webhook
3. **Payload URL** : `http://votre-ip:3000/deploy`
4. **Content type** : `application/json`
5. **Events** : Just the push event
6. Add webhook

**Maintenant** : Quand vous push → GitHub appelle le webhook → Déploiement auto ! 🎉

---

## 🔒 11. HTTPS avec Let's Encrypt (Recommandé)

### Installer Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtenir un certificat SSL
```bash
sudo certbot --nginx -d votre-domaine.com
```

Suivez les instructions. Certbot configurera automatiquement Nginx pour HTTPS.

### Renouvellement automatique
```bash
sudo systemctl status certbot.timer  # Vérifie que c'est actif
```

---

## 📊 12. Monitoring & Logs

### Voir les logs Nginx
```bash
# Logs d'accès
sudo tail -f /var/log/nginx/access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/error.log
```

### Redémarrer Nginx
```bash
sudo systemctl restart nginx
```

### Vérifier l'état
```bash
sudo systemctl status nginx
```

---

## 🛠️ 13. Dépannage

### Le site ne s'affiche pas ?
```bash
# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier les permissions
ls -la /var/www/angers-green-paths/dist

# Vérifier le firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

### Erreurs lors du build ?
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Variables d'environnement ne fonctionnent pas ?
```bash
# Vérifier .env
cat .env

# Rebuild après modification
npm run build
```

---

## 📝 14. Résumé du Workflow

### Développement quotidien
```bash
# Sur votre PC
1. Code en local
2. git add . && git commit -m "Update"
3. git push origin main

# Sur le serveur
4. ssh user@serveur
5. ./deploy-angers.sh
6. ✅ Site mis à jour!
```

### Commandes utiles
```bash
# Déployer
./deploy-angers.sh

# Voir les logs
sudo tail -f /var/log/nginx/access.log

# Redémarrer Nginx
sudo systemctl restart nginx

# Vérifier l'état
sudo systemctl status nginx
```

---

## 🎉 C'est Prêt !

Votre application est maintenant :
- ✅ Déployée sur Ubuntu 24.04
- ✅ Accessible depuis Internet
- ✅ Mise à jour facilement avec `./deploy-angers.sh`
- ✅ Optimisée pour la production
- ✅ (Optionnel) Déploiement automatique avec webhook

---

## 📚 Ressources

- [Documentation Nginx](https://nginx.org/en/docs/)
- [Documentation PM2](https://pm2.keymetrics.io/)
- [Documentation Vite](https://vitejs.dev/)
- [GitHub Webhooks](https://docs.github.com/webhooks)

---

## 💡 Prochaines Étapes

1. **Configurer un domaine** (ex: angers-nature.fr)
2. **Ajouter HTTPS** avec Let's Encrypt
3. **Configurer le webhook** pour déploiement auto
4. **Mettre en place un monitoring** (Uptime Robot)
5. **Configurer des backups** automatiques

**Bon déploiement ! 🚀**
