import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout';
import { HomePage, LobbyPage, SettingsPage, IsometricTestPage } from './pages';
import { GameProvider } from './contexts/GameContext';
import { ConnectionStatus } from './components/game/ConnectionStatus';

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="lobby" element={<LobbyPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="isometric" element={<IsometricTestPage />} />
            </Route>
          </Routes>
          
          {/* Connection Status Indicator */}
          <ConnectionStatus />
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
              },
            }}
          />
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;