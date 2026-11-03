#!/usr/bin/env python3
"""
Hokus · derleme: src/ klasörünü TEK dosyalı, çift tıklayınca açılan HTML'e çevirir.
Kullanım:   python3 tools/build.py            →  dist/hokus.html
            python3 tools/build.py v31        →  dist/hokus-v31.html
Yaptığı iş (tersine dönüşüm, kayıpsız):
  css/style.css        → <style>…</style>
  js/app.js            → <script>…</script>
  assets/…  (yol)      → data: URI olarak gömülür (JS/CSS/HTML içindeki 'assets/…' dizgeleri)
  config/defaults.json → <script id="defaults"> içine gömülür; geliştirme yükleyicisi (dev:start…dev:end) silinir
"""
import re,sys,os,base64,json,mimetypes
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SRC=os.path.join(ROOT,'src')
rd=lambda p:open(os.path.join(SRC,p),encoding='utf-8').read()
html=rd('index.html');css=rd('css/style.css');js=rd('js/app.js')
cfg=open(os.path.join(SRC,'config/defaults.json'),encoding='utf-8').read()
json.loads(cfg)   # geçerli JSON mu
html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+css+'</style>')
html=re.sub(r'<!--dev:start-->.*?<!--dev:end-->\n?','',html,flags=re.S)
html=re.sub(r'<script type="application/json" id="defaults">.*?</script>',lambda m:'<script type="application/json" id="defaults">'+json.dumps(json.loads(cfg),ensure_ascii=False,separators=(',',':'))+'</script>',html,flags=re.S)
html=html.replace('<script src="js/app.js"></script>','<script>'+js+'</script>')
n=0
for dp,_,fs in os.walk(os.path.join(SRC,'assets')):
    for f in fs:
        full=os.path.join(dp,f);rel=os.path.relpath(full,SRC).replace(os.sep,'/')
        mime=mimetypes.guess_type(full)[0] or 'application/octet-stream'
        if mime=='audio/x-wav':mime='audio/wav'
        uri='data:%s;base64,%s'%(mime,base64.b64encode(open(full,'rb').read()).decode())
        c=html.count("'"+rel+"'")
        assert c>=1,'asset kullanılmıyor veya yol farklı: '+rel
        html=html.replace("'"+rel+"'","'"+uri+"'");n+=c
name='hokus-%s.html'%sys.argv[1] if len(sys.argv)>1 else 'hokus.html'
os.makedirs(os.path.join(ROOT,'dist'),exist_ok=True)
out=os.path.join(ROOT,'dist',name);open(out,'w',encoding='utf-8').write(html)
print('OK →',out,'(%d KB, %d asset yerleştirildi)'%(len(html)//1024,n))
