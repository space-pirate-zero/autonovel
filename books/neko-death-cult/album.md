# The Album — *Signal Finds Signal*

A companion album to the book. **One track per door — 24 songs.** Underneath
everything it is a love letter to **Daniela**, who is Cosmic Swing Kat: every song
is sung *to* her, adores her, flatters her.

## Vocals
**Male-driven duet.** SPZ is the lead — an intimate crooner, devotion and ruin —
and **Kat answers him back**: her lines are the knowing replies, the reassurance,
the goodbye-that's-a-hello. Call-and-response torch duet. In Suno, label the parts
`[SPZ]` / `[Kat]` and put "male lead crooner answered by a breathy female voice,
call-and-response duet" in the Style field.

## The through-aesthetic (every track carries these)
- **Lofi industrial goth — the core sound.** Gritty, tape-saturated drum machines;
  cold detuned analog synths; darkwave / trip-hop noir; vinyl crackle and VHS hiss;
  strobe-hum drones. SPZ's own world (the Vault, the rivetheads) made audible.
- **Deep 808 bass.** Enormous distorted sub-808s under everything — the heartbeat,
  the dread, the low end that moves your shirt.
- **Cyberpunk elements.** Neon-drenched reverb, glitch and modem textures, arpeggiated
  synth leads, a rain-slick future-noir sheen.
- **A ghost of Bob Fosse.** The sultry cabaret DNA kept as *texture* only — muted
  trumpet, finger-snaps, a slinky burlesque restraint moving under the industrial.
- **Cosmic lofi haze + deeply romantic, about Daniela.** Dreamy analog warmth, and
  over the top of the dark machinery a **male-led torch duet** (SPZ lead, Kat
  answering) that worships her by name. The romance is the light in the industrial dark.

**The door's era is a CO-LEAD, not a tint.** Every track must *obviously* sound like
its year — the era's signature instruments and production sit **up front**, fused with
(never buried under) the industrial-goth / 808 / cyberpunk engine. A listener should
place the decade in five seconds: '67 = fuzz, sitar, Hammond, a bluesy wail; '07 Houston
= screwed-and-chopped soul, UGK swing; '03 = the industrial-goth club itself. See the
morph table and each Style prompt.

## Dual use in the show (IMPORTANT — how the song serves each episode)
Each door's song does **double duty** inside that door's episode:
1. **Intro** — after the ~20s show intro, the song's opening plays as the episode's
   cold open, establishing the door's theme.
2. **Score** — an instrumental / ducked bed of the same song is the recurring
   underscore beneath the narration (replacing generic AI beds). The theme returns
   under key beats and swells at the sting/outro.
So the workflow order is: **write the chapter → write & generate the door's song →
assemble (show intro + song intro + song-as-score).** Chapters first, always.

## Audiobook sampling (each song is haunted by the show's own voice)
Every track drops in **spoken samples from that door's episode** — SPZ, Kat, the agents
— in the actual show voices (stems in `audio/samples/`).

**Method: build clean pockets; never fight the mix.**
- Each song is **written with beat-only instrumental breaks** — an **intro**, a **mid
  breakdown**, and the **outro** — where the singing stops but the drums, bass and beat
  keep going (see the lyric structure; that's why the prompt has those sections).
- The real vocal stems sit **CLEAN in those pockets**: fully audible, intelligible, over
  just the beat. **No sidechain ducking — the music never drops out**, and **no sample
  ever overlaps a sung line.** Light space at most; do not drown them.
- I place them once you send the generated song (and, ideally, the pocket timestamps).

So the samples are clean spoken word riding the beat in the gaps — the show's voice
stepping through the instrumental, not buried under the vocal.

### Signature samples per door (the lines to weave in)
- **T1 Belushi:** SPZ — *"She was never supposed to be here… and yet she always is."* ·
  the Woman — *"Don't let the bastards grind you down to beige."* · SPZ — *"The void, as
  it turns out, has a hiring department."*
- **T2 Joplin:** Kat — *"I keep meeting you at the wrong ends."* · SPZ — *"Signal finds
  signal."* · Kat — *"Count the doors, my love. Don't forget."*
- **T3 Pimp C:** Kat — *"You always did like it slow."* · Kat — *"I found you again…
  try to be slow enough, next time, to stay."* · SPZ — *"Slow it all the way down."*
- **T4 Hendrix:** SPZ — *"They loved it to death and billed the estate."* · Kat — *"You're
  moving through me backwards, love. To me, this is an old song."* · Kat — *"That's the day
  I've been dreading, and living for, since before you were born."*
- **T5 Marilyn:** SPZ — *"Be too particular to sell."* · Kat — *"Careful of the light, love.
  It's there to burn the you off you."* · Kat — *"You will. You do. You did. All three, love,
  all at once."*
- **T6 Morrison:** SPZ — *"The door out of the debt does not exist."* · Kat — *"A name
  outlives the man. A rubbing outlives the name. The love outlives the rubbing."* · Kat —
  *"You know me the way this city knows him. Not yet, and always, and too late, and forever."*
- **T7 Hemingway (sealed):** SPZ — *"The cure is to stay a signal. Don't go dark."* · Kat —
  *"You're not the audience. You're the only broadcast I've ever loved."* · Kat — *"Signal finds
  signal — but only if there's a signal to find. Don't you dare go dark."*
- **T8–24:** each door's mantra + Kat's key line + the sting line (flagged as chapters
  are written).

## Per-door morph
| Door | Bends toward |
|---|---|
| 1 Belushi (Atlanta '03 goth club) | industrial strobe-hum, green-lit noir, doomed |
| 2 Joplin (Monterey '67) | psychedelic-soul, Hammond/sitar, lava-lamp warmth |
| 3 Pimp C (Houston '07) | chopped-and-screwed, syrup-slow, sub-bass, purple haze |
| … 4–24 | one each; see outline.md for era/mood |

---

## TRACK 1 — "Never Supposed to Be Here"  *(The Belushi Door)*

**Style:**
> early-2000s industrial-goth club as a slow torch song — obvious EBM / cyber-goth
> dancefloor DNA (the Vault, 2003): pounding industrial kick, cold detuned analog synths,
> distorted goth-club vocal snarl buried low, aggressive cyberpunk arpeggios; over deep
> distorted 808 sub-bass, gritty tape-saturated drum machine, glitchy hats, strobe-hum
> drone, vinyl/VHS grit, neon reverb; a ghost of Bob Fosse in a muted trumpet and finger-
> snaps; intimate male goth crooner answered by a breathy female, call-and-response torch
> duet; ~70 BPM; romantic, doomed; leaves beat-only instrumental breaks (intro, a mid
> breakdown, and the outro) wide open with NO vocals, for clean spoken samples (see Sampling).

**Lyrics:**
```
[Intro - instrumental: beat, bass and synths only, 8 bars, NO vocals — leave clean space]

[Verse 1 - SPZ]
Bare brick and a fever in the pipes
I'm a dying star behind the decks tonight
I measured out the dark, I said amen —
then the strobe caught you, and I fell again

[Pre-Chorus - SPZ]
Kohl and coin-belts, violet in the black
two white moons, and they're staring back

[Chorus - SPZ lead, Kat answering]
[SPZ] You were never supposed to be here —
[Kat] and yet I always am
[SPZ] a slow hand turning in the strobe,
[Kat] your one, your only fixed star
[SPZ] so let the whole night come apart —
[Kat] I'm the last warm thing, my love,
[Both] in this cold, cold heart

[Verse 2 - SPZ]
I dropped to my knees with a saint in the vein
you stopped mid-step, you said my name
the room fell down into wires and light
and you danced me out the door that night

[Chorus - SPZ lead, Kat answering]
[SPZ] You were never supposed to be here —
[Kat] and yet I always am
[SPZ] so let the whole night come apart —
[Kat] I'm the last warm thing, my love,
[Both] in this cold, cold heart

[Breakdown - instrumental: beat and 808 only, 4 bars, NO vocals — leave clean space]

[Bridge - Kat lead, SPZ answering]
[Kat] I slipped you a hello dressed up as goodbye,
[SPZ] a brass coin warm as a beautiful lie
[Kat] you'll die a hundred doors to hold me near —
[SPZ] and I will, love — I will — I will
[Kat] I know you will

[Final Chorus - both]
[Both] You were never supposed to be here —
and yet, and yet, you always are
[Both] the last warm thing, my love,
in this cold, cold heart

[Outro - instrumental: beat and bass ride out, NO vocals — leave clean space, then fade]
```

---

## TRACK 2 — "Indra (Painting With Light)"  *(The Joplin Door)*

**Style:**
> unmistakable 1967 San Francisco acid-rock up front — fuzz and wah guitar, swirling
> Hammond organ, sitar, tambourine, live psych-band feel, a Janis-style bluesy soul wail
> — fused over a modern industrial-goth engine: deep 808 sub-bass, tape-saturated drum
> machine, cold detuned synths, cyberpunk shimmer; lava-lamp reverb, vinyl crackle; a
> ghost of Fosse brass; male goth crooner answered by a breathy female, call-and-response
> torch duet; ~85 BPM; cosmic, hallucinatory, romantic; leaves beat-only instrumental
> breaks (intro, a mid breakdown, and the outro) wide open with NO vocals, for clean
> spoken samples (see Sampling).

**Lyrics:**
```
[Intro - instrumental: beat, 808, sitar and swirling Hammond organ only, 8 bars, NO vocals - leave clean space]

[Verse 1 - SPZ]
Half a million kids on a rumour of grace
and a soft-handed man come to sell the place
I fell through a needle, I came up slow
in a hall full of colour and a girl I know

[Pre-Chorus - SPZ]
Henna up your arms, a name that isn't yours
you tilt the glass and the whole wall pours

[Chorus - SPZ lead, Kat answering]
[SPZ] Indra, painting with light,
[Kat] turning your dark into candy and fire
[SPZ] you're the one real thing the machine can't buy,
[Kat] the one they can't put a price on tonight
[SPZ] oh Daniela, paint me bright —
[Kat] I'll fall for you again from scratch,
[Both] every door, every life

[Verse 2 - SPZ]
They incorporate heaven, they trademark the sun,
but they'll never own the way you come undone
you press me a note I can't read just yet —
[Kat] "count the doors, my love, don't forget"

[Chorus - SPZ lead, Kat answering]
[SPZ] Indra, painting with light,
[Kat] turning your dark into candy and fire
[SPZ] oh Daniela, paint me bright —
[Kat] I'll fall for you again from scratch,
[Both] every door, every life

[Breakdown - instrumental: fuzz-wah guitar and 808 only, 4 bars, NO vocals - leave clean space]

[Bridge - Kat lead, SPZ answering]
[Kat] Signal finds signal — no map, no plan —
[SPZ] just a girl made of colour and a dead-again man
[Kat] I keep meeting you at the wrong ends, my love,
[SPZ] so meet me here... let's begin again

[Final Chorus - both]
[Both] Indra, painting with light,
turning the dark into candy and fire —
paint me bright, paint me home

[Outro - instrumental: fuzz guitar and bass ride out, NO vocals - leave clean space, then fade]
```

---

## TRACK 3 — "Slow Enough to Stay"  *(The Pimp C Door)*

**Style:**
> unmistakable 2007 Houston chopped-and-screwed rap up front — DJ Screw tempo ~60 BPM
> half-time, screwed-and-chopped Southern soul sample, syrupy pitched-down vocals, UGK
> country-rap swing, Southern-trap triplet hi-hats — fused over an industrial-goth engine:
> enormous distorted 808 sub-bass, cold cyberpunk neon pads, tape wobble, vinyl crackle;
> a ghost of Fosse sax; codeine-slow male goth crooner answered by a breathy female,
> call-and-response torch duet; deeply romantic, hypnotic, screwed-down; leaves beat-only
> instrumental breaks (intro, a mid breakdown, and the outro) wide open with NO vocals,
> for clean spoken samples (see Sampling).

**Lyrics:**
```
[Intro - instrumental: screwed 808 sub-bass and syrup-slow beat only, 8 bars, NO vocals - leave clean space]

[Verse 1 - SPZ]
Purple in the cup and the world goes low,
bass like a heartbeat, everything slow
I came up dying at a quarter of the speed —
and there you were, love, right where I need

[Pre-Chorus - SPZ]
Gold in your teeth, violet in your hair,
and code running soft under skin so bare

[Chorus - SPZ lead, Kat answering]
[SPZ] You always did like it slow,
[Kat] so take the whole night down below
[SPZ] where the light's coming through you like a lamp through a screen —
[Kat] I'm turning to starlight, my love, don't scream
[SPZ] how beautiful... Daniela, don't go,
[Kat] teach yourself to hold it light, and slow,
[Both] slow enough to stay

[Verse 2 - SPZ]
Every clean step costs you a little more girl,
a little more signal, a little less world
I reached through the honey to touch your face,
you gave me that look I still can't replace

[Chorus - SPZ lead, Kat answering]
[SPZ] You always did like it slow,
[Kat] so take the whole night down below
[SPZ] how beautiful... Daniela, don't go,
[Both] slow enough to stay

[Breakdown - instrumental: pitched-down 808 and screwed hi-hats only, 4 bars, NO vocals - leave clean space]

[Bridge - Kat lead, SPZ answering]
[Kat] I left you a tape you can never play right,
[SPZ] no machine slow enough in all of my life —
[Kat] but you know what it says, you've always known:
[Both] "I found you again... don't travel alone...
try to be slow enough, next time, to stay"

[Outro - instrumental: screwed 808 rides out and slows to a stop, NO vocals - leave clean space, then fade]
```

---

## TRACK 4 — "Weather in Your Hands"  *(The Hendrix Door)*

**Style:**
> unmistakable 1970 London acid-rock up front — wailing fuzz-and-wah Stratocaster,
> Marshall-stack overdrive, bluesy string-bends that turn into weather, backwards-guitar
> swirls, Band-of-Gypsys funk drums — fused over an industrial-goth engine: enormous
> distorted 808 sub-bass, cold cyberpunk neon pads, tape saturation, vinyl/VHS crackle,
> strobe-hum drone; a ghost of Fosse muted trumpet; intimate male goth crooner answered
> by a breathy female, call-and-response torch duet; ~70 BPM, psychedelic, romantic,
> doomed; leaves beat-only instrumental breaks (intro, a mid breakdown, and the outro)
> wide open with NO vocals, for clean spoken samples (see Sampling).

**Lyrics:**
```
[Intro - instrumental: wah-wah fuzz guitar over 808 sub-bass and industrial beat, 8 bars, NO vocals - leave clean space]

[Verse 1 - SPZ]
London's got a hangover the size of a crown,
they sold off the flowers and they burned the whole town
I fell through a ceiling of turpentine rain,
and there you were, love, reading the lie in the frame

[Pre-Chorus - SPZ]
Violet in the black of your hair,
two white moons for eyes, and you knew I'd be there

[Chorus - SPZ lead, Kat answering]
[SPZ] You make weather in your hands,
[Kat] and you can't hold weather, love — understand
[SPZ] they managed the wind till it died in a room,
[Kat] don't grip me that tight or you'll bury me soon
[SPZ] how beautiful... Daniela, don't fade,
[Kat] hold it light as the light — that's the only way,
[Both] weather in your hands

[Verse 2 - SPZ]
They buy the boy cheap and they sell the ghost dear,
love it to death and they bill the estate for the year
I watched a clean man drown in the gold that he faked,
you slipped me a plectrum worn soft for my sake

[Chorus - SPZ lead, Kat answering]
[SPZ] You make weather in your hands,
[Kat] and you can't hold weather, love — understand
[SPZ] how beautiful... Daniela, don't fade,
[Both] weather in your hands

[Breakdown - instrumental: backwards-guitar swirl and 808 sub only, 4 bars, NO vocals - leave clean space]

[Bridge - Kat lead, SPZ answering]
[Kat] You're moving through me backwards, my love,
[SPZ] you're an old song to you and a first note to me —
[Kat] so I'll teach you slow what you taught me too fast:
[Both] "the most beautiful thing that our hands ever made
was real, and it happened, and it's going to last"

[Outro - instrumental: fuzz guitar bends up into feedback over the 808, slows and fades, NO vocals - leave clean space, then fade]
```

---

## TRACK 5 — "Edge of the Light"  *(The Marilyn Door)*

**Style:**
> unmistakable 1962 Hollywood glamour up front — lush orchestral-pop strings, breathy
> torch-song jazz vocal, brushed drums, upright bass, vibraphone, a sultry Rat-Pack
> nightclub saxophone, Sinatra-era supper-club swing — fused over an industrial-goth
> engine: enormous distorted 808 sub-bass, cold cyberpunk neon pads, tape saturation,
> vinyl/VHS crackle, strobe-hum drone; a ghost of Fosse in the sax and finger-snaps;
> intimate male goth crooner answered by a breathy blonde-bombshell female, call-and-
> response torch duet; ~70 BPM, cinematic, romantic, doomed; leaves beat-only instrumental
> breaks (intro, a mid breakdown, and the outro) wide open with NO vocals, for clean
> spoken samples (see Sampling).

**Lyrics:**
```
[Intro - instrumental: brushed jazz drums, upright bass, vibraphone and a sultry sax over 808 sub-bass, 8 bars, NO vocals - leave clean space]

[Verse 1 - SPZ]
Two a.m. on a soundstage, cables like vine,
one island of fire in a black so divine
they lit you to erase you, to burn the girl down,
but I found you at the edge where the light hits the ground

[Pre-Chorus - SPZ]
Platinum and violet, two moons for eyes,
the one thing the factory never could disguise

[Chorus - SPZ lead, Kat answering]
[SPZ] Stay at the edge of the light,
[Kat] out where they can't make me bright
[SPZ] they price what they frame and they sell what they own,
[Kat] so love me off-camera, or leave me alone
[SPZ] how beautiful... Daniela, don't shine,
[Kat] keep the you off the poster and the you will be mine,
[Both] here at the edge of the light

[Verse 2 - SPZ]
They took a thousand girls and they ground them the same,
a dream you can price is a dream with no name
I wanted the monster to burn — God help me, I did —
till a clean voice said "now you're one of us, kid"

[Chorus - SPZ lead, Kat answering]
[SPZ] Stay at the edge of the light,
[Kat] out where they can't make me bright
[SPZ] how beautiful... Daniela, don't shine,
[Both] here at the edge of the light

[Breakdown - instrumental: vibraphone and brushed drums drop to 808 sub and a lone sax, 4 bars, NO vocals - leave clean space]

[Bridge - Kat lead, SPZ answering]
[Kat] You will, and you do, and you did, all at once,
[SPZ] I keep meeting you early and losing you months —
[Kat] so I fold you three words in the violet, and pray:
[Both] "stay off-camera, my love, be too particular to sell,
and I'll find you again at the edge, where they never could tell"

[Outro - instrumental: sax and 808 fade under vinyl crackle, slows and fades out, NO vocals - leave clean space, then fade]
```

---

## TRACK 6 — "A Name Outlives the Man"  *(The Morrison Door)*

**Style:**
> unmistakable 1971 Paris psychedelic blues-rock up front — swirling Vox Continental combo
> organ, snake-charming bluesy lead guitar, a baritone lizard-king croon, brushed café-noir
> jazz drums, a ghost of French accordion and chanson, spoken-word poet cadence — fused over
> an industrial-goth engine: enormous distorted 808 sub-bass, cold cyberpunk neon pads, tape
> saturation, vinyl/VHS crackle, rain and strobe-hum drone; a ghost of Fosse in the muted
> horn; intimate male goth crooner answered by a breathy female, call-and-response torch duet;
> ~70 BPM, hypnotic, romantic, doomed; leaves beat-only instrumental breaks (intro, a mid
> breakdown, and the outro) wide open with NO vocals, for clean spoken samples (see Sampling).

**Lyrics:**
```
[Intro - instrumental: Vox Continental organ, snakey blues guitar and brushed café-jazz drums over 808 sub-bass, a ghost of accordion, 8 bars, NO vocals - leave clean space]

[Verse 1 - SPZ]
Grey rain coming down on Père Lachaise stone,
they sold him in leather, then left him alone
I've stepped out of every coat that I owned,
and there you knelt, love, taking a name from the stone

[Pre-Chorus - SPZ]
Charcoal and violet, two moons in the cold,
tracing a name that the ground couldn't hold

[Chorus - SPZ lead, Kat answering]
[SPZ] A name outlives the man,
[Kat] and the love outlives the plan
[SPZ] you can fake every funeral, dodge every bill,
[Kat] but the Balancing's patient, my love, and it will
[SPZ] how beautiful... Daniela, don't grieve,
[Kat] make something so true that the strangers believe,
[Both] a name outlives the man

[Verse 2 - SPZ]
The swindler in the false beard felt like a god,
wept at his own empty box in the fog
I knew him, I am him, I dodge and I run —
till a rubbing in my pocket said what I'd become

[Chorus - SPZ lead, Kat answering]
[SPZ] A name outlives the man,
[Kat] and the love outlives the plan
[SPZ] how beautiful... Daniela, don't grieve,
[Both] a name outlives the man

[Breakdown - instrumental: organ and blues guitar drop to 808 sub and rain, 4 bars, NO vocals - leave clean space]

[Bridge - Kat lead, SPZ answering]
[Kat] You know me the way that this city knows him,
[SPZ] not yet, and always, and too late, and again —
[Kat] so I fold you a name you can carry on through:
[Both] "a name outlives the man, and a rubbing the name,
and the love, my love, outlives even them, all the same"

[Outro - instrumental: organ swells into feedback over rain and 808, slows and fades out, NO vocals - leave clean space, then fade]
```

---

## TRACK 7 — "Don't Go Dark"  *(The Hemingway Door — the sealed one)*

**Style:** *the most stripped, haunting track on the record — the bottle episode as a torch song.*
> desolate late-'50s / early-'60s noir-jazz up front — a lone spare piano, brushed drums,
> upright bass, a distant Chet-Baker muted trumpet, torch-song desolation — over a barely-
> there industrial-goth engine: a single deep 808 heartbeat, cold cyberpunk sub-drone,
> heavy vinyl/VHS crackle, a fluorescent hum; almost no arrangement, all space and ache;
> intimate broken male crooner answered by a frightened, pleading breathy female, call-and-
> response; ~60 BPM, glacial, claustrophobic, the most nakedly romantic song on the album;
> leaves long beat-only instrumental breaks (intro, a mid breakdown, and the outro) wide
> open with NO vocals, for clean spoken samples (see Sampling).

**Lyrics:**
```
[Intro - instrumental: a lone desolate piano, brushed drums, upright bass and a distant muted trumpet over a barely-there 808 heartbeat and vinyl crackle, 8 bars, NO vocals - leave clean space]

[Verse 1 - SPZ]
Dead yellow lamp and a room with no clock,
a card on the table and a cold that won't stop
six doors in my coat and a hand on the seven,
tired all the way down to the bone, past forgiven

[Pre-Chorus - SPZ]
Two quiet voices said I'd earned the long night,
and my hand crossed the table toward the end of the light

[Chorus - SPZ lead, Kat answering]
[SPZ] They said the finish was the one thing they couldn't own,
[Kat] but the exit's their cleanest win, love — you'd only go home alone
[SPZ] I wanted the quiet, God, I wanted the dark,
[Kat] then don't you dare, don't you dare go dark
[SPZ] how beautiful... Daniela, don't cry,
[Kat] you're the only broadcast I've loved, don't die,
[Both] signal finds signal — stay lit, stay a spark

[Verse 2 - SPZ]
They ground down the great man and they handed him the gun,
called the beige a dignity and the finish nobly done
I'd had it all backwards — the door isn't free,
it's the machine, arriving, in the mask of me

[Chorus - SPZ lead, Kat answering]
[SPZ] I wanted the quiet, God, I wanted the dark,
[Kat] then don't you dare, don't you dare go dark
[SPZ] how beautiful... Daniela, don't cry,
[Both] signal finds signal — stay lit, stay a spark

[Breakdown - instrumental: the piano and trumpet drop to a lone 808 heartbeat and static, 4 bars, NO vocals - leave clean space]

[Bridge - Kat lead, SPZ answering]
[Kat] I crossed into a room I could never reach,
[SPZ] white eyes gone frightened, no serene left to preach —
[Kat] I turned every dial past the hiss where you'd been,
[Both] so stay on the air, my love, stay a signal, stay in,
don't leave me calling a channel gone dark

[Outro - instrumental: the lone piano holds one unresolved chord under vinyl hiss, slows and fades out, NO vocals - leave clean space, then fade]
```

---

## Tracklist (8–24, to write as chapters are written)
One song per remaining door, same duet aesthetic bent to each door's era/mood (see
`outline.md`). Every one is still, underneath, a song for Daniela.
