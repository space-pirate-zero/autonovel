export interface Track {
  title: string;
  duration: string;
}

export interface MusicAlbum {
  id: string;
  title: string;
  slug: string;
  spotify: string;
  appleMusic: string;
  appleMusicEmbed: string;
  youtube?: string;
  date: string;
  image: string;
  description: string;
  tags: string[];
  tracks: Track[];
}

export const albums: MusicAlbum[] = [
  {
    id: "music-1",
    title: "Tentacle Love",
    slug: "tentacle-love",
    spotify: "https://open.spotify.com/album/6GCHOsYGMTxroYdGqLGIfm",
    appleMusic: "https://music.apple.com/us/album/tentacle-love/1836519029",
    appleMusicEmbed: "https://embed.music.apple.com/us/album/tentacle-love/1836519029",
    youtube: "https://youtu.be/mqi7xeAIycQ",
    date: "2025-08-28",
    image: "https://i.scdn.co/image/ab67616d0000b27300378350debf7aebff3113d2",
    description: "Eight transmissions from the outer edge. Tentacle Love reaches deep into hip-hop's cosmic underbelly — raw percussion, interstellar bars, and the kind of hooks that drag you back like gravity.",
    tags: ["Hip-Hop", "Rap", "Cosmic"],
    tracks: [
      { title: "Tentacle Love", duration: "4:00" },
      { title: "Big Bang Spender", duration: "2:36" },
      { title: "Damn Satellites", duration: "3:30" },
      { title: "Space Junk", duration: "3:11" },
      { title: "Who You", duration: "4:00" },
      { title: "Her", duration: "2:51" },
      { title: "Somebody's Watching Me", duration: "3:21" },
      { title: "Where Do Bad Folks Go When They Die", duration: "2:28" },
    ],
  },
  {
    id: "music-2",
    title: "американское порно",
    slug: "amerikanskoe-porno",
    spotify: "https://open.spotify.com/album/3tlLcMStCf6CMmsUvhiQny",
    appleMusic: "https://music.apple.com/us/album/%D0%B0%D0%BC%D0%B5%D1%80%D0%B8%D0%BA%D0%B0%D0%BD%D1%81%D0%BA%D0%BE%D0%B5-%D0%BF%D0%BE%D1%80%D0%BD%D0%BE/1816126550",
    appleMusicEmbed: "https://embed.music.apple.com/us/album/%D0%B0%D0%BC%D0%B5%D1%80%D0%B8%D0%BA%D0%B0%D0%BD%D1%81%D0%BA%D0%BE%D0%B5-%D0%BF%D0%BE%D1%80%D0%BD%D0%BE/1816126550",
    date: "2025-05-24",
    image: "https://i.scdn.co/image/ab67616d0000b2737615184c80ca3bed0a7b22f6",
    description: "Seven transmissions from the space between empires. A pop album dressed in Cyrillic — seductive, disorienting, and totally unashamed. American Porn, in the key of the cosmos.",
    tags: ["Pop", "Synth", "Alternative"],
    tracks: [
      { title: "Deep Space 69: The Drip Nebula", duration: "4:00" },
      { title: "Moon Unit Maintenance: She Needed a Docking", duration: "4:00" },
      { title: "Nuns of Neptune 3: Cloistered & Cloned", duration: "4:00" },
      { title: "The Lust Belt of Alpha Centauri", duration: "4:00" },
      { title: "Sins of the Solar Siren", duration: "4:00" },
      { title: "Rocket Thrust: Volume IV", duration: "4:00" },
      { title: "That Rush", duration: "4:00" },
    ],
  },
  {
    id: "music-3",
    title: "The Yellow 5",
    slug: "the-yellow-5",
    spotify: "https://open.spotify.com/album/17U3aAsE2F9zdHxsoCEwTa",
    appleMusic: "https://music.apple.com/us/album/the-yellow-5/1813320890",
    appleMusicEmbed: "https://embed.music.apple.com/us/album/the-yellow-5/1813320890",
    date: "2025-05-08",
    image: "https://i.scdn.co/image/ab67616d0000b2736e67609e736cd09e8ac391f8",
    description: "Eight transmissions from the Latin cosmos. Samba rhythms in zero gravity. Bossa nova on the event horizon. The Yellow 5 is Space Pirate Zero's most sensuous detour yet — heat, movement, and the electric hum of the universe dancing.",
    tags: ["Latin", "Bossa Nova", "Cosmic"],
    tracks: [
      { title: "Órbita Suave", duration: "4:00" },
      { title: "Estación Copacabana", duration: "2:44" },
      { title: "Solar Barrio", duration: "3:02" },
      { title: "Circuitos Calientes", duration: "3:02" },
      { title: "Naves y Novelas", duration: "4:00" },
      { title: "Samba Gravitacional", duration: "3:02" },
      { title: "Interludio Nebuloso", duration: "4:00" },
      { title: "Última Aurora", duration: "1:47" },
    ],
  },
  {
    id: "music-4",
    title: "Vaudeville Nebula",
    slug: "vaudeville-nebula",
    spotify: "https://open.spotify.com/album/7mNzViQ7Hyz8yDTCoQo1ni",
    appleMusic: "https://music.apple.com/us/album/vaudeville-nebula-ep/1809718983",
    appleMusicEmbed: "https://embed.music.apple.com/us/album/vaudeville-nebula-ep/1809718983",
    date: "2025-04-23",
    image: "https://i.scdn.co/image/ab67616d0000b273343c127840a8b333c55cbc78",
    description: "Four transmissions from the cosmic vaudeville stage. Lo-fi, strange, and deeply human. The EP that named the persona — equal parts nostalgia and interstellar drift.",
    tags: ["Lo-Fi", "Cosmic", "Alternative", "EP"],
    tracks: [
      { title: "Stratosphere Seduction", duration: "4:00" },
      { title: "ATL Nights, Moonlight Moves", duration: "3:53" },
      { title: "Vaudeville Nebula", duration: "4:00" },
      { title: "Kiss Me Like a Supernova", duration: "3:09" },
    ],
  },
  {
    id: "music-5",
    title: "Lambada on Saturn's Rings",
    slug: "lambada-on-saturns-rings",
    spotify: "https://open.spotify.com/album/4Yfc5W7IVh8ppmgOZcNVZ3",
    appleMusic: "https://music.apple.com/us/album/lambada-on-saturns-rings/1759451234",
    appleMusicEmbed: "https://embed.music.apple.com/us/album/lambada-on-saturns-rings/1759451234",
    youtube: "https://youtu.be/JREXL-prS_U",
    date: "2024-07-24",
    image: "https://i.scdn.co/image/ab67616d0000b273c5f9b8adcfbfd1b9376425de",
    description: "Thirteen transmissions from Saturn's rings. Alternative fever dreams with a Latin pulse. The debut full-length from Space Pirate Zero — irreverent, melodic, and permanently orbiting the edge of taste.",
    tags: ["Alternative", "Latin", "Indie"],
    tracks: [
      { title: "Lambada on Saturn's Rings", duration: "2:53" },
      { title: "Planetary Orgy", duration: "3:03" },
      { title: "Heart Shaped Box", duration: "4:00" },
      { title: "Style and Grace", duration: "2:19" },
      { title: "Cloud 9", duration: "4:00" },
      { title: "Rave in my Pants", duration: "2:58" },
      { title: "My Weenus Blots out the Sun", duration: "2:31" },
      { title: "Sexy Mukbang", duration: "2:00" },
      { title: "Trance of Desire", duration: "3:17" },
      { title: "Chemistry", duration: "2:35" },
      { title: "Me and My Boner Love You", duration: "2:37" },
      { title: "The Waistband Ain't Enough", duration: "2:44" },
      { title: "Daniela Can't You See", duration: "2:18" },
    ],
  },
  {
    id: "music-6",
    title: "Afternoon Delight",
    slug: "afternoon-delight",
    spotify: "https://open.spotify.com/album/23QY0RHdORirUSQ1OESjbo",
    appleMusic: "https://music.apple.com/us/album/afternoon-delight/1776518291",
    appleMusicEmbed: "https://embed.music.apple.com/us/album/afternoon-delight/1776518291",
    date: "2024-10-31",
    image: "https://i.scdn.co/image/ab67616d0000b273dc5c602d00e30e91b5d0fbc4",
    description: "Fourteen transmissions from a parallel 1979. An alternative universe where Spaceship Alpha 9 was charting and the future was still something to believe in. Afternoon Delight is nostalgia deployed as a weapon.",
    tags: ["Alternative", "Rock", "Retro"],
    tracks: [
      { title: "Thunderdome", duration: "2:52" },
      { title: "Outshined", duration: "3:15" },
      { title: "Cosmic Beauty", duration: "2:26" },
      { title: "Feel the Riot", duration: "2:23" },
      { title: "Afternoon Delight", duration: "3:14" },
      { title: "Starlit", duration: "3:55" },
      { title: "Fire in the Dark", duration: "2:18" },
      { title: "Thoughts", duration: "2:43" },
      { title: "Haze", duration: "2:33" },
      { title: "Puff Puff Planet", duration: "2:21" },
      { title: "Just One Fix", duration: "3:58" },
      { title: "Galactic Masterpiece", duration: "2:54" },
      { title: "Homer Sauce", duration: "2:19" },
      { title: "Carmelita", duration: "2:39" },
    ],
  },
];
