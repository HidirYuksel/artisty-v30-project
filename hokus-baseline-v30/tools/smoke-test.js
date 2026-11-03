// Hızlı duman testi (Playwright gerekir:  npm i playwright  &&  npx playwright install chromium)
// Kullanım:  node tools/smoke-test.js <url>      örn. http://localhost:8080/index.html  veya  file:///.../dist/hokus.html
// Kontrol eder: JS hatası yok, kilitli değerler (config/defaults.json) uygulanmış, ana öğeler yerinde, toggle çalışıyor.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2];if(!url){console.error('URL ver');process.exit(2)}
const lock=JSON.parse(fs.readFileSync(path.join(__dirname,'../src/config/defaults.json'),'utf8')).V;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1992,height:1120}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url);await p.waitForTimeout(2200);try{await p.click('#edX',{timeout:1500})}catch(e){}await p.waitForTimeout(500);
const st=await p.evaluate(()=>{const k=Object.keys(localStorage).find(x=>!x.endsWith('-lite'));return k?JSON.parse(localStorage[k]).V:null});
let bad=[];if(st)for(const k in lock)if(st[k]!==lock[k])bad.push(k+': '+st[k]+' ≠ '+lock[k]);
const ok=await p.evaluate(()=>['[data-id=dir]','[data-id=team]','[data-id=about]','[data-id=search]','[data-id=contact]','#logo','#tg','#stage'].every(s=>document.querySelector(s)));
await p.click('#tg');const pr=await p.getAttribute('#tg','aria-pressed');
console.log('JS hataları :',errs.length?errs:'yok');console.log('Kilitli değer farkı:',bad.length?bad:'yok');console.log('Ana öğeler :',ok?'tamam':'EKSİK');console.log('Toggle     :',pr==='true'?'tamam':'ÇALIŞMIYOR');
await b.close();process.exit(errs.length||bad.length||!ok||pr!=='true'?1:0)})();
