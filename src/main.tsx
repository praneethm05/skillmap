
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import { AppDataProvider } from './state/AppDataProvider';
import { appEnv, getStartupIssues } from './config/env';
import CommandPalette from './components/ui/CommandPalette';
import './index.css'

const startupIssues = getStartupIssues();
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

if (startupIssues.length > 0) {
  console.error('SkillMap startup configuration issues:', startupIssues);
}

const startupIssueView = (
  <div className="min-h-screen w-full bg-gray-50/20 px-4 py-10 sm:px-6">
    <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="mb-3 text-2xl font-semibold text-red-900">Configuration required</h1>
      <p className="mb-4 text-sm text-gray-700">SkillMap cannot start until required environment values are configured.</p>
      <ul className="list-disc space-y-2 pl-5 text-sm text-red-800">
        {startupIssues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-gray-700">
        Update your `.env` file and restart the dev server.
      </p>
    </div>
  </div>
);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {startupIssues.length > 0 ? (
      startupIssueView
    ) : (
      <ClerkProvider publishableKey={appEnv.clerkPublishableKey}>
        <AppDataProvider>
          <BrowserRouter>
            <App />
            <CommandPalette />
          </BrowserRouter>
        </AppDataProvider>
      </ClerkProvider>
    )}
  </React.StrictMode>
);
