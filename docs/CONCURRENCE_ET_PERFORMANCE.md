# Concurrence et Performance - Table Users

## 📊 Index Créés

### Index existants (migration initiale)
1. **idx_users_deleted_at** - Index partiel pour utilisateurs actifs
   - Optimise: `SELECT * FROM users WHERE deleted_at IS NULL`
   - Type: Partial index (seulement lignes non supprimées)

2. **idx_users_deleted_by** - Index pour audit des suppressions
   - Optimise: Requêtes de traçabilité
   - Type: Partial index (seulement lignes supprimées)

### Index de performance (migration 20260102)
3. **idx_users_email** - Recherche par email
   - Optimise: Login, vérification de duplicata
   - Critique pour: `findByEmail()`

4. **idx_users_role** - Filtrage par rôle
   - Optimise: Requêtes admin/guest/hotel_owner
   - Utile pour: Statistiques par rôle

5. **idx_users_role_deleted** - Index composite
   - Optimise: `SELECT * FROM users WHERE role = 'admin' AND deleted_at IS NULL`
   - Combine: Rôle + statut de suppression

6. **idx_users_created_at** - Tri chronologique
   - Optimise: `ORDER BY created_at DESC`
   - Tri: Ordre de création

7. **idx_users_updated_at** - Tri par modification
   - Optimise: `ORDER BY updated_at DESC`
   - Utile pour: Voir dernières modifications

8. **idx_users_version** - Contrôle de concurrence
   - Optimise: Vérifications de version
   - Type: Composite (id, version)

## 🔒 Contrôle de Concurrence

### Stratégie: Concurrence Optimiste

#### Principe
- Chaque ligne a une colonne `version` (INTEGER)
- À chaque UPDATE, la version est automatiquement incrémentée via trigger
- Le client vérifie la version avant de modifier

#### Avantages
- ✅ Pas de verrous (locks) bloquants
- ✅ Haute performance en lecture
- ✅ Détecte les modifications concurrentes
- ✅ Pas de deadlocks

#### Inconvénients
- ⚠️ Nécessite retry côté client en cas de conflit
- ⚠️ Plus complexe à implémenter côté application

### Trigger Automatique

```sql
CREATE OR REPLACE FUNCTION update_user_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Comportement:**
- Incrémente automatiquement `version` à chaque UPDATE
- Met à jour `updated_at` automatiquement
- Pas besoin de gérer manuellement dans le code

### Utilisation dans le Code

#### Sans concurrence optimiste (actuel)
```typescript
async update(id: string, updateData: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  return data;
}
```

#### Avec concurrence optimiste (recommandé)
```typescript
async update(id: string, updateData: any, expectedVersion: number) {
  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .eq('version', expectedVersion) // ⚠️ Vérification de version
    .select()
    .single();

  if (!data) {
    throw new ConflictException(
      'Conflit de version: l\'utilisateur a été modifié par un autre processus'
    );
  }

  return data;
}
```

## 🚀 Recommandations Performance

### 1. Utiliser les Index Appropriés
- ✅ `email` pour login (UNIQUE déjà indexé)
- ✅ `role` pour filtres admin
- ✅ `deleted_at` pour soft delete queries
- ✅ `(role, deleted_at)` pour requêtes combinées

### 2. Éviter les Full Table Scans
```typescript
// ❌ Mauvais - Full scan
SELECT * FROM users;

// ✅ Bon - Utilise index
SELECT * FROM users WHERE deleted_at IS NULL;
SELECT * FROM users WHERE role = 'admin';
```

### 3. Pagination pour Grandes Listes
```typescript
// Au lieu de charger tous les utilisateurs
const { data } = await supabase
  .from('users')
  .select('*')
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
  .range(0, 49); // Pagination: 50 premiers
```

### 4. Utiliser les Transactions pour Opérations Multiples
```typescript
// Pour bulk delete
const supabase = this.supabaseService.getClient();

// Supabase gère les transactions automatiquement
// pour les opérations atomiques
await supabase
  .from('users')
  .update({ deleted_at: now, deleted_by: adminId })
  .in('id', userIds);
```

## 🔐 Isolation des Transactions (PostgreSQL)

Supabase utilise PostgreSQL avec le niveau d'isolation **READ COMMITTED** par défaut:

- ✅ Une transaction voit les changements committés par d'autres transactions
- ✅ Pas de "dirty reads"
- ✅ Prévient les lectures fantômes pour les mêmes requêtes

### Niveaux d'Isolation Disponibles

1. **READ UNCOMMITTED** - Non recommandé (PostgreSQL traite comme READ COMMITTED)
2. **READ COMMITTED** - Par défaut ✅
3. **REPEATABLE READ** - Pour cohérence stricte
4. **SERIALIZABLE** - Maximum isolation (impact performance)

## 📈 Métriques à Surveiller

### 1. Temps de Réponse Requêtes
```sql
-- Activer query stats dans Supabase Dashboard
-- Ou via pg_stat_statements
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%users%'
ORDER BY mean_exec_time DESC;
```

### 2. Utilisation des Index
```sql
-- Vérifier si les index sont utilisés
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename = 'users';
```

### 3. Bloat (Fragmentation)
```sql
-- Vérifier la fragmentation de la table
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename = 'users';
```

## 🛡️ Bonnes Pratiques Sécurité Concurrence

1. **Toujours valider avant UPDATE**
   - Vérifier que l'utilisateur existe
   - Vérifier les permissions
   - Vérifier la version (si optimistic locking)

2. **Gérer les Retry Logic**
   ```typescript
   async updateWithRetry(id: string, data: any, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         const user = await this.findOne(id);
         return await this.update(id, data, user.version);
       } catch (error) {
         if (error instanceof ConflictException && i < maxRetries - 1) {
           // Attendre un peu avant de réessayer
           await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
           continue;
         }
         throw error;
       }
     }
   }
   ```

3. **Utiliser Row-Level Security (RLS)**
   - Déjà configuré dans Supabase
   - Prévient les accès non autorisés au niveau DB

## 📝 Checklist Migration

- [x] Index sur deleted_at (partiel)
- [x] Index sur deleted_by (partiel)
- [ ] Index sur email (à appliquer)
- [ ] Index sur role (à appliquer)
- [ ] Index composite role+deleted_at (à appliquer)
- [ ] Index sur created_at (à appliquer)
- [ ] Index sur updated_at (à appliquer)
- [ ] Colonne version (à appliquer)
- [ ] Trigger update_user_version (à appliquer)
- [ ] Index sur (id, version) (à appliquer)

## 🎯 Prochaines Étapes

1. **Appliquer les migrations de performance**
   ```bash
   # Dans Supabase SQL Editor
   # Exécuter: 20260102_add_users_performance_indexes.sql
   # Exécuter: 20260102_add_concurrency_control.sql
   ```

2. **Mettre à jour le code pour utiliser la version**
   - Modifier UpdateUserDto pour accepter version
   - Modifier UsersService.update() pour vérifier version
   - Ajouter retry logic si nécessaire

3. **Monitoring**
   - Activer slow query log
   - Surveiller utilisation CPU/mémoire
   - Analyser plans d'exécution des requêtes lentes

4. **Tests de charge**
   - Tester avec 100+ utilisateurs concurrents
   - Vérifier les temps de réponse
   - Valider la gestion des conflits
