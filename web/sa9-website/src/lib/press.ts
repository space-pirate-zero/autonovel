export interface PressItem {
  id: number;
  type: "press" | "video" | "patent";
  title: string;
  url: string;
  date: string;
  image: string;
  description: string;
  summary: string;
  tags: string[];
  youtubeId?: string;
}

export interface Book {
  title: string;
  status: string;
  description: string;
  summary: string;
  image: string;
  tags: string[];
  links?: { label: string; href: string }[];
}

export const videos: PressItem[] = [
  {
    id: 24,
    type: "video",
    title: "Unlocking the Power of AI in Coca-Cola",
    url: "https://www.youtube.com/watch?v=13pBv8LPpi4",
    youtubeId: "13pBv8LPpi4",
    date: "2024-12-01",
    image: "https://img.youtube.com/vi/13pBv8LPpi4/maxresdefault.jpg",
    description: "Highlights the transformative mindset shift at Coca-Cola regarding AI as a foundation for intelligent experiences.",
    summary: "Greg Chambers delivers a keynote on unlocking enterprise AI at scale — reframing artificial intelligence as the foundational intelligence layer beneath every Coca-Cola consumer touchpoint.",
    tags: ["Coca-Cola", "AI", "Digital Innovation"],
  },
  {
    id: 25,
    type: "video",
    title: "Amaze & Delight Customers",
    url: "https://www.youtube.com/watch?v=sHo0SnZFTMw",
    youtubeId: "sHo0SnZFTMw",
    date: "2018-02-28",
    image: "https://img.youtube.com/vi/sHo0SnZFTMw/maxresdefault.jpg",
    description: "Discusses using global digital landscape data to drive engagement across physical retail environments.",
    summary: "Greg Chambers presents Coca-Cola's global digital landscape strategy — using deep learning and computer vision to drive real-time, context-aware consumer engagement.",
    tags: ["Deep Learning", "Retail", "Coca-Cola"],
  },
  {
    id: 26,
    type: "video",
    title: "Coca-Cola's Unabashed AI Strategy",
    url: "https://www.youtube.com/watch?v=G4slIuBODTA",
    youtubeId: "G4slIuBODTA",
    date: "2017-07-24",
    image: "https://img.youtube.com/vi/G4slIuBODTA/maxresdefault.jpg",
    description: "VentureBeat keynote on humanizing machines and using AI as a kernel for every experience.",
    summary: "Greg Chambers delivers the landmark VentureBeat keynote articulating Coca-Cola's unabashed AI strategy: humanizing machines and embedding conversational AI as the kernel of every brand experience.",
    tags: ["Enterprise AI", "Chatbots", "Keynote"],
  },
  {
    id: 27,
    type: "video",
    title: "A Conversation with Lauren Kunze",
    url: "https://www.youtube.com/watch?v=Vh4cTSwcQqc",
    youtubeId: "Vh4cTSwcQqc",
    date: "2017-07-20",
    image: "https://img.youtube.com/vi/Vh4cTSwcQqc/maxresdefault.jpg",
    description: "Explores the integration of conversational AI into brand strategy and interactive hardware.",
    summary: "Greg Chambers and Pandorabots CEO Lauren Kunze explore the integration of conversational AI into enterprise brand strategy.",
    tags: ["Conversational AI", "Pandorabots", "Digital Transformation"],
  },
];

export const pressItems: PressItem[] = [
  {
    id: 32,
    type: "press",
    title: "The Amazing Ways Coca-Cola Uses AI and Big Data",
    url: "https://www.forbes.com/sites/bernardmarr/2017/09/18/the-amazing-ways-coca-cola-uses-artificial-intelligence-ai-and-big-data-to-drive-success/",
    date: "2017-09-18",
    image: "https://picsum.photos/seed/press-forbes/800/600",
    description: "Forbes feature on flavor preference collection via Freestyle machines and image recognition.",
    summary: "Forbes profiles Coca-Cola's multi-front AI strategy: harvesting flavor preference data from 50,000+ Freestyle machines and deploying image recognition in retail.",
    tags: ["Forbes", "Big Data", "Consumer Analytics"],
  },
  {
    id: 34,
    type: "press",
    title: "Google's Cloud Steals Fortune 500 Customers",
    url: "https://fortune.com/2017/03/09/fortune-500-cloud-google/",
    date: "2017-03-09",
    image: "https://picsum.photos/seed/press-fortune/800/600",
    description: "Highlights the selection of Google Cloud to power retail digital signage and mobile push content.",
    summary: "Fortune covers how Google Cloud won major Fortune 500 clients including Coca-Cola — citing Greg Chambers' selection of Google infrastructure to power AI-driven retail.",
    tags: ["Fortune", "Cloud Computing", "Enterprise Tech"],
  },
  {
    id: 35,
    type: "press",
    title: "Turning 12-Pack Boxes Into VR Viewers",
    url: "https://fortune.com/2016/02/24/coca-cola-vr-cardboard/",
    date: "2016-02-24",
    image: "https://picsum.photos/seed/press-vr/800/600",
    description: "Sustainable experiment transforming cardboard packaging into VR headsets to democratize immersive content.",
    summary: "Fortune covers Coca-Cola's creative technology experiment — converting recyclable cardboard 12-pack boxes into functional VR headsets.",
    tags: ["Virtual Reality", "Sustainability", "Packaging"],
  },
  {
    id: 31,
    type: "press",
    title: "Coke's AI Strategy Takes Its Cue from Sting",
    url: "https://venturebeat.com/ai/coke-ai-strategy-takes-its-cue-from-sting/",
    date: "2017-07-24",
    image: "https://picsum.photos/seed/press-sting/800/600",
    description: "Explores a privacy-conscious approach to AI focused on 'sensitivities' and real-time context.",
    summary: "VentureBeat profiles Greg Chambers' privacy-first AI philosophy at Coca-Cola — treating consumer 'sensitivities' as actionable data inputs.",
    tags: ["Privacy", "Digital Strategy", "AI"],
  },
  {
    id: 39,
    type: "press",
    title: "Kuki AI: Chatbot Beats Facebook on Two-Week 'Date'",
    url: "https://www.bbc.com/news/technology-54718671",
    date: "2020-10-28",
    image: "https://picsum.photos/seed/press-bbc/800/600",
    description: "BBC feature on the superiority of personality-driven AI in safe and engaging dialogue.",
    summary: "BBC News covers Kuki AI's decisive triumph over Facebook's BlenderBot in a two-week 'date' experiment.",
    tags: ["Kuki AI", "BBC News", "Bot Battle"],
  },
  {
    id: 38,
    type: "press",
    title: "A Date with AI: Kuki vs BlenderBot",
    url: "https://www.vice.com/en/article/bot-battle-shows-what-happens-when-two-ai-programs-go-on-a-date/",
    date: "2020-10-30",
    image: "https://picsum.photos/seed/press-vice/800/600",
    description: "VICE feature on forming long-term emotional connections via personality-driven AI.",
    summary: "VICE investigates Kuki — demonstrating superior emotional coherence and user engagement over Facebook's BlenderBot.",
    tags: ["Kuki", "Pandorabots", "Conversational AI"],
  },
  {
    id: 28,
    type: "press",
    title: "Coca-Cola to Debut AI-powered Vending Machine Apps",
    url: "https://www.marketingdive.com/news/coca-cola-to-debut-ai-powered-vending-machine-apps/446986/",
    date: "2017-07-13",
    image: "https://picsum.photos/seed/press-vending/800/600",
    description: "Details the 2017 rollout of AI-powered vending apps that allow pre-ordering and location-specific offers.",
    summary: "Marketing Dive covers Greg Chambers' debut of AI-powered Coca-Cola vending machine apps, enabling real-time pre-ordering and personalized offers.",
    tags: ["Coca-Cola", "Retail Innovation", "Mobile Apps"],
  },
  {
    id: 33,
    type: "press",
    title: "Smart Transformation with Google Cloud",
    url: "https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/how-businesses-are-smartly-transforming-google-cloud-android-and-chrome/",
    date: "2017-03-08",
    image: "https://picsum.photos/seed/press-google/800/600",
    description: "Official Google blog post on deploying Chrome-based digital signs powered by Chromebits.",
    summary: "Official Google Cloud blog spotlights Coca-Cola's smart retail transformation — deploying Chromebit-powered digital signage at global scale.",
    tags: ["Google Cloud", "Digital Signage", "Retail"],
  },
  {
    id: 29,
    type: "press",
    title: "BIA/Kelsey LOCAL IMPACT: Atlanta Keynote",
    url: "https://www.bia.com/blog/biakelsey-local-impact-atlanta-coca-colas-greg-chambers-we-need-to-operate-at-local-level-its-100-times-more-important/",
    date: "2017-09-11",
    image: "https://picsum.photos/seed/press-atlanta/800/600",
    description: "Covers the critical shift toward hyper-localization and HDMI-ready digital ecosystems.",
    summary: "BIA/Kelsey covers Greg Chambers' keynote arguing that operating at the hyper-local level is 100x more strategically valuable than broad national campaigns.",
    tags: ["Hyper-Local", "Google Cloud", "IoT"],
  },
  {
    id: 30,
    type: "press",
    title: "How Third-party Apps Transform Brand Partnerships",
    url: "https://www.marketingdive.com/news/how-third-party-apps-are-transforming-brand-partnerships/429165/",
    date: "2016-11-17",
    image: "https://picsum.photos/seed/press-apps/800/600",
    description: "Examines the use of third-party mobile apps and beacon technology to enhance in-store engagement.",
    summary: "Marketing Dive features Greg Chambers' strategy for leveraging third-party mobile apps and Bluetooth beacon technology for connected retail.",
    tags: ["Brand Partnerships", "Beacons", "Mobile Strategy"],
  },
  {
    id: 36,
    type: "press",
    title: "Coca-Cola Bursts Into Digital Signage",
    url: "https://www.digitalsignagetoday.com/articles/coca-cola-bursts-into-digital-signage/",
    date: "2018-03-29",
    image: "https://picsum.photos/seed/press-signage/800/600",
    description: "Features 'Neko' as a pace car for real-time digital endcap implementation in retail.",
    summary: "Digital Signage Today profiles Project Neko — Greg Chambers' AI-powered digital endcap system at Coca-Cola.",
    tags: ["Digital Signage", "Neko", "Retail Strategy"],
  },
  {
    id: 37,
    type: "press",
    title: "Leading Non-Alcoholic Beverage Companies in AI",
    url: "https://thematictake.nridigital.com/thematic_take_aug23/leading-non-alcoholic-beverages-companies-artificial-intelligence",
    date: "2023-08-10",
    image: "https://picsum.photos/seed/press-bev/800/600",
    description: "Recognizes 'Coke On' app and computer vision as core drivers of AI leadership.",
    summary: "NRI Digital ranks Coca-Cola as a top AI leader in the global beverage industry, citing the 'Coke On' app and pioneering computer vision deployments.",
    tags: ["Artificial Intelligence", "Computer Vision", "Loyalty"],
  },
];

export const patents: PressItem[] = [
  {
    id: 21,
    type: "patent",
    title: "Dynamic Signage for Electronic Menu Board",
    url: "https://patents.justia.com/patent/20200334769",
    date: "2020-10-22",
    image: "https://picsum.photos/seed/patent-signage/800/600",
    description: "Hardware dongle system to manage and dynamically update electronic menu boards in real-time based on sales trends.",
    summary: "A patented hardware dongle system enabling real-time dynamic content on electronic menu boards, driven by live sales trend data.",
    tags: ["Retail Tech", "IoT", "Dynamic Signage"],
  },
  {
    id: 22,
    type: "patent",
    title: "Networked Theft Prevention for Percussive Device",
    url: "https://patents.justia.com/patent/11600383",
    date: "2023-03-07",
    image: "https://picsum.photos/seed/patent-device/800/600",
    description: "Security framework for percussive massage devices in commercial environments using unique activation codes.",
    summary: "A networked security architecture for percussive massage devices deployed in commercial environments.",
    tags: ["Therabody", "Security", "Hardware"],
  },
  {
    id: 23,
    type: "patent",
    title: "Intelligence Engine System and Method",
    url: "https://patents.justia.com/patent/11432994",
    date: "2022-09-06",
    image: "https://picsum.photos/seed/patent-ai/800/600",
    description: "AI-driven engine that personalizes percussive therapy by aggregating tracking data with demographic and biometric inputs.",
    summary: "An AI-driven intelligence engine that personalizes percussive therapy protocols by fusing real-time tracking data with biometric inputs.",
    tags: ["AI", "Biometrics", "Wellness Tech"],
  },
];

export const book: Book = {
  title: "Digital Insurgency",
  status: "On Amazon Now",
  description: "A survival guide for digital insurgents operating behind enterprise lines — how to smuggle radical innovation past the bureaucratic immune system.",
  summary: "Digital Insurgency introduces 'The Trojan Horse Protocol,' a battle-tested methodology for bypassing the corporate 'white blood cells' that kill new ideas. Drawing on Greg Chambers' years leading digital innovation at The Coca-Cola Company, it lays out 'Inception Engineering' and 'Architecture as Camouflage' — a framework for shipping Generative AI and agentic workflows inside legacy Fortune 500 environments. Available now in paperback and Kindle.",
  image: "/images/covers/digital-insurgency.jpg",
  tags: ["Digital Insurgency", "Trojan Horse Protocol", "Corporate Innovation", "Enterprise AI", "Greg Chambers"],
  links: [
    { label: "Paperback", href: "https://www.amazon.com/Digital-Insurgency-Smuggling-Authenticity-Corporate/dp/B0H4D92BSF" },
    { label: "Kindle", href: "https://www.amazon.com/Digital-Insurgency-Smuggling-Authenticity-Corporate-ebook/dp/B0H4DLX478" },
  ],
};
