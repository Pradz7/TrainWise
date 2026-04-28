# TrainWise

TrainWise is an AI-powered fitness and nutrition coach that helps users create a personalized fitness profile, generate workout and nutrition plans, track progress, and receive chatbot-based coaching support.

## Features

- Landing page with register and login flow
- Demo authentication using local storage
- Onboarding profile form for new users
- Personalized fitness dashboard
- Profile page with user information summary
- Navbar with Dashboard, Overview, Plans, Tracker, Profile, and Dark Mode toggle
- Dark mode and light mode support
- Workout plan generator
- Nutrition plan generator
- BMI, BMR, and TDEE summary
- Body status card based on BMI category
- Calendar-style progress tracker
- Daily progress tracking by date, weight, and trained muscle group
- Floating circular AI chat widget
- Gemini-powered chatbot for fitness and nutrition questions
- Quick prompt buttons in chat
- Saved profile, tracker, theme, and chat history using local storage
- Loading states, error handling, and success toasts
- Responsive dashboard UI

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Local Storage

### Backend

- FastAPI
- Python
- Pandas
- Uvicorn

### AI

- Gemini API
- Fallback response handling

## App Flow

```text
Landing Page
→ Register/Login
→ Onboarding Profile Form
→ Dashboard
→ Generate Plans / Track Progress / Chat with AI