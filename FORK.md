# RDeluxe/paseo — fork de getpaseo/paseo

Ce fichier est la source de vérité du fork. **Tout agent qui rebase, corrige ou étend ce fork le lit en entier avant de commencer**, applique ses règles, et tient son journal à jour.

## Pourquoi ce fork

J'utilise Paseo (Apache 2.0) sur mon Mac pour piloter mes agents. Je viens de Cursor, dont j'ai importé environ 750 conversations sur une vingtaine de projets. La barre latérale d'upstream ne tient pas cette charge : elle est peu dense (son `docs/design.md` interdit explicitement de serrer les lignes), sans repli automatique, avec une limite « Show more » fixée à 20 dans le code. Celle de Cursor Agents gère très bien ce volume.

Les plugins Paseo ne peuvent pas modifier les lignes de la barre latérale, et upstream ferme les PR par défaut (`CONTRIBUTING.md`). D'où ce fork, **maintenu par un agent** : rebase quotidien sur les versions stables, build régulier de l'app Mac en CI.

Si upstream propose un jour l'équivalent de toutes nos fonctions, le fork n'a plus de raison d'être : on l'abandonne et je reviens à l'app officielle.

## État

- Base upstream actuelle : `v0.10.2`
- Dernière version du fork : aucune pour l'instant (la première sortira du workflow `fork-desktop-macos.yml`)
- Dernier rebase réussi : 2026-10-02 (création du fork)

## Nos fonctions

Toutes côté client (`packages/app`). Le code vit dans **`packages/app/src/fork/`**. Le code d'upstream n'est touché qu'à des **points d'accroche** marqués `// FORK(RDeluxe/paseo)` (`grep -rn "FORK(RDeluxe/paseo)" packages .github`). Les préférences sont dans un store local persistant (`fork/sidebar-preferences.ts`, clé `fork-sidebar-preferences`), volontairement hors des réglages synchronisés d'upstream pour ne jamais créer de conflit dans `hooks/use-settings/storage.ts`. Les textes sont dans `fork/strings.ts` (fr/en), hors des fichiers de langue d'upstream.

Toutes les fonctions se règlent dans **Préférences d'affichage** (l'icône à curseurs en haut de la liste des workspaces), sous le bloc d'upstream.

| Fonction                                                                                                                                                                                                                                                             | Ajoutée le | Fichiers du fork                                                                    | Points d'accroche dans upstream                                                                                                                                                                                     | Règle d'abandon                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tout replier / tout déplier**                                                                                                                                                                                                                                      | 2026-10-02 | `fork/sidebar-menu.tsx` (`ForkSidebarMenuEntries`)                                  | `display-preferences/menu.tsx` (2 lignes)                                                                                                                                                                           | Si upstream ajoute un « collapse all » : prendre le leur, retirer le nôtre.                                                                                                          |
| **Limite par projet + « Show more »** (3/5/10/20, 5 par défaut)                                                                                                                                                                                                      | 2026-10-02 | `fork/limited-group.ts` (+ tests), `fork/project-group.ts`, `fork/sidebar-menu.tsx` | `sidebar/use-limited-sidebar-group.ts` (paramètre `options` facultatif ; sans lui, comportement upstream inchangé à 20), `sidebar-workspace-list.tsx` (`ProjectBlock`)                                              | Si upstream rend la limite réglable par projet : prendre le leur.                                                                                                                    |
| **Masquage des inactifs** (jamais/3/7/14/30 j, 14 par défaut) : les workspaces _terminés_ (`statusBucket === "done"`) dont `statusEnteredAt` est plus ancien passent derrière « Show more » ; jamais ceux en cours, en attente, en échec, ni celui affiché à l'écran | 2026-10-02 | `fork/limited-group.ts` (`isStaleWorkspace`), `fork/project-group.ts`               | mêmes que la limite                                                                                                                                                                                                 | Si upstream masque automatiquement les workspaces inactifs : prendre le leur. Équivalence partielle (par ex. archivage auto au lieu de masquage) : **ne rien retirer**, me demander. |
| **Densité compacte** (par défaut) : lignes de 24–26 px au lieu de 36, et pas de ligne « + New workspace » sous un projet vide (le « + » de la ligne du projet suffit)                                                                                                | 2026-10-02 | `fork/sidebar-density.ts`, `fork/sidebar-preferences.ts`                            | `sidebar-workspace-list.tsx` (ligne de projet, `getProjectWorkspaceRowStyle`, ligne vide de projet), `sidebar/sidebar-workspace-row.tsx`, `sidebar/sidebar-status-list.tsx`, `sidebar/sidebar-group-toggle-row.tsx` | Si upstream ajoute une densité compacte : prendre la leur.                                                                                                                           |

**Fonction native, sans code :** la date de dernière activité à droite des lignes existe déjà dans upstream (Préférences d'affichage → Show → Timestamp, basée sur `statusEnteredAt`). Rien à maintenir.

**Preuve :** `packages/app/e2e/browser/fork-sidebar.spec.ts` (limite, densité, Show more, tout replier/déplier, persistance) et `packages/app/src/fork/limited-group.test.ts` (limite, masquage, workspace affiché toujours visible).

## Modifications propres au fork (hors fonctions)

| Modification                                                                              | Fichier                                         | Raison                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mise à jour automatique coupée (`isPackaged: () => false` pour le service de mise à jour) | `packages/desktop/src/features/auto-updater.ts` | Le flux officiel remplacerait l'app du fork par l'app officielle. Le build n'est de toute façon pas signé, et la mise à jour automatique Electron l'exige sur Mac.                                                                                                                                                                                                                                                 |
| `publish` → `RDeluxe/paseo`                                                               | `packages/desktop/electron-builder.yml`         | Les releases vont sur le fork.                                                                                                                                                                                                                                                                                                                                                                                     |
| Workflow `fork-desktop-macos.yml`                                                         | `.github/workflows/`                            | Le seul workflow actif du fork : build arm64 non signé (signature ad hoc `-c.mac.identity=-`, `-c.mac.notarize=false`, `-c.mac.hardenedRuntime=false` : sans Team ID, le hardened runtime refuse de charger les frameworks Electron), test de démarrage packagé (`PASEO_DESKTOP_SMOKE=1`), release `fork-v<upstream>-<run>`. Cron tous les 3 jours, ne construit que si `main` a bougé depuis la dernière release. |
| Workflows upstream **désactivés** côté GitHub (`gh workflow disable`)                     | réglage du dépôt                                | Ils déploient le site, Docker, Android… et réclament des secrets qu'on n'a pas. Après chaque rebase, vérifier `gh workflow list` : tout nouveau workflow upstream doit être désactivé.                                                                                                                                                                                                                             |
| Encadré « fork » en tête de `CLAUDE.md`                                                   | `CLAUDE.md` (`AGENTS.md` est un lien)           | Envoie tout agent vers ce fichier.                                                                                                                                                                                                                                                                                                                                                                                 |
| `FORK.md`                                                                                 | racine                                          | Ce fichier.                                                                                                                                                                                                                                                                                                                                                                                                        |

On garde volontairement `appId: sh.paseo.desktop` et `productName: Paseo` : l'app du fork remplace l'officielle et réutilise `~/.paseo` (mon historique). **On ne touche jamais au démon (`packages/server`) ni au protocole (`packages/protocol`)**, pour que l'app mobile officielle et le démon officiel restent compatibles.

## Modèle de branches

- **Base :** le dernier tag **stable** d'upstream (`vX.Y.Z` sans `-beta`), jamais `main`.
- **`main` du fork :** la base, plus une pile courte de commits préfixés `fork:` :
  1. `fork: infra` — mise à jour coupée, publish, workflow, `FORK.md`, encadré `CLAUDE.md` ;
  2. `fork: sidebar` — les fonctions de la barre latérale (`packages/app/src/fork/` + points d'accroche + tests).
     Une nouvelle fonction = un nouveau commit `fork: <nom>`. Pour retirer une fonction de `fork: sidebar`, on édite ce commit (rebase interactif ou commit correctif `fork: drop <nom>`) en suivant la table ci-dessus.
- **Tags :** `fork-last-good` = dernier état poussé dont toutes les vérifications passaient. Releases : `fork-vX.Y.Z-N` (créées par la CI).
- **Remotes :** `origin` = `RDeluxe/paseo`, `upstream` = `getpaseo/paseo` avec **push désactivé** (`git remote set-url --push upstream DISABLE`). Ne jamais pousser vers upstream.

## Procédure de rebase (agent quotidien)

1. `git fetch upstream --tags`. Chercher le dernier tag stable : `git tag -l 'v*' --sort=-v:refname | awk '!/-/' | head -1`. S'il est égal à la base actuelle (section « État ») : **s'arrêter**, sans ligne au journal.
2. Lire le `CHANGELOG.md` d'upstream entre l'ancienne et la nouvelle base. Pour chaque fonction de la table, chercher un équivalent upstream et appliquer la règle d'abandon. **Me signaler dans tous les cas** une fonction retirée ou une équivalence partielle.
3. `git rebase --onto <nouveau-tag> <ancien-tag> main`.
4. Résoudre les conflits **selon ce fichier** :
   - Un point d'accroche a bougé : réappliquer l'intention décrite dans la table sur le nouveau code. Ne pas forcer l'ancien code.
   - Upstream a modifié un style de ligne : la surcharge compacte reste ajoutée **après** le style d'upstream, dans les trois variantes de ligne (projet, statut, épinglée) et dans la ligne « Show more ».
   - Upstream a modifié `useLimitedSidebarGroup` : garder la signature `(items, options?)`. Sans `options`, le comportement doit rester exactement celui d'upstream.
5. Vérifier, depuis la racine :
   - `npm ci`, puis `npm run build:app-deps` et `npm run build:server-deps` ;
   - `cd packages/app && npx tsgo --noEmit` ;
   - `npx vitest run src/fork src/components/sidebar src/stores/sidebar-collapsed-sections-store` ;
   - `npx playwright test --project=browser e2e/browser/fork-sidebar.spec.ts` (installer d'abord `npx playwright install chromium` si besoin) ;
   - `grep -rn "FORK(RDeluxe/paseo)" packages .github` : chaque point d'accroche de la table doit toujours être là.
6. Si tout passe : mettre à jour la section « État », ajouter une ligne au journal (commit `fork: journal <date>` en fin de pile, ou amender `fork: infra`), `git push --force-with-lease origin main`, puis déplacer `fork-last-good` (`git tag -f fork-last-good && git push -f origin fork-last-good`).
7. Si quoi que ce soit échoue : **ne rien pousser**, ouvrir une issue `rebase-failed` sur `RDeluxe/paseo` avec la commande, la sortie et ton diagnostic, et terminer sur un message clair.

Le build Mac n'est pas du ressort de l'agent : la CI s'en charge tous les 3 jours. Pour en forcer un : `gh workflow run fork-desktop-macos.yml -f force=true`.

## Installer une version

```bash
gh release download --repo RDeluxe/paseo --pattern '*arm64.zip' -D ~/Downloads <tag>
# Quitter Paseo (Cmd+Q), remplacer /Applications/Paseo.app par celle du zip, puis :
xattr -dr com.apple.quarantine /Applications/Paseo.app
```

## Ce qui demande mon accord

- Toute modification hors de `packages/app`, `packages/desktop`, `.github/workflows/fork-*`, `FORK.md` et de l'encadré de `CLAUDE.md`.
- Toute nouvelle fonction.
- Le retrait d'une fonction pour équivalence partielle avec upstream.

## Fonctions retirées

| Fonction | Retirée le | Remplacée par (version upstream) |
| -------- | ---------- | -------------------------------- |

## Journal

| Date       | Base    | Résultat | Notes                                                                                                 |
| ---------- | ------- | -------- | ----------------------------------------------------------------------------------------------------- |
| 2026-10-02 | v0.10.2 | création | Fork créé ; infra + 4 fonctions de barre latérale ; typecheck, tests unitaires et e2e verts en local. |
