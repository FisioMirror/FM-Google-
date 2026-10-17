#!/bin/sh
# chunk-install.sh v2 — tolera ENOTEMPTY: borra el paquete problemático y reintentos.
cd /public/projects/main || exit 1
BUDGET=${1:-70}
LOG=/storage/7E87-1615/Documents/Proyectos/.infra/npm-cache/_logs
END=$(($(date +%s) + BUDGET))
NAMES=$(node -e "const p=require('./package.json'); console.log(Object.keys({...p.dependencies,...p.devDependencies}).join(' '))")
PENDING=""
for n in $NAMES; do
  node -e "try{process.cwd();require.resolve('$n/package.json',{paths:['/public/projects/main']});process.exit(0)}catch(e){process.exit(1)}" || PENDING="$PENDING $n"
done
if [ -z "$PENDING" ]; then echo "TODO-INSTALADO"; exit 0; fi
echo "Faltan: $PENDING"
installed=0
for n in $PENDING; do
  now=$(date +%s); [ $now -ge $END ] && { echo "BUDGET-AGOTADO (proximo: $n)"; break; }
  ok=0
  trynum=0
  last_log=$(ls -t $LOG/*-debug-0.log 2>/dev/null | head -1)
  while [ $ok -eq 0 ] && [ $trynum -lt 3 ]; do
    trynum=$((trynum+1))
    last_log=$(ls -t $LOG/*-debug-0.log 2>/dev/null | head -1)
    out=$(npm install --no-save --legacy-peer-deps --no-audit --no-fund --cache /storage/7E87-1615/Documents/Proyectos/.infra/npm-cache --loglevel=error "$n" 2>&1 | tail -2)
    if echo "$out" | grep -q "npm error"; then
      last_log=$(ls -t $LOG/*-debug-0.log 2>/dev/null | head -1)
      bad=$(grep -m1 -E "error path /public/projects/main/node_modules/[^ ]+" "$last_log" 2>/dev/null | sed 's|.*node_modules/||')
      if [ -n "$bad" ]; then
        rm -rf "node_modules/$bad"
        find node_modules -maxdepth 3 -type d -name '.*-*' -exec rm -rf {} + 2>/dev/null
      else
        rm -rf "node_modules/$n"
      fi
    else
      ok=1; installed=$((installed+1))
      node -e "try{process.cwd();require.resolve('$n/package.json',{paths:['/public/projects/main']});process.exit(0)}catch(e){process.exit(1)}" || { ok=0; rm -rf "node_modules/$n"; }
    fi
  done
  [ $ok -eq 1 ] && echo "OK: $n" || echo "FALLO-DEF: $n"
done
echo "instalados_en_esta_pasada=$installed"
