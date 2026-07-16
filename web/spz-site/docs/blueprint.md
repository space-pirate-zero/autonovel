# **App Name**: Space Pirate Zero Web HQ

## Core Features:

- Content Breaker Game: An interactive "Breakout" style game. A paddle at the bottom, controlled by the user's mouse, is used to bounce a ball. The ball breaks bricks arranged at the top of the screen. Each brick is skinned with a content preview. When a brick is destroyed, the user can click the revealed content preview to navigate to the full content page. The player has 3 lives and the game advances in levels.
- Multi-Dimensional Content Engine: A custom React-based component hierarchy that treats all content (articles, music, brand work) as standardized data objects.
- System Synchronized Content: A persistent footer engine on sub-pages that recommends related content based on topic tags, presented as a horizontal scroll of cards.
- Dynamic Content Aggregation: Automatically pulls content from various sources, including Substack RSS feeds and social media feeds (X, Instagram, LinkedIn), using a serverless function that updates every 60 minutes.
- Adaptive Content Rendering: A tool to analyze content relevance to the current webpage context, adapting the layout, style, and density of information displayed using AI.
- Global Navigation HUD: A persistent, semi-transparent overlay provides a command center with real-time clock, system status, breadcrumb trail, and quick-access icons for content sub-types.

## Style Guidelines:

- Primary color: Electric Cyan (#00FFFF) for interaction points and accents, representing energy and futuristic technology. 
- Background color: Deep Void Black (#050505) to provide a 'Dark Mode' foundation that enhances the contrast.
- Accent color: Neon Cyber-Magenta (#FF00FF) used sparingly to draw the eye and to support the cyberpunk aesthetic.
- Headline font: 'Orbitron', a futuristic sans-serif, evoking a cockpit UI.
- Body font: 'Rajdhani' maintains high readability amidst a dense layout.
- Futuristic icons, some mimicking glitch effects and scanlines, will represent different content categories, ensuring they are easily identifiable within the HUD.
- Dense, layered layout inspired by cyberpunk interfaces, using a grid-based system for clarity and a sense of organized chaos.
- Use 'glitch' transitions and chromatic aberration on hover effects. Apply scan-line overlays to enhance the pirate-radio/hacker aesthetic, creating an immersive experience.
