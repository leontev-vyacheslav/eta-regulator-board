import './polyfills';

import { createRoot } from 'react-dom/client';
import './index.css';
import Main from './app';
import React, { StrictMode } from 'react';

const root =  createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <Main />
  </StrictMode>
);
