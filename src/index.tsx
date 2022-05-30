import React from 'react';
import ReactDOM from 'react-dom/client';
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { fileDropzoneTracker } from './common/fileDropzoneTracker';
import { fileBasename } from './common/fileBasename';
import reportWebVitals from './reportWebVitals';
import App from './App';
import './index.css';

listen('tauri://file-drop', async event => {
  const payload = event.payload as string[] | null;
  if (!payload || payload.length === 0)
    return;

  const handler = fileDropzoneTracker.getHandler();
  if (!handler) {
    console.log('No file dropzone handler was found', event);
    return;
  }

  handler({
    files: payload.map(f => ({
      path: f,
      name: fileBasename(f),
      asset: convertFileSrc(f),
    }))
  });
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
