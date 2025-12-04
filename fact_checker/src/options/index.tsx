import React from 'react';
import ReactDOM from 'react-dom/client';
import Options from './Options';
import '../index.css'; // Reuse existing styles

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);
