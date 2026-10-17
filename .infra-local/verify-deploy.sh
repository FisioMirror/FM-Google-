#!/bin/sh
# verify-deploy.sh v2 —ciclo verificación Vercel sin procesos largos.
# Uso:
#   sh verify-deploy.sh create [branch] [sha]  -> crea deployment y guarda state (rápido)
#   sh verify-deploy.sh check                  -> 1 sondeo; estados o poll pende
set -e
. /storage/7E87-1615/Documents/Proyectos/.infra/secrets.env 2>/dev/null
STATE=/tmp/opencode/deploy-state.net
case "$1" in
create)
  BRANCH=${2:-$(git -C /public/projects/main branch --show-current)}
  SHA=${3:-$(git -C /public/projects/main rev-parse HEAD)}
  SHA=${SHA:0:12}
  RES=$(node -e "
(async()=>{
const h={Authorization:'Bearer '+process.env.VERCEL_TOKEN};
const r=await fetch('https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1',{method:'POST',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({name:'fm-google',gitSource:{type:'github',repoId:1347355082,ref:'$BRANCH',commit:'$SHA'}})});
const j=await r.json().catch(()=>null);
if(!j.id){console.log('NOCREATO|'+JSON.stringify(j.error||j).slice(0,300));return}
console.log(j.id+'|'+j.url+'|'+j.readyState);
})();")
  echo "$BRANCH|$SHA|$RES" | tr '\n' ' ' > "$STATE"
  echo "CREADO: branch=$BRANCH sha=$SHA -> $(echo $RES | cut -d'|' -f1,2)"
  ;;
check)
  [ -f "$STATE" ] || { echo "sin-state"; exit 1; }
  BRANCH=$(cut -d'|' -f1 "$STATE"); SHA=$(cut -d'|' -f2 "$STATE"); META=$(cut -d'|' -f3- "$STATE"); ID=$(echo "$META" | cut -d'|' -f1)
  S=$(node -e "
(async()=>{
const h={Authorization:'Bearer '+process.env.VERCEL_TOKEN};
try{
const r=await fetch('https://api.vercel.com/v13/deployments/'+process.argv[1],{headers:h});
const j=await r.json();
if(j.error){console.log('ERR-API|'+JSON.stringify(j.error).slice(0,200));return}
console.log(j.readyState+'|'+(j.errorMessage||'')+'|'+(j.url||''));
}catch(e){console.log('ERR-FETCH|'+String(e).slice(0,100))}
})();" "$ID")
  ST=$(echo "$S" | cut -d'|' -f1)
  echo "[$BRANCH $SHA] $ST"
  case "$ST" in
    READY) echo "URL: https://$(echo "$S" | cut -d'|' -f3)";;
    ERROR|CANCELED) node -e "
(async()=>{
const h={Authorization:'Bearer '+process.env.VERCEL_TOKEN};
const r=await fetch('https://api.vercel.com/v2/deployments/'+process.argv[1]+'/events?limit=40',{headers:h});
const evs=await r.json();
(evs.slice(-20).forEach(e=>console.log(((e.text||e.payload&&e.payload.text)||'').slice(0,200))));
})();" "$ID" 2>/dev/null | tail -12;;
  esac
  ;;
*)
  echo "uso: create | check"; exit 1;;
esac
