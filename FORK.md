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

Toutes côté client (`packages/app`), réglables dans **Préférences d'affichage** (l'icône à curseurs en haut de la liste des workspaces).

| Fonction                                                                                                                                                                                                                                                                                                                       | Ajoutée le | Où                                                                                                                                                                                                                                                                                                                                                                                                                                 | Règle d'abandon                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Densité compacte** (par défaut) : lignes de 24–28 px au lieu de 36 ; un projet vide se réduit à sa ligne (le « + » de la ligne suffit) ; l'hôte d'un workspace distant passe de la ligne du dessous à une icône de serveur seule au bout de la ligne de titre, comme Cursor. Racine du menu : « Density ».                   | 2026-10-02 | `display-preferences/density.ts` ; style `rowCompact` dans `sidebar/sidebar-workspace-row-content.tsx`, appliqué par les trois lignes de workspace (`sidebar-workspace-list.tsx`, `sidebar/sidebar-workspace-row.tsx`, `sidebar/sidebar-status-list.tsx`) et `sidebar/sidebar-group-toggle-row.tsx` ; `projectRowCompact` dans `sidebar-workspace-list.tsx` ; badge d'hôte sur la ligne de titre dans `SidebarWorkspaceRowContent` | Si upstream ajoute une densité compacte : prendre la leur.                                                                                                       |
| **Limite par projet + « More » à la Cursor** (3/5/10/20, 5 par défaut) : sous la limite, une ligne « More » discrète, sans flèche ; chaque clic affiche 10 workspaces de plus ; elle disparaît quand tout est visible (pas de « Show less »). Les raccourcis Cmd+1…9 ne numérotent que les lignes affichées avant « More ».    | 2026-10-02 | `display-preferences/project-limit.ts` ; `sidebar/limited-sidebar-group.ts` (logique pure + tests) ; `sidebar/use-limited-sidebar-group.ts` (`options`, dont `pageSize`) ; `ProjectBlock` dans `sidebar-workspace-list.tsx` ; variante `paged` de `SidebarGroupToggleRow` ; `sidebar/sidebar-projection.ts` (raccourcis)                                                                                                           | Si upstream rend la limite réglable avec un « More » paginé : prendre le leur. Limite réglable mais simple déplier/replier : garder notre « More », me prévenir. |
| **Masquage des inactifs** (jamais/3/7/14/30 j, 14 par défaut) : les workspaces _terminés et lus_ (`statusBucket === "done"`) dont `statusEnteredAt` est plus ancien passent derrière « More » ; jamais ceux en cours, en attente, en échec, non lus, ni celui affiché à l'écran. Visible seulement en regroupement par projet. | 2026-10-02 | `isStaleWorkspace` et `projectWorkspaceGroupOptions` dans `sidebar/limited-sidebar-group.ts` ; mêmes points que la limite                                                                                                                                                                                                                                                                                                          | Si upstream masque automatiquement les inactifs : prendre le leur. Équivalence partielle (par ex. archivage auto) : **ne rien retirer**, me demander.            |
| **Glisser-déposer qui respecte les lignes cachées** : réordonner les lignes visibles d'un projet ne déplace plus les workspaces cachés derrière « More ».                                                                                                                                                                      | 2026-10-02 | `mergeIntoVisibleSlots` dans `utils/sidebar-reorder.ts`, utilisé par `handleWorkspaceReorder`                                                                                                                                                                                                                                                                                                                                      | Disparaît avec la limite par projet.                                                                                                                             |
| **Tout replier / tout déplier** : projets, groupes de statut et section épinglée.                                                                                                                                                                                                                                              | 2026-10-02 | `collapseAllSections` / `expandAllSections` dans `stores/sidebar-collapsed-sections-store/state.ts` ; deux lignes en fin de `display-preferences/menu.tsx`                                                                                                                                                                                                                                                                         | Si upstream ajoute un « collapse all » : prendre le leur.                                                                                                        |

Les trois préférences sont des réglages d'upstream (`sidebarDensity`, `sidebarWorkspaceLimit`, `sidebarHideInactiveDays` dans `hooks/use-settings/storage.ts`), lus par `display-preferences/model.ts`.

**Fonction native, sans code :** la date de dernière activité à droite des lignes existe déjà dans upstream (Préférences d'affichage → Show → Last activity).

**Preuve :** `packages/app/e2e/browser/sidebar-project-limit.spec.ts` (limite, « More », persistance, densité, tout replier/déplier), le dernier test de `host-appearance.spec.ts` (icône d'hôte en compact) et les tests unitaires `sidebar/limited-sidebar-group.test.ts`, `sidebar/sidebar-projection.test.ts`, `utils/sidebar-reorder.test.ts`, `stores/sidebar-collapsed-sections-store/state.test.ts`, `hooks/use-settings/storage.test.ts`.

## Modifications propres au fork (hors fonctions)

| Modification                                                                              | Fichier                                         | Raison                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mise à jour automatique coupée (`isPackaged: () => false` pour le service de mise à jour) | `packages/desktop/src/features/auto-updater.ts` | Le flux officiel remplacerait l'app du fork par l'app officielle. Le build n'est pas signé, et la mise à jour automatique Electron l'exige sur Mac.                                                                                                                                                                                                                                                                |
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
  2. `fork: sidebar` — les fonctions de la barre latérale et leurs tests.
     Une nouvelle fonction = un nouveau commit `fork: <nom>`. Pour retirer une fonction de `fork: sidebar`, on édite ce commit (ou commit correctif `fork: drop <nom>`) en suivant la table ci-dessus.
- **Tags :** `fork-last-good` = dernier état poussé dont toutes les vérifications passaient. Releases : `fork-vX.Y.Z-N` (créées par la CI).
- **Remotes :** `origin` = `RDeluxe/paseo`, `upstream` = `getpaseo/paseo` avec **push désactivé** (`git remote set-url --push upstream DISABLE`). Ne jamais pousser vers upstream.

## Procédure de rebase (agent quotidien)

1. `git fetch upstream --tags`. Chercher le dernier tag stable : `git tag -l 'v*' --sort=-v:refname | awk '!/-/' | head -1`. S'il est égal à la base actuelle (section « État ») : **s'arrêter**, sans ligne au journal.
2. Lire le `CHANGELOG.md` d'upstream entre l'ancienne et la nouvelle base. Pour chaque fonction de la table, chercher un équivalent upstream et appliquer la règle d'abandon. **Me signaler dans tous les cas** une fonction retirée ou une équivalence partielle.
3. `git rebase --onto <nouveau-tag> <ancien-tag> main`.
4. Résoudre les conflits en lisant les deux côtés : garder ce qu'upstream a changé, et réappliquer l'intention de la fonction (colonne « Fonction ») sur le nouveau code, selon les standards du dépôt. Si upstream a ajouté une variante de ligne de workspace, elle prend aussi `rowCompact`. Si upstream a ajouté une langue, elle reçoit nos textes.
5. Vérifier, depuis la racine :
   - `npm ci`, puis `npm run build:app-deps` et `npm run build:server-deps` ;
   - `cd packages/app && npx tsgo --noEmit` ;
   - `npx vitest run src/components/sidebar src/hooks/use-settings src/utils src/stores src/i18n` ;
   - `npx playwright test e2e/browser/sidebar-*.spec.ts` (tous les tests de barre latérale, ceux d'upstream compris ; installer d'abord `npx playwright install chromium` si besoin) ;
   - `npx playwright test e2e/browser/host-appearance.spec.ts` ;
   - depuis la racine : `npx oxlint` et `npx oxfmt --check` sur les fichiers modifiés.

   Deux tests d'upstream ont été adaptés et doivent le rester : ceux qui ont besoin de la géométrie d'upstream (défilement de `sidebar-workspace.spec.ts`, badge nommé de `host-appearance.spec.ts`) passent d'abord en densité confortable, et le test de défilement clique deux fois sur « More ». Sur Mac seulement, `sidebar-nav-settings.spec.ts` échoue chez upstream aussi (il attend `Ctrl+N`, le Mac affiche `⌘N`) : ce n'est pas une régression.

6. Si tout passe : mettre à jour la section « État », ajouter une ligne au journal (amender `fork: infra`), `git push --force-with-lease origin main`, puis déplacer `fork-last-good` (`git tag -f fork-last-good && git push -f origin fork-last-good`).
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

| Date       | Base    | Résultat | Notes                                                                                                                                                                                    |
| ---------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-02 | v0.10.2 | création | Fork créé ; infra + fonctions de barre latérale ; typecheck, tests unitaires et e2e verts en local.                                                                                      |
| 2026-10-02 | v0.10.2 | refonte  | Fonctions réécrites directement dans le code d'upstream (fin du dossier `fork/` et des marqueurs), selon ses standards ; raccourcis et glisser-déposer alignés sur la limite par projet. |
