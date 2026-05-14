# Agent Workflow - Command Line Only

No PRs. No browser. Pure command line.

## Phase 0: Schema Agent (A0)

```bash
# Work in your worktree
cd ~/monx/sassy-martie-worktrees/a0-schema

# Do your work...
git add .
git commit -m "Add catalog schema tables"

# When done, push your branch
git push origin feat/a0-schema-foundation

# Run the gate check and merge (provide worktree path)
cd ~/monx/sassy-martie
./merge-gate.sh feat/a0-schema-foundation 0 ../sassy-martie-worktrees/a0-schema

# Push merged dev
git push origin dev
```

## Phase 1: Parallel Agents (A1-A4)

**Agent A1 (Auth):**
```bash
cd ~/monx/sassy-martie-worktrees/a1-auth

# Pull latest dev first (after A0 merged)
git pull origin dev
git merge dev

# Do your work...
pnpm add @supabase/ssr
git add .
git commit -m "Add auth middleware"

# Merge when ready
cd ~/monx/sassy-martie
./merge-gate.sh feat/a1-auth-infra 1 ../sassy-martie-worktrees/a1-auth
git push origin dev
```

**Agent A2 (Catalog):**
```bash
cd ~/monx/sassy-martie-worktrees/a2-catalog

# Pull latest dev (after A0, maybe after A1)
git pull origin dev
git merge dev
pnpm install  # Get any new deps from A1

# Do your work...
git add .
git commit -m "Add catalog pages"

# Merge when ready
cd ~/monx/sassy-martie
./merge-gate.sh feat/a2-catalog-seo 2
git push origin dev
```

**Agent A3, A4:** Same pattern, gate 2

## Phase 2: Community Agent (A5)

```bash
cd ~/monx/sassy-martie-worktrees/a5-community

# Pull latest dev (after A1 + A3 merged)
git pull origin dev
git merge dev
pnpm install

# Do your work...
git add .
git commit -m "Add taster voting UI"

# Merge when ready
cd ~/monx/sassy-martie
./merge-gate.sh feat/a5-community-rewards 3
git push origin dev
```

## If Gate Check Fails

```bash
# Fix the issue in your worktree
cd ~/monx/sassy-martie-worktrees/a2-catalog
# ... fix the build error
git add .
git commit -m "Fix build error"
git push origin feat/a2-catalog-seo

# Try gate again
cd ~/monx/sassy-martie
./merge-gate.sh feat/a2-catalog-seo 2
```

## Conflict Resolution

```bash
# If dev has moved ahead and you have conflicts
cd ~/monx/sassy-martie-worktrees/a3-builder
git pull origin dev
git merge dev
# ... resolve conflicts in package.json or whatever
git add .
git commit -m "Merge dev, resolve conflicts"
git push origin feat/a3-builder-dashboard

# Then try merge again
cd ~/monx/sassy-martie
./merge-gate.sh feat/a3-builder-dashboard 2
```

## The Rule

**Never merge without running the gate script.**
The script IS your PR review. It enforces all the checks.
