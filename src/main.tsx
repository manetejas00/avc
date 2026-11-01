import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { recoverChunk, refreshPage, isChunkLoadError } from './utils/chunkRecovery'

window.addEventListener('vite:preloadError', event => {
  if (recoverChunk((event as Event & { payload: unknown }).payload)) event.preventDefault();
});

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) { recoverChunk(error); }
  render() {
    if (this.state.hasError) {
      return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: '#111', color: '#fff' }}>
        <section style={{ maxWidth: 520, lineHeight: 1.7 }} role="alert">
          <h1 style={{ fontSize: 28, marginBottom: 16 }}>{isChunkLoadError(this.state.error) ? 'A newer version is available' : 'This page could not be displayed'}</h1>
          <p>{isChunkLoadError(this.state.error) ? 'Refresh to load the latest page. If you are offline, reconnect and try again.' : 'Please refresh the page and try again.'}</p>
          <button type="button" onClick={refreshPage} style={{ minHeight: 48, padding: '12px 24px', marginTop: 24, borderRadius: 24, background: '#dfbd45', color: '#111', fontWeight: 600 }}>Refresh page</button>
          <a href="/" style={{ display: 'inline-block', padding: 16, color: '#dfbd45' }}>Back to home</a>
        </section>
      </main>;
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
