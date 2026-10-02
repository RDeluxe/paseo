# RDeluxe/paseo — fork de getpaseo/paseo

Ce fichier est la source de vérité du fork. **Tout agent qui rebase, corrige ou étend ce fork le lit en entier avant de commencer**, applique ses règles, et tient son journal à jour.

## Pourquoi ce fork

J'utilise Paseo (Apache 2.0) sur mon Mac pour piloter mes agents. Je viens de Cursor, dont j'ai importé environ 750 conversations sur une vingtaine de projets. La barre latérale d'upstream ne tient pas cette charge : elle est peu dense, sans repli automatique, avec une limite « Show more » fixée à 20 dans le code. Celle de Cursor Agents gère très bien ce volume.

Les plugins Paseo ne peuvent pas modifier les lignes de la barre latérale, et upstream ferme les PR par défaut (`CONTRIBUTING.md`). D'où ce fork, **maintenu par un agent** : rebase quotidien sur les versions stables, build régulier de l'app Mac en CI.

Si upstream propose un jour l'équivalent de toutes nos fonctions, le fork n'a plus de raison d'être : on l'abandonne et je reviens à l'app officielle.

## État

- Base upstream actuelle : `v0.10.2`
- Dernière version du fork : celle de la dernière release `fork-*` (`gh release list --repo RDeluxe/paseo`)
- Dernier rebase réussi : 2026-10-02 (création du fork)

## Comment le fork modifie upstream

**Le fork modifie le code d'upstream directement**, comme le ferait une PR : pas de dossier à part, pas de couche d'adaptation, pas de marqueurs dans le code. Une fonction du fork est une évolution des fichiers existants, écrite selon les standards du dépôt (`docs/coding-standards.md`, `docs/design.md`, `docs/menus.md`, `docs/i18n.md`, `docs/testing.md`) : préférences dans les réglages d'upstream, textes dans les fichiers de langue (les 9 langues), valeurs d'espacement tirées du thème, tests à côté du code.

Au rebase, les conflits se résolvent en comprenant les deux intentions, celle d'upstream et celle de la fonction décrite ci-dessous, et en écrivant le code qui sert les deux. Ce sont les tests qui disent si c'est réussi.

## Nos fonctions

Toutes côté client (`packages/app`), réglables dans **Préférences d'affichage** (l'icône à curseurs en haut de la liste des workspaces). Leurs préférences sont des réglages d'upstream (`hooks/use-settings/storage.ts`), lus par `display-preferences/model.ts`.

Chaque fonction a ci-dessous son **objectif** (le besoin, à préserver quelle que soit la forme du code), son comportement, l'endroit où elle vit, sa preuve, son **commit d'origine** et sa règle d'abandon.

**Commits d'origine.** Chaque fonction est introduite par un seul commit, et ce commit est figé par un tag `feature/<nom>` que l'on ne déplace jamais. Un rebase réécrit les commits et change leurs identifiants, mais le tag garde l'original : `git show feature/<nom>` montre le diff tel qu'il a été écrit, sur sa base de l'époque. Pendant un conflit, c'est la référence pour retrouver l'intention : comparer ce diff au code d'upstream d'aujourd'hui, puis réécrire la même intention sur le nouveau code.

**Fonction native, sans code :** la date de dernière activité à droite des lignes existe déjà dans upstream (Préférences d'affichage → Show → Last activity).

## Modifications propres au fork (hors fonctions)

| Modification                                                                              | Fichier                                         | Raison                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mise à jour automatique coupée (`isPackaged: () => false` pour le service de mise à jour) | `packages/desktop/src/features/auto-updater.ts` | Le build n'est pas signé, et la mise à jour automatique d'Electron l'exige sur Mac. Les nouvelles versions s'installent à la main (voir « Installer une version »).                                                                                                                                                                                                                                                |
| `publish` → `RDeluxe/paseo`                                                               | `packages/desktop/electron-builder.yml`         | Les releases vont sur le fork.                                                                                                                                                                                                                                                                                                                                                                                     |
| Workflow `fork-desktop-macos.yml`                                                         | `.github/workflows/`                            | Le seul workflow actif du fork : build arm64 non signé (signature ad hoc `-c.mac.identity=-`, `-c.mac.notarize=false`, `-c.mac.hardenedRuntime=false` : sans Team ID, le hardened runtime refuse de charger les frameworks Electron), test de démarrage packagé (`PASEO_DESKTOP_SMOKE=1`), release `fork-v<upstream>-<run>`. Cron tous les 3 jours, ne construit que si `main` a bougé depuis la dernière release. |
| Workflows upstream **désactivés** côté GitHub (`gh workflow disable`)                     | réglage du dépôt                                | Ils déploient le site, Docker, Android… et réclament des secrets qu'on n'a pas. Après chaque rebase, vérifier `gh workflow list` : tout nouveau workflow upstream doit être désactivé.                                                                                                                                                                                                                             |
| Encadré « fork » en tête de `CLAUDE.md`                                                   | `CLAUDE.md` (`AGENTS.md` est un lien)           | Envoie tout agent vers ce fichier.                                                                                                                                                                                                                                                                                                                                                                                 |
| `FORK.md`                                                                                 | racine                                          | Ce fichier.                                                                                                                                                                                                                                                                                                                                                                                                        |

On garde volontairement `appId: sh.paseo.desktop` et `productName: Paseo` : l'app du fork remplace l'officielle et réutilise `~/.paseo` (mon historique). **On ne touche jamais au démon (`packages/server`) ni au protocole (`packages/protocol`)**, pour que l'app mobile officielle et le démon officiel restent compatibles.

## Modèle de branches

- **Base :** le dernier tag **stable** d'upstream (`vX.Y.Z` sans `-beta`), jamais `main`.
- **`main` du fork :** la base, plus une pile de commits **atomiques**, un par changement, écrits comme ceux d'upstream : Conventional Commits (`feat(app): …`, `fix(app): …`, `chore(desktop): …`, `ci: …`, `docs: …`), phrase à l'impératif, corps en prose qui dit pourquoi. Jamais de préfixe « fork ».
  - En bas de pile, l'outillage du fork : `chore(desktop)` (mise à jour coupée, publish), `ci` (workflow), `docs` (`FORK.md`, encadré `CLAUDE.md`).
  - Au-dessus, une fonction par commit, avec son code, ses traductions, ses tests et sa section de ce fichier, et son tag `feature/<nom>`.
  - Une nouvelle fonction = un nouveau commit en haut de pile, plus son tag. Corriger une fonction = amender son commit (`git commit --fixup` puis `git rebase --autosquash`), pour qu'elle reste en un seul commit. Retirer une fonction = supprimer son commit de la pile (et noter son tag dans « Fonctions retirées »).
- **Tags :** `fork-last-good` = dernier état poussé dont toutes les vérifications passaient. `feature/<nom>` = commit d'origine de chaque fonction, figé (voir « Nos fonctions ») ; ne jamais le déplacer ni le supprimer. Releases : `fork-vX.Y.Z-N` (créées par la CI).
- **Remotes :** `origin` = `RDeluxe/paseo`, `upstream` = `getpaseo/paseo` avec **push désactivé** (`git remote set-url --push upstream DISABLE`). Ne jamais pousser vers upstream.

## Procédure de rebase (agent quotidien)

1. `git fetch upstream --tags`. Chercher le dernier tag stable : `git tag -l 'v*' --sort=-v:refname | awk '!/-/' | head -1`. S'il est égal à la base actuelle (section « État ») : **s'arrêter**, sans ligne au journal.
2. Lire le `CHANGELOG.md` d'upstream entre l'ancienne et la nouvelle base. Pour chaque fonction, chercher un équivalent upstream et appliquer sa règle d'abandon. **Me signaler dans tous les cas** une fonction retirée ou une équivalence partielle.
3. `git rebase --onto <nouveau-tag> <ancien-tag> main`. Le rebase rejoue la pile commit par commit, donc une fonction à la fois.
4. Résoudre les conflits en lisant les deux côtés, en partant de l'**objectif** de la fonction et de son commit d'origine (`git show feature/<nom>`) : garder ce qu'upstream a changé, et réappliquer l'intention de la fonction (son objectif et son comportement) sur le nouveau code, selon les standards du dépôt. Si upstream a ajouté une langue, elle reçoit nos textes.
5. Vérifier, depuis la racine :
   - `npm ci`, puis `npm run build:app-deps` et `npm run build:server-deps` ;
   - `cd packages/app && npx tsgo --noEmit` ;
   - `npx vitest run src/components/sidebar src/hooks/use-settings src/utils src/stores src/i18n` ;
   - `npx playwright test e2e/browser/sidebar-*.spec.ts e2e/browser/host-appearance.spec.ts` (tous les tests de barre latérale, ceux d'upstream compris ; installer d'abord `npx playwright install chromium` si besoin) ;
   - depuis la racine : `npx oxlint` et `npx oxfmt --check` sur les fichiers modifiés.

   Sur Mac seulement, `sidebar-nav-settings.spec.ts` échoue chez upstream aussi (il attend `Ctrl+N`, le Mac affiche `⌘N`) : ce n'est pas une régression. En local sur ce Mac, d'autres specs hors barre latérale échouent aussi chez upstream, pour des raisons d'environnement (fournisseur `opencode` absent, recherche de dossiers d'`add-project-flow`).

6. Si tout passe : mettre à jour la section « État », ajouter une ligne au journal (dans le commit `docs` de `FORK.md`, par fixup), `git push --force-with-lease origin main`, puis déplacer `fork-last-good` (`git tag -f fork-last-good && git push -f origin fork-last-good`).
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

| Fonction | Tag | Retirée le | Remplacée par (version upstream) |
| -------- | --- | ---------- | -------------------------------- |

## Journal

| Date       | Base    | Résultat | Notes                                                                                                           |
| ---------- | ------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| 2026-10-02 | v0.10.2 | création | Fork créé, fonctions de barre latérale en commits atomiques ; typecheck, tests unitaires et e2e verts en local. |
