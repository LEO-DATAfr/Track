# 🧪 PE Hub - Tests d'Inscription & Base de Données

## 📌 Vue d'ensemble

Ce package de tests automatisés vérifie:
- ✅ **Inscription d'étudiants** - Création de comptes avec validation
- ✅ **Inscription de professeurs** - Création de comptes professeurs
- ✅ **Stockage des données** - Vérification localStorage + Supabase
- ✅ **Intégrité des données** - Validation des formats et structures
- ✅ **Prévention des doublons** - Vérification des IDs uniques

---

## 🚀 Démarrage Rapide

### Option 1: Tests dans le Navigateur (Recommandé)

```bash
# 1. Assurez-vous que PE Hub est déployée
# 2. Ouvrez dans votre navigateur:
http://localhost:PORT/test-registration.html

# 3. Cliquez sur "▶️ Démarrer tous les tests"
# 4. Attendez les résultats
```

✨ **Avantages:**
- Interface visuelle claire
- Résultats en temps réel
- Visualisation directe des données localStorage

### Option 2: Tests Serveur (Node.js)

```bash
# 1. Installer les dépendances
npm install

# 2. Exécuter les tests
node test-database.js

# 3. Résultats dans /tmp/pe-hub-test-results.json
```

✨ **Avantages:**
- Tests automatisés sans interface
- Résultats JSON structurés
- Intégration CI/CD possible

### Option 3: Script Interactif

```bash
bash run-tests.sh
```

---

## 📁 Fichiers de Test

| Fichier | Description | Usage |
|---------|-------------|-------|
| `test-registration.html` | Interface web de test | Navigateur (visuel) |
| `test-database.js` | Script de test serveur | Node.js (CLI) |
| `run-tests.sh` | Script interactif | Terminal (menu) |
| `TEST-GUIDE.md` | Documentation complète | Référence |

---

## ✅ Cas de Test

### 1️⃣ Test d'Inscription Étudiant

**Entrées:**
- Prénom/Nom
- Email (format valide)
- ID d'autorisation
- Classe (ex: "Year 7")
- Genre
- Maison scolaire

**Vérifications:**
```
✓ Données sauvegardées en localStorage
✓ Format email valide
✓ Format classe au format "Year X"
✓ Mot de passe hashé en SHA-256
✓ UUID généré automatiquement
✓ Timestamp ISO 8601 créé
```

### 2️⃣ Test d'Inscription Professeur

**Entrées:**
- Titre (Mr/Mrs/Ms/Dr)
- Prénom/Nom
- Email
- Qualifications
- Expérience
- Spécialités sportives

**Vérifications:**
```
✓ Tous les champs obligatoires présents
✓ Email format valide
✓ Données structurées correctement
✓ Timestamps autogénérés
```

### 3️⃣ Test de Validation des Données

**Vérifications:**
```
✓ Aucune duplication d'ID
✓ Format de classe valide
✓ Email valide
✓ Mots de passe hashés
✓ Structure JSON correcte
```

---

## 📊 Résultats Attendus

### Test HTML (Navigateur)

```
✅ TEST 1: Création des IDs autorisés
   └─ 2 ID(s) créé(s)

✅ TEST 2: Inscription d'Étudiants  
   └─ 3/3 inscrits avec succès

✅ TEST 3: Inscription de Professeurs
   └─ 2/2 inscrits avec succès

✅ TEST 4: Connexion Supabase
   └─ Non connecté (mode local OK)

✅ TEST 5: Vérification LocalStorage
   └─ 5 utilisateurs sauvegardés

📈 Taux de réussite: 100%
```

### Test Serveur (Node.js)

```
🧪 TEST 1: Création des IDs Autorisés ✅
🧪 TEST 2: Inscription d'Étudiants ✅
🧪 TEST 3: Inscription de Professeurs ✅
🧪 TEST 4: Validation des Données ✅
🧪 TEST 5: Prévention de Duplication ✅
🧪 TEST 6: Structure de la BD ✅

📊 RÉSUMÉ
Total: 6 | Réussis: 6 | Échoués: 0
📈 Taux de réussite: 100%

✓ Résultats: /tmp/pe-hub-test-results.json
```

---

## 🔍 Données de Test

### Étudiants Créés

```javascript
1. Student1 Test1
   Email: student1@test.com
   Class: Year 7
   House: Gryffindor
   Gender: Male/Female

2. Student2 Test2
   Email: student2@test.com
   Class: Year 8
   House: Slytherin
   
3. Student3 Test3
   Email: student3@test.com
   Class: Year 9
   House: Hufflepuff
```

### Professeurs Créés

```javascript
1. Mr/Mrs Teacher1 Test1
   Email: teacher1@test.com
   Experience: 5 ans
   Qualifications: PGCE, QTS
   
2. Mr/Mrs Teacher2 Test2
   Email: teacher2@test.com
   Experience: 6 ans
   Specialisms: Football, Badminton
```

---

## 💾 Vérification des Données

### Console du Navigateur (F12)

```javascript
// Voir tous les étudiants
JSON.parse(localStorage.getItem('students'))

// Voir tous les professeurs
JSON.parse(localStorage.getItem('teachers'))

// Voir les IDs autorisés
JSON.parse(localStorage.getItem('authorizedIds'))

// Voir la session active
JSON.parse(localStorage.getItem('peHubSession'))

// Taille totale
Object.keys(localStorage)
  .reduce((sum, key) => sum + localStorage[key].length, 0)
```

### Résultats JSON (Serveur)

```json
{
  "summary": {
    "total": 6,
    "passed": 6,
    "failed": 0,
    "passRate": 100
  },
  "testData": {
    "students": [...],
    "teachers": [...],
    "authorizedIds": {...}
  },
  "timestamp": "2024-04-12T10:30:00.000Z"
}
```

---

## 🔧 Configuration

### Supabase (Optionnel)

Si vous voulez tester avec Supabase:

```javascript
// Dans index.html - Déjà configuré:
const supabaseUrl = 'https://mfmznpgvylehiszktizh.supabase.co';
const supabaseKey = 'sb_publishable_YA5j8n84LpO7TLwnxHQz1g_BNkL4hyL';

// Tests utilisent le fallback localStorage si Supabase échoue
```

### IDs Autorisés (Optionnel)

Pour tester le système d'autorisation:

```javascript
// Créer un ID autorisé
sdkSave('authorizedIds', 'STU001', {
  type: 'student',
  registered: false,
  presetFirstName: 'Test',
  presetLastName: 'User'
})

// Vérifier
sdkLoad('authorizedIds', 'STU001')
```

---

## ❌ Dépannage

### Problème: Tests échouent

**Solution:**
1. Vérifier que localStorage n'est pas effacé
2. Vérifier que JavaScript est activé
3. Consulter la console (F12) pour les erreurs
4. Exécuter `localStorage.clear()` et réessayer

### Problème: Supabase ne fonctionne pas

**Solution:**
- C'est normal! Le système fonctionne en mode local avec localStorage
- Les données sont sauvegardées à la fois localement et sur Supabase
- En cas d'erreur Supabase, le fallback localStorage est utilisé

### Problème: Tests serveur ne démarre pas

**Solution:**
```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install nodejs

# Installer les dépendances
npm install @supabase/supabase-js

# Exécuter
node test-database.js
```

---

## 📈 Métriques

| Métrique | Cible | Statut |
|----------|-------|--------|
| Inscription réussie | 100% | ✅ 5/5 utilisateurs |
| Intégrité données | 100% | ✅ Toutes validées |
| Pas de doublons | 100% | ✅ 5 IDs uniques |
| Format classe | 100% | ✅ "Year X" valide |
| Hash mot de passe | 100% | ✅ SHA-256 + salt |

---

## 📞 Support

Pour toute question:

1. **Lire** `TEST-GUIDE.md` (documentation complète)
2. **Consulter** la console du navigateur (F12)
3. **Vérifier** `/tmp/pe-hub-test-results.json`
4. **Exécuter** tests à nouveau après `localStorage.clear()`

---

## 🎯 Prochaines Étapes

Après les tests réussis:

- [ ] Tester la connexion des utilisateurs créés
- [ ] Vérifier la persistance des données (refresh)
- [ ] Tester avec des données réelles (emails de vrais professeurs)
- [ ] Intégrer à CI/CD
- [ ] Ajouter tests de performance

---

## 📝 Notes

- Tous les mots de passe sont testés avec le **même salt** que l'application
- Les **UUIDs** sont générés aléatoirement
- Les **timestamps** utilisent le format **ISO 8601**
- Le **fallback localStorage** fonctionne même si Supabase est indisponible

**Version:** 1.0.0  
**Dernière mise à jour:** 12 Avril 2024
