#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

mapfile -t staged_files < <(
  git diff --cached --name-only --diff-filter=ACMR | while IFS= read -r file; do
    case "$file" in
      *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.css|*.md|*.yml|*.yaml|*.html)
        printf '%s\n' "$file"
        ;;
    esac
  done
)

if [ "${#staged_files[@]}" -eq 0 ]; then
  exit 0
fi

code_files=()
for file in "${staged_files[@]}"; do
  case "$file" in
    *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
      code_files+=("$file")
      ;;
  esac
done

bunx prettier --write "${staged_files[@]}"

if [ "${#code_files[@]}" -gt 0 ]; then
  bunx eslint --fix "${code_files[@]}"
fi

git add -- "${staged_files[@]}"
