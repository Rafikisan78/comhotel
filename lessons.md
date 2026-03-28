# Lessons Learned - ComHotel

## Regles de verification avant chaque push

### 1. package-lock.json synchronise
Apres TOUTE modification de `package.json`, toujours regenerer le lock file :
```bash
cd apps/backend && rm -f package-lock.json && npm install
cd apps/frontend && rm -f package-lock.json && npm install
```
**Pourquoi :** Railway et Vercel utilisent `npm ci` qui exige une synchronisation parfaite entre `package.json` et `package-lock.json`. Sinon le build echoue avec `Missing: <package> from lock file`.

### 2. Version Node.js
Le projet necessite **Node.js >= 20**. Verifie par :
- `apps/backend/package.json` → champ `"engines": { "node": ">=20.0.0" }`
- `apps/backend/.node-version` → contient `20`

**Pourquoi :** Supabase SDK v2.90+ et ses sous-packages exigent Node >= 20. Sans cette specification, Railway utilise Node 18 par defaut et le build echoue avec `EBADENGINE`.

### 3. Pas de secrets dans le code
Avant chaque commit, verifier qu'aucun secret n'est expose :
```bash
git diff --cached | grep -iE "(eyJ|password|secret_key|service_role|anon_key)"
```
Si cette commande retourne des resultats, NE PAS commiter.

**Pourquoi :** Les cles Supabase et mots de passe admin ont ete exposes dans l'historique git. Les secrets doivent etre uniquement dans les fichiers `.env` (exclus par `.gitignore`).

### 4. Lint avant push
Toujours linter avant de push :
```bash
cd apps/backend && npm run lint
cd apps/frontend && npm run lint
```
- Backend : 0 erreurs tolerees, warnings `no-explicit-any` acceptes
- Frontend : 0 erreurs tolerees, warnings `useEffect deps` et `<img>` acceptes

**Pourquoi :** Vercel fait un lint pendant le build. Si le lint echoue, le deploiement echoue aussi.

### 5. Suspense pour useSearchParams
Tout composant Next.js utilisant `useSearchParams()` doit etre enveloppe dans `<Suspense>`.

**Pourquoi :** Next.js 14 exige un Suspense boundary pour la generation de pages statiques. Sans cela, le build Vercel echoue avec `useSearchParams() should be wrapped in a suspense boundary`.

### 6. Root Directory pour monorepo
Sur les plateformes de deploiement (Railway, Vercel), configurer le **Root Directory** :
- Vercel (frontend) : `apps/frontend`
- Railway (backend) : `apps/backend`

**Pourquoi :** Sans cette config, la plateforme essaie de builder a la racine du monorepo et echoue car il n'y a pas de `package.json` a la racine.

### 7. Build local avant push
Toujours verifier que le build passe en local :
```bash
cd apps/backend && npm run build
cd apps/frontend && npm run build
```

**Pourquoi :** Detecter les erreurs TypeScript et de compilation avant qu'elles n'echouent sur Railway/Vercel.

## Checklist pre-push

- [ ] `npm run lint` passe (backend + frontend)
- [ ] `npm run build` passe (backend + frontend)
- [ ] `package-lock.json` regenere si `package.json` modifie
- [ ] Aucun secret dans les fichiers commites (`git diff --cached`)
- [ ] `.env` et `.env.local` dans `.gitignore`
