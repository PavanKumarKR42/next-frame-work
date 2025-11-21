'use client';

import { useEffect, useState } from 'react';

export default function DiceGame() {
  const [selectedPrediction, setSelectedPrediction] = useState<boolean | null>(null);
  const [rolledNumber, setRolledNumber] = useState<number | null>(null);
  const [isWinner, setIsWinner] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddr, setWalletAddr] = useState('Not Connected');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [showClaim, setShowClaim] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }

    // Initialize Farcaster SDK
    const initializeSdk = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const { createConfig, connect, getAccount } = await import('@wagmi/core');
        const { base } = await import('@wagmi/core/chains');
        const { http } = await import('@wagmi/core');
        const { farcasterMiniApp } = await import('@farcaster/miniapp-wagmi-connector');

        const config = createConfig({
          chains: [base],
          transports: { [base.id]: http() }
        });

        await sdk.actions.ready({ disableNativeGestures: true });
        console.log("Farcaster MiniApp SDK ready!");
        showStatus('App ready! Connecting wallet...', 'loading');

        try {
          let account = getAccount(config);
          
          if (!account?.address) {
            const result = await connect(config, {
              connector: farcasterMiniApp(),
              chainId: base.id
            });
            console.log('Connection result:', result);
            account = getAccount(config);
          }
          
          if (account?.address) {
            setIsConnected(true);
            const shortAddress = `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
            setWalletAddr(shortAddress);
            console.log('Wallet connected:', account.address);
            showStatus(`✅ Connected: ${shortAddress}`, 'success');
            setTimeout(() => hideStatus(), 3000);
          } else {
            console.warn('No address found after connection attempt');
            showStatus('⚠️ Wallet not connected. Some features may be limited.', 'error');
            setTimeout(() => hideStatus(), 5000);
          }

        } catch (err) {
          console.error('Wallet connection error:', err);
          showStatus('⚠️ Could not connect wallet. Please ensure you are using Warpcast app.', 'error');
          setTimeout(() => hideStatus(), 5000);
        }

        // Auto-prompt to add app
        const hasPromptedAddApp = sessionStorage.getItem('hasPromptedAddApp');
        if (!hasPromptedAddApp) {
          try {
            console.log('Auto-prompting add app...');
            await sdk.actions.addMiniApp();
            sessionStorage.setItem('hasPromptedAddApp', 'true');
            console.log('App added successfully!');
          } catch (error) {
            console.log('Add app prompt dismissed or failed');
            sessionStorage.setItem('hasPromptedAddApp', 'true');
          }
        }

        // Store config and sdk in window for later use
        (window as any).wagmiConfig = config;
        (window as any).farcasterSdk = sdk;

      } catch (err) {
        console.error("SDK initialization failed:", err);
        showStatus('Failed to initialize. Please reopen in Warpcast.', 'error');
      }
    };

    initializeSdk();
  }, []);

  const showStatus = (message: string, type: string) => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const hideStatus = () => {
    setStatusMessage('');
    setStatusType('');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', newTheme);
  };

  const selectPrediction = (prediction: boolean) => {
    setSelectedPrediction(prediction);
  };

  const rollDice = () => {
    if (selectedPrediction === null) return;

    setIsRolling(true);
    setShowClaim(false);
    setShowShare(false);

    setTimeout(() => {
      const number = Math.floor(Math.random() * 101);
      setRolledNumber(number);
      setIsRolling(false);

      const won = selectedPrediction ? number > 50 : number < 50;
      setIsWinner(won);

      if (won) {
        setShowClaim(true);
        showStatus('Congratulations! Click below to claim your 1 TYBG reward!', 'success');
      } else {
        showStatus('Better luck next time! Try another prediction.', 'error');
        setTimeout(() => {
          resetGame();
        }, 3000);
      }
    }, 500);
  };

  const claimReward = async () => {
    if (!isWinner || rolledNumber === null || selectedPrediction === null) return;

    if (!isConnected) {
      showStatus('❌ Please connect your wallet first. Try reopening in Warpcast.', 'error');
      return;
    }

    hideStatus();

    try {
      showStatus('<span class="loader"></span>Preparing transaction...', 'loading');

      const { switchChain, writeContract, getAccount } = await import('@wagmi/core');
      const { base } = await import('@wagmi/core/chains');
      const config = (window as any).wagmiConfig;

      const account = getAccount(config);
      if (!account?.address) {
        throw new Error('Wallet not connected');
      }

      console.log('Claiming reward with:', {
        address: account.address,
        prediction: selectedPrediction,
        rolledNumber: rolledNumber
      });

      showStatus('<span class="loader"></span>Switching to Base chain...', 'loading');
      await switchChain(config, { chainId: base.id });

      showStatus('<span class="loader"></span>Claiming your reward...', 'loading');

      const DICE_CONTRACT = '0x6b5DbbF1049691d430bE3135419B47093523ecA6';
      const DICE_ABI = [
        {
          "inputs": [{"internalType": "bool", "name": "prediction", "type": "bool"}, {"internalType": "uint256", "name": "randomNum", "type": "uint256"}],
          "name": "claimReward",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      const txHash = await writeContract(config, {
        address: DICE_CONTRACT,
        abi: DICE_ABI,
        functionName: 'claimReward',
        args: [selectedPrediction, BigInt(rolledNumber)]
      });

      const explorerUrl = `https://basescan.org/tx/${txHash}`;

      showStatus(
        `🎉 Reward Claimed! You received 1 TYBG!<br><a href="${explorerUrl}" target="_blank">View Transaction</a>`,
        'success'
      );

      setShowShare(true);

      setTimeout(() => {
        resetGame();
      }, 10000);

    } catch (error: any) {
      console.error('Claim error:', error);
      
      let errorMsg = 'Failed to claim reward';
      if (error.message.includes('User rejected') || error.message.includes('rejected')) {
        errorMsg = '❌ Transaction rejected by user';
      } else if (error.message.includes('Wallet not connected')) {
        errorMsg = '❌ Wallet not connected. Please reopen in Warpcast.';
      } else if (error.message.includes('insufficient funds')) {
        errorMsg = '❌ Insufficient funds for gas';
      } else if (error.message) {
        errorMsg = `❌ ${error.message.slice(0, 100)}`;
      }
      showStatus(errorMsg, 'error');
    }
  };

  const shareOnFarcaster = async () => {
    try {
      showStatus('<span class="loader"></span>Opening cast composer...', 'loading');

      const sdk = (window as any).farcasterSdk;
      await sdk.actions.composeCast({
        text: `🎲 I just won 1 TYBG playing the Dice Game! 
Rolled ${rolledNumber} and predicted ${selectedPrediction ? 'Above' : 'Below'} 50.5! 

Try your luck now! 🍀`,
        embeds: ["https://dice-game-nine-ruby.vercel.app"]
      });

      showStatus('Cast composer opened!', 'success');
      setTimeout(() => hideStatus(), 3000);
    } catch (error) {
      console.error('Share error:', error);
      showStatus('Failed to open cast composer', 'error');
    }
  };

  const resetGame = () => {
    setSelectedPrediction(null);
    setRolledNumber(null);
    setIsWinner(false);
    setShowClaim(false);
    setShowShare(false);
    hideStatus();
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
            <span className="info-value">{walletAddr}</span>
          </div>
        </div>

        <div className="dice-container">
          <div className="dice-label">Roll Result</div>
          <div className={`dice-number ${isRolling ? 'rolling' : ''}`}>
            {rolledNumber !== null ? rolledNumber : '?'}
          </div>
          {isWinner && (
            <div className="result-badge win">🎉 YOU WON!</div>
          )}
          {!isWinner && rolledNumber !== null && (
            <div className="result-badge lose">😢 TRY AGAIN</div>
          )}
        </div>

        <div className="prediction-section">
          <div className="prediction-buttons">
            <button 
              className={`prediction-btn ${selectedPrediction === true ? 'selected' : ''}`}
              onClick={() => selectPrediction(true)}
              disabled={isRolling}
            >
              <div style={{fontSize: '24px', marginBottom: '4px'}}>⬆️</div>
              <div>Above 50.5</div>
            </button>
            <button 
              className={`prediction-btn ${selectedPrediction === false ? 'selected' : ''}`}
              onClick={() => selectPrediction(false)}
              disabled={isRolling}
            >
              <div style={{fontSize: '24px', marginBottom: '4px'}}>⬇️</div>
              <div>Below 50.5</div>
            </button>
          </div>

          <button 
            className="roll-btn" 
            onClick={rollDice}
            disabled={selectedPrediction === null || isRolling}
          >
            {selectedPrediction === null ? 'Select Your Prediction' : '🎲 Roll the Dice!'}
          </button>

          <button 
            className={`claim-btn ${showClaim ? 'show' : ''}`}
            onClick={claimReward}
          >
            🎉 Claim 1 TYBG Reward
          </button>

          <button 
            className={`share-btn ${showShare ? 'show' : ''}`}
            onClick={shareOnFarcaster}
          >
            📢 Share Your Win on Farcaster
          </button>
        </div>

        {statusMessage && (
          <div className={`status show ${statusType}`} dangerouslySetInnerHTML={{ __html: statusMessage }} />
        )}

        <div className="footer">
          Built with ❤️ | Follow: <a href="https://farcaster.xyz/yourname" target="_blank">@yourname</a>
        </div>
      </div>
    </>
  );
}