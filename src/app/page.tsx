'use client';

import { useState, useEffect } from 'react';

export default function DiceGame() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', newTheme);
  };

  return (
    <>
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
      
      <div className="container">
        <div className="header">
          <h1>🎲 TYBG Dice</h1>
          <div className="subtitle">Predict & Win 1 TYBG Token!</div>
        </div>

        <div className="info-box">
          <div className="info-row">
            <span className="info-label">Chain:</span>
            <span className="info-value">Base</span>
          </div>
          <div className="info-row">
            <span className="info-label">Reward:</span>
            <span className="info-value">1 TYBG</span>
          </div>
          <div className="info-row">
            <span className="info-label">Cost:</span>
            <span className="info-value">Gas Only</span>
          </div>
          <div className="info-row">
            <span className="info-label">Connected:</span>
            <span className="info-value">Ready to Play</span>
          </div>
        </div>

        <div className="dice-container">
          <div className="dice-label">Roll Result</div>
          <div className="dice-number">?</div>
        </div>

        <div className="prediction-section">
          <div className="prediction-buttons">
            <button className="prediction-btn">
              <div style={{fontSize: '24px', marginBottom: '4px'}}>⬆️</div>
              <div>Above 50.5</div>
            </button>
            <button className="prediction-btn">
              <div style={{fontSize: '24px', marginBottom: '4px'}}>⬇️</div>
              <div>Below 50.5</div>
            </button>
          </div>

          <button className="roll-btn">
            🎲 Roll the Dice!
          </button>
        </div>

        <div className="footer">
          Built with ❤️ | Follow: <a href="https://farcaster.xyz/yourname" target="_blank">@yourname</a>
        </div>
      </div>
    </>
  );
}