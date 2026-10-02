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

### Densité compacte

- **Objectif :** voir beaucoup de conversations d'un coup, comme dans la barre latérale de Cursor Agents. Upstream (`docs/design.md` §7) veut des lignes aérées et reste le défaut ; avec des centaines de workspaces, je veux pouvoir choisir la densité.
- **Comportement :** densité confortable (celle d'upstream) par défaut. En compact, chaque workspace tient sur une ligne, comme dans Cursor : les lignes font 24 à 28 px au lieu de 36, la ligne d'infos sous le titre disparaît, l'hôte d'un workspace distant devient une icône de serveur seule au bout de la ligne de titre, l'avatar du projet passe de 16 à 12 px, et un projet vide se réduit à sa ligne (son « + » suffit). Réglage : racine du menu, « Density ».
- **Où :** `display-preferences/density.ts` ; le réglage `sidebarDensity` ; le style `rowCompact` de `sidebar/sidebar-workspace-row-content.tsx`, appliqué par les trois lignes de workspace (`sidebar-workspace-list.tsx`, `sidebar/sidebar-workspace-row.tsx`, `sidebar/sidebar-status-list.tsx`) et par `sidebar/sidebar-group-toggle-row.tsx` ; `projectRowCompact` dans `sidebar-workspace-list.tsx` ; le badge d'hôte sur la ligne de titre, dans `SidebarWorkspaceRowContent`. Si upstream ajoute une variante de ligne de workspace, elle prend aussi `rowCompact`.
- **Preuve :** `e2e/browser/sidebar-density.spec.ts`, le dernier test de `e2e/browser/host-appearance.spec.ts`, `hooks/use-settings/storage.test.ts`.
- **Commit d'origine :** `feature/compact-density`.
- **Règle d'abandon :** si upstream ajoute une densité compacte, prendre la leur.

### Limite par projet et « More » à la Cursor

- **Objectif :** qu'un projet avec un long historique (jusqu'à 200 conversations importées de Cursor) n'écrase pas ceux du dessous. On ne voit que ses derniers workspaces, et on en dévoile plus à la demande, par pages, comme dans Cursor.
- **Comportement :** 3, 5, 10 ou 20 workspaces par projet, 5 par défaut. Sous la limite, une ligne « More » discrète, sans flèche. Chaque clic affiche 10 workspaces de plus, et la ligne disparaît quand tout est visible (pas de « Show less »). Le workspace affiché à l'écran reste toujours visible. Le réglage n'apparaît qu'en regroupement par projet.
- **Où :** `display-preferences/project-limit.ts` ; le réglage `sidebarWorkspaceLimit` ; `sidebar/limited-sidebar-group.ts` (logique pure) ; le hook `sidebar/use-paged-sidebar-group.ts` (le `useLimitedSidebarGroup` d'upstream reste intact pour les épinglés et les groupes de statut) ; `ProjectBlock` dans `sidebar-workspace-list.tsx` ; l'action `"more"` de `SidebarGroupToggleRow`.
- **Preuve :** `e2e/browser/sidebar-project-limit.spec.ts`, `sidebar/limited-sidebar-group.test.ts`, `hooks/use-settings/storage.test.ts`. Le test de défilement d'upstream (`sidebar-workspace.spec.ts`) clique deux fois sur « More » pour afficher ses 25 workspaces.
- **Commit d'origine :** `feature/project-workspace-limit`.
- **Règle d'abandon :** si upstream rend la limite réglable avec un « More » paginé, prendre le leur. Si la limite devient réglable mais avec un simple déplier/replier, garder notre « More » et me prévenir.

### Masquage des inactifs

- **Objectif :** que la barre latérale montre ce qui est en cours, pas ce qui est fini depuis des semaines, sans rien archiver ni supprimer.
- **Comportement :** jamais, 3, 7, 14 ou 30 jours, 14 par défaut. Un workspace _terminé et lu_ (`statusBucket === "done"`) dont `statusEnteredAt` est plus ancien que le seuil passe derrière « More ». Jamais ceux en cours, en attente, en échec, non lus, ni celui affiché à l'écran. Le réglage n'apparaît qu'en regroupement par projet.
- **Où :** `display-preferences/project-limit.ts` ; le réglage `sidebarHideInactiveDays` ; `isStaleWorkspace` et `projectWorkspaceGroupOptions` dans `sidebar/limited-sidebar-group.ts` ; `ProjectBlock` dans `sidebar-workspace-list.tsx`.
- **Preuve :** `sidebar/limited-sidebar-group.test.ts`, `hooks/use-settings/storage.test.ts`.
- **Commit d'origine :** `feature/hide-inactive-workspaces`.
- **Règle d'abandon :** si upstream masque automatiquement les inactifs, prendre le leur. En cas d'équivalence partielle (par exemple de l'archivage automatique), **ne rien retirer** et me demander.

### Raccourcis clavier alignés sur la limite par projet

- **Objectif :** que Cmd+1…9 ouvre toujours une ligne visible. Upstream numérote tous les workspaces d'un projet ; avec la limite et le masquage, Cmd+6 pouvait ouvrir un workspace caché derrière « More », et le projet suivant n'avait plus de numéros.
- **Comportement :** seules les lignes qu'un projet affiche avant « More » sont numérotées. Le workspace sélectionné, quand il est affiché au-delà de la limite, garde sa place mais pas de numéro.
- **Où :** `buildSidebarProjection` dans `sidebar/sidebar-projection.ts` (via `projectWorkspaceGroupOptions`) ; `sidebar/sidebar-model.tsx` lui passe la limite.
- **Preuve :** `sidebar/sidebar-projection.test.ts` ; `workspace-shortcut-targets-subscriber.test.tsx` monte maintenant un `QueryClientProvider`, puisque le modèle lit les réglages.
- **Commit d'origine :** `feature/shortcuts-follow-limit`.
- **Règle d'abandon :** disparaît avec la limite par projet.

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
