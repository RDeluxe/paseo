# RDeluxe/paseo — fork de getpaseo/paseo

Ce fichier est la source de vérité du fork. **Tout agent qui rebase, corrige ou étend ce fork le lit en entier avant de commencer**, applique ses règles, et tient son journal à jour.

## Pourquoi ce fork

J'utilise Paseo (Apache 2.0) sur mon Mac pour piloter mes agents. Je viens de Cursor, dont j'ai importé environ 750 conversations sur une vingtaine de projets. La barre latérale d'upstream ne tient pas cette charge : elle est peu dense, sans repli automatique, avec une limite « Show more » fixée à 20 dans le code. Celle de Cursor Agents gère très bien ce volume.

Les plugins Paseo ne peuvent pas modifier les lignes de la barre latérale, et upstream ferme les PR par défaut (`CONTRIBUTING.md`). D'où ce fork, **maintenu par un agent** : rebase quotidien sur les versions stables, build régulier de l'app Mac en CI.

Si upstream propose un jour l'équivalent de toutes nos fonctions, le fork n'a plus de raison d'être : on l'abandonne et je reviens à l'app officielle.

## État

- Base upstream actuelle : `v0.11.2`
- Dernière version du fork : celle de la dernière release `fork-*` (`gh release list --repo RDeluxe/paseo`)
- Dernier rebase réussi : 2026-10-10 (`v0.11.1` → `v0.11.2`)

## Comment le fork modifie upstream

**Le fork modifie le code d'upstream directement**, comme le ferait une PR : pas de dossier à part, pas de couche d'adaptation, pas de marqueurs dans le code. Une fonction du fork est une évolution des fichiers existants, écrite selon les règles d'upstream (section suivante) : préférences dans les réglages d'upstream, textes dans les fichiers de langue (les 9 langues), valeurs d'espacement tirées du thème, tests à côté du code.

Au rebase, les conflits se résolvent en comprenant les deux intentions, celle d'upstream et celle de la fonction décrite ci-dessous, et en écrivant le code qui sert les deux. Ce sont les tests qui disent si c'est réussi.

## Les règles d'upstream

Chaque commit du fork est écrit comme s'il était proposé à upstream. Les documents ci-dessous font foi ; ce fichier ne les recopie pas, il dit comment le fork les applique. [`CLAUDE.md`](CLAUDE.md) tient l'index complet de `docs/`.

| Document                                                                                                                           | Ce qu'il impose au fork                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)                                                                                               | La forme d'une proposition : une fonction par changement, ciblée et petite (upstream n'accepte guère plus de 3 000 lignes de code de production), défendue dans une discussion, avec ses preuves de QA. Upstream ferme les PR par défaut : on n'en ouvre aucune sans mon accord. Notre discussion : [getpaseo/paseo#6121](https://github.com/getpaseo/paseo/discussions/6121). |
| [`docs/product.md`](docs/product.md)                                                                                               | Un cœur léger : une fonction doit servir le travail avec les agents et ne pas alourdir l'expérience par défaut. C'est pourquoi nos réglages gardent le comportement d'upstream tant qu'on ne les change pas, sauf choix écrit dans la section de la fonction.                                                                                                                  |
| [`docs/design.md`](docs/design.md)                                                                                                 | Le visuel : jetons du thème, réutilisation des composants, hiérarchie, alignement sur les glyphes, aucun saut de mise en page, textes en sentence case, interdits du §14.                                                                                                                                                                                                      |
| [`docs/menus.md`](docs/menus.md)                                                                                                   | Le menu Préférences d'affichage : sous-pages, options avec icônes, lignes racines sans icône.                                                                                                                                                                                                                                                                                  |
| [`docs/i18n.md`](docs/i18n.md), [`docs/glossary.md`](docs/glossary.md)                                                             | Les textes : toutes les langues d'upstream, et ses termes (workspace, project, host).                                                                                                                                                                                                                                                                                          |
| [`docs/coding-standards.md`](docs/coding-standards.md), [`docs/unistyles.md`](docs/unistyles.md), [`docs/hover.md`](docs/hover.md) | Le code : typage dérivé des types canoniques, organisation des fichiers, styles et survol.                                                                                                                                                                                                                                                                                     |
| [`docs/testing.md`](docs/testing.md), [`docs/qa.md`](docs/qa.md)                                                                   | Les preuves : un test réel à côté du code, et les quatre questions de la QA. Toutes les preuves de ce fichier sont faites dans le navigateur (Playwright) et dans l'app macOS ; rien n'est testé sur iOS, Android, Windows ni Linux.                                                                                                                                           |
| [`docs/protocol-compatibility.md`](docs/protocol-compatibility.md), [`docs/protocol-validation.md`](docs/protocol-validation.md)   | Le démon et le protocole : le fork n'y touche pas (voir « Modifications propres au fork ») ; s'il le faisait un jour, ces deux documents s'appliqueraient.                                                                                                                                                                                                                     |

Comment les appliquer :

- Avant d'écrire une fonction ou de résoudre un conflit, lire les documents du tableau qui touchent le code concerné, dans leur version de la base actuelle.
- Un écart à une règle n'est permis que s'il est l'objectif même de la fonction. Il est alors écrit dans sa section, règle citée. Tout autre écart est un bug, à corriger dans le commit de la fonction.
- Au rebase, ces documents peuvent changer : l'étape 2 de la procédure les relit.

## Nos fonctions

Toutes côté client (`packages/app`), réglables dans **Préférences d'affichage** (l'icône à curseurs en haut de la liste des workspaces). Leurs préférences sont des réglages d'upstream (`hooks/use-settings/storage.ts`), lus par `display-preferences/model.ts`.

Chaque fonction a ci-dessous son **objectif** (le besoin, à préserver quelle que soit la forme du code), son comportement, l'endroit où elle vit, sa preuve, son **commit d'origine** et sa règle d'abandon.

**Commits d'origine.** Chaque fonction est introduite par un seul commit, et ce commit est figé par un tag `feature/<nom>`. Un rebase réécrit les commits et change leurs identifiants, mais ne déplace jamais le tag, qui garde l'original : `git show feature/<nom>` montre le diff tel qu'il a été écrit, sur sa base de l'époque. Seule une réécriture voulue de la fonction (une revue qui corrige son code, par exemple) déplace le tag sur le nouveau commit, et le journal le note : sinon l'intention de référence serait la version que l'on a corrigée. Pendant un conflit, c'est la référence pour retrouver l'intention : comparer ce diff au code d'upstream d'aujourd'hui, puis réécrire la même intention sur le nouveau code.

**Fonction native, sans code :** la date de dernière activité à droite des lignes existe déjà dans upstream (Préférences d'affichage → Show → Last activity).

### Densité compacte

- **Objectif :** voir beaucoup de conversations d'un coup, comme dans la barre latérale de Cursor Agents. Écart voulu à deux règles d'upstream. `docs/design.md` §7 : « Compressing rows below the established density to fit more on the screen is wrong » ; upstream reste le défaut, mais avec des centaines de workspaces je veux pouvoir choisir la densité. `docs/glossary.md` (Host badge) : « that host's own display mode decides how it draws » ; sur une ligne unique, l'hôte n'a pas la place de son nom, il garde seulement son glyphe et sa couleur (s'il est masqué, il reste masqué).
- **Comportement :** densité confortable (celle d'upstream) par défaut. En compact, chaque workspace tient sur une ligne, comme dans Cursor : les lignes font 24 à 28 px au lieu de 36, la ligne d'infos sous le titre disparaît, l'hôte d'un workspace distant devient une icône de serveur seule au bout de la ligne de titre, l'avatar du projet passe de 16 à 12 px, et un projet vide se réduit à sa ligne (son « + » suffit). Réglage : racine du menu, « Density ».
- **Où :** la table `SIDEBAR_DENSITY_LAYOUTS` de `display-preferences/density.ts`, seul endroit qui dit ce que fait une densité, lue par `useSidebarDensityLayout` (`display-preferences/model.ts`) ; le réglage `sidebarDensity` ; le style `rowCompact` de `sidebar/sidebar-workspace-row-content.tsx`, appliqué par les trois lignes de workspace (`sidebar-workspace-list.tsx`, `sidebar/sidebar-workspace-row.tsx`, `sidebar/sidebar-status-list.tsx`) et par `sidebar/sidebar-group-toggle-row.tsx` ; `projectRowCompact` dans `sidebar-workspace-list.tsx` ; le badge d'hôte sur la ligne de titre, dans `SidebarWorkspaceRowContent`. Si upstream ajoute une variante de ligne de workspace, elle prend aussi `rowCompact`.
- **Preuve :** `e2e/browser/sidebar-density.spec.ts`, le test « compact rows show the host as a bare glyph on the title line » de `e2e/browser/host-appearance.spec.ts`, `hooks/use-settings/storage.test.ts`.
- **Commit d'origine :** `feature/compact-density`.
- **Règle d'abandon :** si upstream ajoute une densité compacte, prendre la leur.

### Limite par projet et « More » à la Cursor

- **Objectif :** qu'un projet avec un long historique (jusqu'à 200 conversations importées de Cursor) n'écrase pas ceux du dessous. On ne voit que ses derniers workspaces, et on en dévoile plus à la demande, par pages, comme dans Cursor. Deux écarts voulus. `docs/product.md` veut une expérience par défaut légère et celle d'upstream ; ici la limite est active d'emblée (5, là où upstream montre 20 lignes avant « Show more »), parce que c'est pour elle que le fork existe. `docs/design.md` §1 : « When two surfaces do the same semantic thing in two different ways, one of them is wrong » ; les projets ont « More », les épinglés et les groupes de statut gardent le « Show more / Show less » d'upstream, parce qu'un projet porte des centaines de workspaces et qu'une section de statut en porte peu.
- **Comportement :** 3, 5, 10 ou 20 workspaces par projet, 5 par défaut. Sous la limite, une ligne « More » discrète, sans flèche. Chaque clic affiche 10 workspaces de plus, et la ligne disparaît quand tout est visible (pas de « Show less »). Le workspace affiché à l'écran reste toujours visible. Les raccourcis Cmd+1…9 ne numérotent que les lignes affichées avant « More » (le workspace sélectionné, montré au-delà de la limite, garde sa place mais pas de numéro), et le glisser-déposer des lignes visibles laisse les workspaces cachés à leur place. Le réglage n'apparaît qu'en regroupement par projet ; ses options sont des nombres, sans icône (la coche prend la colonne de tête, comme le prévoit `showSelectedCheck` dans `docs/menus.md`).
- **Où :** `display-preferences/project-limit.ts` ; le réglage `sidebarWorkspaceLimit` ; `sidebar/limited-sidebar-group.ts` (logique pure) ; le hook `sidebar/use-paged-sidebar-group.ts` (le `useLimitedSidebarGroup` d'upstream reste intact pour les épinglés et les groupes de statut) ; `ProjectBlock` dans `sidebar-workspace-list.tsx` ; l'action `"more"` de `SidebarGroupToggleRow` ; la numérotation dans `buildSidebarProjection` (`sidebar/sidebar-projection.ts`, via `projectWorkspaceGroupOptions`, que `ProjectBlock` utilise aussi) ; `mergeIntoVisibleSlots` dans `utils/sidebar-reorder.ts`, appelé par `handleWorkspaceReorder`.
- **Preuve :** `e2e/browser/sidebar-project-limit.spec.ts`, `sidebar/limited-sidebar-group.test.ts`, `sidebar/sidebar-projection.test.ts`, `utils/sidebar-reorder.test.ts`, `hooks/use-settings/storage.test.ts` ; `workspace-shortcut-targets-subscriber.test.tsx` monte un `QueryClientProvider`, puisque le modèle lit les réglages. Le test de défilement d'upstream (`sidebar-workspace.spec.ts`) clique deux fois sur « More » pour afficher ses 25 workspaces.
- **Commit d'origine :** `feature/project-workspace-limit`. Les raccourcis et le glisser-déposer étaient d'abord deux commits de correction, `feature/shortcuts-follow-limit` et `feature/reorder-keeps-hidden` ; ils sont fondus ici depuis le 2026-10-05, et leurs tags restent comme trace.
- **Règle d'abandon :** si upstream rend la limite réglable avec un « More » paginé, prendre le leur. Si la limite devient réglable mais avec un simple déplier/replier, garder notre « More » et me prévenir.

### Masquage des inactifs

- **Objectif :** que la barre latérale montre ce qui est en cours, pas ce qui est fini depuis des semaines, sans rien archiver ni supprimer. Écart voulu à `docs/product.md` (expérience par défaut d'upstream) : le masquage est actif d'emblée, à 14 jours ; upstream ne masque rien.
- **Comportement :** jamais, 3, 7, 14 ou 30 jours, 14 par défaut. Un workspace _terminé et lu_ (`statusBucket === "done"`) dont `statusEnteredAt` est plus ancien que le seuil passe derrière « More ». Jamais ceux en cours, en attente, en échec, non lus, ni celui affiché à l'écran. Les lignes et les raccourcis lisent la même horloge, arrondie à l'heure : un workspace qui franchit le seuil app ouverte passe derrière « More » dans l'heure, et un raccourci ne vise jamais une ligne cachée. Le réglage n'apparaît qu'en regroupement par projet.
- **Où :** `display-preferences/project-limit.ts` ; le réglage `sidebarHideInactiveDays` ; `isStaleWorkspace` et `projectWorkspaceGroupOptions` dans `sidebar/limited-sidebar-group.ts` ; l'horloge `useStaleClock` (`sidebar/use-stale-clock.ts`, sur le ticker horaire d'upstream `utils/relative-time-ticker.ts`), lue par `ProjectBlock` (`sidebar-workspace-list.tsx`) et par `SidebarModelProvider` pour les raccourcis.
- **Preuve :** `sidebar/limited-sidebar-group.test.ts`, `sidebar/use-stale-clock.test.ts`, le test des raccourcis masqués de `sidebar/sidebar-projection.test.ts`, `hooks/use-settings/storage.test.ts`.
- **Commit d'origine :** `feature/hide-inactive-workspaces`.
- **Règle d'abandon :** si upstream masque automatiquement les inactifs, prendre le leur. En cas d'équivalence partielle (par exemple de l'archivage automatique), **ne rien retirer** et me demander.

### Tout replier / tout déplier

- **Objectif :** ranger d'un geste une barre latérale de vingt projets, comme dans Cursor.
- **Comportement :** replie, ou déplie, les projets, les groupes de statut et la section épinglée. Deux actions en fin de menu, sans icônes.
- **Où :** `collapseAllSections` et `expandAllSections` dans `stores/sidebar-collapsed-sections-store/state.ts` ; deux lignes en fin de `display-preferences/menu.tsx`.
- **Preuve :** `e2e/browser/sidebar-collapse-all.spec.ts`, `stores/sidebar-collapsed-sections-store/state.test.ts`.
- **Commit d'origine :** `feature/collapse-all`.
- **Règle d'abandon :** si upstream ajoute un « collapse all », prendre le leur.

### Densité semi-compacte

- **Objectif :** garder tout ce que dit une ligne confortable (branche, PR, checks, labels), mais dans beaucoup moins de place, pour qui veut la densité sans perdre l'information. Écart voulu à trois règles d'upstream : `docs/design.md` §7 (des lignes plus serrées, comme le compact) ; le commentaire de `ChecksItem` (`sidebar/workspace-meta-row/index.tsx`), « A tick on its own has no subject », qui fait de « icône et texte » le défaut des checks ; et `docs/glossary.md` (Host badge), « that host's own display mode decides how it draws ». Les deux derniers cèdent à la place gagnée : la ligne d'infos raccourcie n'a plus la place des mots.
- **Comportement :** troisième choix de « Density », entre confortable et compact. Les lignes prennent la géométrie serrée du compact et gardent la ligne d'infos, en plus courte : l'hôte devient une icône seule au bout du titre, la PR n'affiche que son numéro (l'icône et sa couleur disent ouverte, fusionnée ou fermée), les checks se réduisent à leur icône, et les séparateurs `·` disparaissent. Comme en compact, un projet vide se réduit à sa ligne. Les réglages ne changent pas pour autant : le sous-menu Checks et le mode d'affichage de l'hôte gardent ce que l'on a choisi, et le retrouvent en densité confortable. L'avatar du projet garde sa taille.
- **Où :** la ligne `semiCompact` de `SIDEBAR_DENSITY_LAYOUTS` (`display-preferences/density.ts`) ; `condensed` dans `useSidebarMetaPreferences` (`display-preferences/model.ts`), lu par `WorkspaceMetaRow` (`sidebar/workspace-meta-row/index.tsx`) ; `SidebarWorkspaceRowContent` pour l'hôte.
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
- **Tags :** `fork-last-good` = dernier état poussé dont toutes les vérifications passaient. `feature/<nom>` = commit d'origine de chaque fonction, figé (voir « Nos fonctions ») ; ne jamais le supprimer, ni le déplacer hors d'une réécriture voulue notée au journal. Releases : `fork-vX.Y.Z-N` (créées par la CI).
- **Remotes :** `origin` = `RDeluxe/paseo`, `upstream` = `getpaseo/paseo` avec **push désactivé** (`git remote set-url --push upstream DISABLE`). Ne jamais pousser vers upstream.

## Procédure de rebase (agent quotidien)

1. `git fetch upstream --tags`. Chercher le dernier tag stable : `git tag -l 'v*' --sort=-v:refname | awk '!/-/' | head -1`. S'il est égal à la base actuelle (section « État ») : **s'arrêter**, sans ligne au journal.
2. Lire le `CHANGELOG.md` d'upstream entre l'ancienne et la nouvelle base. Pour chaque fonction, chercher un équivalent upstream et appliquer sa règle d'abandon. **Me signaler dans tous les cas** une fonction retirée ou une équivalence partielle. Lire aussi ce qui a changé dans les règles (`git diff <ancien-tag> <nouveau-tag> -- CONTRIBUTING.md CLAUDE.md docs/`) : une règle nouvelle ou modifiée qui touche une fonction se vérifie sur son code, et la fonction s'y conforme dans son commit. Si la règle contredit l'objectif même de la fonction, me le signaler au lieu de trancher.
3. `git rebase --onto <nouveau-tag> <ancien-tag> main`. Le rebase rejoue la pile commit par commit, donc une fonction à la fois.
4. Résoudre les conflits en lisant les deux côtés, en partant de l'**objectif** de la fonction et de son commit d'origine (`git show feature/<nom>`) : garder ce qu'upstream a changé, et réappliquer l'intention de la fonction (son objectif et son comportement) sur le nouveau code, selon les standards du dépôt. Si upstream a ajouté une langue, elle reçoit nos textes.
5. Vérifier. Chaque ligne se lance depuis la racine du dépôt, telle quelle (bash comme zsh) ; `<nouveau-tag>` est la nouvelle base. Une ligne qui échoue arrête tout et mène à l'étape 8.

   ```bash
   npm ci && npm run build:app-deps && npm run build:server
   (cd packages/app && npm run typecheck)
   (cd packages/desktop && npm run typecheck)
   (cd packages/app && npx vitest run src/components/sidebar src/components/workspace-shortcut-targets-subscriber.test.tsx src/hooks/use-settings src/utils src/stores src/i18n)
   (cd packages/app && npx playwright test e2e/browser/sidebar-*.spec.ts e2e/browser/host-appearance.spec.ts)
   git diff --name-only --diff-filter=d <nouveau-tag>..main | grep -E '\.(ts|tsx)$' | xargs npm run lint --
   git diff --name-only --diff-filter=d <nouveau-tag>..main | grep -E '\.(ts|tsx|json|md|yml)$' | xargs npm run format:check:files --
   ```

   - Les e2e couvrent tous les tests de barre latérale, ceux d'upstream compris. S'il manque le navigateur : `(cd packages/app && npx playwright install chromium)`.
   - Le lint et le formatage portent sur tous les fichiers que le fork change par rapport à la nouvelle base. S'ils disent n'avoir trouvé aucun fichier, c'est un échec de la commande, pas un succès.
   - `build:server` et non `build:server-deps` : le typecheck de `packages/desktop` lit les déclarations de `packages/server/dist`. Sur un clone neuf, sans ce build, il échoue sur `@getpaseo/server/process`.
   - Ne jamais lancer `npx vitest run` sans chemin dans `packages/server` : cela inclut les tests e2e, qui démarrent de vrais démons et de vrais agents.
   - Sur Mac seulement, `sidebar-nav-settings.spec.ts` échoue chez upstream aussi (il attend `Ctrl+N`, le Mac affiche `⌘N`) : ce n'est pas une régression. En local sur ce Mac, d'autres specs hors barre latérale échouent aussi chez upstream, pour des raisons d'environnement (fournisseur `opencode` absent, recherche de dossiers d'`add-project-flow`).

6. Faire relire le rebase par un sous-agent **neuf**, lancé pour l'occasion et sans ton contexte, pour qu'il juge le code sans hériter de tes choix. Lui donner l'ancienne et la nouvelle base, et lui demander de lire `FORK.md`, puis de comparer la pile avant et après (`git range-diff <ancien-tag>..fork-last-good <nouveau-tag>..main`) et chaque commit de fonction à son tag (`git show feature/<nom>`). Il vérifie :
   - que chaque fonction garde son objectif et son comportement ;
   - que chaque résolution de conflit garde ce qu'upstream a changé ;
   - que les fonctions respectent les règles d'upstream de la nouvelle base, en particulier celles qui ont changé entre les deux tags ;
   - que rien ne sort du périmètre de « Ce qui demande mon accord », et que le démon et le protocole ne changent que par des champs facultatifs.

   Il rend une liste de problèmes, chacun avec son fichier, sa ligne et sa gravité (bloquant ou non). Un problème bloquant se corrige dans le commit de sa fonction (`git commit --fixup`), puis on reprend à l'étape 5, et un autre sous-agent neuf refait la revue. Si deux tours de correction laissent un problème bloquant : étape 8, avec la revue dans l'issue. Les problèmes non bloquants vont dans la ligne du journal.

7. Si tout passe : mettre à jour la section « État », ajouter une ligne au journal, et les verser dans le commit `docs` (`git commit --fixup=<sha du commit docs>` puis `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <nouveau-tag>`), `git push --force-with-lease origin main`, puis déplacer `fork-last-good` (`git tag -f fork-last-good && git push -f origin fork-last-good`).
8. Si quoi que ce soit échoue : **ne rien pousser**, remettre `main` dans son état d'avant (`git rebase --abort` pendant un rebase, sinon `git reset --hard origin/main`), puis ouvrir une issue avec la commande qui a échoué, sa sortie et ton diagnostic :

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

| Date       | Base    | Résultat     | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-02 | v0.10.2 | création     | Fork créé, fonctions de barre latérale en commits atomiques ; typecheck, tests unitaires et e2e verts en local.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-10-05 | v0.10.3 | rebase       | Sans conflit ni équivalence upstream (seul ajout : confirmation avant un lien d'appairage) ; vérifications vertes, sauf l'échec connu de `sidebar-nav-settings` sur Mac.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-10-05 | v0.10.3 | réécriture   | Revue des fonctions contre les règles d'upstream : corrections versées dans leurs commits, les deux correctifs fondus dans la limite, et les tags `feature/*` déplacés sur les nouveaux commits.                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-10-07 | v0.10.3 | installation | Agent installé sur un serveur Linux : vérifications de l'étape 5 vertes, e2e compris (`sidebar-nav-settings` passe sur Linux). L'étape 5 construit maintenant le serveur (`build:server`), faute de quoi le typecheck de desktop échoue sur un clone neuf. Ajout de l'étape 6 : revue de chaque rebase par un sous-agent neuf.                                                                                                                                                                                                                                                                                 |
| 2026-10-08 | v0.11.0 | rebase       | Sans équivalence upstream. Conflits résolus en gardant les deux côtés : `t` d'upstream et `workspaceLimit` dans la projection de la barre latérale, `useTranslation` et nos icônes de dossier, traduction française corrigée par upstream. Vérifications vertes, e2e compris. Revue sans problème bloquant ; non bloquants : `ProjectIconSize` déclaré entre deux imports (`project-leading-visual.tsx`, déjà dans `feature/compact-density`), et la section « Description des commandes » pourrait préciser qu'OpenCode v2 passe par le même mapper.                                                          |
| 2026-10-08 | v0.11.1 | rebase       | Sans conflit ni équivalence upstream (Haiku 5.5, correctifs Claude et sous-agents) ; règles inchangées. Vérifications vertes, e2e compris (67). Revue sans problème bloquant ; non bloquant : la phrase « Seule exception » de « Ce qui demande mon accord » est dans le commit de `feature/shell-command-descriptions` mais pas dans son tag, sans trace au journal.                                                                                                                                                                                                                                          |
| 2026-10-10 | v0.11.2 | rebase       | Sans conflit ni équivalence upstream (correctif d'affichage du texte sur iOS, patch `react-native-uitextview` retiré) ; règles inchangées. Vérifications vertes, e2e compris (67) ; `workspace-draft-submission-store.test.ts` (upstream) a dépassé son délai de 5 s au premier passage, à froid, puis la ligne entière est passée. Revue sans problème bloquant. Trace de la remarque du 2026-10-08 : la phrase « Seule exception » de « Ce qui demande mon accord » a été ajoutée au commit de `feature/shell-command-descriptions` sans déplacer son tag, puisqu'elle ne change pas le code de la fonction. |
