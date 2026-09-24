# FableMind Design AI

FableMind Design AI is an AI assistant made mainly for people working with UI/UX, graphic design, product design, branding, and frontend development.

The idea behind this project is simple: instead of using a general AI assistant for every design-related task, FableMind focuses more on the way designers actually work.

It can be used for things like UX ideas, design research, UI decisions, branding, creative exploration, frontend questions, and general project discussions.

---

## Features

* AI chat interface focused on design and development
* Google and Email/Password authentication
* Chat history using Firebase Firestore
* Groq API support
* OpenRouter support
* Automatic fallback between AI providers
* Streaming AI responses
* Light and dark theme
* User settings
* PWA support
* Custom system prompt for controlling the AI's behavior
* Responsive interface for desktop and mobile

---

## What can I use it for?

FableMind can help with different parts of a design workflow, for example:

* UX research
* User personas
* User journeys
* User flows
* Information architecture
* Wireframes
* UI design ideas
* Design systems
* Typography and color selection
* Branding ideas
* Graphic design concepts
* Product design
* Portfolio projects
* Frontend development
* Design-to-code discussions
* General brainstorming

It is not limited to one particular design tool or workflow. The system prompt can also be changed depending on how the assistant should behave.

---

## Tech Stack

**Frontend**

* React
* Vite
* JavaScript
* CSS

**Backend / Services**

* Firebase Authentication
* Firebase Firestore

**AI**

* Groq
* OpenRouter

---

## Project Structure

```text
src/
├── config/
│   ├── aiProviders.js
│   ├── firebase.js
│   └── constants.js
│
├── services/
│   ├── aiService.js
│   └── firebaseService.js
│
├── context/
│   ├── AuthContext.jsx
│   ├── ChatContext.jsx
│   ├── ThemeContext.jsx
│   └── SettingsContext.jsx
│
├── components/
│   ├── ui/
│   ├── chat/
│   └── layout/
│
├── pages/
│
└── utils/
    └── loadSystemPrompt.js

sys_prompt/
└── sys_prompt.txt
```

---

## AI Provider Setup

FableMind currently supports Groq and OpenRouter.

The AI service uses Groq first and can fall back to OpenRouter when required.

AI provider settings are kept separately in:

```text
src/config/aiProviders.js
```

So adding another provider does not require changing the whole application.

---

## Custom AI Prompt

The main AI instructions are stored separately from the React code.

```text
sys_prompt/sys_prompt.txt
```

You can edit this file to change how FableMind responds, what areas it focuses on, and how it handles design-related questions.

This makes it easier to experiment with different AI personalities and workflows without changing the main application.

---

## Firebase Setup

Firebase is used for authentication and storing user chat data.

Enable the following in your Firebase project:

* Google Authentication
* Email/Password Authentication
* Firestore Database

Then add the Firebase configuration to your `.env` file.

Example:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## AI API Keys

You can use either Groq or OpenRouter.

### Groq

Create an API key from the Groq console and add it to your environment variables.

### OpenRouter

Create an API key from OpenRouter and add it to your environment variables.

The application also supports configuring AI providers from the app settings when available.

---

## Getting Started

Clone the repository:

```bash
git clone <your-repository-url>
```

Move into the project folder:

```bash
cd fablemind-design-ai
```

Install the dependencies:

```bash
npm install
```

Create your `.env` file and add the required Firebase and AI API configuration.

Then start the development server:

```bash
npm run dev
```

---

## Build

For a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

## Firebase Security Rules

The current Firestore structure keeps user data under the authenticated user's UID.

Example rules:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write:
        if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

Make sure to review and adjust the rules based on the data you add to the application.

---

## PWA

FableMind can also be installed as a PWA on supported browsers.

On desktop, use the install option available in Chrome or Edge.

On mobile, use the browser's **Add to Home Screen** option.

---

## Adding Another AI Provider

AI providers are managed from:

```text
src/config/aiProviders.js
```

Add the provider to `AI_PROVIDERS` and update `PROVIDER_ORDER`.

The rest of the AI service is designed to work with the provider configuration, so the existing application code does not need to be changed for every new provider.

---

## Why I Built This

There are already many general-purpose AI assistants available.

I wanted to experiment with what an AI assistant would look like if its main focus was the day-to-day work of a designer and frontend developer.

FableMind is an ongoing project, so the features and AI behavior will continue to change as I test different workflows and ideas.

---

## Status

This project is currently under development.

Some features may change as the project grows.


