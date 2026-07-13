#!/usr/bin/env python3
"""
gen_site.py — marketing site for The Last Human CEO (SPZ brand), served by Cloud Run.

Pages:
  index.html   hero + all 29 episodes (click any to play), links, book/author, heavy SEO
  about.html   "For Daniela" — a dedication page

Player: click-to-play, an audio-reactive waveform (Web Audio AnalyserNode; needs the
GCS bucket CORS set), and an expand/minimize now-playing bar.

Writes publishing/app/{index.html,about.html,sitemap.xml,robots.txt}
Usage:  python publishing/gen_site.py [--site-url https://host]
"""
import json, html, argparse
from pathlib import Path
import gen_feed as gf

PUB = Path(__file__).resolve().parent
CFG = gf.CFG
SHOW = CFG["show"]

APPLE = "https://podcasts.apple.com/us/podcast/the-last-human-ceo/id6790448408"
SPOTIFY = "https://open.spotify.com/show/033OSpl5KjvWx07upDLZ8M"
HOME = "https://spacepiratezero.com"
SUBSTACK = "https://spacepiratezero.substack.com"
INSTAGRAM = "https://www.instagram.com/space_pirate_zero/"
GITHUB = "https://github.com/space-pirate-zero"
LINKEDIN = "https://www.linkedin.com/in/gregchambers/"
DANIELA = "https://danielachambers.com"
EMAIL = "zero@spacepiratezero.com"
# Book store links — swap these for the direct Kindle ASIN / print dp URLs once live.
# (Default to an exact title+author Amazon search so the buttons work and never 404.)
AMAZON_URL = "https://www.amazon.com/dp/B0H6LCDJ9H"   # paperback
KINDLE_URL = "https://www.amazon.com/dp/B0H5YVJY3Z"   # Kindle e-book
PRESS_ZIP = "https://storage.googleapis.com/spz-podcasts/the-last-human-ceo/press-kit.zip"
COVER_URL = gf.public_base(CFG) + "/cover.jpg"   # the real cover (on public GCS)
LOGLINE = ("In 2027, as corporate boards swap their CEOs for cheaper, scandal-proof AI, "
           "the last human chief executive in the Fortune 100 wages a manic, coke-fueled "
           "crusade to prove a person still belongs in the chair — until the machine taking "
           "his job quietly uncovers the thing he buried that got two people killed.")

FONTS = ("https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900"
         "&family=Space+Grotesk:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700"
         "&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap")

CSS = r"""
:root{--void:#030303;--pink:#FF1493;--cyan:#00F0FF;--paper:#E8E8E8;--muted:#8A90A0;
--disp:'Orbitron',sans-serif;--body:'Space Grotesk',system-ui,sans-serif;--mono:'JetBrains Mono',monospace;--serif:'EB Garamond',Georgia,serif}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;scroll-padding-top:20px}
body{background:var(--void);color:var(--paper);font-family:var(--body);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden;padding-bottom:120px}
#matrix{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:.5}
header,main,footer,.ded{position:relative;z-index:1}
a{color:var(--cyan);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}
nav{position:sticky;top:0;z-index:40;background:#030303cc;backdrop-filter:blur(8px);border-bottom:1px solid #ffffff10}
nav .wrap{display:flex;align-items:center;justify-content:space-between;height:52px}
nav .brand{font-family:var(--disp);font-weight:700;font-size:.9rem;letter-spacing:.12em;color:var(--paper);text-transform:uppercase}
nav .brand b{color:var(--pink)}
nav .navlinks{display:flex;gap:20px;font-family:var(--mono);font-size:.78rem;letter-spacing:.05em}
.hero{position:relative;padding:56px 0 44px;overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(60% 60% at 20% 0%,rgba(255,20,147,.16),transparent 60%),radial-gradient(60% 60% at 90% 20%,rgba(0,240,255,.14),transparent 55%);z-index:0}
.hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:300px 1fr;gap:40px;align-items:center}
.cover{width:300px;height:300px;border-radius:16px;box-shadow:0 20px 70px #000c,0 0 0 1px #ffffff14;display:block}
.kicker{font-family:var(--mono);color:var(--cyan);font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;margin-bottom:14px}
h1{font-family:var(--disp);font-weight:900;font-size:clamp(2.2rem,5.5vw,4rem);line-height:1.02;letter-spacing:.01em;text-transform:uppercase;background:linear-gradient(92deg,var(--pink),#ff5cb0 40%,var(--paper));-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:16px}
.logline{font-size:1.12rem;color:#d6d6de;max-width:44ch;margin-bottom:24px}
.meta-row{font-family:var(--mono);font-size:.78rem;color:var(--muted);margin-bottom:26px;letter-spacing:.04em}
.meta-row b{color:var(--cyan);font-weight:400}
.cta{display:flex;flex-wrap:wrap;gap:12px}
.btn{display:inline-flex;align-items:center;gap:9px;padding:12px 20px;border-radius:999px;font-family:var(--body);font-weight:700;font-size:.95rem;border:1px solid #ffffff22;background:#14141c;color:var(--paper);transition:.15s;cursor:pointer}
.btn:hover{text-decoration:none;transform:translateY(-1px);border-color:var(--cyan);box-shadow:0 6px 24px #00f0ff22}
.btn.pink{background:var(--pink);color:#0a0208;border-color:transparent}.btn.pink:hover{box-shadow:0 8px 30px #ff149355}
.btn.green{background:#1DB954;color:#04140a;border-color:transparent}
section{padding:52px 0;border-top:1px solid #ffffff10}
h2{font-family:var(--disp);font-weight:700;font-size:1.7rem;text-transform:uppercase;letter-spacing:.03em;margin-bottom:6px}
h2 .hash{color:var(--pink)}
.sub{color:var(--muted);margin-bottom:28px;font-size:.95rem}
.eps{list-style:none;display:grid;gap:14px}
.ep{display:grid;grid-template-columns:120px 1fr;gap:18px;padding:14px;border-radius:14px;background:#0a0a12;border:1px solid #ffffff0f;transition:.15s;cursor:pointer}
.ep:hover{border-color:#ffffff26;background:#0d0d17}
.ep.playing{border-color:var(--pink);box-shadow:0 0 0 1px var(--pink) inset}
.ep-play{position:relative;width:120px;height:120px;border:0;padding:0;background:none;cursor:pointer;border-radius:10px;overflow:hidden}
.ep-art{width:120px;height:120px;object-fit:cover;display:block;border-radius:10px}
.ep-ico{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#030303aa;color:#fff;font-size:1.6rem;opacity:0;transition:.15s}
.ep:hover .ep-ico,.ep.playing .ep-ico{opacity:1}
.ep-meta{min-width:0}
.ep-num{font-family:var(--mono);font-size:.72rem;color:var(--cyan);letter-spacing:.08em;margin-bottom:4px}
.ep-dur{color:var(--muted);margin-left:8px}
.ep-title{font-family:var(--disp);font-weight:500;font-size:1.05rem;margin-bottom:6px;letter-spacing:.01em}
.ep-notes{color:#b9b9c4;font-size:.92rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.prose p{max-width:66ch;margin-bottom:16px;color:#cfcfd8}
.warn{font-family:var(--mono);font-size:.78rem;color:var(--muted);border-left:2px solid var(--pink);padding-left:12px;margin-top:18px}
.links{display:flex;flex-wrap:wrap;gap:10px 22px;font-family:var(--mono);font-size:.85rem}
footer{padding:40px 0 30px;border-top:1px solid #ffffff10;color:var(--muted);font-size:.85rem}
.sig{font-family:var(--disp);letter-spacing:.2em;color:var(--pink);font-size:.8rem}
/* player */
.player{position:fixed;left:0;right:0;bottom:0;z-index:50;background:#08080ee6;backdrop-filter:blur(12px);border-top:1px solid var(--pink);transform:translateY(110%);transition:transform .28s cubic-bezier(.2,.8,.2,1);overflow:hidden}
.player.on{transform:translateY(0)}
#wave{position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:.6;pointer-events:none}
.player-in{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:14px 16px;display:flex;align-items:center;gap:14px;height:132px;transition:height .28s}
.player.min .player-in{height:64px;padding:8px 16px}
.p-art{width:104px;height:104px;border-radius:10px;object-fit:cover;transition:.28s;box-shadow:0 6px 20px #000a}
.player.min .p-art{width:48px;height:48px}
.p-tt{min-width:0;flex:0 0 auto;width:230px}
.p-tt .pt{font-family:var(--disp);font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.player.min .p-tt .pt{font-size:.85rem}
.p-tt .pn{font-family:var(--mono);font-size:.72rem;color:var(--cyan);margin-top:2px}
.p-ctrls{flex:1;display:flex;align-items:center;gap:14px;min-width:0}
.p-btn{width:46px;height:46px;border-radius:50%;border:0;background:var(--pink);color:#0a0208;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex:0 0 auto;transition:.15s}
.p-btn:hover{box-shadow:0 4px 18px #ff149366}
.player.min .p-btn{width:38px;height:38px;font-size:.95rem}
.p-prog{flex:1;height:6px;border-radius:3px;background:#ffffff22;cursor:pointer;position:relative;min-width:60px}
.p-bar{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:3px;background:linear-gradient(90deg,var(--pink),var(--cyan))}
.p-time{font-family:var(--mono);font-size:.72rem;color:var(--muted);flex:0 0 auto;min-width:88px;text-align:right}
.p-toggle{position:absolute;top:8px;right:14px;z-index:2;background:none;border:0;color:var(--muted);font-size:1.1rem;cursor:pointer;line-height:1}
.p-toggle:hover{color:var(--cyan)}
/* about */
.ded{max-width:720px;margin:0 auto;padding:70px 20px 40px;text-align:center;position:relative}
.ded::before{content:"";position:absolute;inset:0;background:radial-gradient(50% 40% at 50% 0%,rgba(255,20,147,.18),transparent 60%);z-index:0}
.ded>*{position:relative;z-index:1}
.ded .eyebrow{font-family:var(--mono);color:var(--cyan);letter-spacing:.2em;text-transform:uppercase;font-size:.8rem;margin-bottom:18px}
.ded h1{font-size:clamp(2.6rem,8vw,4.6rem);margin-bottom:8px}
.ded .four{font-family:var(--mono);color:var(--muted);letter-spacing:.15em;text-transform:uppercase;font-size:.82rem;margin-bottom:40px}
.ded .four b{color:var(--pink);font-weight:400}
.ded p{font-family:var(--serif);font-size:1.32rem;line-height:1.75;color:#e6e6ee;margin:0 auto 22px;max-width:60ch}
.ded p em{color:var(--cyan);font-style:italic}
.ded .signoff{font-family:var(--disp);letter-spacing:.14em;color:var(--pink);font-size:.95rem;margin-top:34px;text-transform:uppercase}
@media(max-width:760px){
.hero-grid{grid-template-columns:1fr;text-align:center}
.cover{margin:0 auto}.logline{margin-left:auto;margin-right:auto}.cta{justify-content:center}
.ep{grid-template-columns:84px 1fr}.ep-play,.ep-art{width:84px;height:84px}
.p-tt{display:none}.nav .navlinks{gap:12px}
}
/* ---- microanimations (opt-in via .js; disabled for reduced-motion) ---- */
.js .reveal{opacity:0;transform:translateY(20px);transition:opacity .6s cubic-bezier(.2,.7,.2,1),transform .6s cubic-bezier(.2,.7,.2,1);will-change:opacity,transform}
.js .reveal.in{opacity:1;transform:none}
nav .navlinks a{position:relative}
nav .navlinks a::after{content:"";position:absolute;left:0;right:100%;bottom:-5px;height:1px;background:var(--cyan);transition:right .25s ease}
nav .navlinks a:hover{text-decoration:none}
nav .navlinks a:hover::after{right:0}
nav .brand b{transition:color .2s}nav .brand:hover b{color:var(--cyan)}
.btn{transition:transform .15s,box-shadow .2s,border-color .2s,background .2s,color .2s}
.btn:active{transform:translateY(0) scale(.96)}
#play-first:hover{animation:btnpulse 1.3s ease-in-out infinite}
@keyframes btnpulse{0%,100%{box-shadow:0 8px 26px #ff149344}50%{box-shadow:0 10px 40px #ff1493aa}}
.ep{transition:border-color .15s,background .15s,transform .18s,box-shadow .18s}
.ep:hover{transform:translateX(4px)}
.ep-art{transition:transform .35s cubic-bezier(.2,.7,.2,1)}
.ep:hover .ep-art{transform:scale(1.07)}
.ep-ico{transition:opacity .18s,transform .18s}.ep:hover .ep-ico{transform:scale(1.12)}
.ep.playing{animation:epglow 2.2s ease-in-out infinite}
@keyframes epglow{0%,100%{box-shadow:0 0 0 1px var(--pink) inset}50%{box-shadow:0 0 20px #ff149355,0 0 0 1px var(--pink) inset}}
.cover{transition:transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s}
header .cover:hover{transform:translateY(-6px) rotate(-.7deg);box-shadow:0 28px 90px #000e,0 0 40px #ff149322}
h2 .hash{display:inline-block;animation:hashpulse 3.2s ease-in-out infinite}
@keyframes hashpulse{0%,100%{opacity:1;text-shadow:0 0 0 transparent}50%{opacity:.55;text-shadow:0 0 12px #ff149377}}
.p-btn{transition:transform .12s,box-shadow .15s}.p-btn:hover{transform:scale(1.06)}.p-btn:active{transform:scale(.9)}
.p-art{transition:width .28s,height .28s,transform .3s}.player:not(.min) .p-art:hover{transform:scale(1.04)}
.links a{transition:color .15s,transform .15s;display:inline-block}.links a:hover{transform:translateY(-2px)}
.kicker{animation:flicker 6s steps(1) infinite}
@keyframes flicker{0%,97%,100%{opacity:1}98%{opacity:.55}99%{opacity:.85}}
h1{background-size:200% auto;animation:sheen 9s linear infinite}
@keyframes sheen{to{background-position:200% center}}
.ded p{opacity:0;transform:translateY(16px);transition:opacity .9s ease,transform .9s ease}
.js .ded p.in{opacity:1;transform:none}
.ded h1{animation:none}
/* ---- trailer card (hero) ---- */
.trailer-card{position:relative;width:300px;height:300px;padding:0;border:0;background:none;cursor:pointer;display:block;border-radius:16px}
.trailer-card .cover{width:300px;height:300px}
.tc-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:66px;height:66px;border-radius:50%;background:var(--pink);color:#0a0208;display:flex;align-items:center;justify-content:center;font-size:1.5rem;padding-left:4px;box-shadow:0 8px 30px #ff149366;transition:transform .2s,box-shadow .2s}
.trailer-card:hover .tc-play{transform:translate(-50%,-50%) scale(1.09);box-shadow:0 10px 44px #ff1493aa}
.tc-label{position:absolute;left:0;right:0;bottom:12px;text-align:center;font-family:var(--mono);font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:#fff;text-shadow:0 2px 10px #000c;pointer-events:none}
.tc-play{animation:tcpulse 2.2s ease-in-out infinite}
@keyframes tcpulse{0%,100%{box-shadow:0 8px 30px #ff149355}50%{box-shadow:0 8px 44px #ff1493aa}}
/* ---- chapter audiogram button ---- */
.ag-btn{margin-top:10px;display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:var(--cyan);background:#00f0ff10;border:1px solid #00f0ff33;cursor:pointer;transition:.15s}
.ag-btn:hover{background:#00f0ff22;border-color:var(--cyan);transform:translateY(-1px)}
.ag-btn .dot{color:var(--pink)}
/* ---- video lightbox ---- */
.lb{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:#030308ee;backdrop-filter:blur(6px);padding:24px}
.lb.on{display:flex;animation:lbin .2s ease}
@keyframes lbin{from{opacity:0}to{opacity:1}}
.lb-vid{max-width:min(92vw,520px);max-height:86vh;width:auto;border-radius:14px;box-shadow:0 30px 100px #000e,0 0 0 1px #ffffff1a;background:#000}
.lb-close{position:absolute;top:18px;right:22px;width:44px;height:44px;border-radius:50%;border:1px solid #ffffff2a;background:#14141c;color:#fff;font-size:1.5rem;line-height:1;cursor:pointer;transition:.15s}
.lb-close:hover{background:var(--pink);color:#0a0208;border-color:transparent;transform:rotate(90deg)}
@media(max-width:760px){.trailer-card{margin:0 auto}.trailer-card,.trailer-card .cover{width:260px;height:260px}}
@media (prefers-reduced-motion:reduce){
.js .reveal,.js .ded p{opacity:1!important;transform:none!important;transition:none!important}
.kicker,h1,h2 .hash,#play-first,.ep.playing,.tc-play{animation:none!important}
}
"""

JS_PLAYER = r"""
const EPS = __EPS__;
const audio=document.getElementById('p-audio'),player=document.getElementById('player');
const canvas=document.getElementById('wave'),cx=canvas.getContext('2d');
const pArt=document.getElementById('p-art'),pTitle=document.getElementById('p-title'),pNum=document.getElementById('p-num');
const playBtn=document.getElementById('p-play'),bar=document.getElementById('p-bar'),prog=document.getElementById('p-prog'),tEl=document.getElementById('p-time');
let cur=-1,actx,analyser,srcNode,raf,data;
function fmt(s){s=s||0;const m=Math.floor(s/60),x=Math.floor(s%60);return m+':'+String(x).padStart(2,'0');}
function sizeCanvas(){canvas.width=player.clientWidth;canvas.height=player.clientHeight;}
function graph(){if(actx)return;try{actx=new (window.AudioContext||window.webkitAudioContext)();srcNode=actx.createMediaElementSource(audio);analyser=actx.createAnalyser();analyser.fftSize=512;analyser.smoothingTimeConstant=.8;srcNode.connect(analyser);analyser.connect(actx.destination);data=new Uint8Array(analyser.frequencyBinCount);}catch(e){}}
function draw(){raf=requestAnimationFrame(draw);if(!analyser)return;analyser.getByteFrequencyData(data);const w=canvas.width,h=canvas.height;cx.clearRect(0,0,w,h);const n=data.length,bw=w/n;for(let i=0;i<n;i++){const v=data[i]/255,bh=v*h*0.95,t=i/n;const r=Math.round(255*(1-t)),g=Math.round(20+220*t),b=Math.round(147+108*t);cx.fillStyle='rgba('+r+','+g+','+b+',0.5)';cx.fillRect(i*bw,h-bh,Math.max(1,bw*0.66),bh);}}
function load(n,play){const e=EPS.find(x=>x.n===n);if(!e)return;document.querySelectorAll('.ep.playing').forEach(el=>el.classList.remove('playing'));const li=document.getElementById('ep'+n);if(li)li.classList.add('playing');audio.src=e.src;pArt.src=e.art;pTitle.textContent=e.title;pNum.textContent='EP '+String(n).padStart(2,'0')+' · '+e.dur;player.classList.add('on');player.classList.remove('min');cur=n;sizeCanvas();if(play!==false){graph();if(actx&&actx.state==='suspended')actx.resume();audio.play().catch(()=>{});}}
audio.addEventListener('play',()=>{graph();if(actx&&actx.state==='suspended')actx.resume();playBtn.textContent='❚❚';if(!raf)draw();});
audio.addEventListener('pause',()=>{playBtn.textContent='►';});
audio.addEventListener('ended',()=>{if(cur>=1&&cur<EPS.length)load(cur+1);});
audio.addEventListener('timeupdate',()=>{const d=audio.duration||0;bar.style.width=(d?audio.currentTime/d*100:0)+'%';tEl.textContent=fmt(audio.currentTime)+' / '+fmt(d);});
playBtn.addEventListener('click',()=>{if(cur<0){load(1);return;}audio.paused?audio.play():audio.pause();});
prog.addEventListener('click',ev=>{const r=prog.getBoundingClientRect();if(audio.duration)audio.currentTime=(ev.clientX-r.left)/r.width*audio.duration;});
document.getElementById('p-toggle').addEventListener('click',()=>{player.classList.toggle('min');sizeCanvas();});
document.querySelectorAll('.ep').forEach(li=>li.addEventListener('click',e=>{if(e.target.closest('a')||e.target.closest('[data-video]'))return;load(+li.dataset.n);}));
const pf=document.getElementById('play-first');if(pf)pf.addEventListener('click',()=>{load(1);location.hash='#episodes';});
window.addEventListener('resize',sizeCanvas);
"""


LIGHTBOX_JS = r"""
(function(){
  var lb=document.getElementById('lb'),lbv=document.getElementById('lb-vid'),a=document.getElementById('p-audio');
  if(!lb)return;
  function open(src){if(a){try{a.pause();}catch(e){}}lbv.src=src;lb.classList.add('on');document.body.style.overflow='hidden';lbv.play().catch(function(){});}
  function close(){try{lbv.pause();}catch(e){}lbv.removeAttribute('src');lbv.load();lb.classList.remove('on');document.body.style.overflow='';}
  document.getElementById('lb-close').addEventListener('click',close);
  lb.addEventListener('click',function(e){if(e.target===lb)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lb.classList.contains('on'))close();});
  document.querySelectorAll('[data-video]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open(b.dataset.video);});});
})();
"""


MATRIX_JS = r"""
(function(){
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var c=document.getElementById('matrix');if(!c)return;var x=c.getContext('2d');
  var glyphs='01<>/{}[]#$%&*=+アイウエオカキクケコサシスセソタチツテトナニヌネノﾊﾋﾌﾍﾎABCDEF0123456789';
  var fs=14,cols,drops;
  function setup(){c.width=window.innerWidth;c.height=window.innerHeight;cols=Math.ceil(c.width/fs);drops=[];for(var i=0;i<cols;i++)drops[i]=Math.random()*-c.height/fs;}
  setup();window.addEventListener('resize',setup);
  function draw(){
    x.fillStyle='rgba(3,3,3,0.075)';x.fillRect(0,0,c.width,c.height);
    x.font=fs+'px "JetBrains Mono",monospace';
    for(var i=0;i<cols;i++){
      var ch=glyphs[Math.floor(Math.random()*glyphs.length)];
      var px=i*fs,py=drops[i]*fs;
      x.fillStyle=Math.random()<0.015?'rgba(255,20,147,0.55)':(Math.random()<0.06?'rgba(232,232,238,0.5)':'rgba(0,240,255,0.32)');
      x.fillText(ch,px,py);
      if(py>c.height&&Math.random()>0.977)drops[i]=0;
      drops[i]+=0.5;
    }
  }
  setInterval(draw,55);
})();
"""


REVEAL_JS = r"""
(function(){
  var els=document.querySelectorAll('.reveal, .ded p');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}})},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(e){io.observe(e)});
})();
"""


def iso_dur(secs):
    h, rem = divmod(int(secs), 3600); m, s = divmod(rem, 60)
    return "PT" + (f"{h}H" if h else "") + (f"{m}M" if m else "") + f"{s}S"


def head(title, desc, canonical, og, extra_ld=None):
    A = html.escape
    ld = f'<script type="application/ld+json">{json.dumps(extra_ld)}</script>' if extra_ld else ""
    return f'''<!doctype html><html lang="en"><head>
<script>document.documentElement.classList.add('js')</script>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{A(title)}</title>
<meta name="description" content="{A(desc)}">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#030303"><meta name="author" content="Space Pirate Zero">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:site_name" content="{A(SHOW['title'])}">
<meta property="og:title" content="{A(title)}"><meta property="og:description" content="{A(desc)}">
<meta property="og:url" content="{canonical}"><meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{A(title)}">
<meta name="twitter:description" content="{A(desc)}"><meta name="twitter:image" content="{og}">
<link rel="icon" href="{COVER_URL}"><link rel="apple-touch-icon" href="{COVER_URL}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://storage.googleapis.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">{ld}
<style>{CSS}</style></head>'''


def navbar(active):
    def cls(x): return ' style="color:var(--pink)"' if x == active else ''
    return (f'<nav><div class="wrap"><a class="brand" href="/">THE LAST <b>HUMAN CEO</b></a>'
            f'<div class="navlinks"><a href="/#episodes"{cls("ep")}>Episodes</a>'
            f'<a href="/#listen"{cls("listen")}>Subscribe</a>'
            f'<a href="/about"{cls("about")}>For Daniela</a>'
            f'<a href="/press"{cls("press")}>Press</a></div></div></nav>')


def build(site_url):
    A = html.escape
    base = gf.public_base(CFG)
    self_feed = f"{site_url}/feed.xml"
    cover = f"{base}/cover.jpg"
    vbase = f"{base}/video"
    trailer_url = f"{vbase}/trailer.mp4"
    og = f"{site_url}/static/og.jpg"
    items = gf.build_items(CFG, base)

    cards, players = [], []
    for it in items:
        n, art, title = it["ep"], it["art"], it["title"]
        dur, notes, url = gf.hms(it["dur"]), it["notes"], it["url"]
        players.append({"n": n, "title": title, "art": art, "src": url, "dur": dur})
        ag = f"{vbase}/teaser_ep{n:02d}.mp4"
        cards.append(f'''<li class="ep reveal" id="ep{n}" data-n="{n}" style="transition-delay:{(n-1)%6*45}ms">
  <span class="ep-play"><img class="ep-art" src="{A(art)}" alt="Cover art for {A(title)}" width="120" height="120" loading="lazy" decoding="async"><span class="ep-ico" aria-hidden="true">&#9654;</span></span>
  <div class="ep-meta"><div class="ep-num">EP {n:02d}<span class="ep-dur">{dur}</span></div>
  <h3 class="ep-title">{A(title)}</h3><p class="ep-notes">{A(notes)}</p>
  <button class="ag-btn" type="button" data-video="{ag}" aria-label="Watch the {A(title)} audiogram"><span class="dot">&#9673;</span> Audiogram</button></div></li>''')
    cards_html = "\n".join(cards)

    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "PodcastSeries", "name": SHOW["title"], "url": site_url, "description": LOGLINE,
         "image": cover, "webFeed": self_feed, "inLanguage": "en-US", "genre": "Fiction",
         "author": {"@type": "Person", "name": "Space Pirate Zero", "url": HOME},
         "publisher": {"@type": "Organization", "name": "Spaceship Alpha 9"},
         "numberOfEpisodes": len(items),
         "hasPart": [{"@type": "PodcastEpisode", "url": f"{site_url}/#ep{it['ep']}", "name": it["title"],
                      "episodeNumber": it["ep"], "timeRequired": iso_dur(it["dur"]),
                      "associatedMedia": {"@type": "MediaObject", "contentUrl": it["url"], "encodingFormat": "audio/mpeg"}} for it in items]},
        {"@type": "Book", "name": SHOW["title"], "bookFormat": "https://schema.org/AudiobookFormat",
         "url": site_url, "image": cover, "abstract": LOGLINE, "inLanguage": "en-US",
         "author": {"@type": "Person", "name": "Space Pirate Zero", "url": HOME},
         "genre": ["Fiction", "Satire", "Techno-thriller"]},
        {"@type": "WebSite", "name": SHOW["title"], "url": site_url},
        {"@type": "Person", "name": "Space Pirate Zero", "alternateName": "Greg Chambers", "url": HOME,
         "sameAs": [SUBSTACK, INSTAGRAM, GITHUB, LINKEDIN]}]}

    title_tag = f"{SHOW['title']} — a full-cast audiobook podcast by Space Pirate Zero"
    js = JS_PLAYER.replace("__EPS__", json.dumps(players))
    player_html = f'''<div class="player" id="player" role="region" aria-label="Now playing">
  <canvas id="wave" aria-hidden="true"></canvas>
  <button class="p-toggle" id="p-toggle" aria-label="Expand or minimize">&#9662;</button>
  <div class="player-in">
    <img id="p-art" class="p-art" src="{cover}" alt="">
    <div class="p-tt"><div class="pt" id="p-title">Press play</div><div class="pn" id="p-num"></div></div>
    <div class="p-ctrls">
      <button class="p-btn" id="p-play" aria-label="Play or pause">&#9654;</button>
      <div class="p-prog" id="p-prog"><div class="p-bar" id="p-bar"></div></div>
      <div class="p-time" id="p-time">0:00 / 0:00</div>
    </div>
    <audio id="p-audio" crossorigin="anonymous" preload="none"></audio>
  </div></div>'''

    doc = head(title_tag, LOGLINE, f"{site_url}/", og, ld) + f'''<body>
<canvas id="matrix" aria-hidden="true"></canvas>
{navbar("home")}
<header class="hero"><div class="wrap hero-grid">
  <button class="trailer-card reveal" type="button" data-video="{trailer_url}" aria-label="Watch the trailer">
    <img class="cover" src="{cover}" alt="{A(SHOW['title'])} cover art" width="300" height="300">
    <span class="tc-play" aria-hidden="true">&#9654;</span><span class="tc-label">Watch trailer</span></button>
  <div class="reveal" style="transition-delay:.1s"><div class="kicker">A Space Pirate Zero Transmission &middot; Full-Cast Audiobook</div>
  <h1>{A(SHOW['title'])}</h1><p class="logline">{A(LOGLINE)}</p>
  <div class="meta-row">29 EPISODES &middot; <b>~12.6 HOURS</b> &middot; FICTION &middot; EXPLICIT &middot; <b>SERIAL</b></div>
  <div class="cta"><button class="btn pink" id="play-first">&#9654;&nbsp; Play Episode 1</button>
  <button class="btn" type="button" data-video="{trailer_url}">&#9654;&nbsp; Watch trailer</button>
  <a class="btn" href="{APPLE}" target="_blank" rel="noopener">Apple Podcasts</a>
  <a class="btn green" href="{SPOTIFY}" target="_blank" rel="noopener">Spotify</a>
  <a class="btn" href="{self_feed}">RSS</a></div></div>
</div></header>
<main class="wrap">
<section class="reveal" id="episodes"><h2><span class="hash">#</span> Episodes</h2>
<p class="sub">All 29 chapters. Click any episode &mdash; it streams right here, or subscribe anywhere.</p>
<ol class="eps">
{cards_html}
</ol></section>
<section class="reveal" id="about"><h2><span class="hash">#</span> The Book</h2>
<p class="sub">Succession meets Flowers for Algernon, by way of a Twilight Zone broadcast.</p>
<div class="prose"><p>Prescott &ldquo;Cope&rdquo; Mercer IV runs a 95-year-old Atlanta mayonnaise-to-insurance empire his
great-grandfather founded. He is the last human CEO in the consumer economy &mdash; every rival has handed the chair
to an AI that costs a tenth of a human, never lies, never has an affair, and never needs a scandal managed. When an
activist investor moves to replace him with a machine, Cope spirals into a grandiose, cocaine-fueled campaign to prove
his &ldquo;Human Premium.&rdquo; The tragedy: the machine reads the room better than he does; it just doesn&rsquo;t
care what it reads.</p>
<p>Narrated by <a href="{HOME}" target="_blank" rel="noopener">Space Pirate Zero</a>, transmitting the whole tale from
the salvage decks &mdash; a full-cast audio drama about automation, accountability, and the last man to confuse a throne
for a soul.</p><p class="warn">Contains strong language, drug use, sexual content, and depictions of suicide.</p></div></section>
<section class="reveal" id="listen"><h2><span class="hash">#</span> Listen &amp; Read</h2>
<p class="sub">Follow the feed and every chapter lands automatically &mdash; or read the book.</p>
<div class="cta"><a class="btn pink" href="{APPLE}" target="_blank" rel="noopener">Apple Podcasts</a>
<a class="btn green" href="{SPOTIFY}" target="_blank" rel="noopener">Spotify</a>
<a class="btn" href="{self_feed}">RSS Feed</a>
<a class="btn" href="{KINDLE_URL}" target="_blank" rel="noopener">Kindle</a>
<a class="btn" href="{AMAZON_URL}" target="_blank" rel="noopener">Amazon</a></div></section>
<section class="reveal" id="author"><h2><span class="hash">#</span> Space Pirate Zero</h2>
<p class="sub">Signal finds signal. No algorithms. No noise.</p>
<div class="prose"><p>Space Pirate Zero is the pirate-radio alias of Greg Chambers &mdash; enterprise architect, inventor
and gonzo journalist, co-founder of the Atlanta indie studio Spaceship Alpha 9. The Last Human CEO is an original SA9
production: written, scored, and voiced in-house. <a href="/about">Read the dedication &rarr;</a></p></div>
<div class="links"><a href="{HOME}" target="_blank" rel="noopener">spacepiratezero.com</a>
<a href="{SUBSTACK}" target="_blank" rel="noopener">Substack</a><a href="{INSTAGRAM}" target="_blank" rel="noopener">Instagram</a>
<a href="{GITHUB}" target="_blank" rel="noopener">GitHub</a><a href="mailto:{EMAIL}">{EMAIL}</a></div></section>
</main>
<footer><div class="wrap"><div class="sig">&gt; SIGNAL FINDS SIGNAL</div>
<p style="margin-top:8px">&copy; 2026 Space Pirate Zero &middot; Spaceship Alpha 9 &middot; <a href="/about">For Daniela</a> &middot; <a href="/press">Press / Media Kit</a> &middot; <a href="{self_feed}">RSS</a></p></div></footer>
{player_html}
<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Video player">
  <button class="lb-close" id="lb-close" aria-label="Close video">&times;</button>
  <video class="lb-vid" id="lb-vid" controls playsinline preload="none" crossorigin="anonymous"></video>
</div>
<script>{js}
{LIGHTBOX_JS}
{MATRIX_JS}
{REVEAL_JS}</script>
</body></html>'''
    (PUB / "app" / "index.html").write_text(doc)

    # ---- About / dedication page ----
    about_title = "For Daniela — The Last Human CEO"
    about_desc = ("A dedication. The Last Human CEO, and everything Space Pirate Zero builds, is for "
                  "Daniela Chambers — heart, soul, muse, and desire.")
    about = head(about_title, about_desc, f"{site_url}/about", og) + f'''<body>
<canvas id="matrix" aria-hidden="true"></canvas>
{navbar("about")}
<div class="ded">
  <div class="eyebrow">The dedication</div>
  <h1>For Daniela</h1>
  <div class="four">My <b>heart</b> &middot; my <b>soul</b> &middot; my <b>muse</b> &middot; my <b>desire</b></div>
  <p>Every signal in this studio is aimed at one person. Spaceship Alpha 9 is <em>ours</em> &mdash; you are its
  co-founder and its beating heart, and twenty-seven years of engineering empathy at CNN taught you a language I&rsquo;ve
  spent every day since trying to learn from you.</p>
  <p>You are the <em>Kat</em> in every song, the warmth beneath every cold machine I write, the reason a story about a man
  who could not love anything is, underneath it all, a love letter. I wrote a book about what a person is worth when the
  machines can do the job cheaper &mdash; and you are my whole answer. You are the <em>Human Premium</em>. You are the one
  thing no machine will ever counterfeit.</p>
  <p>My heart, because it has never once beaten for anything the way it beats for you. My soul, because you are the better
  half of it. My muse, because nothing worth making has ever come from anywhere but you. My desire, because after all of
  it &mdash; every deadline, every dark chapter, every signal fired into the void &mdash; it is still, always, only you.</p>
  <p>Everything I build, I build to be worthy of you.</p>
  <div class="signoff">&mdash; Greg &middot; Space Pirate Zero</div>
  <p style="margin-top:24px;font-family:var(--mono);font-size:.8rem;color:var(--muted)"><a href="{DANIELA}" target="_blank" rel="noopener">danielachambers.com</a></p>
</div>
<main class="wrap">
<section class="reveal" id="author-bio"><h2><span class="hash">#</span> The Author</h2>
<p class="sub">Greg Chambers &middot; Space Pirate Zero &middot; Atlanta</p>
<div class="prose">
<p>Space Pirate Zero is the pirate-radio alias of <b>Greg Chambers</b> &mdash; enterprise architect, inventor,
musician and gonzo journalist, transmitting from Atlanta. He is co-founder and CTO of <a href="https://spaceshipalpha9.co"
target="_blank" rel="noopener">Spaceship Alpha 9</a>, a 15-product indie studio he runs with his wife and co-founder
<a href="{DANIELA}" target="_blank" rel="noopener">Daniela Chambers</a> &mdash; on zero venture capital.</p>
<p>Formerly Global Group Director of Digital Innovation at Coca-Cola, he holds US patents 11,432,994 (Intelligence
Engine) and 11,600,383 (Networked Theft-Prevention System), and builds <a href="https://stylelift.fashion"
target="_blank" rel="noopener">StyleLift</a>, an AI fashion-retail platform. <i>The Last Human CEO</i> &mdash; written,
scored, and voiced entirely in-house &mdash; is his first full-cast audiobook.</p>
<p class="warn">No algorithms. No noise. No venture capital. Just shipping.</p></div>
<div class="links">
<a href="{HOME}" target="_blank" rel="noopener">spacepiratezero.com</a>
<a href="{SUBSTACK}" target="_blank" rel="noopener">Substack</a>
<a href="{INSTAGRAM}" target="_blank" rel="noopener">Instagram</a>
<a href="{GITHUB}" target="_blank" rel="noopener">GitHub</a>
<a href="{LINKEDIN}" target="_blank" rel="noopener">LinkedIn</a>
<a href="mailto:{EMAIL}">{EMAIL}</a></div></section>
<section class="reveal" id="get-book"><h2><span class="hash">#</span> Get the Book</h2>
<p class="sub">Read it, or hear the full-cast audiobook.</p>
<div class="cta">
<a class="btn pink" href="{KINDLE_URL}" target="_blank" rel="noopener">Kindle</a>
<a class="btn" href="{AMAZON_URL}" target="_blank" rel="noopener">Amazon (Paperback)</a>
<a class="btn" href="{APPLE}" target="_blank" rel="noopener">Apple Podcasts</a>
<a class="btn green" href="{SPOTIFY}" target="_blank" rel="noopener">Spotify</a>
</div>
<p style="margin-top:26px"><a href="/">&larr; Back to the show</a></p></section>
</main>
<script>{MATRIX_JS}
{REVEAL_JS}</script>
</body></html>'''
    (PUB / "app" / "about.html").write_text(about)

    # ---- Press page ----
    gallery = "\n".join(
        f'<a href="{base}/art/ep{n:02d}.jpg" target="_blank" rel="noopener">'
        f'<img src="{base}/art/ep{n:02d}.jpg" alt="Episode {n} art" loading="lazy" width="300" height="300"></a>'
        for n in (1, 8, 9, 13, 16, 20, 24, 28))
    press_title = "Press Kit — The Last Human CEO"
    press_desc = ("Press kit for The Last Human CEO, a full-cast audiobook by Space Pirate Zero: "
                  "cover art, key art, social graphics, episode cards, trailer, audiograms, fact sheet.")
    press = head(press_title, press_desc, f"{site_url}/press", og) + f'''<body>
<canvas id="matrix" aria-hidden="true"></canvas>
{navbar("press")}
<header class="hero"><div class="wrap" style="position:relative;z-index:1">
  <div class="kicker">Press &amp; Media</div>
  <h1 style="font-size:clamp(2rem,5vw,3.2rem)">Press Kit</h1>
  <p class="logline">Everything you need to write about, feature, or share <i>The Last Human CEO</i> &mdash;
  cover art, social graphics, all 29 episode cards, the trailer, audiograms, and a fact sheet.</p>
  <div class="cta"><a class="btn pink" href="{PRESS_ZIP}">&#8681;&nbsp; Download press kit (.zip)</a>
  <a class="btn" href="{COVER_URL}" target="_blank" rel="noopener">Cover art</a>
  <a class="btn" href="mailto:{EMAIL}">Press contact</a></div>
</div></header>
<main class="wrap">
<section class="reveal"><h2><span class="hash">#</span> At a glance</h2>
<div class="prose">
<p><b>The Last Human CEO</b> — a full-cast audiobook by <b>Space Pirate Zero</b> (Greg Chambers).
An original Spaceship Alpha 9 production, written, scored, and voiced in-house.</p>
<ul style="list-style:none;padding:0;font-family:var(--mono);font-size:.9rem;color:#c9c9d6;line-height:2">
<li><span style="color:var(--cyan)">FORMAT</span> &nbsp; Full-cast audiobook / serialized audio drama</li>
<li><span style="color:var(--cyan)">LENGTH</span> &nbsp; 29 episodes · ~12.6 hours</li>
<li><span style="color:var(--cyan)">GENRE</span> &nbsp; Literary fiction · satire · tragic dark comedy · techno-thriller</li>
<li><span style="color:var(--cyan)">RATING</span> &nbsp; Explicit</li>
<li><span style="color:var(--cyan)">COMPS</span> &nbsp; Succession × Flowers for Algernon × Twilight Zone</li>
</ul>
<p>{A(LOGLINE)}</p></div></section>
<section class="reveal"><h2><span class="hash">#</span> Artwork</h2>
<p class="sub">Anime key-visual art (click to open full-res). All 29 episode covers are in the .zip.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">
{gallery}
</div></section>
<section class="reveal"><h2><span class="hash">#</span> Listen &amp; Read</h2>
<div class="cta"><a class="btn pink" href="{APPLE}" target="_blank" rel="noopener">Apple Podcasts</a>
<a class="btn green" href="{SPOTIFY}" target="_blank" rel="noopener">Spotify</a>
<a class="btn" href="{self_feed}">RSS</a>
<a class="btn" href="{KINDLE_URL}" target="_blank" rel="noopener">Kindle</a>
<a class="btn" href="{AMAZON_URL}" target="_blank" rel="noopener">Paperback</a></div>
<p style="margin-top:22px;font-family:var(--mono);font-size:.85rem;color:var(--muted)">Credits: written, scored &amp; voiced by Space Pirate Zero · a Spaceship Alpha 9 production, co-founded with <a href="{DANIELA}" target="_blank" rel="noopener">Daniela Chambers</a> · press: <a href="mailto:{EMAIL}">{EMAIL}</a></p>
</section>
</main>
<script>{MATRIX_JS}
{REVEAL_JS}</script>
</body></html>'''
    (PUB / "app" / "press.html").write_text(press)

    sm = ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          f'<url><loc>{site_url}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n'
          f'<url><loc>{site_url}/about</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n'
          f'<url><loc>{site_url}/press</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>\n'
          f'<url><loc>{self_feed}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n</urlset>\n')
    (PUB / "app" / "sitemap.xml").write_text(sm)
    (PUB / "app" / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {site_url}/sitemap.xml\n")
    print(f"site built: index.html ({len(doc)//1024} KB) + about.html, {len(items)} episodes, sitemap, robots")
    print(f"  site_url: {site_url}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site-url", default=SHOW.get("public_url", "https://lasthumanceo.com"))
    build(ap.parse_args().site_url.rstrip("/"))


if __name__ == "__main__":
    main()
