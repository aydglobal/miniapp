import React from 'react';
import ReactDOM from 'react-dom/client';
import MainRouter from './router';
import { UserProvider } from './store/useUser';
import './styles.css';
import './adn-pro-visual-patch.css';
import './adn-crypto-empire.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <MainRouter />
    </UserProvider>
  </React.StrictMode>
);
