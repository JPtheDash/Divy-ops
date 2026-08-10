#!/usr/bin/env bash
# Verify the DevOps + AWS toolchain. Safe to re-run anytime.
set -uo pipefail
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[0;33m'; NC='\033[0m'
missing=0
check(){ if command -v "$1" >/dev/null 2>&1; then printf "  ${GREEN}OK${NC}   %s\n" "$1"; else printf "  ${RED}MISS${NC} %s\n" "$1"; missing=$((missing+1)); fi; }
header(){ printf "\n${YELLOW}%s${NC}\n" "$1"; }

header "Core (Phase 0)"
for t in git gh jq yq python3 node; do check "$t"; done

header "AWS (Phase 1)"
for t in aws awslocal localstack; do check "$t"; done

header "Containers (Phases 2/5)"
for t in docker hadolint dive; do check "$t"; done

header "IaC (Phase 3)"
for t in tofu terraform tflint; do check "$t"; done

header "Kubernetes (Phase 5)"
for t in kubectl kind helm k9s eksctl; do check "$t"; done

header "Docker daemon"
if docker info >/dev/null 2>&1; then printf "  ${GREEN}OK${NC}   daemon reachable\n"; else printf "  ${RED}MISS${NC} run: colima start\n"; missing=$((missing+1)); fi

printf "\n"
if [ "$missing" -eq 0 ]; then printf "${GREEN}All tools present. Start labs/00-foundations/.${NC}\n"
else printf "${YELLOW}%d missing. Note: tofu/terraform are alternatives — only one is needed.${NC}\n" "$missing"; fi
