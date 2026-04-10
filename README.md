# TaskFlow AI

An AI-powered task execution system that converts user intent into structured, multi-step actionable outputs using Oxlo AI APIs. 

This is NOT a chatbot—it behaves as an intent → planning → execution engine that returns structured, programmatically-consumable outputs.

## Problem
General chat models return unstructured conversation blocks, making it difficult to parse and use outputs programmatically. Chat interfaces don't enforce output schemas.

## Solution
TaskFlow AI implements a 3-step AI pipeline that:
1. **Intent Detection** - Classifies user intent and extracts relevant entities
2. **Task Planning** - Generates logically-ordered intermediate steps
3. **Structured Output Generation** - Orchestrates execution and returns validated JSON

This pattern behaves like an agentic system, not a generic chatbot, with deterministic, consumable outputs.

## Architecture

```
 User Input ("Plan my Saturday")
     │
     ▼
[ Intent Detection ] ──▶ Classifies intent, extracts entities
     │
     ▼
[ Task Planning ]    ──▶ Generates step-by-step execution plan
     │
     ▼
[ Execution ]        ──▶ Orchestrates completion & returns structured JSON
     │
     ▼
Structured Output (Title + Sections) → UI Rendering
```

## Tech Stack
- **Next.js 14+** (App Router, Server/Client Components)
- **React** (Frontend interactivity)
- **TailwindCSS** (Modern UI styling)
- **Lucide React** (Icons)
- **Oxlo AI APIs** (LLM calls for pipeline steps)

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ 
- npm or yarn

### 2. Installation
```bash
cd taskflow-next
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Oxlo API key:
```
OXLO_API_KEY=your_oxlo_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

✅ **3-Step AI Pipeline** - Intent detection, planning, and structured execution  
✅ **Animated Step Progress** - Real-time UI feedback during execution  
✅ **Structured Output** - Returns validated JSON with title and sections  
✅ **Graceful Fallback** - Mock responses if API key missing (for testing UI)  
✅ **Responsive Design** - Mobile and desktop support  
✅ **Dark Mode** - Modern dark UI with emerald/cyan accent colors  
✅ **Example Prompts** - Pre-filled intent examples for quick testing  

## API Response Format

```json
{
  "steps": [
    "Understanding intent...",
    "Planning tasks...",
    "Generating output..."
  ],
  "result": {
    "title": "Generated Task Title",
    "sections": [
      {
        "heading": "Section Name",
        "content": ["point1", "point2", "point3"]
      }
    ]
  },
  "meta": {
    "api_calls": 3,
    "execution_time": "2.15 sec"
  }
}
```

## File Structure

```
taskflow-next/
├── app/
│   ├── api/
│   │   └── execute/
│   │       └── route.js         # POST /api/execute - Main pipeline
│   ├── layout.tsx              # Root layout
│   ├── page.js                 # Main UI component
│   ├── globals.css             # Global styles
│   └── favicon.ico
├── lib/
│   └── oxlo.js                 # Oxlo API integration
├── public/                     # Static assets
├── .env.example               # Environment template
├── .env.local                 # Your secrets (not in git)
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind theming
├── next.config.mjs            # Next.js config
└── README.md                  # This file
```

## Usage Examples

### Plan my Saturday
Input: "Plan my Saturday with outdoor activities"

Returns: Structured plan with morning, afternoon, evening activities

### Learn Golang
Input: "Learn Golang in 30 days syllabus"

Returns: Week-by-week learning path with concepts and projects

### YouTube Channel
Input: "Start a YouTube channel step-by-step"

Returns: Pre-production, equipment setup, content creation roadmap

## Fallback Behavior

If `OXLO_API_KEY` is not set in `.env.local`, the API gracefully returns a mock response so you can still test the UI, animations, and data rendering without an API key. This is useful for frontend/UX development.

## Bonus Features Included

- ⚡ Loading animations with step progress
- 🎨 Icon-based UI with Lucide React
- 🌙 Dark mode optimized
- ⌨️ Example prompts for quick testing
- 📊 Execution time and API call count
- 🎯 Responsive grid layout (desktop/mobile)
