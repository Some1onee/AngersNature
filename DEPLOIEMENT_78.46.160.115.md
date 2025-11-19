# 🚀 Déploiement sur 78.46.160.115

## 📋 Votre Configuration

- **IP Serveur** : 78.46.160.115
- **OS** : Ubuntu (neuf)
- **Repo GitHub** : https://github.com/Some1onee/AngersNature
- **Accès** : Vous allez y accéder par http://78.46.160.115

---

## 🔌 1. Connexion au Serveur

### Première connexion SSH
```powershell
# Depuis votre PC Windows
ssh root@78.46.160.115
# Ou
ssh utilisateur@78.46.160.115
```

**Si vous n'avez pas de clé SSH** :
- Le serveur vous demandera un mot de passe
- Utilisez le mot de passe fourni par votre hébergeur

---

## 🛠️ 2. Installation Complète (Une Seule Fois)

Copiez-collez ces commandes **une par une** sur le serveur :

### Mise à jour du système
```bash
sudo apt update && sudo apt upgrade -y
```

### Installer Node.js 20.x
```bash
# Ajouter le repo NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Installer Node.js
sudo apt install -y nodejs

# Vérifier
node --version  # Doit afficher v20.x.x
npm --version   # Doit afficher 10.x.x
```

### Installer Git
```bash
sudo apt install -y git
git --version
```

### Installer Nginx
```bash
sudo apt install -y nginx

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier
sudo systemctl status nginx
```

### Installer PM2
```bash
sudo npm install -g pm2
```

### Configurer le pare-feu
```bash
# Autoriser HTTP et SSH
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (pour plus tard)

# Activer le pare-feu
sudo ufw --force enable

# Vérifier
sudo ufw status
```

---

## 📂 3. Cloner Votre Projet

### Créer le dossier
```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
```

### Cloner depuis GitHub
```bash
git clone https://github.com/Some1onee/AngersNature.git angers-nature
cd angers-nature
```

---

## ⚙️ 4. Configuration Supabase

### Créer le fichier .env
```bash
nano .env
```

### Coller votre configuration
```env
VITE_SUPABASE_URL=https://twvouhocitydrgziegxg.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_ici
```

**Pour obtenir votre Anon Key** :
1. Allez sur https://supabase.com/dashboard
2. Votre projet → Settings → API
3. Copiez `anon` `public`

**Enregistrer** : `Ctrl+X` → `Y` → `Entrée`

---

## 🏗️ 5. Premier Build

```bash
# Installer les dépendances
npm install --legacy-peer-deps

# Build de production
npm run build
```

Cela crée un dossier `dist/` avec votre site optimisé.

---

## 🌐 6. Configuration Nginx

### Créer la configuration
```bash
sudo nano /etc/nginx/sites-available/angers-nature
```

### Coller cette configuration
```nginx
server {
    listen 80;
    server_name 78.46.160.115;

    root /var/www/angers-nature/dist;
    index index.html;

    # Gestion du routing React
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des fichiers statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
```

**Enregistrer** : `Ctrl+X` → `Y` → `Entrée`

### Activer la configuration
```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/angers-nature /etc/nginx/sites-enabled/

# Supprimer la config par défaut
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## ✅ 7. Tester le Site

Ouvrez votre navigateur et allez sur :
```
http://78.46.160.115
```

Vous devriez voir votre site Angers Nature ! 🎉

---

## 🔄 8. Script de Mise à Jour

### Créer le script de déploiement
```bash
nano ~/deploy.sh
```

### Coller ce contenu
```bash
#!/bin/bash

echo "🚀 Déploiement Angers Nature..."

cd /var/www/angers-nature

# Sauvegarder les changements locaux
git stash

# Pull depuis GitHub
echo "⬇️  Pull depuis GitHub..."
git pull origin main

# Vérifier .env
if [ ! -f .env ]; then
    echo "⚠️  ATTENTION: Fichier .env manquant!"
    exit 1
fi

# Installer les dépendances
echo "📚 Installation des dépendances..."
npm install --legacy-peer-deps

# Build
echo "🏗️  Build de production..."
npm run build

# Redémarrer Nginx
echo "🔄 Redémarrage de Nginx..."
sudo systemctl reload nginx

echo "✅ Déploiement terminé!"
echo "🌐 Site accessible sur http://78.46.160.115"
```

**Enregistrer** : `Ctrl+X` → `Y` → `Entrée`

### Rendre exécutable
```bash
chmod +x ~/deploy.sh
```

---

## 🎯 9. Workflow de Mise à Jour

### Sur votre PC (Windows)
```powershell
# Faire vos modifications
# ...

# Commit et push
git add .
git commit -m "Nouvelles modifications"
git push origin main
```

### Sur le serveur
```bash
# Se connecter
ssh root@78.46.160.115

# Déployer
./deploy.sh
```

**C'est tout !** Votre site est mis à jour ! ⚡

---

## 📊 10. Commandes Utiles

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

### Voir l'espace disque
```bash
df -h
```

### Mettre à jour le système
```bash
sudo apt update && sudo apt upgrade -y
```

---

## 🔒 11. (Plus Tard) Ajouter HTTPS

Quand vous aurez un nom de domaine :

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir un certificat
sudo certbot --nginx -d votre-domaine.com

# Le renouvellement est automatique
```

---

## 🛠️ 12. Dépannage

### Le site ne s'affiche pas ?

1. **Vérifier Nginx**
```bash
sudo systemctl status nginx
sudo nginx -t
```

2. **Vérifier le pare-feu**
```bash
sudo ufw status
# Le port 80 doit être ouvert
```

3. **Vérifier le build**
```bash
cd /var/www/angers-nature
ls -la dist/
# Le dossier dist/ doit exister et contenir des fichiers
```

### Erreur 502 Bad Gateway ?
```bash
# Rebuild le projet
cd /var/www/angers-nature
npm run build
sudo systemctl restart nginx
```

### Erreur lors du npm install ?
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## 📝 13. Checklist Post-Installation

- [ ] Le site s'affiche sur http://78.46.160.115
- [ ] Vous pouvez naviguer sur toutes les pages
- [ ] Les données Supabase s'affichent correctement
- [ ] Vous pouvez vous connecter en admin
- [ ] Le script `./deploy.sh` fonctionne
- [ ] Les logs Nginx sont accessibles

---

## 🎉 Félicitations !

Votre application est maintenant :
- ✅ Déployée sur 78.46.160.115
- ✅ Accessible depuis Internet
- ✅ Mise à jour facilement avec `./deploy.sh`
- ✅ Prête pour la production

---

## 📞 Support

Si vous avez des problèmes :
1. Vérifiez les logs : `sudo tail -f /var/log/nginx/error.log`
2. Testez Nginx : `sudo nginx -t`
3. Vérifiez le build : `ls -la /var/www/angers-nature/dist/`

**Bon déploiement ! 🚀**
