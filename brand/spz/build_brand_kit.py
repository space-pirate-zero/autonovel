#!/usr/bin/env python3
import base64, pathlib

FONTS = pathlib.Path("/Users/gregchambers/autonovel/.claude/worktrees/mystifying-hertz-fe888c/fonts")
CLIPS = pathlib.Path("/private/tmp/claude-501/-Users-gregchambers-autonovel/fad78438-262c-4c90-8699-979701fdb8d9/scratchpad/clips")
OUT = pathlib.Path("/private/tmp/claude-501/-Users-gregchambers-autonovel/fad78438-262c-4c90-8699-979701fdb8d9/scratchpad/spz_brand_kit.html")

def face(family, weight, fname):
    b = base64.b64encode((FONTS / fname).read_bytes()).decode()
    return (f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};"
            f"font-display:swap;src:url(data:font/ttf;base64,{b}) format('truetype');}}")

fontface = "\n".join([
    face("Orbitron", 700, "Orbitron-700.ttf"),
    face("Orbitron", 900, "Orbitron-900.ttf"),
    face("Space Grotesk", 400, "SpaceGrotesk-400.ttf"),
    face("Space Grotesk", 500, "SpaceGrotesk-500.ttf"),
    face("Space Grotesk", 700, "SpaceGrotesk-700.ttf"),
    face("JetBrains Mono", 400, "JetBrainsMono-400.ttf"),
])

def clip(fn):
    return "data:audio/mpeg;base64," + base64.b64encode((CLIPS / fn).read_bytes()).decode()

# order = playlist order in the UI
tracks_js = ",\n".join([
    f"{{name:'Logo Sting',era:'Sound-logo · paper-tear → 808 → cat bell',src:'{clip('sting.mp3')}'}}",
    f"{{name:'Signal Finds Signal',era:'Main theme · the title track',src:'{clip('theme.mp3')}'}}",
    f"{{name:'The Vault',era:'Scene bed · 2003 EBM cyber-goth club',src:'{clip('vault.mp3')}'}}",
    f"{{name:'Cash from Chaos',era:\"Door 14 · Sid '79 punk · full production\",src:'{clip('sid.mp3')}'}}",
])

SITE = "https://spacepiratezero.com"
# (title, tracks, genre, url, blurb) — real released discography from spacepiratezero.com
ALBUMS = [
 ("Lambada on Saturn's Rings",13,"Alternative / Latin",SITE+"/content/music/lambada-on-saturns-rings","Debut LP — irreverent, melodic, permanently orbiting the edge of taste."),
 ("Afternoon Delight",14,"Alternative / Rock",SITE+"/content/music/afternoon-delight","Nostalgic retro-futurism — a parallel 1979."),
 ("Vaudeville Nebula",4,"Lo-Fi / Cosmic",SITE+"/content/music/vaudeville-nebula","The EP that named the persona. Lo-fi, strange, deeply human."),
 ("The Yellow 5",8,"Latin / Bossa Nova",SITE+"/content/music/the-yellow-5","Samba rhythms in zero gravity. Bossa nova on the event horizon."),
 ("американское порно",7,"Pop / Synth",SITE+"/content/music/amerikanskoe-porno","Cosmic pop, Cyrillic aesthetic — seductive, disorienting, unashamed."),
 ("Tentacle Love",8,"Hip-Hop / Rap",SITE+"/content/music/tentacle-love","Eight transmissions from the outer edge — raw percussion, interstellar bars."),
]
def rec_row(i,a):
    t,tr,g,u,b=a
    return (f'<a class="rec" href="{u}" target="_blank" rel="noopener">'
            f'<span class="rec-n">{i+1:02d}</span>'
            f'<span class="rec-main"><span class="rec-t">{t}</span><span class="rec-b">{b}</span></span>'
            f'<span class="rec-meta"><span class="rec-g">{g}</span><span class="rec-tr">{tr} trk</span></span>'
            f'<span class="rec-go">↗</span></a>')
catalog_html = "\n".join(rec_row(i,a) for i,a in enumerate(ALBUMS))

# (group, [(label, url, desc)])
LINKGROUPS = [
 ("Home base",[("spacepiratezero.com",SITE,"digital insurgent at large")]),
 ("Channels",[("Substack","https://spacepiratezero.substack.com","weekly dispatches"),
              ("GitHub","https://github.com/space-pirate-zero","the org"),
              ("LinkedIn","https://www.linkedin.com/in/gregchambers/","Greg Chambers"),
              ("Instagram","https://www.instagram.com/space_pirate_zero/","@space_pirate_zero")]),
 ("Listen",[("Spotify","https://open.spotify.com/artist/5hsu0KPjwVKMCx1hAMFvI4","full discography"),
            ("Apple Music","https://music.apple.com/us/artist/space-pirate-zero/1751347344","full discography")]),
 ("Studio",[("Spaceship Alpha 9","https://spaceshipalpha9.co","15-product indie studio · no VC"),
            ("StyleLift","https://stylelift.fashion","AI fashion retail")]),
 ("On the site",[("Dispatches",SITE+"/content/article","essays"),
                 ("Music",SITE+"/content/music","the records"),
                 ("Books",SITE+"/content/book","forthcoming"),
                 ("Dossier",SITE+"/bio","the bio"),
                 ("Comms",SITE+"/contact","contact"),
                 ("Join Waitlist",SITE+"/waitlist","get on the list")]),
]
def host(u): return u.split("//",1)[-1].split("/",1)[0].replace("www.","")
def link_card(l):
    lab,u,d=l
    return (f'<a class="lnk" href="{u}" target="_blank" rel="noopener">'
            f'<span class="lnk-l">{lab}</span><span class="lnk-d">{d}</span>'
            f'<span class="lnk-u">{host(u)} <i>↗</i></span></a>')
def link_group(g):
    name,items=g
    return (f'<div class="lgrp"><div class="lgrp-h">{name}</div>'
            f'<div class="lgrid">'+"".join(link_card(l) for l in items)+"</div></div>")
links_html = "\n".join(link_group(g) for g in LINKGROUPS)

# ---- Studio (Spaceship Alpha 9) — pulled from the SpaceShipAlpha9 repo ----
MANIFESTO = ["Ship or Die","Own Your Stack","Don't Kill the Lamp","AI Is a Crew Member",
             "Bootstrap Everything","Build in Public, Ship in Stealth","Quality Is Non-Negotiable","Small Teams > Big Committees"]
# (name, tagline, status)
STUDIO_PRODUCTS = [
 ("Space Pirate Zero","One indie studio quietly building the future of software.","live"),
 ("StyleLift","The AI stylist that learns what you actually like.","beta"),
 ("GhostDeck","The VM manager that makes Docker Desktop look expensive.","beta"),
 ("Grocery Ninja","Stop wasting $150/month on groceries you throw away.","beta"),
 ("Space Tokens","One credit system. Fifteen products. Zero friction.","beta"),
 ("Phantom Tiles","Beat grandma at Rummikub. If you can.","beta"),
 ("DARKWAVE","Kubernetes for humans. Not for consultants.","development"),
 ("GhostGrid","Your MCP servers, one click away.","development"),
 ("Atomic Sound","A recording studio that fits on your Mac.","development"),
 ("Atomic Video","Video editing that feels the music.","development"),
 ("Atomic Distro","Get your music everywhere. Keep 90% of the money.","development"),
 ("Brand Casino","Turn foot traffic into brand fanatics.","development"),
 ("HomeGrid","One app for every smart device. No cloud required.","development"),
 ("RONIN","Tell Final Cut Pro what to do. In English.","development"),
 ("TradeCraft","They watch everything. Now you watch back.","development"),
 ("REWIND TV","Channel surfing is back. And it's glorious.","development"),
]
def prod_card(p):
    name,tag,st=p
    cls={"live":"live","beta":"beta"}.get(st,"dev")
    lab={"live":"LIVE","beta":"BETA","development":"DEV"}[st]
    return (f'<div class="prod p-{cls}"><div class="prod-h"><span class="prod-n">{name}</span>'
            f'<span class="prod-st s-{cls}">{lab}</span></div><div class="prod-t">{tag}</div></div>')
studio_products_html = "".join(prod_card(p) for p in STUDIO_PRODUCTS)
manifesto_html = "".join(f'<span class="mchip">{m}</span>' for m in MANIFESTO)

HTML = r"""<title>Space Pirate Zero — Brand Kit</title>
<style>
__FONTFACE__

:root{
  --void:#050507; --void2:#0b0d12; --surface:#0e1017; --surface2:#141722;
  --line:#20242f; --paper:#e8e8e8; --muted:#8a90a0; --muted2:#5b6070;
  --pink:#ff1493; --cyan:#00f0ff;
  --disp:'Orbitron',sans-serif; --body:'Space Grotesk',system-ui,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,monospace;
  --maxw:1120px;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--void);color:var(--paper);font-family:var(--body);
  font-weight:400;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden;
  background-image:radial-gradient(1200px 600px at 78% -8%,rgba(255,20,147,.10),transparent 60%),
    radial-gradient(1000px 620px at 10% 8%,rgba(0,240,255,.08),transparent 55%);
  background-attachment:fixed;}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 28px}
section{padding:76px 0;border-top:1px solid var(--line);scroll-margin-top:64px}
h1,h2,h3{margin:0;text-wrap:balance}
p{margin:0}
a{color:var(--cyan);text-decoration:none}
::selection{background:var(--pink);color:#050507}
:focus-visible{outline:2px solid var(--cyan);outline-offset:3px;border-radius:2px}

.eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:var(--muted)}
.sec-head{display:flex;align-items:baseline;gap:16px;margin-bottom:34px;flex-wrap:wrap}
.sec-num{font-family:var(--mono);font-size:13px;color:var(--pink);letter-spacing:.1em}
.sec-title{font-family:var(--disp);font-weight:700;font-size:clamp(22px,3vw,32px);letter-spacing:.04em;text-transform:uppercase}
.sec-note{font-size:14px;color:var(--muted);margin-left:auto;max-width:38ch}

/* ---------- NAV ---------- */
nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;justify-content:center;
  gap:4px;padding:10px 12px;background:rgba(5,5,7,.72);backdrop-filter:blur(12px);
  border-bottom:1px solid transparent;transition:border-color .3s, background .3s;flex-wrap:wrap}
nav.scrolled{border-bottom-color:var(--line)}
nav a{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--muted);padding:6px 12px;position:relative;transition:color .2s}
nav a:hover{color:var(--paper)}
nav a.active{color:var(--cyan)}
nav a::after{content:"";position:absolute;left:12px;right:12px;bottom:2px;height:1px;
  background:var(--cyan);transform:scaleX(0);transform-origin:left;transition:transform .3s}
nav a.active::after,nav a:hover::after{transform:scaleX(1)}
.nav-dot{width:7px;height:7px;border-radius:50%;background:var(--pink);align-self:center;margin-right:6px;
  box-shadow:0 0 10px var(--pink);animation:pulse 2.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}

/* reveal-on-scroll */
.reveal{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.reveal.in{opacity:1;transform:none}

/* ---------- buttons ---------- */
.btn{position:relative;overflow:hidden;font-family:var(--mono);cursor:pointer;border:1px solid var(--line);
  background:var(--surface);color:var(--paper);border-radius:2px;transition:transform .12s,border-color .2s,box-shadow .2s,color .2s;
  -webkit-tap-highlight-color:transparent}
.btn:hover{border-color:var(--cyan);box-shadow:0 0 0 1px rgba(0,240,255,.3),0 6px 24px -12px var(--cyan)}
.btn:active{transform:scale(.94)}
.ripple{position:absolute;border-radius:50%;background:rgba(0,240,255,.35);transform:translate(-50%,-50%) scale(0);
  pointer-events:none;animation:rip .55s ease-out forwards}
@keyframes rip{to{transform:translate(-50%,-50%) scale(1);opacity:0}}

/* ---------- HERO ---------- */
.hero{position:relative;min-height:92vh;display:flex;flex-direction:column;justify-content:center;
  overflow:hidden;border-top:none}
#scope{position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:.55}
.hero-glow{position:absolute;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(340px 340px at var(--mx,70%) var(--my,30%),rgba(255,20,147,.14),transparent 70%);
  transition:background .2s}
.hero .wrap{position:relative;z-index:2;width:100%}
.hero-eyebrow{display:flex;gap:18px;align-items:center;margin-bottom:30px;flex-wrap:wrap}
.hero-eyebrow .dot{width:8px;height:8px;border-radius:50%;background:var(--pink);
  box-shadow:0 0 14px 2px var(--pink);animation:pulse 2.4s ease-in-out infinite}
.wordmark{font-family:var(--disp);font-weight:900;line-height:.9;letter-spacing:-.01em;
  font-size:clamp(48px,12.5vw,168px);text-transform:uppercase;cursor:default}
.wordmark span{display:inline-block;transition:transform .3s}
.wordmark .l1{color:var(--paper)}
.wordmark .l2{color:transparent;-webkit-text-stroke:1.5px var(--cyan)}
.wordmark .l3{color:var(--pink);text-shadow:0 0 34px rgba(255,20,147,.5)}
.wordmark:hover .l2{animation:glitch .4s steps(2) 1}
@keyframes glitch{0%{transform:translate(0)}25%{transform:translate(-3px,1px)}50%{transform:translate(2px,-2px)}75%{transform:translate(-1px,1px)}100%{transform:translate(0)}}
.tagline{margin-top:34px;font-family:var(--mono);font-size:clamp(15px,2vw,22px);color:var(--cyan);letter-spacing:.06em}
.tagline .cur{display:inline-block;width:.62ch;height:1.05em;background:var(--cyan);transform:translateY(.16em);margin-left:.15em;animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.hero-sub{margin-top:26px;max-width:52ch;color:var(--muted);font-size:16px}
.hero-cta{margin-top:30px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.play-hero{display:flex;align-items:center;gap:12px;padding:13px 22px 13px 16px;font-size:12px;letter-spacing:.18em;text-transform:uppercase}
.play-hero .ico{width:16px;height:16px;position:relative;flex:none}
.scrolltip{position:absolute;bottom:22px;left:0;right:0;z-index:2;text-align:center;font-family:var(--mono);font-size:11px;letter-spacing:.3em;color:var(--muted2);text-transform:uppercase}
.scrolltip span{display:inline-block;animation:bob 1.8s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}

/* ---------- ESSENCE ---------- */
.essence-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:44px}
.lede{font-family:var(--disp);font-weight:700;font-size:clamp(20px,2.6vw,30px);line-height:1.28;letter-spacing:.01em}
.lede .pink{color:var(--pink)}.lede .cyan{color:var(--cyan)}
.bio{margin-top:24px;color:var(--muted);font-size:15px;max-width:46ch}
.prods{list-style:none;margin:0;padding:0}
.prods li{display:flex;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid var(--line);font-size:14px;transition:padding-left .25s,border-color .25s}
.prods li:first-child{border-top:1px solid var(--line)}
.prods li:hover{padding-left:8px;border-color:var(--cyan)}
.prods .k{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted2);align-self:center}
.prods .v{text-align:right}.prods .v b{font-weight:500}
.prods .v span{display:block;color:var(--muted);font-size:12px}

/* ---------- VOICE ---------- */
.voice-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;align-items:start}
.card{background:var(--surface);border:1px solid var(--line);border-radius:2px;padding:26px;transition:border-color .25s,transform .25s}
.card:hover{border-color:#2c313f;transform:translateY(-2px)}
.card h3{font-family:var(--mono);font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:16px}
.bench{font-family:var(--disp);font-weight:700;font-size:clamp(20px,2.4vw,27px);line-height:1.3}
.bench em{font-style:normal;color:var(--cyan)}
.gears{width:100%;border-collapse:collapse;font-size:14px}
.gears th,.gears td{text-align:left;padding:12px 12px 12px 0;border-bottom:1px solid var(--line);vertical-align:top}
.gears th{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted2);font-weight:400}
.gears .g{font-family:var(--disp);font-weight:700;text-transform:uppercase;letter-spacing:.03em;white-space:nowrap}
.gears .frame{color:var(--cyan)}.gears .scene{color:var(--pink)}
.rule{display:flex;gap:16px;align-items:center;padding:20px 24px;border:1px solid var(--pink);border-radius:2px;background:linear-gradient(90deg,rgba(255,20,147,.08),transparent)}
.rule .big{font-family:var(--disp);font-weight:900;font-size:clamp(18px,2.2vw,24px);text-transform:uppercase;color:var(--pink);letter-spacing:.02em;white-space:nowrap}
.rule .sub{color:var(--muted);font-size:13px}
.banned{display:flex;flex-wrap:wrap;gap:9px;margin-top:4px}
.banned .chip{font-family:var(--mono);font-size:12px;color:var(--muted);border:1px solid var(--line);padding:5px 10px;border-radius:2px;text-decoration:line-through;text-decoration-color:var(--pink);text-decoration-thickness:1.5px;transition:transform .15s,color .15s,border-color .15s}
.banned .chip:hover{transform:rotate(-2deg) scale(1.05);color:var(--pink);border-color:var(--pink)}
.tuning{grid-column:1/-1;border-left:2px solid var(--cyan);padding:6px 0 6px 26px;margin-top:6px}
.tuning p{font-size:clamp(16px,1.9vw,20px);line-height:1.55;color:var(--paper)}
.tuning .attr{margin-top:14px;font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted2)}

/* ---------- COLOR ---------- */
.swatches{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
.sw{border:1px solid var(--line);border-radius:2px;overflow:hidden;background:var(--surface);transition:transform .2s,border-color .2s}
.sw:hover{transform:translateY(-4px);border-color:var(--cyan)}
.sw .chip{height:118px;position:relative;cursor:copy}
.sw .chip .hex{position:absolute;left:12px;bottom:10px;font-family:var(--mono);font-size:12px;letter-spacing:.04em}
.sw .meta{padding:13px 14px}
.sw .name{font-family:var(--disp);font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:.05em}
.sw .role{color:var(--muted);font-size:11.5px;margin-top:5px;line-height:1.45}
.sw .rgb{font-family:var(--mono);font-size:10.5px;color:var(--muted2);margin-top:8px}
.pairings{display:flex;gap:14px;margin-top:24px;flex-wrap:wrap}
.pair{flex:1;min-width:180px;border:1px solid var(--line);border-radius:2px;padding:16px;font-size:13px}
.pair .demo{font-family:var(--disp);font-weight:900;font-size:24px;text-transform:uppercase;letter-spacing:.02em;margin-bottom:10px}
.pair .lab{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.06em}
.pair.no{border-color:#3a2230}
.pair.no .demo{background:linear-gradient(90deg,var(--pink),var(--cyan));-webkit-background-clip:text;background-clip:text;color:transparent}
.pair.no .lab{color:var(--pink)}

/* ---------- TYPE ---------- */
.type-row{display:grid;grid-template-columns:150px 1fr;gap:30px;padding:30px 0;border-bottom:1px solid var(--line);align-items:start}
.type-row:last-child{border-bottom:none}
.type-meta .fam{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan)}
.type-meta .use{color:var(--muted);font-size:12px;margin-top:8px;line-height:1.5}
.spec-disp{font-family:var(--disp);font-weight:900;font-size:clamp(40px,7vw,86px);line-height:.92;text-transform:uppercase;letter-spacing:-.01em}
.spec-disp .g{color:var(--muted2);font-weight:700}
.spec-body p{font-size:18px;max-width:60ch;line-height:1.62}
.spec-body .scale{margin-top:16px;display:flex;gap:20px;align-items:baseline;flex-wrap:wrap;color:var(--muted)}
.spec-body .scale b{color:var(--paper);font-weight:500}
.spec-mono{font-family:var(--mono);font-size:15px;line-height:1.7;color:var(--cyan)}
.spec-mono .c{color:var(--muted)}

/* ---------- SONIC + PLAYER ---------- */
.sonic-top{display:grid;grid-template-columns:1.2fr 1fr;gap:40px;align-items:center}
.sig{font-size:16px;color:var(--paper);line-height:1.65;max-width:48ch}
.sig .hl{color:var(--cyan)}
.specs{display:flex;gap:12px;margin-top:24px;flex-wrap:wrap}
.stat{border:1px solid var(--line);border-radius:2px;padding:12px 16px;min-width:96px}
.stat .n{font-family:var(--disp);font-weight:900;font-size:26px;color:var(--pink);font-variant-numeric:tabular-nums}
.stat .l{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:3px}
#eq{width:100%;height:130px;display:block}

.player{margin-top:34px;border:1px solid var(--line);border-radius:4px;background:linear-gradient(180deg,var(--surface),#0a0c12);overflow:hidden}
.player-top{display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;padding:18px 20px}
.pbtn{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;flex:none}
.pbtn.playing::before{content:"";position:absolute;inset:-4px;border-radius:50%;border:1px solid var(--cyan);opacity:.6;animation:ring 1.4s ease-out infinite}
@keyframes ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.5);opacity:0}}
.ico-pp{width:18px;height:18px;position:relative}
.ico-pp i{position:absolute;background:var(--paper);transition:all .25s cubic-bezier(.4,0,.2,1)}
/* play = two bars rotated into a triangle-ish; we animate opacity between play/pause */
.ico-pp .bar1,.ico-pp .bar2{top:0;width:5px;height:18px;border-radius:1px}
.ico-pp .bar1{left:2px}.ico-pp .bar2{right:2px}
.ico-pp .tri{left:3px;top:0;width:0;height:0;background:transparent;border-left:14px solid var(--paper);border-top:9px solid transparent;border-bottom:9px solid transparent;transition:opacity .2s}
.paused .ico-pp .bar1,.paused .ico-pp .bar2{opacity:0}
.paused .ico-pp .tri{opacity:1}
.playing .ico-pp .bar1,.playing .ico-pp .bar2{opacity:1}
.playing .ico-pp .tri{opacity:0}
.now{min-width:0}
.now .t{font-family:var(--disp);font-weight:700;font-size:16px;text-transform:uppercase;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.now .e{font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vol{display:flex;align-items:center;gap:9px}
.vol .mute{width:34px;height:34px;border-radius:2px;display:grid;place-items:center;font-size:13px}
.range{-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:var(--line);cursor:pointer;outline:none}
.range::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--cyan);box-shadow:0 0 8px var(--cyan);transition:transform .15s}
.range::-webkit-slider-thumb:hover{transform:scale(1.25)}
.range::-moz-range-thumb{width:14px;height:14px;border:none;border-radius:50%;background:var(--cyan);box-shadow:0 0 8px var(--cyan)}
.vol .range{width:92px}
.seekwrap{padding:0 20px 8px}
.seekrow{display:flex;align-items:center;gap:12px}
.seek{flex:1;height:6px;border-radius:3px;background:var(--line);position:relative;cursor:pointer}
.seek .fill{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:3px;background:linear-gradient(90deg,var(--cyan),var(--pink))}
.seek .head{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;background:var(--paper);transform:translate(-50%,-50%) scale(0);transition:transform .15s;box-shadow:0 0 10px rgba(255,255,255,.6)}
.seek:hover .head{transform:translate(-50%,-50%) scale(1)}
.time{font-family:var(--mono);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums;min-width:38px;text-align:center}
.tracklist{border-top:1px solid var(--line)}
.trk{display:grid;grid-template-columns:26px 1fr auto;gap:14px;align-items:center;padding:13px 20px;cursor:pointer;border-bottom:1px solid rgba(32,36,47,.5);transition:background .2s,padding-left .2s}
.trk:last-child{border-bottom:none}
.trk:hover{background:rgba(0,240,255,.05);padding-left:26px}
.trk.active{background:linear-gradient(90deg,rgba(255,20,147,.10),transparent)}
.trk .idx{font-family:var(--mono);font-size:12px;color:var(--muted2)}
.trk.active .idx{color:var(--pink)}
.trk .tn{font-family:var(--body);font-weight:500;font-size:14px}
.trk .te{font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:2px}
.trk .bars{display:flex;gap:2px;align-items:flex-end;height:14px;opacity:0;transition:opacity .2s}
.trk.active .bars{opacity:1}
.trk .bars i{width:3px;background:var(--cyan);height:5px}
.trk.active.playing .bars i{animation:bars .9s ease-in-out infinite}
.trk .bars i:nth-child(2){animation-delay:.15s}.trk .bars i:nth-child(3){animation-delay:.3s}.trk .bars i:nth-child(4){animation-delay:.45s}
@keyframes bars{0%,100%{height:4px}50%{height:14px}}

/* ---------- VOICES ---------- */
.hero-voice{border:1px solid var(--pink);border-radius:2px;padding:28px;background:linear-gradient(120deg,rgba(255,20,147,.07),rgba(0,240,255,.04));margin-bottom:20px;transition:transform .25s,box-shadow .25s}
.hero-voice:hover{transform:translateY(-3px);box-shadow:0 20px 50px -30px var(--pink)}
.hero-voice .tag{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--pink)}
.hero-voice .nm{font-family:var(--disp);font-weight:900;font-size:clamp(24px,3vw,34px);text-transform:uppercase;margin:8px 0 4px}
.hero-voice .desc{color:var(--muted);font-size:14px;max-width:60ch}
.vid{font-family:var(--mono);font-size:12px;color:var(--cyan);margin-top:16px;display:flex;gap:22px;flex-wrap:wrap}
.vid b{color:var(--paper);font-weight:400}
.cast{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.vc{border:1px solid var(--line);border-radius:2px;padding:15px;background:var(--surface);transition:transform .2s,border-color .2s}
.vc:hover{transform:translateY(-3px);border-color:var(--cyan)}
.vc .r{font-family:var(--disp);font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.04em}
.vc .who{color:var(--muted);font-size:11.5px;margin-top:5px;line-height:1.4;min-height:2.7em}
.vc .id{font-family:var(--mono);font-size:10px;color:var(--muted2);margin-top:10px;word-break:break-all}

/* ---------- CATALOG ---------- */
.records{border-top:1px solid var(--line)}
.rec{display:grid;grid-template-columns:34px 1fr auto 22px;gap:16px;align-items:center;
  padding:16px 4px;border-bottom:1px solid var(--line);color:var(--paper);transition:padding-left .22s,background .22s}
.rec:hover{padding-left:16px;background:rgba(0,240,255,.045)}
.rec-n{font-family:var(--mono);font-size:12px;color:var(--muted2)}
.rec:hover .rec-n{color:var(--pink)}
.rec-t{font-family:var(--disp);font-weight:700;font-size:16px;text-transform:uppercase;letter-spacing:.02em;display:block}
.rec-b{color:var(--muted);font-size:12.5px;margin-top:3px;display:block}
.rec-meta{text-align:right;white-space:nowrap}
.rec-g{font-family:var(--mono);font-size:11px;color:var(--cyan);letter-spacing:.05em;display:block}
.rec-tr{font-family:var(--mono);font-size:10.5px;color:var(--muted2);display:block;margin-top:3px}
.rec-go{font-family:var(--mono);color:var(--muted2);transition:transform .22s,color .22s}
.rec:hover .rec-go{color:var(--cyan);transform:translate(3px,-3px)}
.rec-note{margin-top:20px;font-size:13px;color:var(--muted)}
.rec-note b{color:var(--paper);font-weight:500}

/* ---------- LINKS ---------- */
.lgrp{margin-bottom:26px}
.lgrp-h{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted2);margin-bottom:12px}
.lgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.lnk{position:relative;display:block;padding:16px 16px 14px;border:1px solid var(--line);border-radius:3px;
  background:var(--surface);overflow:hidden;transition:transform .2s,border-color .2s,box-shadow .2s}
.lnk::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--pink);transform:scaleY(0);transform-origin:top;transition:transform .22s}
.lnk:hover{transform:translateY(-3px);border-color:var(--cyan);box-shadow:0 14px 40px -22px var(--cyan)}
.lnk:hover::before{transform:scaleY(1)}
.lnk-l{font-family:var(--disp);font-weight:700;font-size:15px;text-transform:uppercase;letter-spacing:.03em;color:var(--paper);display:block}
.lnk-d{color:var(--muted);font-size:12px;margin-top:4px;display:block}
.lnk-u{font-family:var(--mono);font-size:11px;color:var(--cyan);margin-top:12px;display:flex;justify-content:space-between;align-items:center}
.lnk-u i{font-style:normal;transition:transform .2s}
.lnk:hover .lnk-u i{transform:translate(3px,-3px)}
/* ---------- STUDIO ---------- */
.studio-lede{font-size:16px;color:var(--paper);line-height:1.65;max-width:58ch}
.studio-lede b{color:var(--cyan);font-weight:500}
.manifesto{display:flex;flex-wrap:wrap;gap:9px;margin:22px 0 30px}
.mchip{font-family:var(--mono);font-size:11px;letter-spacing:.03em;color:var(--paper);border:1px solid var(--line);border-radius:20px;padding:7px 13px;transition:transform .15s,border-color .15s,color .15s}
.mchip:hover{transform:translateY(-2px);border-color:var(--pink);color:var(--pink)}
.mchip::before{content:"› ";color:var(--pink)}
.prodgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.prod{border:1px solid var(--line);border-radius:3px;padding:15px 16px;background:var(--surface);transition:transform .2s,border-color .2s}
.prod:hover{transform:translateY(-3px);border-color:var(--cyan)}
.prod-h{display:flex;justify-content:space-between;align-items:center;gap:10px}
.prod-n{font-family:var(--disp);font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:.02em}
.prod-t{color:var(--muted);font-size:12.5px;margin-top:7px;line-height:1.45}
.prod-st{font-family:var(--mono);font-size:9px;letter-spacing:.14em;padding:3px 7px;border-radius:3px;white-space:nowrap}
.s-live{color:#050507;background:var(--cyan)}
.s-beta{color:#050507;background:var(--pink)}
.s-dev{color:var(--muted2);border:1px solid var(--line)}
.p-live{border-color:rgba(0,240,255,.4)}
.prodgrid .prod:first-child{border-color:var(--pink)}
.operator{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:start;margin-top:24px;padding:20px 22px;border:1px solid var(--line);border-radius:3px;background:linear-gradient(120deg,rgba(0,240,255,.05),transparent)}
.operator .who{font-family:var(--disp);font-weight:700;font-size:16px;text-transform:uppercase;letter-spacing:.03em}
.operator .det{color:var(--muted);font-size:13px;margin-top:8px;line-height:1.6;max-width:64ch}
.operator .pat{font-family:var(--mono);font-size:10.5px;color:var(--muted2);text-align:right;white-space:nowrap;line-height:1.7}
.taglines{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
.tagpill{font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:var(--muted);border:1px solid var(--line);border-radius:20px;padding:7px 14px}
.tagpill b{color:var(--cyan);font-weight:400}

footer{padding:64px 0 90px;border-top:1px solid var(--line);text-align:center}
footer .lock{font-family:var(--disp);font-weight:900;font-size:clamp(20px,3vw,30px);text-transform:uppercase;letter-spacing:.04em}
footer .lock .z{color:var(--pink)}
footer .mant{font-family:var(--mono);color:var(--cyan);letter-spacing:.16em;margin-top:14px;font-size:14px}
footer .loc{margin-top:26px;font-family:var(--mono);font-size:11.5px;color:var(--muted2);letter-spacing:.04em;line-height:2}

@media (max-width:820px){
  .essence-grid,.voice-grid,.sonic-top{grid-template-columns:1fr}
  .swatches{grid-template-columns:repeat(2,1fr)}
  .cast{grid-template-columns:repeat(2,1fr)}
  .type-row{grid-template-columns:1fr;gap:14px}
  .tuning{grid-column:auto}.sec-note{margin-left:0}
  nav{gap:0}
}
@media (prefers-reduced-motion:reduce){
  *{animation:none!important;scroll-behavior:auto;transition-duration:.01ms!important}
  .reveal{opacity:1;transform:none}
  .tagline .cur{opacity:1}
}
</style>

<nav id="nav">
  <span class="nav-dot"></span>
  <a href="#essence">Essence</a><a href="#voice">Voice</a><a href="#color">Color</a>
  <a href="#type">Type</a><a href="#sonic">Sound</a><a href="#voices">Voices</a>
  <a href="#catalog">Catalog</a><a href="#links">Links</a><a href="#studio">Studio</a>
</nav>

<div class="hero">
  <canvas id="scope"></canvas>
  <div class="hero-glow" id="glow"></div>
  <div class="wrap">
    <div class="hero-eyebrow">
      <span class="dot"></span><span class="eyebrow">Brand Kit</span>
      <span class="eyebrow" style="color:var(--muted2)">v1.1 · 2026</span>
      <span class="eyebrow" style="color:var(--muted2)">github.com/space-pirate-zero</span>
    </div>
    <h1 class="wordmark"><span class="l1">Space</span><br><span class="l2">Pirate</span><br><span class="l3">Zero</span></h1>
    <div class="tagline">&gt; signal finds signal<span class="cur"></span></div>
    <p class="hero-sub">Digital insurgent at large. The visual, verbal &amp; sonic identity behind the music, the books, and the Maneki Neko Death Cult audio drama.</p>
    <div class="taglines">
      <span class="tagpill">site · <b>Digital Insurgent at Large</b></span>
      <span class="tagpill">motto · <b>No algorithms. No noise. Just shipping.</b></span>
      <span class="tagpill">sonic · <b>Signal finds signal</b></span>
    </div>
    <div class="hero-cta">
      <button class="btn play-hero" id="heroPlay"><span class="ico ico-pp paused"><i class="bar1"></i><i class="bar2"></i><i class="tri"></i></span> Play the identity</button>
      <span class="eyebrow" style="color:var(--muted2)">4 tracks · live visualizer</span>
    </div>
  </div>
  <div class="scrolltip"><span>scroll ↓</span></div>
</div>

<section id="essence"><div class="wrap reveal">
  <div class="sec-head"><span class="sec-num">01</span><h2 class="sec-title">Essence</h2>
    <p class="sec-note">One subject, one job: expose the counterfeit and live honest.</p></div>
  <div class="essence-grid">
    <div>
      <p class="lede"><span class="pink">Diogenes with a laptop.</span> Deface the counterfeit, live honest. Snarky, punk, Atlanta-trap, hacker — cyberpunk-noir in look, <span class="cyan">industrial-goth</span> in sound, bar-at-midnight in voice.</p>
      <p class="bio">Burned-out DJ turned digital insurgent — narrates the counterfeit world at a bar at midnight, sneers up at the machine, never down at the broke. Irish grandmother in the blood; Atlanta in the bones.</p>
    </div>
    <ul class="prods">
      <li><span class="k">Music</span><span class="v"><b>6 albums released</b><span>Lambada on Saturn's Rings · Afternoon Delight · Vaudeville Nebula · +3</span></span></li>
      <li><span class="k">Audio</span><span class="v"><b>The Maneki Neko Death Cult</b><span>24 episodes · ~10.5 hours · in production</span></span></li>
      <li><span class="k">Books</span><span class="v"><b>Digital Insurgency &amp; more</b><span>forthcoming — in the monorepo</span></span></li>
      <li><span class="k">Studio</span><span class="v"><b>Spaceship Alpha 9</b><span>15-product indie studio · no VC</span></span></li>
    </ul>
  </div>
  <div class="operator">
    <div>
      <div class="who">Greg Chambers <span style="color:var(--muted2);font-weight:400;font-size:12px">— a.k.a. Space Pirate Zero</span></div>
      <div class="det">Enterprise architect, inventor, musician, gonzo journalist — "the frequency beneath the frequency." Founder &amp; CTO of Spaceship Alpha 9 with Daniela Chambers (the real-world Kat), Atlanta-based, no VC. Formerly Global Group Director of Digital Innovation at Coca-Cola.</div>
    </div>
    <div class="pat">US&nbsp;11432994<br>Intelligence Engine<br><br>US&nbsp;11600383<br>Theft-Prevention</div>
  </div>
</div></section>

<section id="voice"><div class="wrap reveal">
  <div class="sec-head"><span class="sec-num">02</span><h2 class="sec-title">Voice &amp; Tone</h2>
    <p class="sec-note">What SPZ says. Pair with the Narrator voice for how it sounds.</p></div>
  <div class="voice-grid">
    <div class="card"><h3>The benchmark</h3><p class="bench">Someone talking at a <em>bar at midnight</em>. If it reads like a press release, it failed.</p></div>
    <div class="card"><h3>The two gears</h3>
      <table class="gears">
        <tr><th>Gear</th><th>When</th><th>Feel</th></tr>
        <tr><td class="g frame">Frame</td><td>Open &amp; close</td><td>Dry, knowing, fable-cadence. Serling. Already knows how it ends.</td></tr>
        <tr><td class="g scene">Scene</td><td>Inside the story</td><td>Hot, present, reckless. Thompson. The needle's in.</td></tr>
      </table></div>
    <div class="rule" style="grid-column:1/-1"><span class="big">Punch up, never down.</span>
      <span class="sub">Every sneer aims at the system, the machine, the fail-up rich, the beige — never at workers, the broke, or ordinary people. The one rule that never bends.</span></div>
    <div class="card" style="grid-column:1/-1"><h3>Banned words — kill on sight</h3>
      <div class="banned">
        <span class="chip">leverage</span><span class="chip">synergy</span><span class="chip">ecosystem</span><span class="chip">paradigm</span><span class="chip">seamless</span><span class="chip">robust</span><span class="chip">utilize</span><span class="chip">delve</span><span class="chip">tapestry</span><span class="chip">game-changer</span><span class="chip">move the needle</span><span class="chip">empower</span><span class="chip">best-in-class</span><span class="chip">holistic</span><span class="chip">cutting-edge</span><span class="chip">disruptive</span><span class="chip">scalable</span><span class="chip">streamline</span><span class="chip">innovative</span><span class="chip">transform</span>
      </div></div>
    <div class="tuning"><p>Here's a thing nobody tells you about dying on purpose: the trick isn't the courage. The trick is the dosage. Too little and you just throw up on your own decks in front of forty people in fishnets. Too much and you don't come back to write the part where it gets interesting.</p>
      <div class="attr">Tuning fork — Door 1 cold open</div></div>
  </div>
</div></section>

<section id="color"><div class="wrap reveal">
  <div class="sec-head"><span class="sec-num">03</span><h2 class="sec-title">Color</h2>
    <p class="sec-note">Two neons, one void. Click a swatch to copy its hex.</p></div>
  <div class="swatches" id="swatches">
    <div class="sw"><div class="chip" style="background:#050507" data-hex="#030303"><span class="hex" style="color:#8a90a0">#030303</span></div><div class="meta"><div class="name">Void</div><div class="role">Primary ground. Near-black, never #000 — a hair of warmth.</div><div class="rgb">rgb(3,3,3)</div></div></div>
    <div class="sw"><div class="chip" style="background:#ff1493" data-hex="#FF1493"><span class="hex" style="color:#050507">#FF1493</span></div><div class="meta"><div class="name">Pink</div><div class="role">Primary accent. The punk shout, the title glow.</div><div class="rgb">rgb(255,20,147)</div></div></div>
    <div class="sw"><div class="chip" style="background:#00f0ff" data-hex="#00F0FF"><span class="hex" style="color:#050507">#00F0FF</span></div><div class="meta"><div class="name">Cyan</div><div class="role">Secondary accent. The signal, the terminal glow.</div><div class="rgb">rgb(0,240,255)</div></div></div>
    <div class="sw"><div class="chip" style="background:#e8e8e8" data-hex="#E8E8E8"><span class="hex" style="color:#050507">#E8E8E8</span></div><div class="meta"><div class="name">Paper</div><div class="role">Body text on void. Dirty off-white, newsprint.</div><div class="rgb">rgb(232,232,232)</div></div></div>
    <div class="sw"><div class="chip" style="background:#8a90a0" data-hex="#8A90A0"><span class="hex" style="color:#050507">#8A90A0</span></div><div class="meta"><div class="name">Muted</div><div class="role">De-emphasis — metadata, rules, secondary text.</div><div class="rgb">rgb(138,144,160)</div></div></div>
  </div>
  <div class="pairings">
    <div class="pair" style="background:#050507"><div class="demo" style="color:var(--pink)">Signal</div><div class="lab">pink on void — primary</div></div>
    <div class="pair" style="background:#050507"><div class="demo" style="color:var(--cyan)">Signal</div><div class="lab">cyan on void — the signal</div></div>
    <div class="pair" style="background:#050507"><div class="demo" style="color:var(--paper)">Signal</div><div class="lab">paper on void — body</div></div>
    <div class="pair no"><div class="demo">Never</div><div class="lab">pink on cyan vibrates — always separate the two neons with void or paper</div></div>
  </div>
</div></section>

<section id="type"><div class="wrap reveal">
  <div class="sec-head"><span class="sec-num">04</span><h2 class="sec-title">Typography</h2>
    <p class="sec-note">Orbitron shouts. Space Grotesk speaks. JetBrains Mono computes.</p></div>
  <div class="type-row"><div class="type-meta"><div class="fam">Orbitron</div><div class="use">Display · titles · wordmark. Weights 900 / 700. All-caps, airport-shelf readable.</div></div>
    <div class="spec-disp">SPACE<br><span class="g">PIRATE</span> ZERO</div></div>
  <div class="type-row"><div class="type-meta"><div class="fam">Space Grotesk</div><div class="use">Body &amp; UI. Weights 400 / 500 / 700. Warm-geometric grotesque that still reads near-future.</div></div>
    <div class="spec-body"><p>The door's song becomes the episode's theme only in its instrumental form; everything under the spoken word is instrumental. The narration is never fought by sung lyrics — it stays fully intelligible, ducked low, bar-at-midnight close.</p>
      <div class="scale"><span>Aa</span><b>400 Regular</b><b>500 Medium</b><b>700 Bold</b><span>0–9 tabular</span></div></div></div>
  <div class="type-row"><div class="type-meta"><div class="fam">JetBrains Mono</div><div class="use">Code · terminal · data · labels. The hacker voice made visible — often set in cyan.</div></div>
    <div class="spec-mono">voice_id = <span style="color:var(--pink)">"8bOIcU4hJx9LYJV4NS1I"</span><br>model    = <span style="color:var(--pink)">"eleven_v3"</span><br><span class="c"># signal finds signal — 70 BPM, ~-16 LUFS</span></div></div>
</div></section>

<section id="sonic"><div class="wrap reveal">
  <div class="sec-head"><span class="sec-num">05</span><h2 class="sec-title">Sonic Identity</h2>
    <p class="sec-note">Press play — the visualizers run on the real audio.</p></div>
  <div class="sonic-top">
    <div>
      <p class="sig">An <span class="hl">industrial-goth engine</span> — deep distorted 808 sub-bass, pounding industrial kick, cold detuned analog synths, cyberpunk arpeggios, strobe-hum drone, vinyl/VHS grit, neon reverb, and a ghost of Fosse muted trumpet. One haunting romantic motif that swells then dissolves. A single beckoning-cat bell is the mnemonic.</p>
      <div class="specs">
        <div class="stat"><div class="n" data-count="70">0</div><div class="l">BPM</div></div>
        <div class="stat"><div class="n" data-count="-16" data-suffix="">0</div><div class="l">dB bed duck</div></div>
        <div class="stat"><div class="n" data-count="0.97" data-dec="2">0</div><div class="l">limiter ceil</div></div>
        <div class="stat"><div class="n" data-count="24">0</div><div class="l">scored eps</div></div>
      </div>
    </div>
    <canvas id="eq"></canvas>
  </div>

  <div class="player" id="player">
    <div class="player-top">
      <button class="btn pbtn paused" id="pp" aria-label="Play/Pause"><span class="ico-pp"><i class="bar1"></i><i class="bar2"></i><i class="tri"></i></span></button>
      <div class="now"><div class="t" id="nowT">Signal Finds Signal</div><div class="e" id="nowE">Press play to hear the identity</div></div>
      <div class="vol">
        <button class="btn mute" id="mute" aria-label="Mute">♪</button>
        <input class="range" id="vol" type="range" min="0" max="1" step="0.01" value="0.8" aria-label="Volume">
      </div>
    </div>
    <div class="seekwrap"><div class="seekrow">
      <span class="time" id="cur">0:00</span>
      <div class="seek" id="seek"><div class="fill" id="fill"></div><div class="head" id="head"></div></div>
      <span class="time" id="dur">0:00</span>
    </div></div>
    <div class="tracklist" id="tracklist"></div>
  </div>
</div></section>

<section id="voices"><div class="wrap reveal">
  <div class="sec-head"><span class="sec-num">06</span><h2 class="sec-title">Voices</h2>
    <p class="sec-note">ElevenLabs cast, eleven_v3. Keep the Narrator at stability ≥ 0.5.</p></div>
  <div class="hero-voice">
    <div class="tag">Hero voice · Space Pirate Zero</div><div class="nm">Narrator</div>
    <p class="desc">A custom ElevenLabs Voice Design voice — raspy, faint Belfast lilt, raw punk nihilist who turns tender. Reuse it for any SPZ narration, brand spot, trailer VO, or audio drama.</p>
    <div class="vid"><span>id <b>8bOIcU4hJx9LYJV4NS1I</b></span><span>model <b>eleven_v3</b></span><span>stab <b>0.5</b></span><span>sim <b>0.85</b></span><span>style <b>0.35</b></span><span>speed <b>1.08</b></span></div>
  </div>
  <div class="cast">
    <div class="vc"><div class="r">Kat</div><div class="who">The beloved. Velvety, knowing, tender. (Daniela / Cosmic Swing Kat.)</div><div class="id">pFZP5JQG7iQjIQuC4Bku</div></div>
    <div class="vc"><div class="r">Woman</div><div class="who">Cult agent. Posh, affectless, menace by restraint.</div><div class="id">4JHJuokHot8d75SnR53J</div></div>
    <div class="vc"><div class="r">Man</div><div class="who">Cult agent. Cold, condescending, reasonable-sounding menace.</div><div class="id">agL69Vji082CshT65Tcy</div></div>
    <div class="vc"><div class="r">Bearded</div><div class="who">The kind one. Warm, unhurried, gives nothing away.</div><div class="id">JBFqnCBsd6RMkjVDRZzb</div></div>
    <div class="vc"><div class="r">Guest</div><div class="who">Bit parts &amp; the marks. Husky, flexible.</div><div class="id">N2lVS1w4EtoT3dr4eOWO</div></div>
  </div>
</div></section>

<section id="catalog"><div class="wrap reveal">
  <div class="sec-head"><span class="sec-num">07</span><h2 class="sec-title">Catalog</h2>
    <p class="sec-note">The released discography. Click any record to open it.</p></div>
  <div class="records">
__CATALOG__
  </div>
  <p class="rec-note">Also streaming on <a href="https://open.spotify.com/artist/5hsu0KPjwVKMCx1hAMFvI4" target="_blank" rel="noopener">Spotify</a> &amp; <a href="https://music.apple.com/us/artist/space-pirate-zero/1751347344" target="_blank" rel="noopener">Apple Music</a>. In production: <b>Signal Finds Signal</b> (24-track companion to the Neko Death Cult audio drama) — heard in the Sound player above.</p>
</div></section>

<section id="links"><div class="wrap reveal">
  <div class="sec-head"><span class="sec-num">08</span><h2 class="sec-title">Links &amp; Presence</h2>
    <p class="sec-note">Every channel, pulled from spacepiratezero.com. Opens in a new tab.</p></div>
__LINKS__
</div></section>

<section id="studio"><div class="wrap reveal">
  <div class="sec-head"><span class="sec-num">09</span><h2 class="sec-title">The Studio</h2>
    <p class="sec-note">SPZ is the flagship brand of Spaceship Alpha 9. Pulled from the SA9 repo.</p></div>
  <p class="studio-lede"><b>Spaceship Alpha 9</b> — an AI-native indie software studio. Fifteen products across AI, music, fashion, gaming, privacy &amp; infrastructure. <b>No investors. No board. No permission required.</b> Captain: Greg Chambers, with Daniela Chambers.</p>
  <div class="manifesto">__MANIFESTO__</div>
  <div class="prodgrid">__PRODUCTS__</div>
  <p class="rec-note">One <b>Space Tokens</b> credit system + Keycloak SSO across the fleet. Sites live in the repo, not the web: <a href="https://spaceshipalpha9.co" target="_blank" rel="noopener">spaceshipalpha9.co</a> · <a href="https://stylelift.fashion" target="_blank" rel="noopener">stylelift.fashion</a> (Free forever · Pro $9.99/mo · 512-dim Style DNA · 87% fit confidence).</p>
</div></section>

<footer><div class="wrap reveal">
  <div class="lock">Space Pirate <span class="z">Zero</span></div>
  <div class="mant">&gt; signal finds signal</div>
  <div class="loc">brand/spz/ · version-controlled<br>~/.claude/brand/spz/ · global reuse</div>
</div></footer>

<audio id="audio" crossorigin="anonymous" preload="metadata"></audio>
<script>
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TRACKS = [__TRACKS__];

  /* ---------- ripple on every .btn ---------- */
  document.querySelectorAll('.btn').forEach(function(b){
    b.addEventListener('click',function(e){
      var r=b.getBoundingClientRect(),s=document.createElement('span');
      s.className='ripple';var d=Math.max(r.width,r.height);
      s.style.width=s.style.height=d+'px';s.style.left=(e.clientX-r.left)+'px';s.style.top=(e.clientY-r.top)+'px';
      b.appendChild(s);setTimeout(function(){s.remove();},560);
    });
  });

  /* ---------- swatch copy ---------- */
  document.querySelectorAll('#swatches .chip').forEach(function(c){
    c.addEventListener('click',function(){
      var hex=c.getAttribute('data-hex');
      if(navigator.clipboard) navigator.clipboard.writeText(hex);
      var h=c.querySelector('.hex'),old=h.textContent;h.textContent='copied ✓';
      setTimeout(function(){h.textContent=old;},900);
    });
  });

  /* ---------- reveal on scroll + stat count-up ---------- */
  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(en.isIntersecting){en.target.classList.add('in');
      en.target.querySelectorAll('[data-count]').forEach(countUp);io.unobserve(en.target);}
  });},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
  function countUp(el){
    if(reduce){el.textContent=el.getAttribute('data-count');return;}
    var end=parseFloat(el.getAttribute('data-count')),dec=+(el.getAttribute('data-dec')||0),t0=null;
    function step(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/900),v=end*(1-Math.pow(1-p,3));
      el.textContent=dec?v.toFixed(dec):Math.round(v);if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  }

  /* ---------- nav scroll-spy + border ---------- */
  var nav=document.getElementById('nav'),links=[].slice.call(nav.querySelectorAll('a'));
  var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));});
  function spy(){
    nav.classList.toggle('scrolled',window.scrollY>20);
    var y=window.scrollY+120,idx=0;
    secs.forEach(function(s,i){if(s&&s.offsetTop<=y)idx=i;});
    links.forEach(function(a,i){a.classList.toggle('active',i===idx);});
  }
  window.addEventListener('scroll',spy,{passive:true});spy();

  /* ---------- hero pointer glow + magnetic buttons ---------- */
  var glow=document.getElementById('glow');
  if(!reduce){
    document.querySelector('.hero').addEventListener('pointermove',function(e){
      var r=this.getBoundingClientRect();
      glow.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
      glow.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
    });
    document.querySelectorAll('.play-hero,.pbtn').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();
        b.style.transform='translate('+((e.clientX-r.left-r.width/2)/6)+'px,'+((e.clientY-r.top-r.height/2)/6)+'px)';});
      b.addEventListener('pointerleave',function(){b.style.transform='';});
    });
  }

  /* ---------- AUDIO ENGINE ---------- */
  var audio=document.getElementById('audio'),ctx,analyser,gain,srcNode,freq,wave,cur=0,started=false;
  var pp=document.getElementById('pp'),heroPlay=document.getElementById('heroPlay');
  var nowT=document.getElementById('nowT'),nowE=document.getElementById('nowE');
  var fill=document.getElementById('fill'),head=document.getElementById('head'),seek=document.getElementById('seek');
  var curT=document.getElementById('cur'),durT=document.getElementById('dur');
  var vol=document.getElementById('vol'),mute=document.getElementById('mute');
  var tl=document.getElementById('tracklist');

  TRACKS.forEach(function(t,i){
    var row=document.createElement('div');row.className='trk';row.dataset.i=i;
    row.innerHTML='<span class="idx">'+String(i+1).padStart(2,'0')+'</span>'+
      '<div><div class="tn">'+t.name+'</div><div class="te">'+t.era+'</div></div>'+
      '<div class="bars"><i></i><i></i><i></i><i></i></div>';
    row.addEventListener('click',function(){select(i,true);});
    tl.appendChild(row);
  });
  var rows=[].slice.call(tl.children);

  function fmt(s){s=s||0;var m=Math.floor(s/60),x=Math.floor(s%60);return m+':'+(x<10?'0':'')+x;}
  function ensureCtx(){
    if(ctx)return;
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    srcNode=ctx.createMediaElementSource(audio);
    analyser=ctx.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=.8;
    gain=ctx.createGain();gain.gain.value=parseFloat(vol.value);
    srcNode.connect(analyser);analyser.connect(gain);gain.connect(ctx.destination);
    freq=new Uint8Array(analyser.frequencyBinCount);wave=new Uint8Array(analyser.fftSize);
  }
  function select(i,play){
    cur=i;audio.src=TRACKS[i].src;nowT.textContent=TRACKS[i].name;nowE.textContent=TRACKS[i].era;
    rows.forEach(function(r,k){r.classList.toggle('active',k===i);});
    if(play)audio.play();
  }
  function setPlayUI(on){
    pp.classList.toggle('playing',on);pp.classList.toggle('paused',!on);
    var hp=heroPlay.querySelector('.ico-pp');hp.classList.toggle('playing',on);hp.classList.toggle('paused',!on);
    heroPlay.childNodes[heroPlay.childNodes.length-1].nodeValue = on?' Pause':' Play the identity';
    rows.forEach(function(r,k){r.classList.toggle('playing',on&&k===cur);});
  }
  function toggle(){
    ensureCtx();if(ctx.state==='suspended')ctx.resume();
    if(!started){started=true;if(!audio.src)select(cur,false);}
    if(audio.paused)audio.play();else audio.pause();
  }
  pp.addEventListener('click',toggle);heroPlay.addEventListener('click',function(){if(!audio.src)select(1,false);toggle();});
  audio.addEventListener('play',function(){setPlayUI(true);});
  audio.addEventListener('pause',function(){setPlayUI(false);});
  audio.addEventListener('ended',function(){select((cur+1)%TRACKS.length,true);});
  audio.addEventListener('loadedmetadata',function(){durT.textContent=fmt(audio.duration);});
  audio.addEventListener('timeupdate',function(){
    var p=audio.duration?audio.currentTime/audio.duration:0;
    fill.style.width=(p*100)+'%';head.style.left=(p*100)+'%';curT.textContent=fmt(audio.currentTime);
  });
  seek.addEventListener('click',function(e){var r=seek.getBoundingClientRect();
    if(audio.duration)audio.currentTime=((e.clientX-r.left)/r.width)*audio.duration;});
  vol.addEventListener('input',function(){if(gain)gain.gain.value=+vol.value;audio.muted=false;mute.textContent=+vol.value===0?'✕':'♪';});
  mute.addEventListener('click',function(){
    audio.muted=!audio.muted;mute.textContent=audio.muted?'✕':'♪';
    if(audio.muted)mute.animate([{transform:'translateX(0)'},{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:220});
  });
  select(1,false); // preload the theme as default

  /* ---------- VISUALIZERS (live when playing, ambient when idle) ---------- */
  function fit(cv){var r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1;
    cv.width=r.width*d;cv.height=r.height*d;var x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);return {x:x,w:r.width,h:r.height};}
  var scope=document.getElementById('scope'),eq=document.getElementById('eq');
  var s=fit(scope),e=fit(eq),t=0,et=0,N=48,seed=[];
  for(var k=0;k<N;k++)seed.push(0.25+Math.abs(Math.sin(k*1.7))*0.75);
  var live=function(){return analyser && !audio.paused;};

  function drawScope(){
    var x=s.x,w=s.w,h=s.h,mid=h*0.62;x.clearRect(0,0,w,h);
    if(live()){analyser.getByteTimeDomainData(wave);
      for(var pass=0;pass<2;pass++){x.beginPath();
        for(var i=0;i<=w;i++){var vi=Math.floor(i/w*wave.length),y=mid+((wave[vi]-128)/128)*h*0.42*(pass?0.6:1);
          i===0?x.moveTo(i,y):x.lineTo(i,y);}
        x.strokeStyle=pass?'rgba(255,20,147,0.55)':'rgba(0,240,255,0.75)';x.lineWidth=pass?1:1.6;x.stroke();}
    }else{
      for(var pass=0;pass<2;pass++){x.beginPath();
        for(var i=0;i<=w;i+=2){var ph=i/w*Math.PI*6+t*(pass?0.7:1),env=Math.sin(i/w*Math.PI);
          var y=mid+Math.sin(ph)*26*env*Math.sin(t*0.4+i*0.01)+Math.sin(ph*3.1)*7*env;
          i===0?x.moveTo(i,y):x.lineTo(i,y);}
        x.strokeStyle=pass?'rgba(255,20,147,0.5)':'rgba(0,240,255,0.6)';x.lineWidth=pass?1:1.4;x.stroke();}
      t+=0.02;
    }
    if(!reduce||live())requestAnimationFrame(drawScope);
  }
  function drawEq(){
    var x=e.x,w=e.w,h=e.h,bw=w/N;x.clearRect(0,0,w,h);
    if(live())analyser.getByteFrequencyData(freq);
    for(var k=0;k<N;k++){
      var amp;
      if(live()){amp=(freq[Math.floor(k/N*freq.length)]/255);amp=Math.max(0.03,amp);}
      else{var beat=Math.sin(et*2-k*0.18);amp=seed[k]*(0.4+0.35*Math.max(0,beat));}
      var bh=amp*h*0.9,bx=k*bw,by=h-bh;
      var g=x.createLinearGradient(0,by,0,h);g.addColorStop(0,'rgba(0,240,255,0.95)');g.addColorStop(1,'rgba(255,20,147,0.5)');
      x.fillStyle=g;x.fillRect(bx+bw*0.18,by,bw*0.64,bh);
    }
    if(!live())et+=0.05;
    if(!reduce||live())requestAnimationFrame(drawEq);
  }
  drawScope();drawEq();
  window.addEventListener('resize',function(){s=fit(scope);e=fit(eq);if(reduce){drawScope();drawEq();}});
})();
</script>
"""

full = (HTML.replace("__FONTFACE__", fontface).replace("__TRACKS__", tracks_js)
            .replace("__CATALOG__", catalog_html).replace("__LINKS__", links_html)
            .replace("__MANIFESTO__", manifesto_html).replace("__PRODUCTS__", studio_products_html))

# Make charset-independent: HTML text -> numeric entities, JS strings -> \u escapes.
# (base64 blobs are pure ASCII and pass through untouched.)
def ent(s):  return ''.join(c if ord(c) < 128 else f'&#{ord(c)};' for c in s)
def jsesc(s): return ''.join(c if ord(c) < 128 else f'\\u{ord(c):04x}' for c in s)
head, rest = full.split("<script>", 1)
body, tail = rest.split("</script>", 1)
full = ent(head) + "<script>" + jsesc(body) + "</script>" + ent(tail)

OUT.write_text(full)
print("wrote", OUT, OUT.stat().st_size, "bytes")
