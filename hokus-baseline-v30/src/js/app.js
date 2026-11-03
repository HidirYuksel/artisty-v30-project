
(()=>{
'use strict';
const $=s=>document.querySelector(s);
const mod=(a,n)=>((a%n)+n)%n,clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const h=(tag,cls,t)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(t!=null)e.textContent=t;return e};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const KEY='hokus-preview-v1';
const site=$('#site'),page=$('#page');

/* =====================================================================
   ŞEMA (panel + varsayılan değerler)
   Birimler cqw: sitenin genişliğinin %1'i, böylece tasarım orantılı ölçeklenir.
   ===================================================================== */
const R=(k,l,d,min,max,step,u='',hint='',pt=null)=>({t:'range',k,l,d,min,max,step,u,hint,pt});
const N=(text,dyn)=>({t:'note',text,dyn});
const C=(k,l,d)=>({t:'color',k,l,d}),K=(k,l,d)=>({t:'check',k,l,d}),T=(k,l,d)=>({t:'text',k,l,d});
const SE=(k,l,d,o)=>({t:'select',k,l,d,o});
const G=(l,fields)=>({t:'group',l,fields});
const PATS=[['random','Rastgele'],['ltr','Soldan sağa'],['rtl','Sağdan sola'],['centerOut','Ortadan dışa'],['edgesIn','Dıştan içe']];
/* v8: site fontu Neue Haas Grotesk TEXT (Adobe Fonts / Typekit: 400, 400 italic, 700, 700 italic). Display kaldırıldı. */
const FONTS=['neue-haas-grotesk-text','indivisible','Helvetica Neue','Arial'].map(f=>[f,f]);
const WTS=[['400','Regular (400)'],['700','Bold (700)']];

const ITEMS=[
 {id:'dir',   t:'DIRECTORS',grp:'nav',   pat:'ltr', tm:true},
 {id:'wrk',   t:'WORKS',    grp:'nav',   pat:'random', href:'#works', tm:true},
 {id:'team',  t:'TEAM',     grp:'nav',   pat:'rtl', tm:true},
 {id:'about', t:'ABOUT',    grp:'side',  pat:'centerOut',col:'R',orient:'down',anchor:'top', tm:true, dx:-.15, dy:.1},
 {id:'search',t:'SEARCH',   grp:'below', pat:'ltr', dy:-.8},
 {id:'contact',t:'CONTACT', grp:'side',  pat:'edgesIn',  col:'L',orient:'up',  anchor:'bottom'},
 {id:'ig',    t:'INSTAGRAM',grp:'social',pat:'random', dy:-.6},
 {id:'vimeo', t:'VIMEO',    grp:'social',pat:'rtl', dy:-.6},
 {id:'giphy', t:'GIPHY',    grp:'social',pat:'ltr', dy:-.6},
 /* Works alt menüsü */
 {id:'cmm',   t:'COMMERCIALS', grp:'sub', pat:'ltr',       cat:'commercials'},
 {id:'mus',   t:'MUSIC VIDEOS',grp:'sub', pat:'random',    cat:'music'},
 {id:'nar',   t:'NARRATIVE',   grp:'sub', pat:'ltr',       cat:'narrative'},
 {id:'cnt',   t:'CONTENT',     grp:'sub', pat:'rtl',       cat:'content'},
 {id:'mds',   t:'MOODS',       grp:'sub', pat:'centerOut', cat:'moods'}];
const itemGroup=it=>{
  const p='i.'+it.id+'.';
  const f=[T(p+'t','Metin',it.t),T(p+'href','Link (URL veya #bölüm)',it.href||'#'),K(p+'hide','Gizle',false),
    R(p+'dx','Yatay konum (kaydır)',it.dx||0,-40,40,.05,'cqw'),R(p+'dy','Dikey konum (kaydır)',it.dy||0,-40,40,.05,'cqw'),
    R(p+'ls','Harf aralığı (letter-spacing) — genel değere EK',0,-.2,.6,.005,'em','Sol: daha sıkı · Sağ: daha açık (genel değerin üstüne eklenir)',{k:'tx.fs'}),
    SE(p+'pat','Hover efekt deseni (harflerin hangi sırayla karıştığı)',it.pat,PATS)];
  if(it.tm){const k=f.findIndex(x=>x.k===p+'ls');if(k>=0)f.splice(k,1)}   // ortak tipografi: öğe başına harf aralığı yok
  if(it.grp==='side')f.splice(3,0,SE(p+'anchor','Sütunda dikey hizalama',it.anchor,[['top','Üst'],['center','Orta'],['bottom','Alt']]));
  return G(it.t,f)};
const byGrp=g=>ITEMS.filter(i=>i.grp===g).map(itemGroup);

const SEC=[
{t:'Genel',f:[C('bg','Zemin rengi','#000000'),C('tc','Yazı rengi','#ffffff'),
  SE('font','Font','neue-haas-grotesk-text',FONTS),SE('fx.wt','Kalınlık','400',WTS),
  N('',()=>`Font boyutları cqw ile ölçeklenir (site genişliğinin %1’i). Yanda görünen pt değeri sadece referanstır (1pt = 1,333px) ve şu anki önizleme genişliğine (${Math.round(site.clientWidth)} px) göre hesaplanır; tasarımı değiştirmez. Min. 11px sınırı da hesaba katılır.`),
  R('tx.fs','Menü / yan yazı / SEARCH / sosyal link — yazı boyutu',1,.5,2.2,.01,'cqw','Sol: küçük · Sağ: büyük','size'),R('tx.ls','Menü / yan yazı / SEARCH / sosyal link — harf aralığı (letter-spacing)',0,-.1,.4,.005,'em','Sol: sıkı · Sağ: açık',{k:'tx.fs'}),
  SE('fx.case','Harf durumu','none',[['none','Yazıldığı gibi'],['upper','BÜYÜK (EN)'],['upperTr','BÜYÜK (TR: i→İ)']])]},
{t:'Yerleşim',f:[R('ly.top','Üst boşluk (header yüksekliği)',5.72,2,20,.01,'cqw'),R('ly.peek','Kenarda görünen komşu video',2.35,0,12,.01,'cqw'),
  R('ly.col','Yan sütun genişliği',3.9,1,16,.01,'cqw'),R('ly.aspect','Video oranı (en/boy)',1.907,1,2.6,.001),
  R('ly.dim','Komşu videoları karart',.45,0,1,.05),R('bl.h','Video altı boşluk',6,0,20,.1,'cqw')]},
{t:'Logo (sol üst)',f:[R('lg.x','Soldan',4.07,0,30,.01,'cqw'),R('lg.y','Üstten',2.41,0,20,.01,'cqw'),R('lg.w','Genişlik',7.78,2,30,.01,'cqw'),C('lg.c','Renk','#ffffff'),T('lg.href','Link','#')]},
{t:'Üst menü başlıkları — ortak tipografi',f:[
  N('DIRECTORS, WORKS, TEAM ve ABOUT aynı punto, harf aralığı ve font ailesini paylaşır; öğe başına ayrı değer yoktur (uyumsuzluk olamaz). Yazı boyutu pt referansıyla gösterilir (1pt = 1,333px). Team’in sağ kenarı ABOUT’un sağ kenarıyla otomatik hizalanır.'),
  R('tm.fs','Yazı boyutu',1,.5,2.2,.01,'cqw','Sol: küçük · Sağ: büyük','size'),
  R('tm.ls','Harf aralığı (letter-spacing)',0,-.1,.4,.005,'em','Sol: sıkı · Sağ: açık',{k:'tm.fs'}),
  SE('tm.font','Font ailesi','neue-haas-grotesk-text',FONTS),
  K('nv.al','Team’in sağ kenarını ABOUT’un sağ kenarına hizala (kapalıysa: video sağ kenarına)',false),
  R('nv.ro','Sağ hiza — mikro ayar',1,-30,30,.25,'px','Artı: menü sola · Eksi: sağa')]},
{t:'Menü (üst sağ)',f:[R('nv.t','Üstten',3.04,0,20,.01,'cqw'),R('nv.r','Sağdan ek boşluk',-2.15,-20,20,.01,'cqw'),R('nv.gap','Öğeler arası boşluk',2.53,0,15,.01,'cqw'),...byGrp('nav')]},
{t:'Yan yazılar (dikey)',f:byGrp('side')},
{t:'Kontroller',f:[K('ct.show','← 01/04 → kontrollerini göster',false)]},
{t:'Works · görseller',wks:1,f:[]},
{t:'Works sayfası',f:[
  {t:'btn',l:'Works sayfasını göster',fn:()=>setView('works')},
  {t:'btn',l:'Ana sayfayı göster',fn:()=>setView('home')},
  {t:'btn',l:'Alt menüyü aç / kapat',fn:()=>{if(view!=='works'){setView('works');setTimeout(openSub,Math.max(0,V['wk.vdur']*1000+80))}else if(subOpen)closeSub();else openSub()}},
  N('Works sayfası ikili grid: pencereler “cover” ile dolar (görsel büyür ve gerekirse kırpılır). Görselleri “Works · görseller” bölümünden eklersin; proje bilgileri pencerenin üzerine gelince bükülmeyle birlikte belirir (“Works · hover bükülme + proje bilgisi”). Doğrudan açmak için adres sonuna #works ekleyebilirsin.'),
  R('wk.mx','Yan boşluk (sol / sağ)',4,0,20,.01,'cqw','Varsayılan: logonun soldan konumuyla aynı'),
  R('wk.top','Üst boşluk (grid başlangıcı)',5.73,0,20,.01,'cqw'),
  R('wk.gx','Sütunlar arası boşluk',1.23,0,6,.01,'cqw'),
  R('wk.gy','Satırlar arası boşluk',1.29,0,6,.01,'cqw'),
  R('wk.aspect','Pencere oranı (en/boy)',1.855,1,3,.001,'','Sol: kareye yakın · Sağ: daha geniş şerit'),
  R('wk.fx','Kırpma odağı — yatay',50,0,100,1,'%','Sol: görselin solu kalır · Sağ: sağı kalır'),
  R('wk.fy','Kırpma odağı — dikey',50,0,100,1,'%','Sol: üst kalır · Sağ: alt kalır'),
  R('wk.bh','Grid altı boşluk',6,0,30,.1,'cqw'),
    R('wk.sw','ABOUT sütun genişliği (Works)',.8,.2,6,.01,'cqw','Metin bu sütunun ortasına oturur: küçük değer = grid kenarına yakın'),
  R('wk.vdur','Sayfa geçişi: yeni sayfanın belirme süresi (Home ⇄ Works)',.35,0,2,.05,'s','Geçiş anlıktır; bu süre sadece yeni sayfanın yumuşakça belirmesidir'),
  C('wk.olc','Footer “O” ışık rengi (Works)','#00ff00'),
  C('wk.glc','Zemin ışığı rengi — proje pencerelerinde (Works)','#00ff00')]},
{t:'Works · hover bükülme + proje bilgisi',f:[
  N('Bir proje penceresinin üzerine gelince (PLAY imleci) pencere, Home’daki geçiş efektine benzer şekilde dört kenardan (üst, alt, sağ, sol) perspektif / bükülme alır. Pencerenin dört köşesi sabit kalır, bükülme köşeler arasındaki düzleme uygulanır (grid bozulmaz); proje bilgisi ve ok bu sırada belirir. Proje bilgisi metni “Works · görseller” bölümündeki “Proje bilgisi” alanına yazılır. Yazı boyutu pt referansıyla gösterilir (1pt = 1,333px).'),
  R('wk.bend','Bükülme miktarı',1,0,2.5,.05,'×','0 = bükülme yok · 1 = Home’daki geçişle aynı · Sağ: daha belirgin'),
  R('wk.bendx','Sağ / sol açı oranı (yan kenarların içe bükülmesi)',1,0,3,.05,'×','0 = sadece üst / alt · 1 = referanstaki gibi · Sağ: yanlar daha çok bükülür'),
  R('wk.bin','Bükülme — oluşma süresi (hover)',.6,.05,2.5,.05,'s','Sol: ani · Sağ: yavaş, yumuşak'),
  R('wk.bout','Bükülme — düzelme süresi (hover bitince)',.6,.05,2.5,.05,'s','Sol: ani · Sağ: yavaş, yumuşak'),
  SE('wk.ifont','Proje bilgisi — font ailesi','neue-haas-grotesk-text',FONTS),
  SE('wk.iwt','Proje bilgisi — kalınlık','400',WTS),
  R('wk.isz','Proje bilgisi — yazı boyutu',.8,.4,3,.01,'cqw','Sol: küçük · Sağ: büyük','size'),
  R('wk.ils','Proje bilgisi — harf aralığı (letter-spacing)',.12,-.1,.8,.005,'em','Sol: sıkı · Sağ: açık',{k:'wk.isz'}),
  K('wk.iup','Proje bilgisi — BÜYÜK HARF',true),
  C('wk.ic','Proje bilgisi — renk','#ffffff'),
  R('wk.ipx','Proje bilgisi — soldan / sağdan boşluk (pencere genişliğinin %’si)',4.4,0,20,.1,'%'),
  R('wk.iy','Proje bilgisi — dikey konum (pencere yüksekliğinin %’si)',50,0,100,.5,'%','Sol: üst · Sağ: alt'),
  SE('wk.iarr','Ok konumu',"edge",[['edge','Satırın sağ ucunda (referans görsel)'],['text','Metnin hemen sağında']]),
  R('wk.igap','Metin ile ok arası boşluk',.8,0,4,.05,'cqw'),
  R('wk.icap','Ok yüksekliği = büyük harf (cap) yüksekliği oranı',.72,.5,1,.005,'em','Ok, yazının büyük harf yüksekliğine eşitlenir. Neue Haas Grotesk Text için ≈ .72; metinle farklı görünürse buradan ince ayar yap'),
  R('wk.idel','Bilgi — belirme gecikmesi',.15,0,1.5,.05,'s'),
  R('wk.iin','Bilgi — belirme süresi',.45,.05,2,.05,'s'),
  R('wk.iout','Bilgi — kaybolma süresi',.25,.05,2,.05,'s')]},
{t:'Works · alt menü',f:[
  N('Alt menü, Works sayfasında WORKS’in üzerine gelince (hover) açılır, başlıklar WORKS’in sol kenarından başlayan sol hizalı bir blok olarak dizilir (hiza “Alt menü hizası”ndan değişir); dokunmatik ekranda tıklayınca açılır / kapanır. Açılırken alt başlıklar karışmadan, sırayla yumuşakça belirir; WORKS başlığı karışma efektini korur. Alt başlıklarda hover’da renk değişimi çalışır.'),
  K('wk.subfx','Alt başlıklarda hover’da harf karışması',true),
  R('wk.cdel','Fare menüden çıkınca kapanma gecikmesi',.25,0,1.5,.05,'s','Sol: hemen kapanır · Sağ: biraz bekler'),
  R('wk.sfs','Alt başlık yazı boyutu',.72,.4,2,.01,'cqw','Sol: küçük · Sağ: büyük','size'),
  R('wk.sls','Alt başlık harf aralığı (letter-spacing)',0,-.1,.4,.005,'em','Sol: sıkı · Sağ: açık',{k:'wk.sfs'}),
  R('wk.sgap','Alt başlıklar arası boşluk',.2,0,3,.01,'cqw'),
  R('wk.sy','WORKS ile ilk alt başlık arası',.33,-2,6,.01,'cqw'),
  C('wk.c','Hover / aktif rengi','#00ff00'),
  SE('wk.active','Aktif kategori (yeşil kalır)','none',[['none','Yok'],['commercials','COMMERCIALS'],['music','MUSIC VIDEOS'],['narrative','NARRATIVE'],['content','CONTENT'],['moods','MOODS']]),
  R('wk.odur','Açılış kayma süresi',.6,.05,2,.05,'s','Sol: ani · Sağ: yavaş, yumuşak'),
  R('wk.slide','Açılışta yukarıdan kayma mesafesi',.9,0,4,.05,'em'),
  R('wk.stg','Alt başlıklar arası gecikme (stagger)',.07,0,.5,.01,'s','Sol: hepsi aynı anda · Sağ: sırayla'),
  SE('wk.sal','Alt menü hizası (WORKS’e göre)','left',[['left','Soldan blok (WORKS’in sol kenarına)'],['center','Ortada'],['right','Sağdan']]),
  R('wk.sx','Alt menü — yatay mikro kaydırma',0,-40,40,.25,'px'),
  ...byGrp('sub')]},
{t:'İmleç (özel)',f:[K('cu.show','Özel imleci kullan',true),R('cu.c','Daire imleç boyutu',19,6,80,1,'px'),R('cu.p','Video üstü imleç (PLAY) boyutu',68,30,200,1,'px'),
  R('cu.x','Footer “O” imleci — boyut (genişlik)',33,10,120,1,'px','Sol: küçük · Sağ: büyük'),R('cu.xr','Footer “O” imleci — oran (en/boy)',1,.4,2.5,.01,'','1 = kare (orijinal) · Sol: dikey uzar · Sağ: yatay uzar')]},
{t:'Works · Moods ikonları',f:[
  K('md.on','Başlangıçta açık',false),
  R('md.u','İkon ölçeği',.0515,.02,.15,.0005,'cqw'),
  R('md.gap','İkon – etiket arası',.9,0,5,.01,'cqw'),
  R('md.dy','Dikey mikro ayar',0,-30,30,.25,'px'),
  R('md.x1','EMOTIONAL — yatay konum',17,0,100,.01,'cqw'),
  R('md.x2','HUMOROUS — yatay konum',30.09,0,100,.01,'cqw'),
  R('md.x3','MUSICAL — yatay konum',42.24,0,100,.01,'cqw'),
  R('md.x4','EXPERIMENTAL — yatay konum',55.9,0,100,.01,'cqw'),
  R('md.x5','INFORMATIVE — yatay konum',69.48,0,100,.01,'cqw'),
  R('md.x6','PREMIUM — yatay konum',81.83,0,100,.01,'cqw')]},
{t:'Toggle butonu (sağ alt · pin)',f:[
  N('Sağ altta, en üst katmanda sabit. Sağ ve alt boşluğu panelden ayarlanır (referans görseldeki konum). Basınca kapalı ↔ açık görünüm değişir (işlevi sonraki aşamada). Works’te rengi otomatik yeşil (Works zemin ışığı rengi).'),
  K('tg.show','Butonu göster',true),
  K('tg.on','Başlangıç hali: açık',false),
  K('tg.snd','Açılırken ses çal (kapatırken sessiz)',true),
  R('tg.vol','Ses seviyesi',.8,0,1,.05,'','Sol: sessiz · Sağ: tam'),
  R('tg.sd','Ses gecikmesi (ince senkron)',0,0,300,5,'ms','0 = tıklama anında. Ses görselden erkense artırın'),
  R('tg.vd','Görsel geçiş gecikmesi (ince senkron)',0,0,300,5,'ms','0 = tıklama anında. İkinci tık sesine denk getirmek için ≈70 ms'),
  R('tg.w','Boyut (genişlik)',2.0,.8,6,.01,'cqw','Sol: küçük · Sağ: büyük'),
  C('tg.c','Renk (Home ve genel sayfalar)','#ff0000'),
  C('tg.sc','Aktif durumda çizgi (stroke) rengi','#000000'),
  R('tg.r','Sağdan boşluk (sağ kenara)',3.99,0,20,.01,'cqw','Referans: sol hizayla (logo / SEARCH / CONTACT) simetrik'),
  R('tg.b','Alttan boşluk',2.11,0,20,.01,'cqw'),
  R('tg.dx','Yatay mikro ayar',0,-30,30,.25,'px','Artı: sola · Eksi: sağa'),
  R('tg.dy','Dikey mikro ayar',0,-30,30,.25,'px','Artı: yukarı · Eksi: aşağı')]},
{t:'Hover efekti (menü · footer · proje adları)',f:[
  R('rf.dur','Toplam süre',.3,.2,2,.01,'s'),
  R('rf.lead','Hepsinin karışık kaldığı ilk bölüm',.12,0,.6,.01),
  R('rf.cps','Harf değişim hızı',12,6,60,1,'/sn'),
  R('rf.rnd','Oturma sırası rastgeleliği',1,0,1,.05),
  K('fx.leave','Mouse çıkarken de oynat',false)]},
{t:'Video altyazısı',f:[K('cp.show','Göster',true),K('cp.always','Hep görünür (hover beklemez)',false),
  R('cp.fs','Yazı boyutu',1.12,.5,3,.01,'cqw','Sol: küçük · Sağ: büyük','size'),R('cp.ls','Harf aralığı (letter-spacing)',0,-.1,.4,.005,'em','Sol: sıkı · Sağ: açık',{k:'cp.fs'}),R('cp.pad','Kenar boşluğu (0 = video penceresine yaslı)',0,0,10,.05,'cqw'),
  SE('cp.ha','Yatay konum','flex-start',[['flex-start','Sol'],['center','Orta'],['flex-end','Sağ']]),
  SE('cp.va','Dikey konum','flex-end',[['flex-start','Üst'],['center','Orta'],['flex-end','Alt']]),
  R('cp.x','Yatay kaydır',0,-30,30,.05,'cqw'),R('cp.y','Dikey kaydır',0,-30,30,.05,'cqw'),
  C('cp.c','Yazı rengi','#ffffff'),SE('cp.wt','Kalınlık','400',WTS),SE('cp.pat','Efekt deseni','random',PATS),
  R('cp.leave','Çıkış süresi (video alanından çıkınca sönme)',.25,0,1.5,.05,'s','Sol: ani · Sağ: yavaş söner')]},
{t:'Patlama + tam ekran (Play tıklaması)',f:[R('bu.n','Dondurma adedi',48,5,200,1),R('bu.emit','Çıkış süresi',1,.1,3,.05,'s'),
  R('bu.min','En küçük boy (yükseklik)',1.6,.5,8,.05,'cqw'),R('bu.max','En büyük boy (yükseklik)',3.6,.5,10,.05,'cqw'),
  R('bu.speed','Fırlatma hızı',45,5,140,1,'cqw/s'),R('bu.dir','Fırlatma yönü (-90 = yukarı, 0 = sağ)',-90,-180,180,1,'°'),R('bu.spread','Açı genişliği',140,10,360,5,'°'),
  R('bu.g','Yer çekimi',90,0,300,5,'cqw/s²'),R('bu.drag','Hava direnci',.8,0,3,.05),R('bu.spin','Dönme hızı',360,0,1080,10,'°/s'),
  R('bu.life','Ömür',3,.5,8,.1,'s'),R('bu.fade','Sönme süresi',.7,.1,3,.05,'s'),
  R('fs.delay','Videonun büyümesi için gecikme',.8,0,3,.05,'s'),R('fs.dur','Büyüme süresi',.9,.2,3,.05,'s'),K('fs.muted','Sessiz başlat',false),
  R('fs.l','Alt kontroller: soldan',13.1,0,40,.05,'cqw'),R('fs.r','Alt kontroller: sağdan',4.1,0,40,.05,'cqw'),R('fs.b','Alt kontroller: alttan',2.35,0,20,.05,'cqw'),
  R('fs.bs','Buton boyutu',1.3,.8,4,.05,'cqw'),R('fs.bh','Bar yüksekliği',.65,.2,3,.05,'cqw'),R('fs.gap','Öğeler arası boşluk',.65,0,5,.05,'cqw')]},
{t:'Videolar ve geçiş',vids:1,f:[K('tr.auto','Otomatik oynat',true),R('tr.hold','Placeholder bekleme',5,2,14,1,'sn'),R('tr.dur','Geçiş süresi',1500,600,3500,50,'ms'),
  R('tr.def','Deformasyon',1,0,2.5,.05),R('tr.slide','Kayma mesafesi',1,1,1.7,.01),
  SE('tr.fit','Yerleştirme','cover',[['cover','Kırp (cover)'],['contain','Sığdır (contain)']]),R('tr.fx','Yatay odak',50,0,100,1,'%'),R('tr.fy','Dikey odak',50,0,100,1,'%'),
  K('tr.muted','Sessiz oynat',true),K('tr.loop','Videoyu döngüye al (otomatik ilerleme durur)',false)]},
{t:'Işık süzmesi (video üstünde imleci takip)',f:[
  N('Işık en alt katmandır: üstte PLAY imleci, ortada video paneli, altta bu ışık. Sadece imleç video alanındayken belirir, çıkınca kaybolur. Video panelinin kenarlarında (üst/alt ve yan boşluklarda) panelin altından görünür.'),
  K('gl.show','Göster',true),C('gl.c','Işık rengi','#0000ff'),
  R('gl.int','Yoğunluk (genel opaklık)',1,0,1,.05,'','Sol: şeffaf / sönük · Sağ: tam opak'),
  R('gl.w','Genişlik',50,5,150,.5,'cqw','Sol: dar · Sağ: geniş'),
  R('gl.h','Yükseklik',24.7,5,150,.5,'cqw','Sol: kısa · Sağ: uzun (SVG oranı 241×119 ≈ 24.7 / 50)'),
  R('gl.midpos','Orta nokta konumu (gradient stop)',57.7,1,99,.1,'%','Sol: merkezdeki dolgun alan küçük · Sağ: dolgun alan geniş, kenara kadar uzanır'),
  R('gl.mid','Orta noktadaki opaklık',.56,0,1,.01,'','Sol: merkezden sonra hızla söner · Sağ: kenara doğru daha opak kalır'),
  R('gl.follow','Takip yumuşaklığı (lag)',.4,0,.95,.05,'','Sol: imleci anında takip eder · Sağ: geriden, yumuşak ve yavaş takip eder'),
  R('gl.fin','Belirme süresi (fade-in)',.5,0,3,.05,'s','Sol: ani belirir · Sağ: yavaş belirir'),
  R('gl.fout','Kaybolma süresi (fade-out)',.5,0,3,.05,'s','Sol: ani kaybolur · Sağ: yavaş, yumuşak kaybolur'),
  SE('gl.blend','Karışım (blend mode)','normal',[['normal','Normal'],['screen','Screen'],['plus-lighter','Plus lighter']])]},
{t:'Sol alt · CONTACT / SEARCH',f:[
  N('CONTACT (dikey) ve SEARCH (yatay) Home ve Works’te aynı yerde, görünüm penceresinin sol altında sabit durur. SEARCH’ün alt boşluğu, Team’in üst boşluğuyla birebir eşitlenir: “Optik eşitleme” açıkken harflerin görünen kenarları (Team’de büyük harf üstü, SEARCH’te harf tabanı) aynı mesafede olur. Mikro ayarlar piksel cinsindendir.'),
  R('lb.x','Soldan boşluk',4,0,20,.01,'cqw','Varsayılan: logo ve Works gridiyle aynı sol hiza'),
  R('lb.cw','CONTACT dikey sütun genişliği',.88,.2,6,.01,'cqw','CONTACT bu sütunun ortasına oturur'),
  K('lb.eq','SEARCH alt boşluğu = logonun üst boşluğu (otomatik, harf tabanına göre)',true),
  R('lb.bm','Alt boşluk (otomatik kapalıysa)',3.8,0,20,.01,'cqw'),
  R('lb.bo','Alt boşluk — mikro ayar',-4.25,-30,30,.25,'px','Eksi: aşağı · Artı: yukarı'),
  R('lb.cy','CONTACT — video alt çizgisine mikro ayar',0,-30,30,.25,'px','Artı: aşağı · Eksi: yukarı (0 = C tam video alt çizgisinde)'),
  ...byGrp('below')]},
{t:'Footer',f:[
  K('ft.link','Logo yan ve alt boşluğu = SEARCH’ün alt boşluğu (otomatik)',true),
  R('ft.m','Yan boşluk (sağ = sol) — otomatik kapalıysa',3.8,0,20,.01,'cqw'),
  R('ft.pbm','Alt boşluk — otomatik kapalıysa',3.8,0,20,.01,'cqw'),
  R('ft.mo','Yan boşluk — mikro ayar',23,-30,30,.25,'px','Artı: logo daralır · Eksi: genişler'),
  R('ft.bo','Alt boşluk — mikro ayar',0,-30,30,.25,'px'),
  R('ft.mt','Üst boşluk',10,0,40,.1,'cqw'),C('ft.c','Dev logo rengi','#2f2f2f'),
  R('ft.sm','Sosyal linkler — logonun üst kenarından boşluk',14,0,120,.5,'px'),R('ft.sg','Sosyal linkler arası',2.57,0,20,.01,'cqw'),C('so.c','Sosyal link rengi','#bdbdbd'),
  K('ft.dshow','“DESIGNED BY” metnini göster',true),
  T('ft.dt','“DESIGNED BY” metni','DESIGNED BY ARTI STÜDYO®'),
  R('ft.ds','“DESIGNED BY” — yazı boyutu',.55,.3,2,.01,'cqw','Sol: küçük · Sağ: büyük','size'),
  R('ft.dls','“DESIGNED BY” — harf aralığı (letter-spacing)',.08,-.1,.6,.005,'em','',{k:'ft.ds'}),
  R('ft.dg','“DESIGNED BY” — logonun alt kenarından boşluk',10,0,80,.5,'px'),
  C('ft.dc','“DESIGNED BY” — renk','#8a8a8a'),
  ...byGrp('social')]},
{t:'Footer · "O" harfi mavi ışığı',f:[K('ol.show',"O'ya gelince ışığı göster",true),K('ol.pin','Ayar yaparken hep göster (hover beklemeden)',false),
  C('ol.c','Işık rengi','#0000ff'),R('ol.g','Parlaklık (1 = SVG’nin kendi değeri)',1,0,2.4,.05),
  R('ol.in','Belirme süresi (yavaş = estetik)',1.6,.1,5,.1,'s'),R('ol.out','Kaybolma süresi',1.1,.1,5,.1,'s'),
  R('ol.s','Boyut',1,.2,3,.01),R('ol.up','Üst uzama (dikey)',1,.5,3,.01),R('ol.sp','Üst genişleme (yatay)',1,.3,4,.01),R('ol.sy','Yükseklik oranı (1 = SVG’nin kendi oranı)',1,.4,2,.01),
  R('ol.x','Yatay konum (ince ayar)',0,-10,10,.01,'cqw'),R('ol.y','Dikey konum (ince ayar)',0,-10,10,.01,'cqw'),
  R('ol.hit',"Hover alanı (O'nun boyutuna oranla)",1,.3,1.8,.01)]},
];
const defs={};
const reg=f=>{if(f.k)defs[f.k]=f;(f.fields||[]).forEach(reg)};SEC.forEach(s=>s.f.forEach(reg));
const D={};Object.keys(defs).forEach(k=>D[k]=defs[k].d);D['ui.open']=true;
const DEF_SLIDES=[{cap:'TAT · HAZIR TABAKLAR · FERİT KATİPOĞLU'},{cap:'ÖRNEK FİLM 02 · YÖNETMEN ADI'},{cap:'ÖRNEK FİLM 03 · YÖNETMEN ADI'},{cap:'ÖRNEK FİLM 04 · YÖNETMEN ADI',url:'https://vimeo.com/1217882553',fsx:true}];

let EMB={};try{EMB=JSON.parse($('#defaults').textContent||'{}')}catch(e){EMB={}}
const EDIT=/[?&]edit\b/.test(location.search);
const clientMode=!!EMB.client&&!EDIT;
/* Sürüm geçişi: eski kayıtlı ayarlarda bu yeni varsayılanlar bir kez uygulanır (diğer ayarlara dokunulmaz). */
/* v8 → VER 9: kayıtlı/gömülü ayarlarda eski 'display' font bir kez 'text'e çevrilir; diğer ayarlara dokunulmaz. */
const VER=20,MIGS={20:{'rf.dur':.3,'rf.lead':.12,'rf.cps':12,'rf.rnd':1,'fx.leave':false},19:{'nv.r':-2.15,'ft.mo':23,'i.search.dy':-.8,'i.ig.dy':-.6,'i.vimeo.dy':-.6,'i.giphy.dy':-.6,'wk.mx':4},18:{'ly.top':5.72,'ly.peek':2.35,'ly.col':3.9,'ly.aspect':1.907,'lg.x':4.07,'lg.y':2.41,'lg.w':7.78,'tx.fs':1,'tm.fs':1,'nv.t':3.04,'nv.gap':2.53,'nv.r':0,'nv.ro':1,'nv.al':false,'lb.x':4,'lb.cw':.88,'lb.eq':true,'lb.bo':-4.25,'lb.cy':0,'tg.r':3.99,'tg.b':2.11,'tg.dx':0,'tg.dy':0,'i.about.dx':-.15,'i.about.dy':.1,'i.contact.dx':0,'i.contact.dy':0},17:()=>({'tm.fs':V['tx.fs'],'tm.ls':V['tx.ls']||0,'i.dir.dx':0,'i.dir.dy':0,'i.wrk.dx':0,'i.wrk.dy':0,'i.team.dx':0,'i.team.dy':0,'i.about.dx':0,'i.about.dy':0}),16:{'i.contact.dx':0,'i.contact.dy':0,'i.search.dx':0,'i.search.dy':0,'ft.sm':14,'ft.sg':2.57},14:{'i.contact.dx':0,'i.contact.dy':0,'i.contact.pat':'edgesIn','i.contact.anchor':'bottom','i.search.dx':0,'i.search.dy':0,'i.search.pat':'ltr'},12:{'wk.active':'none'},11:{'wk.active':'none','wk.vdur':.35,'fx.fo':.3,'fx.hold':.1,'fx.fi':.4,'fx.spread':.25,'cp.fi':.4,'cp.fo':.3,'cp.hold':.1,'cp.spread':.25},10:{'i.wrk.href':'#works'},9:{'font':'neue-haas-grotesk-text'},8:{'fx.set':'pool','cp.set':'pool','fx.keep':0,'cp.keep':0},7:{'gl.show':true,'gl.int':1,'gl.w':50,'gl.h':24.7,'gl.midpos':57.7,'gl.mid':.56,'gl.follow':.4,'gl.fin':.5,'gl.fout':.5,'gl.blend':'normal'},4:{'cp.pad':0,'cp.ha':'flex-start','cp.va':'flex-end','cp.x':0,'cp.y':0,'ct.show':false,'gl.show':false,'fx.dur':.55,'fx.settle':.4},
  5:{'cp.hide':60,'cp.dur':.55,'cp.spread':.35,'cp.jit':.3,'cp.min':0,'cp.feel':'fade'},
  6:()=>({'cp.ls':V['tx.ls']||0})};
const migrate=from=>{for(let v=from+1;v<=VER;v++){const m=MIGS[v];Object.assign(V,typeof m==='function'?m():(m||{}))}};
const V=Object.assign({},D,EMB.V||{});
if(EMB.V)migrate(EMB.ver||0);
let slidesInit=(EMB.slides&&EMB.slides.length)?EMB.slides:DEF_SLIDES;
let worksInit=(EMB.works&&EMB.works.length)?EMB.works:null;
let restored=false;
if(!clientMode){try{
  const rd=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
  let sv=rd(KEY);const lt=rd(KEY+'-lite');
  if(!(sv&&sv.V)||(lt&&lt.V&&(lt.ts||0)>(sv.ts||0)+1000&&!(sv.works&&sv.works.length)))sv=lt;   // tam kayıt yoksa / eskiyse hafif yedek
  if(sv&&sv.V&&(sv.ts||0)>(EMB.ts||0)){restored=true;Object.assign(V,sv.V);migrate(sv.ver||0);if(sv.slides&&sv.slides.length)slidesInit=sv.slides;
    if(sv.works&&sv.works.length){
      /* tam kayıtta görsel verisi eksikse ama hafif yedekte proje bilgisi varsa bilgileri koru */
      if(lt&&lt.works)sv.works.forEach((w,i)=>{if(!w.info&&lt.works[i]&&lt.works[i].info)w.info=lt.works[i].info});
      worksInit=sv.works}}
}catch(e){}}
if(clientMode)document.body.classList.add('client');
if(EDIT&&EMB.client)V['ui.open']=true;
const k2v=k=>'--v-'+k.replace(/\./g,'-');
const casefn=s=>V['fx.case']==='upper'?s.toUpperCase():V['fx.case']==='upperTr'?s.toLocaleUpperCase('tr-TR'):s;

/* =====================================================================
   HARF EFEKTİ (rastgele / yönlü kaybolup geri gelme)
   ===================================================================== */
function mulberry32(a){return function(){a|=0;a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function buildPlan(chars,pattern,hideAmount,jit,seed){
  const n=chars.length,rand=seed>0?mulberry32(Math.floor(seed)):Math.random;
  const cand=[];chars.forEach((c,i)=>{if(c.trim()!=='')cand.push(i)});
  for(let i=cand.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));const t=cand[i];cand[i]=cand[j];cand[j]=t}
  const count=hideAmount<=0?0:Math.min(cand.length,Math.max(1,Math.round(cand.length*hideAmount/100)));
  const hidden=new Set(cand.slice(0,count)),mid=(n-1)/2;
  return chars.map((_,i)=>{
    let p=0;
    if(pattern==='random')p=rand();
    else if(pattern==='ltr')p=n>1?i/(n-1):0;
    else if(pattern==='rtl')p=n>1?1-i/(n-1):0;
    else if(pattern==='centerOut')p=mid>0?Math.abs(i-mid)/mid:0;
    else if(pattern==='edgesIn')p=mid>0?1-Math.abs(i-mid)/mid:0;
    const pos=pattern==='random'?p:p*(1-jit)+rand()*jit;
    return{hide:hidden.has(i),pos,dv:rand()}});
}
function build(el,chars){el.textContent='';return chars.map(c=>{const s=h('span',null,c);s.setAttribute('aria-hidden','true');el.append(s);return s})}

/* ---------- menü / yazı öğeleri ---------- */
var moodsOn=false;
const items=ITEMS.map(i=>Object.assign({},i));
const sideHost=it=>it.col==='L'?$('#pcc'):$('#pcol'+it.col);   // sol sütun = sol alt pin (CONTACT), sağ = ABOUT
function mountItems(){
  const host={nav:$('#nav'),below:$('#pct'),social:$('#social'),sub:wsub};let subIdx=0;
  items.forEach(it=>{
    const a=h('a','fx'+(it.grp==='social'?' so':'')+(it.grp==='below'?' ct':'')+(it.grp==='side'?' side':'')+(it.grp==='sub'?' sub':'')+(it.tm?' tm':''));
    a.dataset.id=it.id;it.el=a;
    /* WORKS: alt menü, başlığın hemen altına konumlanabilsin diye sarmalayıcı içinde */
    if(it.id==='wrk'){const w=h('div','navw');w.append(a,wsub);host.nav.append(w);
      w.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')openSub()});
      w.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')closeSubLater()});
      a.addEventListener('focus',openSub)}
    else (it.grp==='side'?sideHost(it):host[it.grp]).append(a);
    if(it.grp==='sub')a.style.setProperty('--i',subIdx++);
    a.addEventListener('pointerenter',()=>{if(it.grp==='sub'&&!V['wk.subfx'])return;playItem(it)});
    a.addEventListener('pointerleave',()=>{if(V['fx.leave'])playItem(it)});
    a.addEventListener('click',e=>itemClick(e,it));
  });
}
/* ---------- SCRAMBLE (menü hover) ----------
   İlk/son harf(ler) sabit kalır; ortadakiler kendi yerinde rastgele karakterlere dönüşüp
   sırayla asıl harfe oturur. Her harfin genişliği kilitlenir, yazı kaymaz. */
const isUp=c=>c!==c.toLocaleLowerCase('tr-TR')&&c===c.toLocaleUpperCase('tr-TR');
/* Karışırken yalnızca harf kullanılır (rakam yok); harfin yuvasının genişliğine yakın olanlar seçilir, yazı kaymaz. */
const mctx=document.createElement('canvas').getContext('2d');
function fitPool(o,w,font){
  const a=[...'abcdefghijklmnopqrstuvwxyz'],g=/\d/.test(o)?[...'0123456789']:(isUp(o)?a.map(c=>c.toUpperCase()):a);
  mctx.font=font;const wd=c=>mctx.measureText(c).width;
  const f=g.filter(c=>{const m=wd(c);return m>=w*.6&&m<=w*1.3});
  return f.length>=3?f:g.slice().sort((a,b)=>Math.abs(wd(a)-w)-Math.abs(wd(b)-w)).slice(0,6)}
function stopScr(it){
  if(it.scr){cancelAnimationFrame(it.scr);it.scr=0}
  if(it.spans)it.spans.forEach((s,i)=>{s.getAnimations().forEach(a=>a.cancel());if(s.dataset.scr){s.textContent=it.chars[i];s.style.inlineSize='';s.style.textAlign='';delete s.dataset.scr}})}
const isLet=c=>/[\p{L}\d]/u.test(c);
/* Karıştırma + kaybolup belirme birlikte (menüler ve video altyazısı aynı motoru kullanır).
   Her harfin zamanlaması: fade-out (fo) → görünmez kalma (hold) → fade-in (fi); karışma bu sürenin tamamında sürer
   ve harf, fade-in bittiğinde asıl harfine oturur. İlk/son harf(ler) sabit. o.reveal: harfler görünmezken başlar (altyazı). */
/* Ölçü önbelleği: yazı tipi + her harfin genişliği + karışma havuzu bir kez hesaplanır, hover'da tekrar ölçülmez.
   Yazı / font / boyut değişince (apply, resize, font yüklenmesi) invalidateMetrics() ile sıfırlanır. */
function fillMc(it,o){
  const mk=it.chars.join('');
  let mc=it.mc;
  if(!mc||mc.key!==mk){
    const cs=getComputedStyle(it.el);
    mc=it.mc={key:mk,vert:cs.writingMode.indexOf('vertical')===0,font:`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,w:[],pool:[]};
  }
  const ch=it.chars,sp=it.spans;
  for(let i=0;i<ch.length;i++){
    if(mc.pool[i]||!isLet(ch[i]))continue;
    const r=sp[i].getBoundingClientRect(),w=mc.vert?r.height:r.width;
    if(!(w>0))continue;   // gizli (display:none) öğe: ölçme, önbelleğe alma
    mc.w[i]=w;mc.pool[i]=fitPool(ch[i],w,mc.font);
  }
  return mc;
}
const mdItems=[];
function invalidateMetrics(){items.forEach(i=>{i.mc=null});mdItems.forEach(i=>{i.mc=null});if(typeof capIt!=='undefined')capIt.mc=null}
function warmScr(){items.forEach(it=>{if(it.spans&&it.el.offsetWidth)fillMc(it)})}
/* ---------- REFERANS SCRAMBLE ----------
   Videodaki mantık: hover anında bütün harfler aynı anda karışır (yalnızca harf, tam opak/beyaz),
   sonra her harf kendi zamanında asıl harfine oturur. Fade/opaklık kullanılmaz.
   Harf genişliği kilitlenir (mc.w) → yazı kaymaz. */
function scrambleRef(it,o){
  stopScr(it);
  const ch=it.chars,sp=it.spans,n=ch.length;if(!n)return;
  sp.forEach(s=>{s.getAnimations().forEach(a=>a.cancel());s.style.opacity=1});
  if(reduce)return;
  const mc=fillMc(it,o),plan=buildPlan(ch,o.pat,0,0,0);
  const dur=Math.max(100,V['rf.dur']*1000),lead=V['rf.lead'],rnd=V['rf.rnd'],iv=1000/Math.max(1,V['rf.cps']);
  const st=[];
  for(let i=0;i<n;i++){
    const c=ch[i];if(!/\p{L}/u.test(c))continue;
    const w=mc.w[i],pool=mc.pool[i];if(!(w>0)||!pool||pool.length<2)continue;
    const pos=(1-rnd)*plan[i].pos+rnd*Math.random();
    st.push({i,t1:dur*(lead+(1-lead)*pos)+iv,nx:0,w,pool,last:c,tn:sp[i].firstChild,done:false});
  }
  st.forEach(x=>{const s=sp[x.i];s.dataset.scr='1';s.style.inlineSize=x.w+'px';s.style.textAlign='center'});
  const t00=performance.now();
  const frame=now=>{
    const t=now-t00;let live=false;
    for(const x of st){
      if(x.done)continue;const s=sp[x.i];
      if(t>=x.t1){x.done=true;if(x.tn)x.tn.nodeValue=ch[x.i];else s.textContent=ch[x.i];s.style.inlineSize='';s.style.textAlign='';delete s.dataset.scr;continue}
      live=true;
      if(t>=x.nx){let g,k=0;do{g=x.pool[(Math.random()*x.pool.length)|0]}while((g===x.last||g===ch[x.i])&&++k<8);
        x.last=g;if(x.tn)x.tn.nodeValue=g;else s.textContent=g;x.nx=t+iv*(.8+Math.random()*.4)}
    }
    it.scr=live?requestAnimationFrame(frame):0};
  if(st.length)frame(t00);else it.scr=0;
}
function playItem(it){if(!it.spans)return;scrambleRef(it,{pat:V['i.'+it.id+'.pat']})}
/* ---------- toggle butonu: yalnızca görsel durum (işlev sonraki aşamada) ---------- */
const tgEl=$('#tg');
/* Ses (açılırken; kapatırken sessiz): yeni efektin baştaki 46 ms sessizliği kırpıldı → ilk tık sesi t=0'da başlar.
   Web Audio ile sayfa yüklenirken önceden çözümlenir (decode gecikmesi yok); tıklama anında aynı karede başlatılır.
   Web Audio kullanılamazsa <audio> yedeği devreye girer. */
const TG_SND='assets/audio/toggle-click.wav';
let tgCtx=null,tgBuf=null,tgSrc=null,tgAud=null,tgSndT=0;
(function(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;tgCtx=new AC({latencyHint:'interactive'});
  fetch(TG_SND).then(r=>r.arrayBuffer()).then(ab=>new Promise((ok,no)=>tgCtx.decodeAudioData(ab,ok,no))).then(b=>{tgBuf=b}).catch(()=>{tgCtx=null})}catch(e){tgCtx=null}})();
function tgSoundStop(){clearTimeout(tgSndT);try{if(tgSrc){tgSrc.stop();tgSrc=null}}catch(e){}try{if(tgAud){tgAud.pause();tgAud.currentTime=0}}catch(e){}}
function tgSoundPlay(){
  const vol=Math.max(0,Math.min(1,V['tg.vol']));
  const go=()=>{
    if(tgCtx&&tgBuf){const src=tgCtx.createBufferSource(),g=tgCtx.createGain();src.buffer=tgBuf;g.gain.value=vol;src.connect(g);g.connect(tgCtx.destination);tgSrc=src;src.start(0);return}
    try{if(!tgAud){tgAud=new Audio(TG_SND);tgAud.preload='auto'}tgAud.currentTime=0;tgAud.volume=vol;const p=tgAud.play();if(p&&p.catch)p.catch(()=>{})}catch(e){}};
  if(tgCtx&&tgCtx.state!=='running')tgCtx.resume().then(go,go);else go();
}
function tgSound(on){
  tgSoundStop();
  if(!on||!V['tg.snd'])return;
  const d=V['tg.sd']||0;if(d>0)tgSndT=setTimeout(tgSoundPlay,d);else tgSoundPlay();
}
/* ses motorunu ilk dokunuşta uyandır: tıklamadan önceki pointerdown'da AudioContext hazır olur */
tgEl.addEventListener('pointerdown',()=>{try{if(tgCtx&&tgCtx.state==='suspended')tgCtx.resume()}catch(e){}},{passive:true});
tgEl.addEventListener('click',()=>{const on=tgEl.getAttribute('aria-pressed')!=='true';tgSound(on);const vd=V['tg.vd']||0,swp=()=>tgEl.setAttribute('aria-pressed',on?'true':'false');if(vd>0)setTimeout(swp,vd);else swp();
  tgEl.dispatchEvent(new CustomEvent('hokus-toggle',{bubbles:true,detail:{on}}))});
/* ---------- WORKS · MOODS ikon çubuğu ---------- */
const MOOD_DEF=[{id:"emo",t:"EMOTIONAL",w:26,h:22,x:17.0,p:"<path d=\"M14.401 10.8045C12.003 8.4065 12.003 4.5195 14.401 2.1215C16.799 -0.276502 20.686 -0.276502 23.084 2.1215C24.283 3.3205 24.882 4.8915 24.882 6.4635C24.882 14.6445 12.602 16.3325 12.602 21.1935C12.603 16.3315 0.322998 14.6445 0.322998 6.4635C0.322998 3.0725 3.072 0.323498 6.463 0.323498C8.104 0.323498 9.594 0.967498 10.696 2.0155\" stroke-width=\"0.646\" stroke-miterlimit=\"10\"/>"},{id:"hum",t:"HUMOROUS",w:22,h:16,x:30.09,p:"<path d=\"M20.914 0.322998H0.322998V5.271C0.322998 10.957 4.933 15.567 10.619 15.567C16.305 15.567 20.915 10.957 20.915 5.271H10.619V11.055\" stroke-width=\"0.646\" stroke-linejoin=\"bevel\"/>"},{id:"mus",t:"MUSICAL",w:21,h:22,x:42.24,p:"<path d=\"M7.00806 17.8676V3.33761L20.3761 0.401611V14.9316\" stroke-width=\"0.646\" stroke-miterlimit=\"10\"/><path d=\"M20.376 14.9316C20.376 16.7773 18.8797 18.2736 17.034 18.2736C15.1883 18.2736 13.692 16.7773 13.692 14.9316C13.692 13.0859 15.1883 11.5896 17.034 11.5896C18.8797 11.5896 20.376 13.0859 20.376 14.9316Z\" stroke-width=\"0.646\" stroke-miterlimit=\"10\"/><path d=\"M7.007 17.8676C7.007 19.7134 5.51074 21.2096 3.66501 21.2096C1.81927 21.2096 0.322998 19.7134 0.322998 17.8676C0.322998 16.0219 1.81927 14.5256 3.66501 14.5256C5.51074 14.5256 7.007 16.0219 7.007 17.8676Z\" stroke-width=\"0.646\" stroke-miterlimit=\"10\"/><path d=\"M7.00806 6.27362L17.1331 4.04962\" stroke-width=\"0.646\" stroke-miterlimit=\"10\"/>"},{id:"exp",t:"EXPERIMENTAL",w:24,h:24,x:55.9,p:"<path d=\"M11.956 23.912C11.956 17.309 6.603 11.956 0 11.956C6.603 11.956 11.956 6.603 11.956 0C11.956 6.603 17.309 11.956 23.912 11.956C17.309 11.956 11.956 17.309 11.956 23.912Z\" stroke-width=\"0.646\" stroke-miterlimit=\"10\"/>"},{id:"inf",t:"INFORMATIVE",w:23,h:20,x:69.48,p:"<path d=\"M18.561 0.336975L0.322998 4.41598V19.437H3.47601V14.455\" stroke-width=\"0.646\" stroke-linejoin=\"bevel\"/><path d=\"M22.3279 7.389C22.3279 11.2914 20.7447 14.455 18.7919 14.455C16.839 14.455 15.2559 11.2914 15.2559 7.389C15.2559 3.48655 16.839 0.322998 18.7919 0.322998C20.7447 0.322998 22.3279 3.48655 22.3279 7.389Z\" stroke-width=\"0.646\" stroke-linejoin=\"bevel\"/><path d=\"M18.7919 14.455L4.97192 12.915C3.70892 12.744 2.62793 10.818 2.62793 8.23098C2.62793 7.46898 2.71892 6.74898 2.88092 6.11298\" stroke-width=\"0.646\" stroke-linejoin=\"bevel\"/>"},{id:"prm",t:"PREMIUM",w:21,h:20,x:81.83,p:"<path d=\"M20.583 0.318542L0.322998 3.72454V18.9045H20.583V6.03954H3.41602\" stroke-width=\"0.646\" stroke-miterlimit=\"10\"/>"}];
const pmd=$('#pmd');
function mountMoods(){
  pmd.textContent='';mdItems.length=0;
  MOOD_DEF.forEach(m=>{
    const a=h('a','mdi');a.href='#';a.setAttribute('aria-label',m.t);a.dataset.md=m.id;a.style.setProperty('--mw',m.w);
    a.innerHTML='<svg viewBox="0 0 '+m.w+' '+m.h+'" aria-hidden="true">'+m.p+'</svg>';
    const l=h('span','mdl');a.append(l);
    const it={el:l,chars:Array.from(m.t),spans:null,pat:'ltr',a,id:m.id};it.spans=build(l,it.chars);mdItems.push(it);
    a.addEventListener('click',e=>e.preventDefault());
    a.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')scrambleRef(it,{pat:'ltr'})});
    pmd.append(a)});
  applyMoodsPos();
}
function applyMoodsPos(){mdItems.forEach((it,i)=>{it.a.style.setProperty('--mx',V['md.x'+(i+1)])})}
function toggleMoods(){moodsOn=!moodsOn;pmd.classList.toggle('on',moodsOn);items.forEach(applyItem)}
let mdInit=false;
function applyMoods(){if(!mdInit){mdInit=true;mountMoods();moodsOn=!!V['md.on'];pmd.classList.toggle('on',moodsOn);items.forEach(applyItem)}applyMoodsPos()}
let tgInit=false;
function applyToggle(){$('#ptg').style.display=V['tg.show']?'':'none';
  if(!tgInit){tgInit=true;tgEl.setAttribute('aria-pressed',V['tg.on']?'true':'false')}}
function applyItem(it){
  const p='i.'+it.id+'.',el=it.el,txt=casefn(String(V[p+'t']??''));
  if(it.sig!==txt){stopScr(it);it.sig=txt;it.chars=Array.from(txt);it.spans=build(el,it.chars);el.setAttribute('aria-label',txt)}
  el.hidden=!!V[p+'hide'];el.setAttribute('href',V[p+'href']||'#');
  const dx=V[p+'dx'],dy=V[p+'dy'];
  el.style.letterSpacing=it.tm?'var(--v-tm-ls)':`calc(${it.grp==='sub'?'var(--v-wk-sls)':'var(--v-tx-ls)'} + ${V[p+'ls']||0}em)`;
  el.classList.toggle('on',!!it.cat&&(V['wk.active']===it.cat||(it.id==='mds'&&moodsOn)));
  if(it.grp==='side'){
    const an=V[p+'anchor'];
    el.style.top=an==='top'?'0':an==='center'?'50%':'auto';el.style.bottom=an==='bottom'?'0':'auto';
    el.style.transform=`translate(calc(-50% + ${dx}cqw),calc(${an==='center'?'-50%':'0px'} + ${dy}cqw))${it.orient==='up'?' rotate(180deg)':''}`;
  }else el.style.transform=it.grp==='below'?`translate(${dx}cqw,calc(${dy}cqw + var(--fs-ct,0px)))`:`translate(${dx}cqw,${dy}cqw)`;
}

/* ---------- altyazı ---------- */
const capEl=$('#capt');let capSpans=[],capChars=[],capSig=null,capHover=false,lastAlways=null;
const capIt={el:capEl,chars:[],spans:[]};
function revealCaption(){capIt.chars=capChars;capIt.spans=capSpans;capSpans.forEach(s=>{s.getAnimations().forEach(a=>a.cancel());s.style.opacity=1});scrambleRef(capIt,{pat:V['cp.pat']||'random'})}
function hideCaption(){
  if(V['cp.always']){stopScr(capIt);capSpans.forEach(s=>s.style.opacity=1);return}
  const cs=capSpans.map(s=>+getComputedStyle(s).opacity);stopScr(capIt);
  capSpans.forEach((s,i)=>{s.style.opacity=cs[i];
    const a=s.animate([{opacity:cs[i]},{opacity:0}],{duration:V['cp.leave']*1000,fill:'forwards'});a.onfinish=()=>{s.style.opacity=0;a.cancel()}});
}
function setCaption(){
  const txt=casefn(slides[cur]?slides[cur].cap||'':'');
  if(capSig!==txt){stopScr(capIt);capSig=txt;capChars=Array.from(txt);capSpans=build(capEl,capChars);capIt.chars=capChars;capIt.spans=capSpans;
    capSpans.forEach(s=>s.style.opacity=(V['cp.always']||capHover)?1:0);
    if(capHover&&!V['cp.always'])revealCaption()}
  $('#cap').style.display=V['cp.show']?'':'none';
  if(lastAlways!==V['cp.always']){lastAlways=V['cp.always'];stopScr(capIt);capSpans.forEach(s=>{s.style.opacity=(V['cp.always']||capHover)?1:0})}
}
$('#vhit').addEventListener('pointerenter',()=>{capHover=true;cuEl.classList.add('play');if(V['cp.show'])revealCaption()});
$('#vhit').addEventListener('pointerleave',()=>{capHover=false;cuEl.classList.remove('play');hideCaption()});

/* ---------- özel imleç ---------- */
const cuEl=$('#cur'),noHover=matchMedia('(hover: none)').matches;
addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||!V['cu.show']||noHover){cuEl.classList.remove('on');return}
  cuEl.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;
  cuEl.classList.toggle('on',site.contains(e.target))},{passive:true});
document.documentElement.addEventListener('mouseleave',()=>cuEl.classList.remove('on'));

/* =====================================================================
   SLIDER (kayan video geçişi — prototipten uyarlandı)
   ===================================================================== */
const S={dur:1500,def:1,slide:1,hold:5,auto:true};
const HK=window.HK={fit:'cover',fx:.5,fy:.5,muted:true,loop:false,V,S};
const cv=$('#cv'),ctx=cv.getContext('2d');
const PAL=[{sky:['#6c7c8f','#c5cbcd'],gr:['#4a5a42','#252d22'],ac:'#c0392b'},{sky:['#1b2a4b','#d98a5a'],gr:['#2b1f24','#100b0e'],ac:'#f2c14e'},{sky:['#04131a','#25666c'],gr:['#0b1e20','#030809'],ac:'#e8e1c8'},{sky:['#d9b77e','#f3e4c3'],gr:['#8a6a3d','#44331c'],ac:'#2d4a7a'}];
const slides=[],media=new Map();
function newSlide(cap,url,poster,fsx){
  const i=slides.length,c=document.createElement('canvas');c.width=960;c.height=540;
  const b=document.createElement('canvas');b.width=160;b.height=90;
  const s={cv:c,bl:b,vid:null,pal:PAL[i%PAL.length],seed:i*1.7,cap:cap||'',url:null,name:'',vm:null,fsx:fsx===undefined?/1217882553/.test(url||''):!!fsx,poster:poster||'',pimg:null,pdrawn:false,ar:16/9,pst:''};
  slides.push(s);if(url)setSource(s,url,true);return s}

/* ---------- kaynak: Vimeo linki / embed kodu / doğrudan video dosyası ---------- */
function parseVimeo(str){
  str=String(str||'').trim();if(!str)return null;let m;
  if(/^\d{5,}$/.test(str))return{id:str,hash:''};
  const hq=str.match(/[?&;]h=([0-9a-f]+)/i),qh=hq?hq[1]:'';
  if((m=str.match(/player\.vimeo\.com\/video\/(\d+)/i)))return{id:m[1],hash:qh};
  if(!/vimeo\.com/i.test(str))return null;
  if((m=str.match(/vimeo\.com\/[^\s"'<>]*?\/?videos?\/(\d+)(?:\/([0-9a-f]{8,}))?/i)))return{id:m[1],hash:m[2]||qh};
  if((m=str.match(/vimeo\.com\/(?:[^\s"'<>?#]+\/)*?(\d{5,})(?:\/([0-9a-f]{8,}))?/i)))return{id:m[1],hash:m[2]||qh};
  return null}
const vmUrl=vm=>'https://vimeo.com/'+vm.id+(vm.hash?'/'+vm.hash:'');
function classify(val){
  val=String(val||'').trim();if(!val)return{t:'none'};
  const vm=parseVimeo(val);if(vm)return{t:'vimeo',vm};
  const u=(val.match(/https?:\/\/[^\s"'<>]+/)||[])[0];
  if(!u)return{t:'err',m:'Vimeo linki, embed kodu veya http(s) ile başlayan bir video adresi girin.'};
  if(/vimeo\.com/i.test(u))return{t:'err',m:'Bu Vimeo adresinden video numarası okunamadı. vimeo.com/123456789 biçiminde link ya da embed kodunun tamamını yapıştırın.'};
  return{t:'file',u}}
function clearMedia(s){
  if(s.vid){s.vid.pause();s.vid.removeAttribute('src');s.vid.load();s.vid=null}
  s.vm=null;s.pimg=null;s.pdrawn=false;s.pst='';s.ar=16/9;s.arK=false;s.cv.width=960;s.cv.height=540}
function setSource(s,val,quiet){
  const r=classify(val);
  if(r.t==='err'){if(!quiet)toast(r.m);return false}
  clearMedia(s);s.name='';
  if(r.t==='none'){s.url=null;return true}
  if(r.t==='vimeo'){s.vm=r.vm;s.url=vmUrl(r.vm);loadPoster(s)}
  else{s.url=r.u;attach(s,r.u)}
  return true}
/* Kapak: Vimeo'nun oEmbed servisinden (thumbnail_url) alınır; alınamazsa panelden elle kapak URL'si girilir. */
function loadPoster(s){
  if(!s.vm)return;const id=s.vm.id,ok=()=>s.vm&&s.vm.id===id;
  const note=t=>{s.pst=t;const L=$('#vlist');if(L&&!L.contains(document.activeElement))renderVids()};
  const set=u=>{const im=new Image();im.onload=()=>{if(!ok())return;s.pimg=im;s.pdrawn=false;note('Kapak hazır.')};
    im.onerror=()=>{if(ok())note('Kapak görseli yüklenemedi; kapak URL’si girebilirsiniz.')};im.src=u};
  if(s.poster){s.pst='';set(s.poster);return}
  s.pst='Kapak alınıyor…';
  fetch('https://vimeo.com/api/oembed.json?width=1280&url='+encodeURIComponent(vmUrl(s.vm)))
    .then(r=>r.ok?r.json():Promise.reject(new Error(r.status)))
    .then(j=>{if(!ok())return;if(j.width&&j.height){s.ar=j.width/j.height;s.arK=true}if(j.thumbnail_url)set(j.thumbnail_url);else note('Kapak bulunamadı; kapak URL’si girebilirsiniz.')})
    .catch(()=>{if(ok())note('Kapak otomatik alınamadı (gizli/kısıtlı video veya ağ). Kapak URL’sini elle girebilirsiniz.')})}
/* Canvas, videonun gerçek oranında (oEmbed'den; yoksa kapağın oranında) hazırlanır, kapak "cover" çizilir:
   böylece canvas'taki kırpma, üstüne gelen iframe'in kırpmasıyla aynı olur. */
function drawPoster(s){
  const im=s.pimg,ia=im.naturalWidth/im.naturalHeight||16/9;
  if(!s.arK)s.ar=ia;
  const W=960,H=Math.max(1,Math.round(W/s.ar)),c=s.cv.getContext('2d');s.cv.width=W;s.cv.height=H;
  let dw,dh;if(ia>s.ar){dh=H;dw=H*ia}else{dw=W;dh=W/ia}
  c.fillStyle='#000';c.fillRect(0,0,W,H);c.drawImage(im,(W-dw)/2,(H-dh)/2,dw,dh)}
function drawPH(s,t){
  const c=s.cv.getContext('2d'),w=s.cv.width,h=s.cv.height,p=s.pal;
  let g=c.createLinearGradient(0,0,0,h*.64);g.addColorStop(0,p.sky[0]);g.addColorStop(1,p.sky[1]);c.fillStyle=g;c.fillRect(0,0,w,h);
  const bx=w*(.5+.28*Math.sin(t/5200+s.seed));
  g=c.createRadialGradient(bx,h*.3,10,bx,h*.3,w*.5);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
  g=c.createLinearGradient(0,h*.62,0,h);g.addColorStop(0,p.gr[0]);g.addColorStop(1,p.gr[1]);c.fillStyle=g;c.fillRect(0,h*.62,w,h*.38);
  c.fillStyle='rgba(0,0,0,.38)';c.beginPath();c.moveTo(w*.4,h*.64);c.lineTo(w*.4,h*.36);c.lineTo(w*.52,h*.2);c.lineTo(w*.66,h*.36);c.lineTo(w*.66,h*.64);c.fill();
  c.fillRect(w*.1,h*.44,w*.2,h*.2);c.fillRect(w*.76,h*.4,w*.16,h*.24);
  const sw=Math.sin(t/1800+s.seed)*3;
  c.fillStyle=p.ac;c.beginPath();c.ellipse(w*.3,h*.9+sw,w*.1,h*.2,0,Math.PI,0);c.fill();
  c.fillStyle='#2a2622';c.beginPath();c.ellipse(w*.3,h*.58+sw,w*.034,h*.075,0,0,7);c.fill();
  c.fillStyle='#5d5a57';c.beginPath();c.ellipse(w*.7,h*.95-sw,w*.1,h*.28,0,Math.PI,0);c.fill();
  c.fillStyle='#b88a6a';c.beginPath();c.ellipse(w*.7,h*.56-sw,w*.032,h*.075,0,0,7);c.fill();
  g=c.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,w*.62);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.fillStyle='rgba(255,255,255,.55)';c.font='600 15px Arial';c.fillText((s.vm?'VIMEO '+s.vm.id:'YER TUTUCU')+' · '+(s.cap||'').slice(0,22),22,h-20);
}
const tmp=document.createElement('canvas');tmp.width=24;tmp.height=14;const tc=tmp.getContext('2d');
const srcOf=s=>(s.vid&&s.vid.readyState>=2&&s.vid.videoWidth)?s.vid:s.cv;
function updBlur(s,t){
  if(s.pimg&&!s.vid){if(!s.pdrawn){drawPoster(s);s.pdrawn=true}}
  else if(!s.vid||s.vid.readyState<2)drawPH(s,t);
  tc.drawImage(srcOf(s),0,0,24,14);
  const b=s.bl.getContext('2d');b.imageSmoothingQuality='high';b.drawImage(tmp,0,0,160,90);
  b.fillStyle='rgba(255,255,255,.16)';b.fillRect(0,0,160,90);
}
let w=0,Hc=0,Rr={x:0,y:0,w:0,h:0},pad=0,dpr=1,laySig='';
function layout(){
  dpr=Math.min(devicePixelRatio||1,2);const r=cv.getBoundingClientRect();
  if(!r.width||!r.height)return;
  const sig=[r.width,r.height,dpr,V['ly.peek'],V['ly.col']].join('|');if(sig===laySig)return;laySig=sig;
  w=r.width;Hc=r.height;cv.width=Math.round(w*dpr);cv.height=Math.round(Hc*dpr);
  const pk=V['ly.peek']/100*w,cl=V['ly.col']/100*w;
  Rr={x:pk+cl,y:0,w:w-2*(pk+cl),h:Hc};pad=cl;
}
new ResizeObserver(()=>layout()).observe(cv);

let pos=0,cur=0,anim=null,holdT=performance.now(),swapped=true;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function setLabel(i){$('#cnt').textContent=String(i+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');setCaption()}
function playOnly(i){slides.forEach((s,k)=>{if(!s.vid)return;if(k===i){if(s.vid.paused)s.vid.play().catch(()=>{})}else if(!s.vid.paused)s.vid.pause()})}
function go(target){
  if(anim||fsOpen||view!=='home')return;const dist=Math.abs(target-pos);if(!dist)return;
  const n=slides.length,t=slides[mod(target,n)];
  if(t.vid){t.vid.currentTime=0;t.vid.play().catch(()=>{})}
  anim={from:pos,to:target,t0:performance.now(),dur:S.dur*(.65+.35*Math.min(dist,3)),dist};swapped=false;
}
const next=()=>go(Math.round(pos)+1),prev=()=>go(Math.round(pos)-1);

function render(now,bell){
  if(!w||!slides.length)return;
  const n=slides.length,P=(Rr.w+pad)*S.slide,step=Math.max(2,Math.round(3*dpr))/dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,Hc);
  const gL=Rr.x-pad,gR=Rr.x+Rr.w+pad;
  const d=bell*S.def,A=.034*w*d,B=.029*w*d,side=.007*w*d;
  const set=new Set();for(let k=-2;k<=2;k++)set.add(mod(Math.round(pos)+k,n));
  set.forEach(i=>updBlur(slides[i],now));
  for(let x=0;x<w;x+=step){
    let xc=x+step/2;
    /* sütun sınırına denk gelen şerit komşu videonun içeriğini taşısın (yoksa sınırda 1px parlak çizgi kalır) */
    {const e=x+step,mL=Rr.x,mR=Rr.x+Rr.w;
      if(x<gL&&e>gL&&xc>=gL)xc=gL-.5;else if(x<mL&&e>mL&&xc<mL)xc=mL+.5;
      else if(x<mR&&e>mR&&xc>=mR)xc=mR-.5;else if(x<gR&&e>gR&&xc<gR)xc=gR+.5}
    const nn=(xc-w/2)/(w/2),k=1-.82*nn*nn;
    const top=side+A*k,bot=side*.6+B*k,sc=(Rr.h-top-bot)/Rr.h;
    const T=y=>Rr.y+top+(y-Rr.y)*sc;
    const u=xc-Rr.x+pos*P,i=Math.floor(u/P),lu=u-i*P,inV=lu<=Rr.w;
    const j=inV?i:(lu-Rr.w<(P-Rr.w)/2?i:i+1);
    const fs=slides[mod(j,n)],sx=clamp((u-j*P)/Rr.w,0,1);
    const y0=T(0),y1=T(Hc);
    ctx.drawImage(fs.bl,sx*159,0,Math.max(.5,step/Rr.w*160),90,x,y0,step+.6,y1-y0);
    if(inV){
      const s=slides[mod(i,n)],el=srcOf(s),sw=el.videoWidth||el.width,sh=el.videoHeight||el.height;
      const aspect=Rr.w/Rr.h,ea=sw/sh,fit=HK.fit;let cx=0,cw=sw,cy=0,ch=sh;
      const ty=T(Rr.y),th=T(Rr.y+Rr.h)-ty;let dy=ty,dh=th,lx=lu,lw=Rr.w,ok=true;
      if(fit==='cover'){if(ea>aspect){cw=sh*aspect;cx=(sw-cw)*HK.fx}else{ch=sw/aspect;cy=(sh-ch)*HK.fy}}
      else if(fit==='contain'){ctx.fillStyle='#000';ctx.fillRect(x,ty,step+.6,th);
        if(ea>aspect){dh=th*aspect/ea;dy=ty+(th-dh)*HK.fy}else{lw=Rr.w*ea/aspect;lx=lu-(Rr.w-lw)*HK.fx;ok=lx>=0&&lx<=lw}}
      if(ok){/* kaynak dikdörtgeni görselin dışına taşarsa tarayıcı hedefi de kısaltır ve altta daha parlak bulanık katman 1px görünür; bu yüzden içeride tut */
        const ww=Math.max(.5,step/lw*cw),x0=Math.min(cx+lx/lw*cw,cx+cw-ww);ctx.drawImage(el,x0,cy,ww,ch,x,dy,step+.6,dh)}
    }
  }
  /* yan sütun boşlukları şeffaf: arkadaki ışık süzmesi buradan görünür; kenarlardaki parlak bulanık katman da böylece sızmaz */
    const dim=V['ly.dim'];
  if(dim>0){ctx.fillStyle=`rgba(0,0,0,${dim})`;ctx.fillRect(0,0,Rr.x,Hc);ctx.fillRect(Rr.x+Rr.w,0,w,Hc)}
  ctx.clearRect(gL,0,Rr.x-gL,Hc);ctx.clearRect(Rr.x+Rr.w,0,gR-Rr.x-Rr.w,Hc);
}

/* ---------- mavi ışık ---------- */
const glow=$('#glow'),gi=glow.querySelector('i');
let gx=0,gy=0,gtx=0,gty=0,gInit=false,lastC=null;
function glowTarget(){const r=page.getBoundingClientRect();gtx=lastC[0]-r.left;gty=lastC[1]-r.top;if(!gInit){gx=gtx;gy=gty;gInit=true}}
let gIn=false;
addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;lastC=[e.clientX,e.clientY];glowTarget()},{passive:true});
function glowOn(e){if(e.pointerType==='touch'||noHover)return;lastC=[e.clientX,e.clientY];glowTarget();if(!gIn){gx=gtx;gy=gty}gIn=true;glow.classList.toggle('on',!!V['gl.show'])}
function glowOff(){gIn=false;glow.classList.remove('on')}
$('#vhit').addEventListener('pointerenter',glowOn);
$('#vhit').addEventListener('pointerleave',glowOff);
site.addEventListener('scroll',()=>{if(lastC)glowTarget()},{passive:true});
function smooth(x){const t=clamp(x,0,1);return t*t*(3-2*t)}
function applyGlow(){
  const c=(view==='works'?V['wk.glc']:V['gl.c']),I=V['gl.int'],mp=V['gl.midpos']/100,mo=V['gl.mid'];
  const col=a=>`color-mix(in srgb, ${c} ${Math.round(a*I*1000)/10}%, transparent)`;
  /* SVG'deki radialGradient: 0 → tam, midpos → mid opaklık, 100% → 0 */
  gi.style.background=`radial-gradient(ellipse closest-side at 50% 50%, ${col(1)} 0%, ${col(mo)} ${(mp*100).toFixed(2)}%, ${col(0)} 100%)`;
  gi.style.mixBlendMode=V['gl.blend'];
  glow.style.setProperty('--gl-in',V['gl.fin']+'s');glow.style.setProperty('--gl-out',V['gl.fout']+'s');
  if(!V['gl.show'])glow.classList.remove('on');else if(gIn)glow.classList.add('on');
}
let siteW=0,glW=0,glH=0;
function moveGlow(){
  if(gIn&&document.body.classList.contains('fsopen'))glowOff();
  if(!gIn)return;
  const sw=siteW||(siteW=site.clientWidth),gw=V['gl.w']/100*sw,gh=V['gl.h']/100*sw,f=V['gl.follow'];
  const k=f<=0?1:.03+.37*Math.pow(1-f,2);
  gx+=(gtx-gx)*k;gy+=(gty-gy)*k;
  if(gw!==glW||gh!==glH){glW=gw;glH=gh;gi.style.width=gw+'px';gi.style.height=gh+'px'}gi.style.transform=`translate(${gx-gw/2}px,${gy-gh/2}px)`;
}

/* ---------- Vimeo katmanı ----------
   Canvas, başka alan adındaki bir iframe'i çizemez. Bu yüzden Vimeo slaytlarında:
   geçiş sırasında kapak görseli canvas'ta kayar/bükülür; slayt yerine oturunca resmi Vimeo
   oynatıcısı (iframe) üstüne yumuşakça belirir, ayrılırken söner ve kaldırılır. */
const vw=$('#vwrap');let vf=null,vready=false,vshown=null,vkey='',vsig='',vpl=null,vplaying=false,vended=false;
const vkeyOf=s=>[s.vm.id,s.vm.hash,HK.muted?1:0,HK.loop?1:0].join('|');
function vsrc(s){
  const p=new URLSearchParams({autoplay:'1',muted:HK.muted?'1':'0',loop:HK.loop?'1':'0',controls:'0',title:'0',byline:'0',portrait:'0',dnt:'1',playsinline:'1'});
  if(s.vm.hash)p.set('h',s.vm.hash);return'https://player.vimeo.com/video/'+s.vm.id+'?'+p}
function killVf(){if(vf){vf.remove();vf=null}vTry=0;vready=false;vkey='';vsig='';vpl=null;vplaying=false;vended=false}
/* Vimeo'yu sessiz başlat; engellenirse sessize alıp yeniden dene */
/* Oynatıcı zaten oynuyorsa (olay kaçmış olsa bile) durumu düzelt ve iframe'i göster */
function vchk(pl,f,show){try{pl.getPaused().then(p=>{if(vpl===pl&&vf===f&&!p&&!vplaying){vplaying=true;vended=false;show()}}).catch(()=>{})}catch(e){}}
/* Vimeo otomatik başlamazsa nedeni ekranda söyle (sessizce takılı kalmasın) */
let vwhyT=0,vShow=null;
function vimeoWhy(name,msg){
  const n=String(name||''),t={
    PrivacyError:'Vimeo bu videonun bu adreste (yerel dosya / alan adı) gömülmesine izin vermiyor. Vimeo’da videonun Gizlilik → “Nerede gömülebilir” ayarını kontrol edin.',
    NotFoundError:'Vimeo videosu bulunamadı ya da bağlantı hatalı.',
    NotAllowedError:'Tarayıcı otomatik oynatmayı engelledi. Sayfada bir yere tıklayınca başlar.',
    NotSupportedError:'Bu tarayıcı Vimeo videosunu bu şekilde oynatamıyor.'}[n]||('Vimeo videosu başlatılamadı'+(n?' ('+n+')':'')+'.');
  if(performance.now()-vwhyT<8000)return;vwhyT=performance.now();console.warn('[Hokus] Vimeo:',n,msg);toast(t)}
let vTry=0;
function vkick(){if(!vpl||!S.auto||fsOpen||anim||vended)return;const p=vpl;
  try{p.getPaused().then(ps=>{if(!ps){vplaying=true;vended=false;vShow&&vShow()}}).catch(()=>{});p.play().catch(e=>{p.setMuted(true).then(()=>p.play()).catch(e2=>{if(++vTry>=3)vimeoWhy((e2&&e2.name)||(e&&e.name),e2&&e2.message)})})}catch(e){}}
/* tarayıcı otomatik oynatmayı engellediyse, ilk tıklama / tuş / dokunuşta Vimeo hemen başlatılır (kullanıcı hareketi içinde) */
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>{vTry=0;if(vpl&&!vplaying)vkick()},{passive:true,capture:true}));
function sdk(cb){
  if(window.Vimeo){cb();return}
  if(sdk.q){sdk.q.push(cb);return}
  sdk.q=[cb];const sc=document.createElement('script');sc.src='https://player.vimeo.com/api/player.js';
  sc.onload=()=>{const q=sdk.q;sdk.q=null;q.forEach(f=>f())};sc.onerror=()=>{sdk.q=null;sc.remove()};document.head.append(sc)}
function sizeVf(s){
  if(!vf)return;const cw=vw.clientWidth,ch=vw.clientHeight;if(!cw||!ch)return;
  const ar=(s&&s.ar)||16/9,cover=HK.fit==='cover',sig=[cw,ch,ar,HK.fit,HK.fx,HK.fy].join('|');if(sig===vsig)return;vsig=sig;
  let W,H;if((cw/ch>ar)===cover){W=cw;H=cw/ar}else{H=ch;W=ch*ar}
  Object.assign(vf.style,{width:W+'px',height:H+'px',left:(cw-W)*HK.fx+'px',top:(ch-H)*HK.fy+'px'})}
function syncVimeo(){
  const s=slides[cur],idle=!anim&&!fsOpen&&Math.abs(pos-cur)<.001,want=(s&&s.vm&&idle)?s:null;
  if(want){
    const key=vkeyOf(want);
    if(vshown!==want||vkey!==key){
      killVf();vshown=want;vkey=key;
      const f=vf=document.createElement('iframe');
      f.title='Vimeo video';f.allow='autoplay; fullscreen; picture-in-picture';f.referrerPolicy='strict-origin-when-cross-origin';f.setAttribute('allowfullscreen','');
      let shown=false;const show=()=>{if(vf!==f||shown)return;shown=true;vw.classList.add('on')};vShow=show;
      f.addEventListener('load',()=>{
        if(vf!==f)return;vready=true;setTimeout(()=>show(),3500);
        sdk(()=>{if(vf!==f)return;try{const pl=new Vimeo.Player(f);vpl=pl;pl.on('playing',()=>{vplaying=true;vended=false;show()});pl.on('play',()=>vchk(pl,f,show));pl.on('timeupdate',()=>{if(!vplaying)vchk(pl,f,show)});setTimeout(()=>vchk(pl,f,show),250);setTimeout(()=>vchk(pl,f,show),1200);pl.on('pause',()=>{vplaying=false});pl.on('error',e=>vimeoWhy(e&&e.name,e&&e.message));pl.on('ended',()=>{vplaying=false;vended=true;if(S.auto&&vf===f&&slides[cur]===want&&!anim)next()});if(HK.muted)pl.setMuted(true).catch(()=>{});setTimeout(()=>{if(vpl===pl&&!vplaying)vkick()},400)}catch(e){}})});
      f.src=vsrc(want);vw.append(f);
    }
  }else if(vshown){
    vshown=null;vw.classList.remove('on');const f=vf;setTimeout(()=>{if(vf===f&&!vshown)killVf()},350)}
  if(vf)sizeVf(vshown||want)}

/* =====================================================================
   PLAY → DONDURMA PATLAMASI + TAM EKRAN VİDEO
   ===================================================================== */
const ICE='assets/img/ice.png';
const bc=$('#burst'),bx=bc.getContext('2d'),bImg=new Image();bImg.src=ICE;
let parts=[],bOn=false,bW=1,bH=1,bDpr=1,fsOpen=false,fsBusy=false,fsP=null,fsTimers=[];
const fsEl=$('#fs'),fsClip=$('#fsclip'),fsV=$('#fsv'),fsPoster=$('#fsp'),fsBar=$('#fsBar'),fsFill=fsBar.querySelector('i');

function burstStart(cx,cy){
  const pr=page.getBoundingClientRect();bDpr=Math.min(devicePixelRatio||1,2);
  bW=site.clientWidth;bH=site.clientHeight;bc.width=Math.round(bW*bDpr);bc.height=Math.round(bH*bDpr);
  const ox=cx-pr.left,oy=cy-pr.top,u=bW/100,now=performance.now(),emit=V['bu.emit']*1000,ar=(bImg.naturalHeight/bImg.naturalWidth)||2.2;
  parts=[];
  for(let i=0;i<V['bu.n'];i++){
    const a=(V['bu.dir']+(Math.random()-.5)*V['bu.spread'])*Math.PI/180,sp=(.45+.55*Math.random())*V['bu.speed']*u,hgt=(V['bu.min']+Math.random()*(V['bu.max']-V['bu.min']))*u;
    parts.push({t0:now+Math.random()*emit,x:ox+(Math.random()-.5)*u*.6,y:oy+(Math.random()-.5)*u*.6,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
      rot:Math.random()*Math.PI*2,vr:(Math.random()<.5?-1:1)*(.3+.7*Math.random())*V['bu.spin']*Math.PI/180,h:hgt,w:hgt/ar,life:V['bu.life']*(.75+.5*Math.random())*1000,last:0,born:false})}
  bOn=true;
}
function burstStep(now){
  if(!bOn)return;
  const u=bW/100,g=V['bu.g']*u,fade=V['bu.fade']*1000;let alive=0;
  bx.setTransform(bDpr,0,0,bDpr,0,0);bx.clearRect(0,0,bW,bH);
  for(const p of parts){
    if(now<p.t0){alive++;continue}
    if(!p.born){p.born=true;p.last=now}
    const age=now-p.t0;if(age>p.life)continue;alive++;
    const dt=Math.min(.05,(now-p.last)/1000);p.last=now;
    const k=Math.max(0,1-V['bu.drag']*dt);p.vx*=k;p.vy=p.vy*k+g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    const sc=Math.min(1,age/140),al=Math.min(1,(p.life-age)/fade);
    bx.save();bx.globalAlpha=Math.max(0,al);bx.translate(p.x,p.y);bx.rotate(p.rot);bx.scale(sc,sc);
    bx.drawImage(bImg,-p.w/2,-p.h/2,p.w,p.h);bx.restore();
  }
  if(!alive){bOn=false;bx.clearRect(0,0,bW,bH)}
}

function fsLayout(){
  syncAll();
  page.style.setProperty('--fsH',site.clientHeight+'px');
  const bs=Math.max(20,V['fs.bs']/100*site.clientWidth);page.style.setProperty('--fs-bs',bs+'px');page.style.setProperty('--fs-bh',Math.max(8,V['fs.bh']/100*site.clientWidth)+'px');
  if(fsOpen){const s=slides[cur];if(s)fsFrame(s);fsContact(true)}
}
new ResizeObserver(()=>{siteW=site.clientWidth;invalidateMetrics();syncGaps();fsLayout();document.querySelectorAll('.wc').forEach(c=>{c._key=null})}).observe(site);
function fsContact(on){
  const ct=(items.find(i=>i.grp==='below')||{}).el;   // videonun altındaki yatay yazı (SEARCH) tam ekranda kontrol çubuğuyla hizalanırif(!ct)return;
  if(!on){site.style.setProperty('--fs-ct','0px');return}
  const tr=ct.style.transition;ct.style.transition='none';site.style.setProperty('--fs-ct','0px');
  const r=ct.getBoundingClientRect(),sr=site.getBoundingClientRect();
  const center=r.top+r.height/2-sr.top,bs=Math.max(20,V['fs.bs']/100*site.clientWidth),target=site.clientHeight-V['fs.b']/100*site.clientWidth-bs/2;
  site.style.setProperty('--fs-ct',(target-center)+'px');void ct.offsetWidth;ct.style.transition=tr;
}
/* videonun tam ekrandaki "cover" ölçüsü */
function coverBox(W,H,ar){return(W/H>ar)?{w:W,h:W/ar}:{w:H*ar,h:H}}
function fsFrame(s){
  const f=fsV.querySelector('iframe');if(!f)return;
  const b=coverBox(site.clientWidth,site.clientHeight,s.ar||16/9);
  Object.assign(f.style,{width:b.w+'px',height:b.h+'px',left:(site.clientWidth-b.w)/2+'px',top:(site.clientHeight-b.h)/2+'px'})}
function vrect(){const sr=site.getBoundingClientRect(),r=$('#vhit').getBoundingClientRect();return{x:r.left-sr.left,y:r.top-sr.top,w:r.width,h:r.height,W:sr.width,H:sr.height}}
function fsSmall(R,ar){
  fsClip.style.clipPath=`inset(${R.y}px ${R.W-R.x-R.w}px ${R.H-R.y-R.h}px ${R.x}px)`;
  const a=coverBox(R.W,R.H,ar),b=coverBox(R.w,R.h,ar),sc=b.w/a.w;
  fsV.style.transform=`translate(${R.x+R.w/2-R.W/2}px,${R.y+R.h/2-R.H/2}px) scale(${sc})`}
const setBar=p=>{fsFill.style.width=(clamp(p,0,1)*100)+'%'};

/* Oynatıcı: Vimeo (resmi player.js) ya da .mp4/.webm — ikisi de aynı küçük arayüz */
function fsMake(s){
  fsV.querySelectorAll('iframe,video').forEach(e=>e.remove());
  const api={ready:false,want:false,playing:false,ended:false,play(){},pause(){},seek(){},destroy(){fsV.querySelectorAll('iframe,video').forEach(e=>e.remove())}};
  if(s.vm){
    const p=new URLSearchParams({autoplay:'0',muted:V['fs.muted']?'1':'0',loop:'0',controls:'0',title:'0',byline:'0',portrait:'0',dnt:'1',playsinline:'1'});if(s.vm.hash)p.set('h',s.vm.hash);
    const f=document.createElement('iframe');f.title='Vimeo video';f.allow='autoplay; fullscreen; picture-in-picture';f.referrerPolicy='strict-origin-when-cross-origin';
    let pl=null,shown=false;const show=()=>{if(!shown){shown=true;f.classList.add('rdy')}};
    api.play=()=>{api.want=true;if(!pl||!api.ready)return;
      const go=()=>pl.play().catch(()=>pl.setMuted(true).then(()=>pl.play()).catch(()=>{}));
      if(api.ended){api.ended=false;pl.setCurrentTime(0).then(go).catch(go)}else go();setTimeout(show,3000)};
    api.pause=()=>{api.want=false;if(pl)pl.pause().catch(()=>{})};
    api.seek=pct=>{if(pl)pl.getDuration().then(d=>{api.ended=false;pl.setCurrentTime(d*pct)}).catch(()=>{})};
    f.addEventListener('load',()=>sdk(()=>{try{
      pl=new Vimeo.Player(f);
      pl.on('timeupdate',d=>setBar(d.percent));
      pl.on('playing',()=>{api.playing=true;show()});pl.on('play',()=>{api.playing=true});pl.on('pause',()=>{api.playing=false});
      pl.on('ended',()=>{api.playing=false;api.ended=true;setBar(1)});
      pl.ready().then(()=>{api.ready=true;if(api.want)api.play()});
    }catch(e){}}));
    f.src='https://player.vimeo.com/video/'+s.vm.id+'?'+p;fsV.append(f);fsFrame(s);
  }else{
    const src=s.vid?s.vid.currentSrc||s.vid.src:s.url;if(!src)return api;
    const v=document.createElement('video');v.playsInline=true;v.muted=!!V['fs.muted'];v.src=src;v.preload='auto';fsV.append(v);
    v.addEventListener('timeupdate',()=>setBar(v.duration?v.currentTime/v.duration:0));
    v.addEventListener('playing',()=>{api.playing=true;v.classList.add('rdy')});v.addEventListener('pause',()=>{api.playing=false});
    v.addEventListener('ended',()=>{api.playing=false;api.ended=true;setBar(1)});
    api.ready=true;
    api.play=()=>{api.want=true;if(api.ended){api.ended=false;v.currentTime=0}v.play().catch(()=>{v.muted=true;v.play().catch(()=>{})})};
    api.pause=()=>{api.want=false;v.pause()};api.seek=pct=>{if(v.duration){api.ended=false;v.currentTime=v.duration*pct}};
  }
  return api}

function openFs(cx,cy){
  const s=slides[cur];if(fsOpen||fsBusy||anim||!s||!s.fsx)return;
  fsOpen=fsBusy=true;site.scrollTop=0;cuEl.classList.remove('play');
  fsLayout();burstStart(cx,cy);setBar(0);
  const im=s.pimg?s.pimg.src:(s.poster||'');fsPoster.style.backgroundImage=im?`url("${im}")`:'none';
  fsEl.style.setProperty('--fsdur',V['fs.dur']+'s');page.style.setProperty('--fsdur',V['fs.dur']+'s');site.style.setProperty('--fsdur',V['fs.dur']+'s');
  fsP=fsMake(s);
  fsTimers.push(setTimeout(()=>{
    const R=vrect();
    fsClip.style.transition=fsV.style.transition='none';fsSmall(R,s.ar||16/9);
    document.body.classList.add('fsopen');void fsClip.offsetWidth;
    fsClip.style.transition=fsV.style.transition='';
    fsClip.style.clipPath='inset(0px 0px 0px 0px)';fsV.style.transform='translate(0px,0px) scale(1)';
    fsEl.classList.add('open');$('#fsc').classList.add('open');fsContact(true);fsP.play();
    fsTimers.push(setTimeout(()=>{fsBusy=false},V['fs.dur']*1000));
  },V['fs.delay']*1000));
}
function closeFs(){
  if(!fsOpen||fsBusy)return;fsBusy=true;
  const s=slides[cur],R=vrect();
  fsEl.classList.remove('open');$('#fsc').classList.remove('open');fsContact(false);
  fsClip.style.transition=fsV.style.transition='';fsSmall(R,(s&&s.ar)||16/9);
  fsTimers.push(setTimeout(()=>{
    if(fsP){fsP.pause();fsP.destroy();fsP=null}
    document.body.classList.remove('fsopen');fsClip.style.clipPath='';fsV.style.transform='';
    fsOpen=fsBusy=false;holdT=performance.now();
  },V['fs.dur']*1000+60));
}
$('#fsClose').onclick=closeFs;
$('#fsPlay').onclick=()=>{if(!fsP)return;if(fsP.playing)fsP.pause();else fsP.play()};
fsBar.addEventListener('click',e=>{if(!fsP)return;const r=fsBar.getBoundingClientRect(),pct=clamp((e.clientX-r.left)/r.width,0,1);setBar(pct);fsP.seek(pct)});
$('#vhit').addEventListener('click',e=>{if(e.button!==0||Math.abs(lastDx)>8)return;openFs(e.clientX,e.clientY)});

/* ---------- ana döngü ---------- */
function tick(now){
  /* Works sayfasındayken slider/Vimeo çalışmaz; yalnızca ortak katmanlar (imleç, patlama) döner */
  if(!homeShown){burstStep(now);moveGlow();requestAnimationFrame(tick);return}
  let bell=0;
  if(anim){
    const p=clamp((now-anim.t0)/anim.dur,0,1);
    pos=anim.from+(anim.to-anim.from)*ease(p);bell=Math.pow(Math.sin(Math.PI*p),1.15);
    if(p>=.5&&!swapped){swapped=true;cur=mod(anim.to,slides.length);setLabel(cur)}
    if(p>=1){const n=slides.length;pos=mod(anim.to,n);cur=Math.round(pos);anim=null;holdT=now;playOnly(cur);setLabel(cur)}
  }else{
    const s=slides[cur];let isV=false,hold=S.hold*1000;if(fsOpen)holdT=now;
    if(s&&s.vm){isV=!!(vready&&vshown===s);hold=15000}   /* Vimeo yüklenemezse 15 sn sonra geç */
    else isV=!!(s&&s.vid&&s.vid.readyState>=2&&!s.vid.error);
    if(!isV&&S.auto&&slides.length>1&&(now-holdT)>=hold)next();
  }
  render(now,bell);syncVimeo();watchdog(now);burstStep(now);moveGlow();requestAnimationFrame(tick);
}

/* Bekçi: ana sayfada donuk video kalmasın. Güncel slayt duruyorsa oynatılır, diğerleri durdurulur. */
let wdT=0;
function watchdog(now){
  if(now-wdT<800)return;wdT=now;
  if(!S.auto||fsOpen||anim)return;
  slides.forEach((s,k)=>{const v=s.vid;if(!v)return;
    if(k===cur){if(v.paused&&!v.ended&&v.readyState>=2)v.play().catch(()=>{v.muted=true;v.play().catch(()=>{})})}
    else if(!v.paused)v.pause()});
  if(vpl&&!vplaying)vkick()}
addEventListener('pointerdown',()=>{wdT=0},{passive:true,capture:true});

/* ---------- video ekleme ---------- */
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),3200)}
function attach(s,src){
  if(s.vid){s.vid.pause();s.vid.removeAttribute('src');s.vid.load()}
  /* crossOrigin KASITLI olarak yok: video yalnızca canvas'a çizilir, pikselleri geri okunmaz.
     Böylece CORS başlığı göndermeyen sunuculardaki .mp4 adresleri de oynar. */
  const v=document.createElement('video');v.muted=HK.muted;v.loop=HK.loop;v.playsInline=true;v.preload='auto';v.src=src;
  v.addEventListener('ended',()=>{if(S.auto&&slides[cur]===s&&!anim)next()});
  v.addEventListener('error',()=>{toast('Video yüklenemedi. Doğrudan .mp4/.webm dosya adresi olmalı (sayfa linki değil). Vimeo için vimeo.com/… linkini kullanın.');if(s.vid===v)s.vid=null});
  v.addEventListener('loadeddata',()=>{if(S.auto&&homeShown&&slides[cur]===s&&!anim)v.play().catch(()=>{v.muted=true;v.play().catch(()=>{})})});
  s.vid=v;
}
$('#next').onclick=next;$('#prev').onclick=prev;
addEventListener('keydown',e=>{
  if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
  if(e.key==='Escape'){closeFs();closeSub()}
  if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')prev();
  if(/^[sSeE]$/.test(e.key)&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!clientMode){V['ui.open']=!V['ui.open'];apply()}});
cv.addEventListener('click',e=>{const x=e.clientX-cv.getBoundingClientRect().left;if(x<Rr.x-pad)prev();else if(x>Rr.x+Rr.w+pad)next()});
cv.addEventListener('mousemove',e=>{const x=e.clientX-cv.getBoundingClientRect().left;cv.style.cursor=(x<Rr.x-pad||x>Rr.x+Rr.w+pad)?'pointer':''});
let sx0=null,lastDx=0;$('#stage').addEventListener('pointerdown',e=>sx0=e.clientX);
addEventListener('pointerup',e=>{if(sx0===null)return;const dx=e.clientX-sx0;sx0=null;lastDx=dx;if(!fsOpen&&Math.abs(dx)>60)dx<0?next():prev()});

/* =====================================================================
   UYGULA + KAYDET
   ===================================================================== */
let saveT=null;
/* Kayıt iki katmanlı: 1) "hafif" yedek (ayarlar + proje bilgileri + görsel YOLLARI; gömülü görsel verisi yok → çok küçük, dolmaz)
   2) tam kayıt (yüklenen görseller dahil). Tam kayıt hafızaya sığmazsa bile proje bilgileri ve ayarlar hafif yedekten geri gelir. */
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{if(clientMode)return;
  const sl=slides.map(s=>({cap:s.cap,url:s.url||null,poster:s.poster||'',fsx:!!s.fsx}));
  const lite={V,slides:sl,works:works.map(w=>({img:(w.img||'').startsWith('data:')?'':w.img,info:w.info})),ts:Date.now(),ver:VER};
  try{localStorage.setItem(KEY+'-lite',JSON.stringify(lite))}catch(e){}
  try{localStorage.setItem(KEY,JSON.stringify({V,slides:sl,works:works.map(w=>({img:w.img,info:w.info})),ts:lite.ts,ver:VER}))}
  catch(e){if(!save.warned){save.warned=true;toast('Tarayıcı hafızası doldu: yüklediğin görseller kalıcı saklanamıyor (proje bilgileri ve ayarlar saklanıyor). “HTML indir” ile kaydet.')}}},300)}
/* Mavi ışık şekli: çıkış noktası (O deliği) sabit. Noktanın üstündeki her nokta yukarı doğru up kat uzar,
   yatay açıklık yükseklikle doğrusal artar (pivotta 1×, tepede sp×) → koni / tepeye doğru yayılan füzyon. Gradient de aynı oranda uzar. */
const olPath=$('#olP'),olGrad=$('#olG'),OL_D0=olPath.getAttribute('d'),OL_CX=157.98,OL_CY=215.1,OL_TOP=0,OL_Y2=olGrad.getAttribute('y2');let olSig='';
function olShape(){
  const up=+V['ol.up']||1,sp=+V['ol.sp']||1,sg=up+'|'+sp;if(sg===olSig)return;olSig=sg;
  if(up===1&&sp===1){olPath.setAttribute('d',OL_D0);olGrad.setAttribute('y2',OL_Y2);return}
  const H=OL_CY-OL_TOP,m=(x,y)=>{if(y>=OL_CY)return[x,y];const h=OL_CY-y;return[OL_CX+(x-OL_CX)*(1+(sp-1)*h/H),OL_CY-h*up]};
  const t=OL_D0.match(/[A-Za-z]|-?[\d.]+/g);let o='',i=0,cx=0,cy=0;const num=()=>parseFloat(t[i++]),f=n=>(+n.toFixed(3));
  while(i<t.length){const c=t[i++];
    if(c==='M'||c==='L'){const[x,y]=m(num(),num());o+=c+f(x)+' '+f(y);}
    else if(c==='C'){for(let k=0;k<3;k++){const[x,y]=m(num(),num());o+=(k?' ':'C')+f(x)+' '+f(y)}}
    else if(c==='V'){const y=num();/* dikey çizgi, koni altında eğik olabilir → L */const px=curX;const[x,yy]=m(px,y);o+='L'+f(x)+' '+f(yy)}
    else if(c==='Z')o+='Z';
    if(c==='M'||c==='L'){curX=parseFloat(t[i-2])}else if(c==='C'){curX=parseFloat(t[i-2])}
  }
  olPath.setAttribute('d',o);olGrad.setAttribute('y2',(OL_CY-(OL_CY-parseFloat(OL_Y2))*up).toFixed(3));
}
let curX=0;
function apply(){
  for(const k in defs){const d=defs[k];if(d.t==='text')continue;let v=V[k];if(d.t==='range')v=v+d.u;else if(d.t==='check')v=v?1:0;site.style.setProperty(k2v(k),v)}
  site.style.setProperty('--v-font',`"${V.font}",Helvetica,Arial,sans-serif`);
  site.style.setProperty('--v-tm-font',`"${V['tm.font']}",Helvetica,Arial,sans-serif`);
  site.style.setProperty('--v-wk-ifont',`"${V['wk.ifont']}",Helvetica,Arial,sans-serif`);
  wsub.classList.toggle('al-c',V['wk.sal']==='center');wsub.classList.toggle('al-r',V['wk.sal']==='right');
  document.querySelectorAll('.wi').forEach(e=>{e.classList.toggle('up',!!V['wk.iup']);e.classList.toggle('far',V['wk.iarr']==='edge')});
  items.forEach(applyItem);invalidateMetrics();syncGaps();applyToggle();applyMoods();olShape();
  const lg=$('#logo');lg.setAttribute('href',V['lg.href']||'#');
  $('#ctl').style.display=V['ct.show']?'':'none';
  Object.assign(S,{auto:V['tr.auto'],dur:V['tr.dur'],def:V['tr.def'],slide:V['tr.slide'],hold:V['tr.hold']});
  Object.assign(HK,{fit:V['tr.fit'],fx:V['tr.fx']/100,fy:V['tr.fy']/100,muted:V['tr.muted'],loop:V['tr.loop']});
  slides.forEach(s=>{if(s.vid){s.vid.muted=HK.muted;s.vid.loop=HK.loop}});
  document.body.classList.toggle('closed',!V['ui.open']);
  document.body.classList.toggle('cu',!!V['cu.show']&&!noHover);
  cuEl.style.setProperty('--cu-c',V['cu.c']+'px');cuEl.style.setProperty('--cu-p',V['cu.p']+'px');cuEl.style.setProperty('--cu-x',V['cu.x']+'px');cuEl.style.setProperty('--cu-xr',V['cu.xr']);
  if(!V['cu.show'])cuEl.classList.remove('on');
  const gw=$('#giantwrap'),oh=$('#ohit');
  gw.classList.toggle('pin',!!V['ol.pin']&&!clientMode);gw.classList.toggle('off',!V['ol.show']);
  oh.setAttribute('rx',116*V['ol.hit']);oh.setAttribute('ry',58.6*V['ol.hit']);
  applyGlow();setCaption();layout();syncAll();save();
}

/* =====================================================================
   PANEL
   ===================================================================== */
const syncs=[];const syncAll=()=>syncs.forEach(f=>f());
const setV=(k,v)=>{V[k]=v;apply()};
const pxOf=k=>Math.max(11,(+V[k]||0)/100*site.clientWidth);   /* gerçekte uygulanan px (min 11px) */
const fmtPt=v=>(Math.round(v*100)/100).toString().replace('.',',');
function field(f){
  if(f.t==='group'){const d=h('details','g');d.append(h('summary',null,f.l));const b=h('div','gb');f.fields.forEach(x=>b.append(field(x)));d.append(b);return d}
  if(f.t==='btn'){const b=h('button','b',f.l);b.onclick=f.fn;return b}
  if(f.t==='note')return document.createDocumentFragment();
  const wr=h('div','f'),lab=h('label'),sp=h('span',null,f.l);lab.append(sp);wr.append(lab);
  if(f.t==='range'){const r=h('input'),n=h('input','n'),box=h('span','r');r.type='range';n.type='number';
    [r,n].forEach(e=>{e.min=f.min;e.max=f.max;e.step=f.step;e.oninput=()=>{if(e.value==='')return;r.value=n.value=e.value;setV(f.k,+e.value)}});
    box.append(n);if(f.u)box.append(h('span','u',f.u));
    let pt=null;if(f.pt){pt=h('span','pt');box.append(pt)}
    lab.append(box);wr.append(r);
    syncs.push(()=>{if(document.activeElement!==n){r.value=n.value=V[f.k]}
      if(pt){if(f.pt==='size')pt.textContent='≈ '+fmtPt(pxOf(f.k)*.75)+' pt';else pt.textContent='≈ '+fmtPt((+V[f.k]||0)*pxOf(f.pt.k)*.75)+' pt'}})}
  else if(f.t==='color'){const i=h('input');i.type='color';i.oninput=()=>setV(f.k,i.value);lab.append(i);syncs.push(()=>i.value=V[f.k])}
  else if(f.t==='check'){const i=h('input');i.type='checkbox';i.onchange=()=>setV(f.k,i.checked);lab.append(i);syncs.push(()=>i.checked=!!V[f.k])}
  else if(f.t==='text'){const i=h('input');i.type='text';i.oninput=()=>setV(f.k,i.value);wr.append(i);syncs.push(()=>{if(document.activeElement!==i)i.value=V[f.k]})}
  else{const s=h('select');f.o.forEach(([v,l])=>s.add(new Option(l,v)));s.onchange=()=>setV(f.k,s.value);wr.append(s);syncs.push(()=>s.value=V[f.k])}
  return wr}
function pick(acc,multi,cb){const i=document.createElement('input');i.type='file';i.accept=acc;i.multiple=!!multi;i.onchange=()=>[...i.files].forEach(cb);i.click()}
const isVid=f=>/\.(mp4|webm)$/i.test(f.name)||/^video\/(mp4|webm)$/.test(f.type);
function useFile(s,f){const url=URL.createObjectURL(f);clearMedia(s);s.url=null;s.name=f.name;attach(s,url)}
const srcLabel=s=>s.vm?'Vimeo · '+s.vm.id+(s.vm.hash?' · gizli bağlantı':''):(s.name||s.url||'Yer tutucu');
function renderVids(){
  const L=$('#vlist');if(!L)return;L.innerHTML='';
  slides.forEach((s,i)=>{
    const d=h('div','vi'+(i===cur?' on':'')),vh=h('div','vh');
    vh.append(h('b',null,String(i+1)),h('span',null,srcLabel(s)));
    const ci=h('input');ci.value=s.cap;ci.placeholder='Altyazı (örn. TAT · HAZIR TABAKLAR · FERİT KATİPOĞLU)';
    ci.oninput=()=>{s.cap=ci.value;if(i===cur)setCaption();save()};
    const si=h('input');si.value=s.url||'';si.placeholder='Kaynak: Vimeo linki, embed kodu veya .mp4 URL’si';
    si.onchange=()=>{const v=si.value.trim();if(v===(s.url||''))return;if(setSource(s,v)){renderVids();save()}};
    d.append(vh,ci,si);
    if(s.vm){
      const pi=h('input');pi.value=s.poster||'';pi.placeholder='Kapak görseli URL’si (boş bırakırsan Vimeo’dan otomatik gelir)';
      pi.onchange=()=>{s.poster=pi.value.trim();s.pimg=null;s.pdrawn=false;loadPoster(s);save()};
      d.append(pi);
    }
    const fl=h('label','note'),cb=h('input');cb.type='checkbox';cb.checked=!!s.fsx;cb.style.cssText='width:auto;margin:0 6px 0 0;vertical-align:middle';cb.onchange=()=>{s.fsx=cb.checked;save()};
    fl.append(cb,document.createTextNode('Play’e tıklayınca dondurma patlaması + tam ekran'));d.append(fl);
    const vb=h('div','vb'),B=(t,fn)=>{const b=h('button',null,t);b.onclick=fn;vb.append(b)};
    B('Önizle',()=>go(Math.round(pos)+(i-cur)));
    B('↑',()=>{moveSlide(i,-1);renderVids()});B('↓',()=>{moveSlide(i,1);renderVids()});
    B('Dosya…',()=>pick('video/mp4,video/webm,.mp4,.webm',false,f=>{if(!isVid(f)){toast('MP4 veya WebM seçin.');return}useFile(s,f);renderVids()}));
    B('Yer tutucu',()=>{clearMedia(s);s.url=null;s.name='';renderVids();save()});
    B('Sil',()=>{removeSlide(i);renderVids()});
    d.append(vb);L.append(d)})}
function moveSlide(i,d){const j=i+d;if(anim||j<0||j>=slides.length)return;const c=slides[cur];[slides[i],slides[j]]=[slides[j],slides[i]];cur=slides.indexOf(c);pos=cur;setLabel(cur);save()}
function removeSlide(i){if(anim)return;if(slides.length<2){toast('En az bir slayt kalmalı.');return}const c=slides[cur];if(slides[i].vid)slides[i].vid.pause();slides.splice(i,1);cur=slides.includes(c)?slides.indexOf(c):Math.min(i,slides.length-1);pos=cur;setLabel(cur);playOnly(cur);save()}
function buildUI(){
  const body=$('#edBody');body.innerHTML='';
  SEC.forEach(sec=>{
    const d=h('details','s');d.append(h('summary',null,sec.t));const b=h('div','sb');d.append(b);
    if(sec.vids){
      const L=h('div');L.id='vlist';b.append(L);
      const ni=h('input');ni.placeholder='Vimeo linki, embed kodu veya .mp4 URL’si yapıştır';
      const u=h('button','b','Slayt olarak ekle'),a=h('button','b','Video dosyası ekle (MP4 / WebM, yerel önizleme)'),e=h('button','b','Boş slayt ekle');
      u.onclick=()=>{const r=classify(ni.value);if(r.t==='none'||r.t==='err'){toast(r.m||'Bir Vimeo linki, embed kodu veya video adresi yapıştırın.');return}
        const s=newSlide('YENİ FİLM · YÖNETMEN ADI');setSource(s,ni.value);ni.value='';setLabel(cur);renderVids();save()};
      ni.onkeydown=ev=>{if(ev.key==='Enter')u.click()};
      a.onclick=()=>pick('video/mp4,video/webm,.mp4,.webm',true,f=>{if(!isVid(f)){toast('MP4 veya WebM seçin.');return}const s=newSlide(f.name.replace(/\.[^.]+$/,'').toUpperCase());useFile(s,f);setLabel(cur);renderVids();save()});
      e.onclick=()=>{newSlide('YENİ FİLM · YÖNETMEN ADI');setLabel(cur);renderVids();save()};
      b.append(ni,u,a,e);
    }
    if(sec.wks){
      const L=h('div');L.id='wlist';b.append(L);
      const m=h('button','b','Görselleri ekle (çoklu seçim)'),e=h('button','b','Boş pencere ekle');
      m.onclick=()=>pick('image/*',true,f=>addWorkFile(f));
      e.onclick=()=>{works.push({img:'',info:''});buildWorks();renderWorks();save()};
      b.append(m,e);
    }
    sec.f.forEach(x=>b.append(field(x)));
    const rs=h('button','b','Bu bölümü varsayılana döndür');
    rs.onclick=()=>{const ks=[];const col=f=>{if(f.k)ks.push(f.k);(f.fields||[]).forEach(col)};sec.f.forEach(col);ks.forEach(k=>V[k]=(EMB.V&&k in EMB.V)?EMB.V[k]:D[k]);apply()};
    b.append(rs);body.append(d)});
  const act=$('#edAct');act.innerHTML='';
  const A=(t,fn)=>{const b=h('button',null,t);b.onclick=fn;act.append(b)};
  A('HTML indir (düzenlenebilir)',()=>exportHTML(false));
  A('HTML indir (müşteri sürümü)',()=>exportHTML(true));
  A('JSON dışa aktar',()=>dl('hokus-ayarlar.json',JSON.stringify(stateObj(false),null,1),'application/json'));
  A('İçe aktar',()=>pick('.json,application/json',false,async f=>{try{const o=JSON.parse(await f.text());Object.assign(V,o.V||{});if(o.slides&&o.slides.length){slides.forEach(s=>s.vid&&s.vid.pause());slides.length=0;o.slides.forEach(x=>newSlide(x.cap,x.url,x.poster,x.fsx));cur=0;pos=0;setLabel(0)}if(o.works&&o.works.length){works.length=0;o.works.forEach(w=>works.push({img:w.img||'',info:w.info||''}));buildWorks()}apply();renderVids();renderWorks();toast('Ayarlar içe aktarıldı.')}catch(e){toast('JSON okunamadı.')}}));
  A('Varsayılana dön',()=>{if(!confirm('Tüm ayarlar varsayılana dönsün mü?'))return;Object.keys(V).forEach(k=>delete V[k]);Object.assign(V,D,EMB.V||{});slides.forEach(s=>s.vid&&s.vid.pause());slides.length=0;(EMB.slides&&EMB.slides.length?EMB.slides:DEF_SLIDES).forEach(x=>newSlide(x.cap,x.url,x.poster,x.fsx));cur=0;pos=0;setLabel(0);works.length=0;(worksInit0||DEF_WORKS).forEach(w=>works.push({img:w.img||'',info:w.info||''}));buildWorks();apply();renderVids();renderWorks()});
}
function dl(name,text,type){const a=h('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
function stateObj(client){return{V:Object.assign({},V,client?{'ui.open':false,'ol.pin':false}:{}),slides:slides.map(s=>({cap:s.cap,url:s.url||null,poster:s.poster||'',fsx:!!s.fsx})),works:works.map(w=>({img:w.img,info:w.info})),ts:Date.now(),ver:VER,client:!!client}}
function exportHTML(client){
  const st=JSON.stringify(stateObj(client)).replace(/</g,'\\u003c');
  const doc=document.documentElement.cloneNode(true);
  doc.querySelectorAll('[data-dyn]').forEach(e=>e.innerHTML='');
  const dv=doc.querySelector('#vwrap');dv.innerHTML='';dv.className='';
  doc.querySelectorAll('script[src*="vimeo.com"]').forEach(e=>e.remove());
  const dg=doc.querySelector('#giantwrap');dg.className='';
  const dfs=doc.querySelector('#fs');dfs.className='';dfs.removeAttribute('style');doc.querySelector('#fsc').className='';['#fsclip','#fsv'].forEach(q=>doc.querySelector(q).removeAttribute('style'));doc.querySelectorAll('#fsv iframe,#fsv video').forEach(e=>e.remove());doc.querySelector('#fsBar i').removeAttribute('style');
  const dpg=doc.querySelector('#page');dpg.removeAttribute('style');dpg.className='';dpg.removeAttribute('data-view');doc.querySelector('#homeView').className='vsec';doc.querySelector('#works').className='vsec off hide';
  const dc=doc.querySelector('#cur');dc.className='';dc.removeAttribute('style');
  doc.querySelectorAll('.fx span[data-scr]').forEach(e=>e.removeAttribute('data-scr'));
  doc.querySelector('#defaults').textContent=st;
  doc.querySelector('body').className='';
  dl(client?'hokus-onizleme-musteri.html':'hokus-onizleme.html','<!DOCTYPE html>\n'+doc.outerHTML,'text/html');
  if(slides.some(s=>s.name&&!s.url))toast('Not: dosyadan yüklenen videolar HTML’ye gömülmez, URL kullanın.');
  else toast(client?'Müşteri sürümü indirildi (panel gizli; ?edit ile açılır).':'Düzenlenebilir sürüm indirildi.');
}
$('#edX').onclick=()=>{V['ui.open']=false;apply()};
$('#edTab').onclick=()=>{V['ui.open']=true;apply()};

/* =====================================================================
   SAYFALAR: HOME ⇄ WORKS + WORKS ALT MENÜSÜ
   - Home'da WORKS'e tıklayınca Works sayfası açılır.
   - Works'teyken WORKS'e tekrar tıklayınca alt menü aşağı doğru açılıp kapanır.
   - Logo'ya tıklayınca Home'a dönülür. Adres sonuna #works eklenirse doğrudan Works açılır.
   ===================================================================== */
const homeV=$('#homeView'),worksV=$('#works');
const wsub=h('div');wsub.id='wsub';wsub.setAttribute('role','menu');
let view='home',homeShown=true,viewBusy=false,subOpen=false,subT=0;
const isHashHref=u=>!u||u.charAt(0)==='#';
const DEF_NAMES=["İŞ BANKASI \"YÜZLER VARDI\" FERİT KATİPOĞLU", "PETROL OFİSİ \"İŞ GÜNÜ\" FERİT KATİPOĞLU", "ENPARA \"EN HAVALI BABA\" FERİT KATİPOĞLU", "BURGER KING \"DONDURMA\" ADAFALİTİKO", "NİLKY \"PROBİYOO\" DİRCUT ASLI ÇELİKEL", "SILA \"HAYRAN\" ADAFALİTİKO", "DENİZBANK \"NE VAR SIRADA?\" DİRCUT FERİT KATİPOĞLU", "TAT \"HAZIR TABAKLAR\" FERİT KATİPOĞLU"];
const DEF_WORKS=DEF_NAMES.map(n=>({img:'',info:n}));
const worksInit0=worksInit;
const works=(worksInit||DEF_WORKS).map(w=>({img:w.img||'',info:w.info||''}));
/* kayıtlı hiçbir pencerede proje bilgisi yoksa, verilen proje isimleri sırayla doldurulur */
if(!works.some(w=>w.info))works.forEach((w,i)=>{if(DEF_NAMES[i])w.info=DEF_NAMES[i]});
/* ---------- WORKS pencere bükülmesi (Home'daki geçiş efektiyle aynı formül) ----------
   Her dikey şerit, merkezden uzaklığa göre üstten/alttan içeri çekilir (k = 1 − .82·n²): üst kenar ortada aşağı sarkar, alt kenar yukarı çıkar.
   Her pencere kendi durumunu (d: 0→1) bağımsız taşır; sadece hover'daki pencere çizilir. */
const wActive=new Set();let wRaf=0;
/* Performans: görsel pencere boyutunda bir kez (cover ile kırpılmış) hazır bitmap'e çizilir (c._src); her karede büyük görsel
   yeniden ölçeklenmez, sadece bu küçük bitmap'ten şeritler kopyalanır. Boyutlar önbellekte, karede layout okuması yok.
   Çarpıtma iki geçişlidir: 1) satırlar yanlardan içe (sağ/sol açı)  2) sütunlar üstten/alttan içe (üst/alt açı).
   Köşelerde etki 0'dır (1−n²): köşeler sabit kalır, kenarlar ortada içe bükülür → pencere gridde yerinde oturur. */
function ensureSrc(c){
  const W=c.clientWidth,H=c.clientHeight;if(!W||!H)return false;
  const dp=Math.min(2,devicePixelRatio||1),pw=Math.round(W*dp),ph=Math.round(H*dp),im=c._im,ok=!!(im&&im.complete&&im.naturalWidth>0);
  const key=pw+'x'+ph+'|'+ok+'|'+V['wk.fx']+'|'+V['wk.fy'];
  c._W=W;c._H=H;c._dp=dp;
  if(c._key===key&&c._src)return true;
  c._key=key;
  const src=c._src||(c._src=document.createElement('canvas')),mid=c._mid||(c._mid=document.createElement('canvas')),cv=c._cv;
  src.width=mid.width=cv.width=pw;src.height=mid.height=cv.height=ph;
  const sx=src.getContext('2d');
  if(ok){const iw=im.naturalWidth,ih=im.naturalHeight,ba=pw/ph,ia=iw/ih;let cx=0,cy=0,cw=iw,ch=ih;
    if(ia>ba){cw=ih*ba;cx=(iw-cw)*V['wk.fx']/100}else{ch=iw/ba;cy=(ih-ch)*V['wk.fy']/100}
    sx.drawImage(im,cx,cy,cw,ch,0,0,pw,ph)}
  else{sx.fillStyle='#141414';sx.fillRect(0,0,pw,ph)}
  c._xm=mid.getContext('2d');c._x2=cv.getContext('2d');
  return true;
}
function drawWarp(c){
  if(!c._src)return;
  const bn=c._bn,W=c._W,dp=c._dp,src=c._src,mid=c._mid,xm=c._xm,x2=c._x2,pw=src.width,ph=src.height;
  const am=V['wk.bend']*bn.d,A=.034*W*am*dp,B=.029*W*am*dp,S=.02*W*am*V['wk.bendx']*dp,sd=Math.max(2,Math.round(4*dp));
  xm.clearRect(0,0,pw,ph);x2.clearRect(0,0,pw,ph);
  for(let y=0;y<ph;y+=sd){
    const hh=Math.min(sd,ph-y),ny=(y+hh/2)/ph*2-1,l=S*(1-ny*ny);
    xm.drawImage(src,0,y,pw,hh,l,y,pw-2*l,hh+1)}
  for(let x=0;x<pw;x+=sd){
    const ww=Math.min(sd,pw-x),nx=(x+ww/2)/pw*2-1,k=1-nx*nx,t=A*k,b=B*k;
    x2.drawImage(mid,x,0,ww,ph,x,t,ww+1,ph-t-b)}
}
function warpTo(c,to){
  const bn=c._bn,now=performance.now();
  if(to&&!ensureSrc(c))return;
  bn.from=bn.d;bn.to=to;bn.t0=now;bn.dur=Math.max(1,(to?V['wk.bin']:V['wk.bout'])*1000);
  if(to){c.classList.add('bend');if(c._hasInfo)c.classList.add('info')}else c.classList.remove('info');
  wActive.add(c);if(!wRaf)wRaf=requestAnimationFrame(warpLoop);
}
function warpLoop(now){
  wRaf=0;
  wActive.forEach(c=>{
    const bn=c._bn,p=Math.min(1,(now-bn.t0)/bn.dur);
    bn.d=bn.from+(bn.to-bn.from)*ease(p);
    drawWarp(c);
    if(p>=1){wActive.delete(c);if(bn.to===0){c.classList.remove('bend');c._x2&&c._x2.clearRect(0,0,c._cv.width,c._cv.height)}}
  });
  if(wActive.size)wRaf=requestAnimationFrame(warpLoop);
}
const ARROW='<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M0.0272217 0.485504H11.1192V11.5775" stroke-width="0.971" stroke-miterlimit="10"/><path d="M11.1193 0.485504L0.343262 11.2605" stroke-width="0.971" stroke-miterlimit="10"/></svg>';
function buildWorks(){
  wActive.clear();
  const g=$('#wgrid');g.innerHTML='';
  works.forEach((w,i)=>{
    const c=h('div','wc'+(w.img?'':' empty'));
    c._bn={d:0,from:0,to:0,t0:0,dur:1};
    if(w.img){const im=new Image();im.alt='Proje kapağı '+(i+1);im.decoding='async';im.draggable=false;im.onerror=()=>c.classList.add('empty');im.onload=()=>{c._key=null;if(c._bn.d>0&&ensureSrc(c))drawWarp(c)};im.src=w.img;c.append(im);c._im=im;im.decode&&im.decode().then(()=>{(window.requestIdleCallback||setTimeout)(()=>{if(c.isConnected&&c.clientWidth)ensureSrc(c)})}).catch(()=>{})}
    const cv=h('canvas');cv.setAttribute('aria-hidden','true');c.append(cv);c._cv=cv;
    /* proje bilgisi: metin + yönlendirme oku */
    const info=String(w.info||'').trim();c._hasInfo=!!info;
    if(info){const wi=h('div','wi'+(V['wk.iup']?' up':'')+(V['wk.iarr']==='edge'?' far':'')),t=h('span','wt');t.textContent=info;wi.append(t);wi.insertAdjacentHTML('beforeend',ARROW);c.append(wi);c.classList.add('hasinfo')}
    /* Her pencere kendi başına: PLAY imleci + zemin ışığı (Home'daki video alanıyla aynı davranış) */
    c.addEventListener('pointerenter',e=>{if(e.pointerType==='touch'||noHover)return;cuEl.classList.add('play');glowOn(e);if(!reduce)warpTo(c,1)});
    c.addEventListener('pointerleave',()=>{cuEl.classList.remove('play');glowOff();if(c._bn.d>0||c._bn.to===1)warpTo(c,0)});
    g.append(c)});
}
/* Yüklenen görsel: en fazla 1800 px'e küçültülüp JPEG olarak gömülür */
function fileToData(f,cb){
  const r=new FileReader();
  r.onload=()=>{const im=new Image();
    im.onload=()=>{const k=Math.min(1,1800/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');
      c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);
      const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.85))};
    im.onerror=()=>toast('Görsel okunamadı.');im.src=r.result};
  r.readAsDataURL(f)}
function setWorkFile(w,f){
  if(!/^image\//.test(f.type)){toast('Bir görsel dosyası seçin.');return}
  fileToData(f,u=>{w.img=u;w.pend=false;buildWorks();renderWorks();save()})}
function addWorkFile(f){
  let w=works.find(x=>!x.img&&!x.pend);if(!w){w={img:'',info:''};works.push(w)}
  w.pend=true;setWorkFile(w,f)}
function renderWorks(){
  const L=$('#wlist');if(!L)return;L.innerHTML='';
  works.forEach((w,i)=>{
    const d=h('div','vi'),vh=h('div','vh'),emb=w.img.startsWith('data:');
    vh.append(h('b',null,String(i+1)),h('span',null,w.img?(emb?'Yüklenen görsel (gömülü)':w.img):'Boş pencere'));
    const ui=h('input');ui.value=emb?'':w.img;ui.placeholder='Görsel yolu / URL (örn. gorseller/'+(i+1)+'.jpg)';
    ui.onchange=()=>{w.img=ui.value.trim();buildWorks();renderWorks();save()};
    const ii=h('input');ii.value=w.info;ii.placeholder='Proje bilgisi (hover’da pencerede belirir)';ii.oninput=()=>{w.info=ii.value;save()};ii.onchange=()=>buildWorks();
    d.append(vh,ui,ii);
    const vb=h('div','vb'),B=(t,fn)=>{const b=h('button',null,t);b.onclick=fn;vb.append(b)};
    B('Görsel seç…',()=>pick('image/*',false,f=>setWorkFile(w,f)));
    B('↑',()=>{if(i>0){[works[i-1],works[i]]=[works[i],works[i-1]];buildWorks();renderWorks();save()}});
    B('↓',()=>{if(i<works.length-1){[works[i+1],works[i]]=[works[i],works[i+1]];buildWorks();renderWorks();save()}});
    B('Görseli kaldır',()=>{w.img='';buildWorks();renderWorks();save()});
    B('Sil',()=>{works.splice(i,1);buildWorks();renderWorks();save()});
    d.append(vb);L.append(d)})}
/* Kenar yazıları (ABOUT / SEARCH) ve CONTACT, aktif sayfanın kendi sütunlarına taşınır */
function placeItems(v){
  const w=v==='works';
  items.forEach(it=>{
    if(it.grp==='side')sideHost(it).append(it.el);
    if(it.grp==='below')$('#pct').append(it.el);
  });
}
function parkHome(){
  slides.forEach(s=>{if(s.vid&&!s.vid.paused)s.vid.pause()});
  vshown=null;vw.classList.remove('on');killVf();glowOff();cuEl.classList.remove('play');capHover=false;
}
/* Fare / dokunma türü (alt menü hover'ı sadece fare için) */
let lastPtr='mouse';
addEventListener('pointerdown',e=>{lastPtr=e.pointerType||'mouse'},true);
/* Açık tam ekran videoyu animasyonsuz kapat (sayfa geçişi beklemesin) */
function fsKill(){
  if(!fsOpen&&!fsBusy)return;
  fsTimers.forEach(clearTimeout);fsTimers=[];
  if(fsP){try{fsP.pause();fsP.destroy()}catch(e){}fsP=null}
  fsEl.classList.remove('open');$('#fsc').classList.remove('open');fsContact(false);
  document.body.classList.remove('fsopen');fsClip.style.transition=fsV.style.transition='';fsClip.style.clipPath='';fsV.style.transform='';
  fsOpen=fsBusy=false;holdT=performance.now();
}
/* Sayfa değişimi ANINDA ve eşzamanlıdır: kilit / bekleme yok, ilk tıklamada geçer.
   Eski sayfa hemen kalkar; yeni sayfa yumuşakça belirir (sadece görsel). */
function setView(v){
  if(v===view)return;
  fsKill();clearTimeout(subT);closeSub(true);
  view=v;
  const out=v==='works'?homeV:worksV,inn=v==='works'?worksV:homeV;
  out.classList.add('off','hide');
  if(v==='works'){try{parkHome()}catch(e){}homeShown=false}
  placeItems(v);glowOff();cuEl.classList.remove('play');
  page.classList.toggle('vw',v==='works');site.classList.toggle('vw',v==='works');page.dataset.view=v;applyGlow();
  inn.classList.add('hide');inn.classList.remove('off');site.scrollTop=0;
  if(v==='home'){homeShown=true;laySig='';layout();holdT=performance.now();playOnly(cur)}
  void inn.offsetWidth;inn.classList.remove('hide');
  try{history.replaceState(null,'',v==='works'?'#works':location.pathname+location.search);lastHash=location.hash}catch(e){}
  requestAnimationFrame(warmScr);
  /* fare zaten WORKS üzerindeyse (tıklama sonrası) alt menü hemen açılsın */
  if(v==='works'&&lastPtr!=='touch'&&lastPtr!=='pen'){const nw=$('.navw');if(nw&&nw.matches(':hover'))openSub()}
}
let lastHash=location.hash,rdyT=0;
function bootView(){
  if(!/^#works\b/i.test(location.hash))return;
  homeV.classList.add('off','hide');worksV.classList.remove('off','hide');
  view='works';homeShown=false;placeItems('works');page.classList.add('vw');site.classList.add('vw');page.dataset.view='works';applyGlow();
}
/* Alt menü: Works sayfasında WORKS'in üstüne gelince açılır. Karışma yok, CSS ile sırayla belirir. */
function openSub(){
  if(view!=='works')return;
  clearTimeout(subT);if(subOpen)return;
  subOpen=true;wsub.classList.add('open');
  clearTimeout(rdyT);rdyT=setTimeout(()=>{if(subOpen)wsub.classList.add('rdy')},Math.max(120,V['wk.odur']*600));
}
function closeSub(now){
  clearTimeout(subT);
  if(!subOpen)return;
  subOpen=false;wsub.classList.remove('open','rdy');clearTimeout(rdyT);
}
function closeSubLater(){clearTimeout(subT);subT=setTimeout(()=>closeSub(),V['wk.cdel']*1000)}
function itemClick(e,it){
  if(e.button!==0)return;
  if(it.grp==='sub'){e.preventDefault();it.el.blur();if(it.id==='mds')toggleMoods();return}   // henüz yönlendirme yok: tıklama renk bırakmaz, yeşil sadece hover'da
  const href=V['i.'+it.id+'.href'];
  if(it.id==='wrk'&&isHashHref(href)){
    e.preventDefault();
    if(view==='home')setView('works');
    else if(lastPtr==='touch'||lastPtr==='pen'){if(subOpen)closeSub();else openSub()}   // fare: hover açar, tıklama bir şey yapmaz
    return;
  }
  /* '#' yer tutucu bağlantılar sayfayı değiştirmesin / hashchange tetiklemesin */
  if(isHashHref(href)&&href.length<=1)e.preventDefault();
}
document.addEventListener('click',e=>{if(subOpen&&!e.target.closest('.navw'))closeSub()});
/* Yedek yönlendirme: adres çubuğundaki / bağlantıdaki #works değişirse sayfa yine değişir */
addEventListener('hashchange',()=>{
  const w=/^#works\b/i.test(location.hash);
  if(w)setView('works');else if(/^#works\b/i.test(lastHash))setView('home');   // sadece #works'ten çıkış Home'a döner
  lastHash=location.hash;
});
$('#logo').addEventListener('click',e=>{if(isHashHref(V['lg.href'])){e.preventDefault();if(view!=='home')setView('home')}});

/* =====================================================================
   BAŞLAT
   ===================================================================== */
mountItems();
/* ---------- boşluk eşitleme (piksel hassasiyeti) ----------
   Team'in görünen üst boşluğu = nav üstü + yarım satır aralığı + (font ascent − büyük harf yüksekliği).
   SEARCH'ün alt boşluğu, harfin tabanı (baseline) aynı mesafede kalacak şekilde hesaplanır. Footer logosunun yan ve alt boşluğu da bu değere bağlanır. */
function syncGaps(){
  const sw=site.clientWidth;if(!sw)return;
  site.style.setProperty('--sh',site.clientHeight+'px');
  const tm=(items.find(i=>i.id==='team')||{}).el,se=(items.find(i=>i.id==='search')||{}).el||tm;
  /* hedef: SEARCH'ün harf tabanı (cap alt kenarı) ekranın altından, logonun üst kenarının ekranın üstünden uzaklığı kadar içeride (üst/alt simetri) */
  let vis=V['lg.y']/100*sw,b=V['lb.bm']/100*sw;
  if(se){const cs=getComputedStyle(se),fs=parseFloat(cs.fontSize)||12;mctx.font=`${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    const m=mctx.measureText('H'),A=m.fontBoundingBoxAscent||fs*.92,D=m.fontBoundingBoxDescent||fs*.25,hl=(fs*1.2-(A+D))/2;b=vis-hl-D}
  const sb=(V['lb.eq']?b:V['lb.bm']/100*sw)+V['lb.bo'];
  site.style.setProperty('--lb-b',sb.toFixed(2)+'px');
  const link=V['ft.link'];
  site.style.setProperty('--ft-m',((link?vis:V['ft.m']/100*sw)+V['ft.mo']).toFixed(2)+'px');
  site.style.setProperty('--ft-b',((link?vis:V['ft.pbm']/100*sw)+V['ft.bo']).toFixed(2)+'px');
  /* Üst sağ menü: Team'in görünen sağ kenarı ABOUT'un görünen sağ kenarıyla aynı çizgiye gelir */
  const ab=(items.find(i=>i.id==='about')||{}).el;
  if(V['nv.al']&&ab&&tm){
    const sr=site.getBoundingClientRect(),ar=ab.getBoundingClientRect(),ca=getComputedStyle(ab),fa=parseFloat(ca.fontSize)||12;
    mctx.font=`${ca.fontStyle} ${ca.fontWeight} ${fa}px ${ca.fontFamily}`;
    const ma=mctx.measureText('H'),Aa=ma.fontBoundingBoxAscent||fa*.92,Da=ma.fontBoundingBoxDescent||fa*.25,capa=ma.actualBoundingBoxAscent||fa*.72;
    /* dikey yazıda harfler yan yatar; satır kutusunun ortası "central" taban çizgisidir → harf üstü merkezden (cap − (A−D)/2) sağda */
    const aboutInk=(ar.left+ar.right)/2-sr.left+(capa-(Aa-Da)/2);
    const ct=getComputedStyle(tm),ft=parseFloat(ct.fontSize)||12;mctx.font=`${ct.fontStyle} ${ct.fontWeight} ${ft}px ${ct.fontFamily}`;
    const lastCh=Array.from(tm.textContent.trim()).pop()||'M',mm=mctx.measureText(lastCh),rsb=mm.width-mm.actualBoundingBoxRight,ls=parseFloat(ct.letterSpacing)||0;
    site.style.setProperty('--nv-r-eff',(sw-aboutInk-rsb-ls+V['nv.ro']).toFixed(2)+'px');
  }else if(tm){
    const ct=getComputedStyle(tm),ft=parseFloat(ct.fontSize)||12;mctx.font=`${ct.fontStyle} ${ct.fontWeight} ${ft}px ${ct.fontFamily}`;
    const lastCh=Array.from(tm.textContent.trim()).pop()||'M',mm=mctx.measureText(lastCh),rsb=mm.width-mm.actualBoundingBoxRight,ls=parseFloat(ct.letterSpacing)||0;
    /* video sağ kenarı = Team'in görünen sağ kenarı */
    site.style.setProperty('--nv-r-eff',((V['ly.peek']+V['ly.col'])/100*sw+V['nv.r']/100*sw-rsb-ls+V['nv.ro']).toFixed(2)+'px');
  }
  /* CONTACT: C'nin görünen başlangıcı = video alt kenarı. Kutu kenarı ile harf mürekkebi arasındaki sol yan boşluk (lsb) telafi edilir */
  const ctI=(items.find(i=>i.id==='contact')||{}).el;
  if(ctI){const cc=getComputedStyle(ctI),fc=parseFloat(cc.fontSize)||12;mctx.font=`${cc.fontStyle} ${cc.fontWeight} ${fc}px ${cc.fontFamily}`;
    const f0=Array.from(ctI.textContent.trim())[0]||'C',lsb=-(mctx.measureText(f0).actualBoundingBoxLeft||0);
    site.style.setProperty('--ct-lsb',(lsb+(V['lb.cy']||0)).toFixed(2)+'px')}
  /* TOGGLE: sağ kenarı Team/ABOUT ink kenarıyla, alt kenarı SEARCH'ün alt çizgisiyle (Team üst boşluğu) aynı hizada */
  site.style.setProperty('--tg-r',(V['tg.r']/100*sw+(V['tg.dx']||0)).toFixed(2)+'px');
  site.style.setProperty('--tg-b',(V['tg.b']/100*sw+(V['tg.dy']||0)).toFixed(2)+'px');
  /* MOODS ikonları: dikey merkez = SEARCH'ün büyük harf orta çizgisi (aynı satır) */
  if(se){const cs=getComputedStyle(se),fs=parseFloat(cs.fontSize)||12;mctx.font=`${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    const m=mctx.measureText('H'),A=m.fontBoundingBoxAscent||fs*.92,D=m.fontBoundingBoxDescent||fs*.25,cap=m.actualBoundingBoxAscent||fs*.72,hl=(fs*1.2-(A+D))/2;
    /* analitik (geçiş animasyonundan bağımsız): kutu altı = sb; taban çizgisi = sb+hl+D; büyük harf orta çizgisi = +cap/2; SEARCH'ün dy kaydırması dahil */
    site.style.setProperty('--md-c',(sb+hl+D+cap/2-(V['i.search.dy']||0)/100*sw+(V['md.dy']||0)).toFixed(2)+'px')}
  const dz=$('#designed');dz.textContent=V['ft.dt']||'';dz.style.display=(V['ft.dshow']&&V['ft.dt'])?'':'none';
}
/* "O" harfine hover → mavi ışık */
$('#ohit').addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){$('#giantwrap').classList.add('on');cuEl.classList.add('xo')}});
$('#ohit').addEventListener('pointerleave',()=>{$('#giantwrap').classList.remove('on');cuEl.classList.remove('xo')});
slidesInit.forEach(x=>newSlide(x.cap,x.url,x.poster,x.fsx));
buildUI();renderVids();renderWorks();
apply();setLabel(0);
buildWorks();bootView();
if(!restored&&!EMB.V&&!clientMode)setTimeout(()=>toast('Bu tarayıcıda kayıtlı ayar / proje bilgisi bulunamadı. Önceki sürümü başka bir tarayıcıda ya da farklı şekilde açtıysan: önceki sürümde panelden “JSON dışa aktar”, burada “İçe aktar”.'),900);
Object.assign(HK,{slides,go:i=>go(Math.round(pos)+(i-cur)),apply,next,prev,cur:()=>cur});
if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',()=>{invalidateMetrics();syncGaps();requestAnimationFrame(warmScr)});
(document.fonts&&document.fonts.ready||Promise.resolve()).then(()=>{invalidateMetrics();syncGaps();requestAnimationFrame(t=>{warmScr();tick(t)})});
requestAnimationFrame(warmScr);
})();
