import sys,glob,os,re
from playwright.sync_api import sync_playwright
files=sorted(glob.glob('out/*.svg')) if len(sys.argv)<2 else sys.argv[1:]
bad=0
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"]); pg=b.new_page(viewport={'width':800,'height':900})
    for f in files:
        svg=open(f,encoding='utf8').read()
        pg.set_content('<body style="margin:0">'+svg+'</body>')
        r=pg.evaluate('''()=>{const s=document.querySelector('svg');const vb=s.viewBox.baseVal;const T=[...s.querySelectorAll('text')].filter(t=>t.textContent.trim());
        const out=[];const bb=T.map(t=>({s:t.textContent,b:t.getBBox()}));
        for(const x of bb){if(x.b.x<0||x.b.y<0||x.b.x+x.b.width>vb.width||x.b.y+x.b.height>vb.height)out.push('枠外:'+x.s);}
        for(let i=0;i<bb.length;i++)for(let j=i+1;j<bb.length;j++){const a=bb[i].b,c=bb[j].b;const ox=Math.min(a.x+a.width,c.x+c.width)-Math.max(a.x,c.x),oy=Math.min(a.y+a.height,c.y+c.height)-Math.max(a.y,c.y);if(ox>2&&oy>4)out.push('重なり:'+bb[i].s+' / '+bb[j].s);}
        return {n:T.length,w:vb.width,h:vb.height,out,cw:T.length?T[0].getBBox().width/Math.max(1,T[0].textContent.length):0}}''')
        print(os.path.basename(f),r['w'],r['h'],'text',r['n'],'問題',len(r['out']),r['out'][:6])
        bad+=len(r['out'])
    b.close()
print('TOTAL問題',bad)
