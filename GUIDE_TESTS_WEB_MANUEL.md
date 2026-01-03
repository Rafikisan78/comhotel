# Guide Tests Manuels - Interface Web Admin
ComHotel v1.7 - 2026-01-03

## Prérequis

### 1. Créer un utilisateur admin
Connectez-vous à votre base Supabase et exécutez:

```sql
-- Promouvoir un utilisateur existant en admin
UPDATE users
SET role = 'admin'
WHERE email = 'VOTRE_EMAIL@exemple.com';

-- Vérifier
SELECT id, email, role FROM users WHERE role = 'admin';
```

### 2. Démarrer les serveurs

```bash
# Terminal 1 - Backend (port 3001)
cd apps/backend
npm run start:dev

# Terminal 2 - Frontend (port 3000)
cd apps/frontend
npm run dev
```

## Scénarios de Test

### 📋 TEST 1: Connexion Admin

**Étapes:**
1. Ouvrir http://localhost:3000/login
2. Entrer email admin + mot de passe
3. Cliquer "Se connecter"

**Résultat attendu:**
- ✅ Redirection vers dashboard/admin
- ✅ Token JWT stocké (vérifier DevTools > Application > Local Storage)
- ✅ Token contient `"role":"admin"`

---

### 📋 TEST 2: Liste Utilisateurs

**Étapes:**
1. Naviguer vers http://localhost:3000/admin/users
2. Observer le tableau

**Résultat attendu:**
- ✅ Liste de tous les utilisateurs affichée
- ✅ Colonnes: Email, Prénom, Nom, Téléphone, Rôle, Actions
- ✅ Badges de couleur pour les rôles:
  - Admin: bleu
  - Guest: gris
  - Hotel Owner: vert
- ✅ Header avec compteur "X utilisateurs"

---

### 📋 TEST 3: Filtres Active/Deleted/All

**Étapes:**
1. Sur /admin/users, cliquer onglet "Active"
2. Observer les utilisateurs affichés
3. Cliquer onglet "Deleted"
4. Observer les utilisateurs supprimés
5. Cliquer onglet "All"

**Résultat attendu:**
- ✅ Active: uniquement users avec deletedAt = null
- ✅ Deleted: uniquement users avec deletedAt présent
- ✅ All: tous les users
- ✅ Badge "Supprimé" rouge sur users deleted

---

### 📋 TEST 4: Modification Utilisateur - Informations

**Étapes:**
1. Cliquer "Modifier" sur un utilisateur guest
2. Observer le formulaire pré-rempli
3. Modifier le téléphone: `0699888777`
4. Modifier le prénom: `TestModifié`
5. Cliquer "Enregistrer les modifications"

**Résultat attendu:**
- ✅ Formulaire chargé avec données actuelles
- ✅ Champ mot de passe vide (sécurité)
- ✅ Message succès: "Utilisateur modifié avec succès"
- ✅ Redirection vers /admin/users après 1.5s
- ✅ Données mises à jour dans la liste

**API Call:**
```
PATCH /users/{id}
Body: { "phone": "0699888777", "firstName": "TestModifié" }
```

---

### 📋 TEST 5: Modification Mot de Passe - Validation OWASP

**Étapes:**
1. Cliquer "Modifier" sur un utilisateur
2. Dans le champ "Nouveau mot de passe", entrer: `short`
3. Cliquer "Enregistrer"
4. Observer l'erreur

**Résultat attendu:**
- ✅ Message d'erreur rouge: "Le mot de passe doit contenir au moins 12 caractères"
- ✅ Pas de soumission au backend

**Étapes (suite):**
5. Entrer: `lowercase123!` (sans majuscule)
6. Cliquer "Enregistrer"

**Résultat attendu:**
- ✅ Message d'erreur: "Le mot de passe doit contenir au moins 1 majuscule..."

**Étapes (suite):**
7. Entrer: `ValidPassword123!` (valide OWASP 2024)
8. Cliquer "Enregistrer"

**Résultat attendu:**
- ✅ Message succès
- ✅ Mot de passe mis à jour
- ✅ Possibilité de se connecter avec le nouveau mot de passe

---

### 📋 TEST 6: Soft Delete Utilisateur

**Étapes:**
1. Sur /admin/users, onglet "Active"
2. Cliquer "Supprimer" pour un utilisateur guest
3. Observer la modale de confirmation
4. Cliquer "Annuler"
5. Re-cliquer "Supprimer"
6. Cliquer "Confirmer la suppression"

**Résultat attendu:**
- ✅ Modale s'affiche avec message de confirmation
- ✅ "Annuler" ferme la modale sans supprimer
- ✅ "Confirmer" supprime l'utilisateur
- ✅ Message succès: "Utilisateur supprimé avec succès"
- ✅ User disparaît de l'onglet "Active"
- ✅ User apparaît dans l'onglet "Deleted"
- ✅ Badge "Supprimé" affiché

**API Call:**
```
DELETE /users/{id}
Authorization: Bearer {adminToken}
```

---

### 📋 TEST 7: Restore Utilisateur Supprimé

**Étapes:**
1. Aller sur onglet "Deleted"
2. Cliquer "Restaurer" pour un utilisateur supprimé
3. Observer

**Résultat attendu:**
- ✅ Message succès: "Utilisateur restauré avec succès"
- ✅ User disparaît de "Deleted"
- ✅ User réapparaît dans "Active"
- ✅ Badge "Supprimé" retiré

**API Call:**
```
POST /users/{id}/restore
Authorization: Bearer {adminToken}
```

---

### 📋 TEST 8: Bulk Delete - Sélection Multiple

**Étapes:**
1. Onglet "Active"
2. Cocher 3 utilisateurs guest (non-admin)
3. Observer le bouton "Supprimer la sélection (3)"
4. Cliquer le bouton
5. Confirmer dans la modale

**Résultat attendu:**
- ✅ Checkboxes fonctionnelles
- ✅ Compteur s'incrémente: (1), (2), (3)
- ✅ Bouton "Supprimer la sélection" visible avec compteur
- ✅ Modale: "Êtes-vous sûr de vouloir supprimer 3 utilisateurs ?"
- ✅ Confirmation supprime tous les users sélectionnés
- ✅ Message succès: "3 utilisateurs supprimés avec succès"
- ✅ Users apparaissent dans "Deleted"

**API Call:**
```
DELETE /users/bulk/delete
Body: { "userIds": ["id1", "id2", "id3"] }
Authorization: Bearer {adminToken}
```

---

### 📋 TEST 9: Protection Admin - Checkbox Désactivée

**Étapes:**
1. Onglet "Active"
2. Essayer de cocher un utilisateur avec rôle "admin"

**Résultat attendu:**
- ✅ Checkbox désactivée (grisée)
- ✅ Impossible de cocher
- ✅ Hover tooltip: "Les administrateurs ne peuvent pas être supprimés"

**Code frontend:**
```tsx
<input
  type="checkbox"
  disabled={user.role === 'admin'}
  ...
/>
```

---

### 📋 TEST 10: Protection Admin - Bouton Supprimer

**Étapes:**
1. Cliquer "Supprimer" pour un utilisateur admin

**Résultat attendu:**
- ✅ Erreur backend: "Impossible de supprimer un administrateur"
- ✅ Message d'erreur rouge affiché
- ✅ User admin non supprimé

**API Response:**
```json
{
  "statusCode": 400,
  "message": "Impossible de supprimer un administrateur"
}
```

---

### 📋 TEST 11: Protection Self-Delete

**Étapes:**
1. Connecté en tant qu'admin
2. Trouver son propre compte dans la liste
3. Cliquer "Supprimer"
4. Confirmer

**Résultat attendu:**
- ✅ Erreur: "Impossible de supprimer votre propre compte"
- ✅ Compte admin non supprimé

---

### 📋 TEST 12: Navigation et UX

**Étapes:**
1. Page edit: cliquer "Annuler"
2. Page edit: cliquer "← Retour à la liste"
3. Tester la recherche (si implémentée)
4. Observer les animations de loading

**Résultat attendu:**
- ✅ "Annuler" retourne à /admin/users
- ✅ "Retour" retourne à /admin/users
- ✅ Spinner affiché pendant chargements
- ✅ Transitions fluides

---

## Tests Curl (Alternative)

Si vous préférez tester via curl (sur Windows, utiliser Git Bash ou WSL):

### 1. Login et récupération du token
```bash
TOKEN=$(curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"VotrePassword123!"}' \
  | jq -r '.accessToken')

echo $TOKEN
```

### 2. Liste tous les utilisateurs
```bash
curl -X GET http://localhost:3001/users/admin/all \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
```

### 3. Mise à jour utilisateur
```bash
curl -X PATCH http://localhost:3001/users/USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone":"0699999999"}' \
  | jq .
```

### 4. Soft delete
```bash
curl -X DELETE http://localhost:3001/users/USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
```

### 5. Restore
```bash
curl -X POST http://localhost:3001/users/USER_ID/restore \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
```

### 6. Bulk delete
```bash
curl -X DELETE http://localhost:3001/users/bulk/delete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userIds":["id1","id2"]}' \
  | jq .
```

## Checklist Complète

- [ ] Backend démarré (port 3001)
- [ ] Frontend démarré (port 3000)
- [ ] Utilisateur admin créé dans DB
- [ ] Login admin réussi
- [ ] Liste utilisateurs affichée
- [ ] Filtres Active/Deleted/All fonctionnels
- [ ] Modification user: informations générales
- [ ] Modification user: mot de passe valide
- [ ] Validation OWASP frontend (mot de passe court)
- [ ] Validation OWASP frontend (sans majuscule)
- [ ] Soft delete utilisateur
- [ ] Restore utilisateur
- [ ] Bulk delete (sélection multiple)
- [ ] Protection admin (checkbox désactivée)
- [ ] Protection admin (bouton supprimer)
- [ ] Protection self-delete
- [ ] Messages de succès/erreur affichés
- [ ] Redirections correctes
- [ ] UI responsive

## Notes

- **Tokens JWT:** Expiration après 7 jours (configurable dans JWT_EXPIRATION)
- **OWASP 2024:** 12 chars min + 1 maj + 1 min + 1 chiffre + 1 spécial
- **Caractères spéciaux acceptés:** @$!%*?&._-+=#
- **Soft delete:** Les données ne sont jamais supprimées, juste marquées
- **Bulk delete:** Maximum recommandé ~100 users à la fois pour performance

## Résolution de Problèmes

### Erreur 403 "Accès réservé aux administrateurs"
➜ Vérifier que le user est bien promû admin dans la DB
```sql
SELECT email, role FROM users WHERE email = 'votre@email.com';
```

### Token expiré
➜ Se reconnecter pour obtenir un nouveau token

### Page edit ne charge pas les données
➜ Vérifier que l'utilisateur existe et que le token est valide

### Bulk delete ne fonctionne pas
➜ Vérifier qu'aucun admin n'est sélectionné dans le bulk
