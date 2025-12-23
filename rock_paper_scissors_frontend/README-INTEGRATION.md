# Rock Paper Scissors Frontend — Backend Integration

This frontend communicates with the FastAPI backend to play Rock Paper Scissors.

Backend URL
- Default backend base URL: http://localhost:3001
- You can override it via environment variable:
  - Create a .env file in the frontend root with:
    REACT_APP_API_BASE=http://localhost:3001

How to Run (Local)
1) Start the backend (FastAPI) on port 3001
   - Confirm it serves POST /play and has CORS allowing http://localhost:3000

2) Start the frontend:
   npm install
   npm start
   Open http://localhost:3000

What the frontend sends
- Endpoint: POST /play
- Body: { "user_choice": "rock" | "paper" | "scissors" }

What the frontend expects
- Response JSON: { "user_choice": string, "computer_choice": string, "result": "win" | "lose" | "draw" }

UI Behavior
- Loading indicator while waiting for the response
- Displays both user and computer choices, and the result
- "Play Again" resets the state

Notes
- The current app shows the effective API base at the bottom of the panel.
- If you need to inject a base URL at runtime (without rebuilding), you can set window.__RPS_API_BASE__ in the browser console or via a script tag before the app loads. The code uses:
  - window.__RPS_API_BASE__ (if present), else
  - REACT_APP_API_BASE (from build-time env), else
  - http://localhost:3001 (default)
