import type { AiContent } from "./types"

/**
 * Dummy AI-generated content keyed by note id.
 * Falls back to DEFAULT_CONTENT for unknown ids.
 */
const NOTE_CONTENT: Record<string, AiContent> = {
  n1: {
    flashcards: [
      {
        id: "fc1",
        front: "What is the purpose of a sprint retrospective?",
        back: "To reflect on the past sprint — what went well, what didn't, and what to improve next cycle.",
      },
      {
        id: "fc2",
        front: "Name three common retrospective formats.",
        back: "Start/Stop/Continue · 4Ls (Liked, Learned, Lacked, Longed for) · Mad/Sad/Glad",
      },
      {
        id: "fc3",
        front: "What is a deployment pipeline?",
        back: "An automated sequence of stages (build → test → staging → production) that code changes pass through before going live.",
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "What is the main goal of a sprint retrospective?",
        options: [
          { label: "Plan the next sprint backlog", correct: false },
          { label: "Reflect and improve the team process", correct: true },
          { label: "Demo features to stakeholders", correct: false },
          { label: "Estimate story points", correct: false },
        ],
        explanation:
          "Retrospectives focus on team processes and collaboration — not planning or estimation.",
      },
      {
        id: "q2",
        question: "In a CI/CD pipeline, what does CD stand for?",
        options: [
          { label: "Continuous Debugging", correct: false },
          { label: "Code Delivery", correct: false },
          { label: "Continuous Delivery / Deployment", correct: true },
          { label: "Component Design", correct: false },
        ],
        explanation:
          "CD stands for Continuous Delivery (automated release to staging) or Continuous Deployment (automated release to production).",
      },
    ],
    mindmap: {
      id: "root",
      label: "Sprint Retro",
      children: [
        {
          id: "m1",
          label: "What went well",
          children: [
            { id: "m1a", label: "Deploy pipeline" },
            { id: "m1b", label: "Team sync" },
          ],
        },
        {
          id: "m2",
          label: "Improvements",
          children: [
            { id: "m2a", label: "Code review speed" },
            { id: "m2b", label: "Documentation" },
          ],
        },
        {
          id: "m3",
          label: "Action items",
          children: [
            { id: "m3a", label: "Weekly retro" },
            { id: "m3b", label: "Pair programming" },
          ],
        },
      ],
    },
  },

  n13: {
    flashcards: [
      {
        id: "fc1",
        front: "What is a React Server Component?",
        back: "A component that renders on the server only — it can fetch data directly but cannot use hooks or browser APIs.",
      },
      {
        id: "fc2",
        front: "What is streaming in Next.js App Router?",
        back: "Sending HTML to the browser in chunks as it's generated, so users see content progressively instead of waiting for the full page.",
      },
      {
        id: "fc3",
        front: "What does the `layout.tsx` file do?",
        back: "Defines a shared UI shell that wraps all pages within its route segment. It persists across navigations within that segment.",
      },
      {
        id: "fc4",
        front: "When should you add `'use client'`?",
        back: "When the component needs interactivity: event handlers, useState, useEffect, or browser-only APIs.",
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "Which of these CAN a React Server Component do?",
        options: [
          { label: "Call useState()", correct: false },
          { label: "Fetch data with async/await at the top level", correct: true },
          { label: "Add onClick handlers", correct: false },
          { label: "Use useEffect()", correct: false },
        ],
        explanation:
          "Server Components can be async and fetch data directly. Hooks and event handlers require Client Components.",
      },
      {
        id: "q2",
        question: "What is the purpose of `loading.tsx` in the App Router?",
        options: [
          { label: "A global CSS loader animation", correct: false },
          { label: "An automatic Suspense boundary that shows while a segment loads", correct: true },
          { label: "It replaces the layout during navigation", correct: false },
          { label: "A Next.js config file", correct: false },
        ],
        explanation:
          "`loading.tsx` automatically wraps the page in a Suspense boundary and shows a fallback UI while the segment is loading.",
      },
    ],
    mindmap: {
      id: "root",
      label: "App Router",
      children: [
        {
          id: "m1",
          label: "Server Components",
          children: [
            { id: "m1a", label: "Async data fetching" },
            { id: "m1b", label: "No hooks" },
          ],
        },
        {
          id: "m2",
          label: "Client Components",
          children: [
            { id: "m2a", label: "'use client'" },
            { id: "m2b", label: "Interactivity" },
          ],
        },
        {
          id: "m3",
          label: "File Conventions",
          children: [
            { id: "m3a", label: "layout.tsx" },
            { id: "m3b", label: "loading.tsx" },
            { id: "m3c", label: "error.tsx" },
          ],
        },
        {
          id: "m4",
          label: "Streaming",
          children: [
            { id: "m4a", label: "Suspense" },
            { id: "m4b", label: "Progressive HTML" },
          ],
        },
      ],
    },
  },
}

export const DEFAULT_CONTENT: AiContent = {
  flashcards: [
    {
      id: "fc1",
      front: "What is the main topic of this note?",
      back: "Review the note and summarise its central idea in one sentence.",
    },
    {
      id: "fc2",
      front: "List the key takeaways from this note.",
      back: "Identify 3–5 bullet points that capture the most important information.",
    },
    {
      id: "fc3",
      front: "How would you explain this note to someone unfamiliar with the topic?",
      back: "Use plain language and an analogy to convey the core concept.",
    },
  ],
  quiz: [
    {
      id: "q1",
      question: "Which statement best describes the purpose of this note?",
      options: [
        { label: "To document a bug fix", correct: false },
        { label: "To capture and organise knowledge", correct: true },
        { label: "To write a project spec", correct: false },
        { label: "To track a meeting agenda", correct: false },
      ],
      explanation: "Notes are primarily a tool for capturing and organising knowledge for future reference.",
    },
  ],
  mindmap: {
    id: "root",
    label: "This Note",
    children: [
      {
        id: "m1",
        label: "Key concepts",
        children: [
          { id: "m1a", label: "Concept A" },
          { id: "m1b", label: "Concept B" },
        ],
      },
      {
        id: "m2",
        label: "Details",
        children: [
          { id: "m2a", label: "Detail 1" },
          { id: "m2b", label: "Detail 2" },
        ],
      },
      {
        id: "m3",
        label: "References",
        children: [{ id: "m3a", label: "Source" }],
      },
    ],
  },
}

export function getAiContent(noteId: string): AiContent {
  return NOTE_CONTENT[noteId] ?? DEFAULT_CONTENT
}
