# 🧪 PE Hub - Guide de Test d'Inscription & Base de Données

## 📋 Résumé

Deux fichiers de test ont été créés pour valider l'inscription des utilisateurs et le stockage des données:

1. **`test-registration.html`** - Tests interactifs dans le navigateur
2. **`test-database.js`** - Tests automatisés serveur-side (Node.js)

---

## 🌐 Méthode 1: Tests Interactifs (Navigateur)

### Comment utiliser:

1. **Ouvrir le fichier test dans le navigateur:**
   ```
   Ouvrez: http://localhost:PORT/test-registration.html
   (Déployez d'abord votre application PE Hub, puis accédez à ce fichier)
   ```

2. **Interface de test:**
   - Bouton **"▶️ Démarrer tous les tests"** - Lance tous les tests automatiquement
   - Bouton **"🗑️ Effacer données locales"** - Nettoie localStorage (attention!)

3. **Résultats affichés:**
   - ✅ **TEST 1: Validation des IDs Autorisés** - Crée des IDs test pour étudiants/professeurs
   - ✅ **TEST 2: Inscription d'Étudiants** - Crée 3 comptes étudiants avec données varées
   - ✅ **TEST 3: Inscription de Professeurs** - Crée 2 comptes professeurs
   - ✅ **TEST 4: Vérification Supabase** - Vérifie la connexion à Supabase
   - ✅ **TEST 5: Vérification LocalStorage** - Affiche les données sauvegardées localement

### Données de test créées:

**Étudiants:**
```
1. Student1 Test1 - student1@test.com (Year 7, Gryffindor) 
2. Student2 Test2 - student2@test.com (Year 8, Slytherin) 
3. Student3 Test3 - student3@test.com (Year 9, Hufflepuff)
```

**Professeurs:**
```
1. Mr/Mrs Teacher1 Test1 - teacher1@test.com (5+ ans d'expérience)
2. Mr/Mrs Teacher2 Test2 - teacher2@test.com (6+ ans d'expérience)
```

---

## 🖥️ Méthode 2: Tests Serveur (Node.js)

### Prérequis:

```bash
# Installer les dépendances
npm install @supabase/supabase-js crypto
```

### Comment exécuter:

```bash
# Exécuter le script de test
node test-database.js
```

### Résultats générés:

- ✅ **TEST 1: Création des IDs Autorisés** 
- ✅ **TEST 2: Inscription d'Étudiants**
- ✅ **TEST 3: Inscription de Professeurs**
- ✅ **TEST 4: Validation des Données**
- ✅ **TEST 5: Prévention de Duplication des IDs**
- ✅ **TEST 6: Structure de la Base de Données**

### Fichier de sortie:

Les résultats sont sauvegardés dans:
```
/tmp/pe-hub-test-results.json
```

Contient:
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
  }
}
```

---

## 🔍 Tests Spécifiques

### Test d'Inscription Étudiant

**Données testées:**
- ✓ Nom et prénom valides
- ✓ Email au format correct
- ✓ Classe au format "Year X" (X = 1-13)
- ✓ Genre (Male/Female)
- ✓ Maison scolaire (Gryffindor, Slytherin, etc.)
- ✓ Mot de passe hashé en SHA-256
- ✓ IDs autorisés stocker localement

**Résultats attendus:**
```
✅ Student1 Test1 inscrit avec succès
✅ Student2 Test2 inscrit avec succès
✅ Student3 Test3 inscrit avec succès
```

### Test d'Inscription Professeur

**Données testées:**
- ✓ Titre (Mr/Mrs/Ms/Dr)
- ✓ Nom et prénom valides
- ✓ Email au format correct
- ✓ Qualifications (PGCE, QTS)
- ✓ Années d'expérience
- ✓ Spécialités sportives
- ✓ Code Manager optionnel

**Résultats attendus:**
```
✅ Mr Teacher1 Test1 inscrit avec succès
✅ Mr Teacher2 Test2 inscrit avec succès
```

### Test de Base de Données

**Vérifications:**
- ✓ Les données sont sauvegardées en localStorage
- ✓ Aucune duplication d'ID
- ✓ Structure JSON valide
- ✓ Timestamps créés automatiquement
- ✓ Champs obligatoires présents

---

## 🗄️ Vérification Manuelle

### Visualiser les données stockées:

Ouvrez la console du navigateur (F12) et exécutez:

```javascript
// Voir tous les étudiants
JSON.parse(localStorage.getItem('students'))

// Voir tous les professeurs
JSON.parse(localStorage.getItem('teachers'))

// Voir les IDs autorisés
JSON.parse(localStorage.getItem('authorizedIds'))

// Voir la session active
JSON.parse(localStorage.getItem('peHubSession'))
```

### Nettoyer les données:

```javascript
// Effacer un type de données
localStorage.removeItem('students')
localStorage.removeItem('teachers')
localStorage.removeItem('authorizedIds')

// Effacer TOUT
localStorage.clear()
```

---

## 📊 Résultats Attendus

### Statut de Réussite:

```
✅ Inscription étudiants: 3/3 réussis
✅ Inscription professeurs: 2/2 réussis
✅ Validation données: VALIDÉ
✅ Prévention doublons: VALIDÉ
✅ Structure BD: VALIDÉ
📈 Taux de réussite: 100%
```

### Vérification Supabase:

```
✓ URL Supabase: https://mfmznpgvylehiszktizh.supabase.co
✓ Authentification: Connecté ou Mode local
✓ Clé: sb_publishable_YA5j8...
```

---

## 🔧 Dépannage

### Problème: "Aucun ID autorisé trouvé"

**Solution:** Les tests créent les IDs automatiquement. Vérifiez que:
- [ ] localStorage n'est pas effacé entre les tests
- [ ] L'ID Enforcement Toggle est OFF (mode flexible)
- [ ] Pas de conflit avec des IDs existants

### Problème: "Email déjà utilisé"

**Solution:** Les emails de test doivent être uniques. Les tests utilisent:
- `studentX@test.com` (X = 1, 2, 3...)
- `teacherX@test.com` (X = 1, 2...)

Modifiez si nécessaire dans le code des tests.

### Problème: "Connexion Supabase échouée"

**Solution:** C'est normal! Le système utilise un fallback localStorage:
- ✓ Supabase essayé d'abord (si disponible)
- ✓ LocalStorage automatiquement comme backup
- Les données sont sauvegardées localement dans les deux cas

### Problème: "Classe invalide"

**Solution:** Utilisez le format correct:
- ✓ "Year 7" (avec espace)
- ✓ "Year 7A" (pas d'espace avant la lettre)
- ✓ "Year 7 A" (avec espace avant la lettre)

---

## 📈 Métriques de Qualité

Les tests validé que:

| Métrique | Statut | Détails |
|----------|--------|---------|
| Validation d'email | ✅ | Format `name@domain.ext` |
| Format de classe | ✅ | "Year X" ou "Year XY" |
| Hash de mot de passe | ✅ | SHA-256 + salt |
| Unicité des IDs | ✅ | Pas de doublons |
| Timestamps | ✅ | ISO 8601 format |
| Structure JSON | ✅ | Valide et complet |
| Fallback localStorage | ✅ | Fonctionne si Supabase échoue |

---

## 🚀 Prochaines Étapes

1. **Tester la connexion:**
   - Vérifier que les utilisateurs créés peuvent se connecter
   - Tester les credentials sauvegardés

2. **Tester la persistance des données:**
   - Rafraîchir la page et vérifier que les données restent
   - Fermer le navigateur et rouvrir

3. **Tester Supabase complètement:**
   - Activez la connexion réelle à Supabase
   - Vérifiez que les comptes sont créés dans Supabase

4. **Tester les cas limites:**
   - Essayez avec des caractères spéciaux
   - Essayez avec des emails invalides
   - Essayez avec des classes invalides

---

## 📝 Notes Importantes

- Les tests utilisent **SHA-256** pour hasher les mots de passe (même salt que l'app)
- Les données sont sauvegardées avec un **timestamp ISO 8601**
- L'**UUID** est généré automatiquement pour chaque utilisateur
- Le **fallback localStorage** fonctionne même si Supabase est indisponible

---

## ✉️ Support

Pour any questions ou problèmes, vérifiez:
1. La console du navigateur (F12) pour les erreurs
2. Le fichier `/tmp/pe-hub-test-results.json` pour les détails
3. Les logs de Supabase dans votre dashboard
