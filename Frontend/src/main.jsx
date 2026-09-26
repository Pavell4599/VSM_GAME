import React, { useState } from 'react';
import MainMenuComponent from './pages/App.jsx'; // Твоё React-меню
import { StartGame } from './game/main';

function App() {
    const [isPlaying, setIsPlaying] = useState(false);

    const handleStartGame = (vagonConfigPath) => {
        setIsPlaying(true);

        setTimeout(() => {
            StartGame('game-container', vagonConfigPath);
        }, 100);
    };

    return (
        <div className="app-container">
            {!isPlaying ? (
                <MainMenuComponent onStart={handleStartGame} />
            ) : (
                <div id="game-container" style={{ width: '100vw', height: '100vh' }}>
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100 }}
                    >
                        В меню
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;