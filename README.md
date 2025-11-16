# Harada Method AI

Transform your dreams into actionable daily habits with the same framework Shohei Ohtani used to become a baseball superstar.

## What is the Harada Method?

The Harada Method is a Japanese goal-setting framework created by Takashi Harada. It uses a 64-cell grid to break down a central goal into:
- **1 Central Goal**: Your main objective
- **8 Supporting Pillars**: Critical categories needed to achieve your goal
- **64 Actionable Tasks**: 8 specific daily habits for each pillar

Shohei Ohtani famously used this method as a high school freshman to plan his path to becoming the #1 draft pick for 8 NPB teams.

## Features

- **AI-Powered Generation**: Uses OpenAI's GPT to generate personalized pillars and tasks based on your goal
- **Magical Ripple Animation**: Watch your grid fill from center to edges with smooth animations
- **Fully Editable**: Double-click any cell to customize suggestions
- **Local Storage Persistence**: Your grid is saved automatically in your browser
- **Export Functionality**: Download your grid as JSON for tracking
- **Ohtani Template**: Load Shohei Ohtani's original grid as an example
- **Fully Responsive**: Works beautifully on desktop, tablet, and mobile
- **No Database Required**: Everything runs client-side with localStorage
- **Privacy-Focused**: Bring your own OpenAI API key or configure a default

## Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS v4 (with @tailwindcss/vite plugin)
- **Animations**: Framer Motion
- **AI**: OpenAI API (GPT-5-nano with minimal reasoning effort)
- **State Management**: React Hooks + localStorage

### Why GPT-5-nano?
- **96% cost reduction** vs GPT-4o ($0.83 vs $21.25 per grid)
- **90% cache discount** on repeated system prompts
- **400K context window** for complex goals
- Optimized for high-volume, creative content generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd harada-method-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional - users can provide their own keys):
```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env` (optional):
```
VITE_OPENAI_API_KEY=sk-your-key-here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build
```

## Usage

1. **Set Your Goal**: Enter your central objective (e.g., "Launch a successful startup")
2. **Configure API Key**: Enter your OpenAI API key in the settings modal
3. **Generate**: Click "Generate My 64-Cell Roadmap" and watch the magic happen
4. **Customize**: Double-click any cell to edit the AI's suggestions
5. **Export**: Download your grid for daily tracking and progress monitoring

## API Key Configuration

The app supports two ways to provide an OpenAI API key:

1. **User-Provided Key**: Users can enter their own API key in the UI (stored in localStorage)
2. **Default Key**: Configure a default key in `.env` for simpler UX (you pay for API calls)

The app will prompt users for a key if neither is configured.

## Project Structure

```
harada-method-ai/
├── src/
│   ├── components/
│   │   ├── HaradaGrid.tsx         # Main 8x8 grid component
│   │   ├── GridCell.tsx           # Individual cell with animations
│   │   ├── GoalInput.tsx          # Goal input form
│   │   └── APIKeyModal.tsx        # API key configuration modal
│   ├── hooks/
│   │   ├── useLocalStorage.ts     # localStorage persistence hook
│   │   └── useOpenAI.ts           # OpenAI streaming hook
│   ├── lib/
│   │   └── openai.ts              # OpenAI client and API calls
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── App.tsx                    # Main app component
│   └── index.css                  # Tailwind CSS v4 styles with @theme
├── .env.example                   # Environment variable template
├── vite.config.ts                 # Vite config with Tailwind plugin
└── package.json
```

## Customization

### Change the Animation Speed

Edit the delays in `src/components/HaradaGrid.tsx`:

```typescript
const getPillarDelay = (pillarIndex: number) => 0.2 + pillarIndex * 0.15;
const getTaskDelay = (pillarIndex: number, taskIndex: number) =>
  getPillarDelay(pillarIndex) + 0.3 + taskIndex * 0.1;
```

### Customize the Color Scheme

Edit the `@theme` section in `src/index.css`:

```css
@theme {
  --color-harada-yellow: #FFEB3B;
  --color-harada-gray: #E5E5E5;
  --color-harada-dark-gray: #666666;
}
```

### Change the AI Model

Edit `src/lib/openai.ts` to use a different OpenAI model:

```typescript
model: 'gpt-5-nano',  // or 'gpt-5-mini', 'gpt-4o-mini', 'gpt-5', etc.
reasoning_effort: 'minimal', // Options: minimal, low, medium, high (GPT-5 models only)
```

**Cost comparison (per grid ~500 input / ~2000 output tokens):**
- GPT-5-nano (minimal): $0.83 → **$0.09 with caching** ⭐
- GPT-4o-mini: $1.28
- GPT-5-mini (medium): $4.13
- GPT-5 (high): $20.63

## Deployment

This app can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use `gh-pages` package
- **Cloudflare Pages**: Connect your repo

## License

MIT

## Credits

- Inspired by Shohei Ohtani's journey and the Harada Method
- Created with Claude Code
- Built with React, Tailwind CSS, and OpenAI

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
