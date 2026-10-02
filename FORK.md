# RDeluxe/paseo — fork de getpaseo/paseo

Ce fichier est la source de vérité du fork. **Tout agent qui rebase, corrige ou étend ce fork le lit en entier avant de commencer**, applique ses règles, et tient son journal à jour.

## Pourquoi ce fork

J'utilise Paseo (Apache 2.0) sur mon Mac pour piloter mes agents. Je viens de Cursor, dont j'ai importé environ 750 conversations sur une vingtaine de projets. La barre latérale d'upstream ne tient pas cette charge : elle est peu dense, sans repli automatique, avec une limite « Show more » fixée à 20 dans le code. Celle de Cursor Agents gère très bien ce volume.

Les plugins Paseo ne peuvent pas modifier les lignes de la barre latérale, et upstream ferme les PR par défaut (`CONTRIBUTING.md`). D'où ce fork, **maintenu par un agent** : rebase quotidien sur les versions stables, build régulier de l'app Mac en CI.

Si upstream propose un jour l'équivalent de toutes nos fonctions, le fork n'a plus de raison d'être : on l'abandonne et je reviens à l'app officielle.

## État

- Base upstream actuelle : `v0.10.3`
- Dernière version du fork : celle de la dernière release `fork-*` (`gh release list --repo RDeluxe/paseo`)
- Dernier rebase réussi : 2026-10-05 (`v0.10.2` → `v0.10.3`)

## Comment le fork modifie upstream

**Le fork modifie le code d'upstream directement**, comme le ferait une PR : pas de dossier à part, pas de couche d'adaptation, pas de marqueurs dans le code. Une fonction du fork est une évolution des fichiers existants, écrite selon les standards du dépôt (`docs/coding-standards.md`, `docs/design.md`, `docs/menus.md`, `docs/i18n.md`, `docs/testing.md`) : préférences dans les réglages d'upstream, textes dans les fichiers de langue (les 9 langues), valeurs d'espacement tirées du thème, tests à côté du code.

Au rebase, les conflits se résolvent en comprenant les deux intentions, celle d'upstream et celle de la fonction décrite ci-dessous, et en écrivant le code qui sert les deux. Ce sont les tests qui disent si c'est réussi.

## Nos fonctions

Les fonctions de la barre latérale sont côté client (`packages/app`), réglables dans **Préférences d'affichage** (l'icône à curseurs en haut de la liste des workspaces). Leurs préférences sont des réglages d'upstream (`hooks/use-settings/storage.ts`), lus par `display-preferences/model.ts`. La description des commandes touche aussi le démon et le protocole, dans les limites fixées plus bas (« Démon et protocole »).

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

### Glisser-déposer qui respecte les lignes cachées

- **Objectif :** que la limite et le masquage ne cassent pas l'ordre manuel des workspaces. Upstream supposait que les lignes visibles étaient toujours les premières de la liste.
- **Comportement :** réordonner les lignes visibles d'un projet ne déplace plus les workspaces cachés derrière « More ».
- **Où :** `mergeIntoVisibleSlots` dans `utils/sidebar-reorder.ts`, utilisé par `handleWorkspaceReorder` dans `sidebar-workspace-list.tsx`.
- **Preuve :** `utils/sidebar-reorder.test.ts`.
- **Commit d'origine :** `feature/reorder-keeps-hidden`.
- **Règle d'abandon :** disparaît avec la limite par projet.

### Tout replier / tout déplier

- **Objectif :** ranger d'un geste une barre latérale de vingt projets, comme dans Cursor.
- **Comportement :** replie, ou déplie, les projets, les groupes de statut et la section épinglée. Deux actions en fin de menu, sans icônes.
- **Où :** `collapseAllSections` et `expandAllSections` dans `stores/sidebar-collapsed-sections-store/state.ts` ; deux lignes en fin de `display-preferences/menu.tsx`.
- **Preuve :** `e2e/browser/sidebar-collapse-all.spec.ts`, `stores/sidebar-collapsed-sections-store/state.test.ts`.
- **Commit d'origine :** `feature/collapse-all`.
- **Règle d'abandon :** si upstream ajoute un « collapse all », prendre le leur.

### Densité semi-compacte

- **Objectif :** garder tout ce que dit une ligne confortable (branche, PR, checks, labels), mais dans beaucoup moins de place, pour qui veut la densité sans perdre l'information.
- **Comportement :** troisième choix de « Density », entre confortable et compact. Les lignes prennent la géométrie serrée du compact et gardent la ligne d'infos, en plus courte : l'hôte devient une icône seule au bout du titre, la PR n'affiche que son numéro (l'icône et sa couleur disent ouverte, fusionnée ou fermée), les checks se réduisent à leur icône, et les séparateurs `·` disparaissent. L'avatar du projet garde sa taille.
- **Où :** `semiCompact` et `hasCompactRows` dans `display-preferences/density.ts` ; `condensed` dans `useSidebarMetaPreferences` (`display-preferences/model.ts`), lu par `WorkspaceMetaRow` (`sidebar/workspace-meta-row/index.tsx`) ; `SidebarWorkspaceRowContent` pour l'hôte.
- **Preuve :** `e2e/browser/sidebar-density.spec.ts`, `e2e/browser/host-appearance.spec.ts`, `hooks/use-settings/storage.test.ts`.
- **Commit d'origine :** `feature/semi-compact-density`.
- **Règle d'abandon :** si upstream ajoute une densité intermédiaire, prendre la leur.

### Dossiers à la place des avatars de projet

- **Objectif :** retrouver la lecture de Cursor, où l'icône d'un projet dit s'il est ouvert, pour qui préfère cela à l'avatar. Indépendant de la densité.
- **Comportement :** « Project icon » à la racine du menu : Avatar (par défaut, celui d'upstream) ou Folder. En Folder, chaque ligne de projet commence par un dossier ouvert quand le projet est déplié, fermé quand il est replié, à la taille de la densité ; le point de statut d'un projet replié reste au coin. Le dossier ne s'échange pas contre le chevron au survol. Les workspaces affichés hors de leur projet (regroupement par statut) gardent l'avatar, qui y nomme le projet.
- **Où :** `display-preferences/project-icon.ts` ; le réglage `sidebarProjectIcon` ; `ProjectMark` et `ProjectFolder` dans `sidebar/project-leading-visual.tsx` ; `ProjectHeaderRow` dans `sidebar-workspace-list.tsx`.
- **Preuve :** `e2e/browser/sidebar-project-icon.spec.ts`, `hooks/use-settings/storage.test.ts`.
- **Commit d'origine :** `feature/folder-project-icons`.
- **Règle d'abandon :** si upstream propose des dossiers à la place des avatars, prendre les leurs.

### Description des commandes

- **Objectif :** comprendre ce que fait l'agent sans lire ses scripts, comme dans Claude Code et Cursor. Quand l'agent décrit sa commande (« Chercher toutes les mentions de Freescout »), la ligne affiche cette phrase ; la commande brute ne sert qu'à qui la déplie.
- **Comportement :** une ligne de commande affiche `Shell` suivi de la description donnée par l'agent ; sans description, la commande, comme upstream. Le détail déplié montre toujours la commande et sa sortie. Ce que chaque harness fournit : Claude Code et OpenCode, le champ `description` de leur outil bash ; un agent ACP, le champ `description` de son `rawInput` s'il en a un (c'est le cas de l'adaptateur ACP de Claude). Cursor (`cursor-agent acp`) n'envoie que la commande, dans `rawInput.command` comme dans `title` (vérifié le 2026-10-02) : ses lignes restent sur la commande. Codex, Pi et OMP n'ont pas de description dans leurs appels. Pour qu'un nouveau harness en profite, son parseur remplit `description` du détail `shell`, et rien d'autre ne change.
- **Où :** le champ facultatif `description` du détail `shell` (`packages/protocol/src/agent-types.ts`, son schéma dans `messages.ts`, et la copie du type dans `packages/server/src/server/agent/agent-sdk-types.ts`) ; le libellé dans `packages/protocol/src/tool-call-display.ts` ; la lecture côté démon dans `ToolShellInputSchema` et `toShellToolDetail` (`providers/tool-call-detail-primitives.ts`, partagés par Claude, Codex et OpenCode) et dans `buildShellToolDetail` (`providers/acp-agent.ts`).
- **Preuve :** `protocol/src/tool-call-display.test.ts`, `protocol/src/messages.tool-call-schema.test.ts`, et les tests des mappers de `claude`, `opencode` et `acp-agent`.
- **Commit d'origine :** `feature/shell-command-descriptions`.
- **Règle d'abandon :** si upstream transporte et affiche la description des commandes, prendre la leur.

## Modifications propres au fork (hors fonctions)

| Modification                                                                              | Fichier                                         | Raison                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mise à jour automatique coupée (`isPackaged: () => false` pour le service de mise à jour) | `packages/desktop/src/features/auto-updater.ts` | Le build n'est pas signé, et la mise à jour automatique d'Electron l'exige sur Mac. Les nouvelles versions s'installent à la main (voir « Installer une version »).                                                                                                                                                                                                                                                |
| `publish` → `RDeluxe/paseo`                                                               | `packages/desktop/electron-builder.yml`         | Les releases vont sur le fork.                                                                                                                                                                                                                                                                                                                                                                                     |
| Workflow `fork-desktop-macos.yml`                                                         | `.github/workflows/`                            | Le seul workflow actif du fork : build arm64 non signé (signature ad hoc `-c.mac.identity=-`, `-c.mac.notarize=false`, `-c.mac.hardenedRuntime=false` : sans Team ID, le hardened runtime refuse de charger les frameworks Electron), test de démarrage packagé (`PASEO_DESKTOP_SMOKE=1`), release `fork-v<upstream>-<run>`. Cron tous les 3 jours, ne construit que si `main` a bougé depuis la dernière release. |
| Workflows upstream **désactivés** côté GitHub (`gh workflow disable`)                     | réglage du dépôt                                | Ils déploient le site, Docker, Android… et réclament des secrets qu'on n'a pas. Après chaque rebase, vérifier `gh workflow list` : tout nouveau workflow upstream doit être désactivé.                                                                                                                                                                                                                             |
| Encadré « fork » en tête de `CLAUDE.md`                                                   | `CLAUDE.md` (`AGENTS.md` est un lien)           | Envoie tout agent vers ce fichier.                                                                                                                                                                                                                                                                                                                                                                                 |
| `FORK.md`                                                                                 | racine                                          | Ce fichier.                                                                                                                                                                                                                                                                                                                                                                                                        |

On garde volontairement `appId: sh.paseo.desktop` et `productName: Paseo` : l'app du fork remplace l'officielle et réutilise `~/.paseo` (mon historique).

### Démon et protocole

L'app mobile officielle doit pouvoir parler au démon du fork, et l'app du fork à un démon officiel (une autre machine). Le démon (`packages/server`) et le protocole (`packages/protocol`) ne changent donc que **par ajout de champs facultatifs** :

- jamais de champ renommé, retiré ou rendu obligatoire, jamais de nouveau message ni de nouveau type de détail ;
- l'app officielle ignore le champ : les schémas zod du protocole ne sont pas stricts, ils retirent les clés qu'ils ne connaissent pas sans rejeter le message ;
- l'app du fork, face à un démon officiel, ne reçoit pas le champ et retombe sur le comportement d'upstream.

Une fonction qui ne tient pas dans ces limites se fait côté app, ou pas du tout. Aujourd'hui, seule la description des commandes s'en sert.

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
5. Vérifier. Chaque ligne se lance depuis la racine du dépôt, telle quelle (bash comme zsh) ; `<nouveau-tag>` est la nouvelle base. Une ligne qui échoue arrête tout et mène à l'étape 7.

   ```bash
   npm ci && npm run build:app-deps && npm run build:server-deps
   (cd packages/app && npx tsgo --noEmit)
   (cd packages/app && npx vitest run src/components/sidebar src/hooks/use-settings src/utils src/stores src/i18n)
   (cd packages/protocol && npx vitest run src/tool-call-display.test.ts src/messages.tool-call-schema.test.ts)
   (cd packages/server && npm run typecheck && npx vitest run src/server/agent/providers/acp-agent.test.ts src/server/agent/providers/claude/tool-call-mapper.test.ts src/server/agent/providers/opencode/tool-call-mapper.test.ts)
   (cd packages/app && npx playwright test e2e/browser/sidebar-*.spec.ts e2e/browser/host-appearance.spec.ts)
   git diff --name-only --diff-filter=d <nouveau-tag>..main | grep -E '\.(ts|tsx)$' | xargs npx oxlint
   git diff --name-only --diff-filter=d <nouveau-tag>..main | grep -E '\.(ts|tsx|json|md|yml)$' | xargs npx oxfmt --check
   ```

   - Les e2e couvrent tous les tests de barre latérale, ceux d'upstream compris. S'il manque le navigateur : `(cd packages/app && npx playwright install chromium)`.
   - Le lint et le formatage portent sur tous les fichiers que le fork change par rapport à la nouvelle base. S'ils disent n'avoir trouvé aucun fichier, c'est un échec de la commande, pas un succès.
   - Ne jamais lancer `npx vitest run` sans chemin dans `packages/server` : cela inclut les tests e2e, qui démarrent de vrais démons et de vrais agents.
   - Sur Mac seulement, `sidebar-nav-settings.spec.ts` échoue chez upstream aussi (il attend `Ctrl+N`, le Mac affiche `⌘N`) : ce n'est pas une régression. En local sur ce Mac, d'autres specs hors barre latérale échouent aussi chez upstream, pour des raisons d'environnement (fournisseur `opencode` absent, recherche de dossiers d'`add-project-flow`).

6. Si tout passe : mettre à jour la section « État », ajouter une ligne au journal (dans le commit `docs` de `FORK.md`, par fixup), `git push --force-with-lease origin main`, puis déplacer `fork-last-good` (`git tag -f fork-last-good && git push -f origin fork-last-good`).
7. Si quoi que ce soit échoue : **ne rien pousser**, remettre `main` dans son état d'avant (`git rebase --abort` pendant un rebase, sinon `git reset --hard origin/main`), puis ouvrir une issue avec la commande qui a échoué, sa sortie et ton diagnostic :

   ```bash
   gh issue create --repo RDeluxe/paseo --label rebase-failed --title "Rebase sur <nouveau-tag> échoué" --body-file <fichier>
   ```

   Termine sur un message clair qui donne le lien de l'issue.

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

| Date       | Base    | Résultat | Notes                                                                                                                                                                    |
| ---------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-10-02 | v0.10.2 | création | Fork créé, fonctions de barre latérale en commits atomiques ; typecheck, tests unitaires et e2e verts en local.                                                          |
| 2026-10-05 | v0.10.3 | rebase   | Sans conflit ni équivalence upstream (seul ajout : confirmation avant un lien d'appairage) ; vérifications vertes, sauf l'échec connu de `sidebar-nav-settings` sur Mac. |
