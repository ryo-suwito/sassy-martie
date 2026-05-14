#!/bin/bash
# merge-gate.sh - Enforces merge gates without PR browser interface
# Usage: ./merge-gate.sh <feature-branch> <gate-number> [worktree-path]

set -e

FEATURE_BRANCH=$1
GATE=$2
WORKTREE_PATH=$3
REPO_ROOT=$(git rev-parse --show-toplevel)

if [ -z "$FEATURE_BRANCH" ] || [ -z "$GATE" ]; then
    echo "Usage: ./merge-gate.sh <feature-branch> <gate-number> [worktree-path]"
    echo "Example: ./merge-gate.sh feat/a0-schema-foundation 0 ../sassy-martie-worktrees/a0-schema"
    exit 1
fi

echo "🚪 Gate $GATE: Merging $FEATURE_BRANCH → dev"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Find worktree path if not provided
if [ -z "$WORKTREE_PATH" ]; then
    WORKTREE_PATH=$(git worktree list | grep "$FEATURE_BRANCH" | awk '{print $1}')
    if [ -z "$WORKTREE_PATH" ]; then
        echo "❌ Could not find worktree for $FEATURE_BRANCH"
        echo "   Provide it manually: ./merge-gate.sh $FEATURE_BRANCH $GATE /path/to/worktree"
        exit 1
    fi
fi

echo "📂 Running checks in: $WORKTREE_PATH"
cd "$WORKTREE_PATH"

case $GATE in
    0)
        echo "📋 Gate 0: Schema & Foundation Checks"
        echo "  ✓ Checking migrations..."
        npx supabase db reset --local || { echo "❌ Migration failed"; exit 1; }
        
        echo "  ✓ Generating types..."
        npx supabase gen types typescript --local > src/utils/supabase/database.types.ts || { echo "❌ Type generation failed"; exit 1; }
        
        echo "  ✓ Verifying seed data..."
        npx supabase db dump --local --data-only --schema=public | grep -q "system_config" || { echo "❌ Seed data missing"; exit 1; }
        
        echo "✅ Gate 0 passed"
        ;;
        
    1)
        echo "📋 Gate 1: Auth & Infrastructure Checks"
        echo "  ✓ Running build..."
        npm run build || { echo "❌ Build failed"; exit 1; }
        
        echo "  ✓ Running lint..."
        npm run lint || { echo "❌ Lint failed"; exit 1; }
        
        echo "  ✓ Checking middleware..."
        test -f src/middleware.ts || { echo "❌ middleware.ts missing"; exit 1; }
        
        echo "✅ Gate 1 passed"
        ;;
        
    2)
        echo "📋 Gate 2: Phase 1 Agent Checks (A2/A3/A4)"
        echo "  ✓ Running build..."
        npm run build || { echo "❌ Build failed"; exit 1; }
        
        echo "  ✓ Running lint..."
        npm run lint || { echo "❌ Lint failed"; exit 1; }
        
        echo "  ✓ Running tests..."
        npm run test || { echo "❌ Tests failed"; exit 1; }
        
        echo "✅ Gate 2 passed"
        ;;
        
    3)
        echo "📋 Gate 3: Community & Rewards Checks"
        echo "  ✓ Running build..."
        npm run build || { echo "❌ Build failed"; exit 1; }
        
        echo "  ✓ Running tests..."
        npm run test || { echo "❌ Tests failed"; exit 1; }
        
        echo "✅ Gate 3 passed"
        ;;
        
    *)
        echo "❌ Unknown gate: $GATE"
        exit 1
        ;;
esac

# All checks passed - merge
echo ""
echo "🔀 Merging to dev..."
cd "$REPO_ROOT"
git checkout dev
git merge "$FEATURE_BRANCH" --no-ff -m "Gate $GATE: Merge $FEATURE_BRANCH

✅ All gate checks passed
$(git log dev..$FEATURE_BRANCH --oneline)
"

echo ""
echo "✨ Merge complete!"
echo "📌 Next steps:"
echo "   git push origin dev"
echo "   git push origin $FEATURE_BRANCH"
