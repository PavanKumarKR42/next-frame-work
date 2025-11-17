'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    sdk: any;
    config: any;
    publicClient: any;
    wagmi: any;
    viem: any;
    connector: any;
  }
}

const CONTRACT_ADDRESS = '0xD65A46d6Bb6408B6825FF72FC6FE1EFE6E1A35a4';
const MAX_SCORE = 7;
const NEYNAR_API_KEY = '20FEAD29-CB14-438B-8309-868BA126B594';
const GAME_URL = 'https://mindgame-omega.vercel.app/';
const BLOCK_EXPLORER_URL = 'https://basescan.org';

const ABI: any[] = [{"inputs":[{"internalType":"address","name":"_bonkToken","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"gameId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"score","type":"uint256"}],"name":"GameEnded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":true,"internalType":"uint256","name":"gameId","type":"uint256"}],"name":"GameStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"gameId","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"inputs":[],"name":"MAX_DAILY_GAMES","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_SCORE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REWARD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPlayers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"bonkToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"gameId","type":"uint256"}],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"dailyPlays","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"gameId","type":"uint256"},{"internalType":"uint256","name":"score","type":"uint256"}],"name":"endGame","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"games","outputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"bool","name":"ended","type":"bool"},{"internalType":"uint256","name":"score","type":"uint256"},{"internalType":"bool","name":"claimed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"n","type":"uint256"}],"name":"getTopPlayers","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastDay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextGameId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"startGame","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userTotalScore","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const colors = [
  { name: "red", hex: "#e74c3c" },
  { name: "blue", hex: "#3498db" },
  { name: "green", hex: "#2ecc71" },
  { name: "yellow", hex: "#f39c12" },
  { name: "purple", hex: "#9b59b6" }
];

interface LeaderboardEntry {
  rank: number;
  username?: string;
  pfp?: string;
  address: string;
  score: number;
}

export default function Home() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [currentDailyPlays, setCurrentDailyPlays] = useState(0);
  const [maxDailyGames, setMaxDailyGames] = useState(3);
  const [finalScore, setFinalScore] = useState(0);
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [displaying, setDisplaying] = useState(false);
  const [buttonsEnabled, setButtonsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('play');
  const [showRules, setShowRules] = useState(false);
  const [message, setMessage] = useState('Ready to connect!');
  const [colorDisplay, setColorDisplay] = useState('GET READY');
  const [colorDisplayBg, setColorDisplayBg] = useState('rgba(0, 0, 0, 0.4)');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showConnect, setShowConnect] = useState(true);
  const [showStart, setShowStart] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [startBtnText, setStartBtnText] = useState('Start Free Game');
  const [startBtnDisabled, setStartBtnDisabled] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [pulseDisplay, setPulseDisplay] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const warnSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const sdkRef = useRef<any | null>(null);
  const configRef = useRef<any | null>(null);
  const publicClientRef = useRef<any | null>(null);

  useEffect(() => {
    const storedScore = localStorage.getItem('bestScore');
    if (storedScore) {
      setBestScore(parseInt(storedScore));
    }

    clickSoundRef.current = new Audio('/music.wav');
    warnSoundRef.current = new Audio('/warn.wav');
    winSoundRef.current = new Audio('/win.wav');
    if (clickSoundRef.current) clickSoundRef.current.volume = 0.5;
    if (warnSoundRef.current) warnSoundRef.current.volume = 0.6;
    if (winSoundRef.current) winSoundRef.current.volume = 0.7;

    const initSDK = async () => {
      try {
        // Import SDK FIRST
        const { sdk } = await import('@farcaster/miniapp-sdk');
        
        // Then import wagmi and viem
        const {
          createConfig, connect, readContract, writeContract, getAccount
        } = await import('@wagmi/core');
        const { base } = await import('@wagmi/core/chains');
        const { farcasterMiniApp } = await import('@farcaster/miniapp-wagmi-connector');
        const { createPublicClient, http, decodeEventLog } = await import('viem');

        const config = createConfig({
          chains: [base],
          transports: { [base.id]: http() }
        });

        const publicClient = createPublicClient({
          chain: base,
          transport: http()
        });

        window.sdk = sdk;
        window.config = config;
        window.publicClient = publicClient;
        window.wagmi = { connect, readContract, writeContract, getAccount };
        window.viem = { decodeEventLog };
        window.connector = { farcasterMiniApp, base };

        sdkRef.current = sdk;
        configRef.current = config;
        publicClientRef.current = publicClient;

        // CRITICAL FIX: Properly call and await sdk.actions.ready()
        try {
          console.log("Calling sdk.actions.ready()...");
          await sdk.actions.ready({ disableNativeGestures: true });
          console.log("✓ Farcaster MiniApp SDK ready - splash screen should dismiss");
        } catch (readyErr) {
          console.warn("SDK ready() warning:", readyErr);
          // Don't throw - allow app to continue even if ready() fails
        }

        setMessage("Ready to connect!");

        // Handle initial setup
        const hasSeenRules = localStorage.getItem('hasSeenRules');
        if (!hasSeenRules) {
          setTimeout(() => setShowRules(true), 300);
        }

        const hasPromptedAddApp = sessionStorage.getItem('hasPromptedAddApp');
        if (!hasPromptedAddApp) {
          try {
            await sdk.actions?.addMiniApp?.();
            sessionStorage.setItem('hasPromptedAddApp', 'true');
          } catch (error) {
            console.log('Add app prompt dismissed:', error);
            sessionStorage.setItem('hasPromptedAddApp', 'true');
          }
        }
      } catch (err) {
        console.error("SDK initialization error:", err);
        setMessage("SDK initialization failed - but you can still play!");
        showToastMsg("Failed to fully initialize SDK. Try reloading.");
      }
    };

    initSDK();

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const showToastMsg = (msg: string, duration = 3500) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  const updateStartButtonText = (dailyPlays: number) => {
    if (dailyPlays < maxDailyGames) {
      setStartBtnText(`Start Free Game (${dailyPlays}/${maxDailyGames})`);
      setStartBtnDisabled(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else {
      setStartBtnDisabled(true);
      startTimer();
    }
  };

  const fetchDailyPlays = async (address: string) => {
    try {
      const { readContract } = window.wagmi;
      const currentDay = Math.floor(Date.now() / 1000 / 86400);

      const lastDay = await readContract(configRef.current, {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'lastDay',
        args: [address]
      });

      if (Number(lastDay) < currentDay) {
        setCurrentDailyPlays(0);
        updateStartButtonText(0);
      } else {
        const count = await readContract(configRef.current, {
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'dailyPlays',
          args: [address]
        });
        setCurrentDailyPlays(Number(count));
        updateStartButtonText(Number(count));
      }
    } catch (e) {
      console.error('Failed to fetch daily plays:', e);
      setCurrentDailyPlays(0);
      updateStartButtonText(0);
    }
  };

  const fetchMaxDailyGames = async () => {
    try {
      const { readContract } = window.wagmi;
      const max = await readContract(configRef.current, {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'MAX_DAILY_GAMES'
      });
      setMaxDailyGames(Number(max));
    } catch (e) {
      console.error('Failed to fetch MAX_DAILY_GAMES:', e);
      setMaxDailyGames(3);
    }
  };

  const getTimeUntilMidnightUTC = () => {
    const now = new Date();
    const midnight = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    const diff = midnight.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, total: diff };
  };

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const updateTimerDisplay = () => {
      const { hours, minutes, seconds } = getTimeUntilMidnightUTC();
      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setStartBtnText(`Next game in ${formattedTime}`);
    };

    updateTimerDisplay();
    timerIntervalRef.current = setInterval(() => {
      const { total } = getTimeUntilMidnightUTC();

      if (total <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setCurrentDailyPlays(0);
        setStartBtnDisabled(false);
        updateStartButtonText(0);
        if (userAddress) {
          fetchDailyPlays(userAddress);
        }
      } else {
        updateTimerDisplay();
      }
    }, 1000);
  };

  const connectWallet = async () => {
    try {
      setShowConnect(false);
      setMessage('Connecting wallet...');

      const { connect, getAccount } = window.wagmi;
      const { farcasterMiniApp, base } = window.connector;

      await connect(configRef.current, {
        connector: farcasterMiniApp(),
        chainId: base.id
      });

      const address = getAccount(configRef.current)?.address;

      if (address) {
        setUserAddress(address);
        showToastMsg(`Connected: ${address.slice(0, 6)}…${address.slice(-4)}`);

        await fetchMaxDailyGames();
        await fetchDailyPlays(address);

        setShowStart(true);
        setColorDisplay("Get Ready...");
        setMessage("Wallet connected. Ready to play!");
      } else {
        throw new Error("No address returned");
      }
    } catch (err) {
      console.error("Wallet connect failed:", err);
      showToastMsg("Connect failed. Make sure you opened this in Warpcast.");
      setShowConnect(true);
      setMessage("Connection failed. Try again.");
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const displaySequence = async () => {
    setDisplaying(true);
    setButtonsEnabled(false);
    setColorDisplay("Watch Carefully!");
    setMessage("");
    await sleep(800);

    for (let i = 0; i < sequence.length; i++) {
      const colorObj = colors.find(c => c.name === sequence[i]);
      if (colorObj) {
        setColorDisplayBg(colorObj.hex);
        setColorDisplay(colorObj.name.toUpperCase());
        setPulseDisplay(true);
        await sleep(700);
        setPulseDisplay(false);
        setColorDisplayBg("rgba(0, 0, 0, 0.3)");
        setColorDisplay("");
        await sleep(300);
      }
    }

    setDisplaying(false);
    setButtonsEnabled(true);
    setColorDisplay("Your Turn!");
  };

  const nextRound = () => {
    setUserSequence([]);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setSequence(prev => [...prev, randomColor.name]);
    setTimeout(() => displaySequence(), 100);
  };

  const initGame = async () => {
    if (!userAddress) {
      showToastMsg("Please connect your wallet first!");
      return;
    }

    if (currentDailyPlays >= maxDailyGames) {
      showToastMsg("You've reached your daily game limit. Come back tomorrow!");
      return;
    }

    setMessage(`Starting Free Game... Please confirm gas transaction.`);
    setButtonsEnabled(false);
    setStartBtnDisabled(true);

    try {
      const { writeContract } = window.wagmi;
      const { decodeEventLog } = window.viem;

      const txResponse = await writeContract(configRef.current, {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'startGame',
        args: [],
      });

      const hash = txResponse?.hash || txResponse;
      if (!hash) {
        throw new Error("Transaction not sent");
      }

      showToastMsg(`Transaction sent! Waiting for confirmation...`);
      setMessage(`Transaction sent! Waiting for confirmation...`);

      const receipt = await publicClientRef.current?.waitForTransactionReceipt({ hash });

      let gameId = null;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: ABI,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "GameStarted") {
            gameId = Number(decoded.args.gameId);
            setCurrentGameId(gameId);
            break;
          }
        } catch (e) {}
      }

      if (gameId === null) {
        setMessage(`No GameStarted event found.`);
        showToastMsg("Transaction confirmed but GameStarted event missing.");
        setStartBtnDisabled(false);
        return;
      }

      setMessage(`Game started! Game ID: ${gameId}`);
      showToastMsg(`Game started! Game ID: ${gameId}`);

      setShowStart(false);
      setShowRestart(true);
      setShowClaim(false);
      setShowShare(false);
      setFinalScore(0);
      setSequence([]);
      setRound(1);

      const newPlays = currentDailyPlays + 1;
      setCurrentDailyPlays(newPlays);
      updateStartButtonText(newPlays);
      
      nextRound();
    } catch (e: any) {
      console.error('Init error:', e);
      let errMsg = e?.shortMessage || e?.message || "Unknown error";
      showToastMsg(`Start Failed: ${errMsg}`);
      setMessage(`Transaction failed: ${errMsg}`);
      setStartBtnDisabled(false);
    }
  };

  const handleUserInput = async (colorName: string) => {
    if (displaying || !buttonsEnabled) return;

    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(() => {});
    }

    const newUserSeq = [...userSequence, colorName];
    setUserSequence(newUserSeq);
    const currentIndex = newUserSeq.length - 1;

    if (newUserSeq[currentIndex] !== sequence[currentIndex]) {
      await handleGameEnd(false);
      return;
    }

    if (newUserSeq.length === sequence.length) {
      if (round === MAX_SCORE) {
        await handleGameEnd(true);
      } else {
        setButtonsEnabled(false);
        setColorDisplayBg("#2ecc71");
        setColorDisplay("Correct!");
        const newRound = round + 1;
        setRound(newRound);
        setMessage(`Great! Round ${newRound} incoming...`);

        setTimeout(() => {
          setColorDisplayBg("rgba(0, 0, 0, 0.3)");
          setColorDisplay("");
          nextRound();
        }, 1200);
      }
    }
  };

  const createConfetti = () => {
    const confettiColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e91e63', '#00bcd4'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(confetti);

        setTimeout(() => {
          confetti.remove();
        }, 4000);
      }, i * 30);
    }
  };

  const handleGameEnd = async (isWin: boolean) => {
    setButtonsEnabled(false);

    if (isWin) {
      if (winSoundRef.current) {
        winSoundRef.current.currentTime = 0;
        winSoundRef.current.play().catch(() => {});
      }
      createConfetti();
      setColorDisplayBg("#f39c12");
      setColorDisplay("PERFECT!");
      setMessage(`Amazing! You reached max score ${MAX_SCORE}!`);
    } else {
      if (warnSoundRef.current) {
        warnSoundRef.current.currentTime = 0;
        warnSoundRef.current.play().catch(() => {});
      }
      setColorDisplayBg("#e74c3c");
      setColorDisplay("Wrong!");
      setMessage(`Game Over! You reached round ${round}`);
    }

    if (round > bestScore) {
      setBestScore(round);
      localStorage.setItem('bestScore', round.toString());
      setMessage(prev => prev + ` New Best: ${round}!`);
    }

    setFinalScore(round);
    setSequence([]);

    setTimeout(async () => {
      setColorDisplayBg("rgba(0, 0, 0, 0.3)");
      setColorDisplay("Get Ready...");
      setMessage("");

      try {
        if (currentGameId) {
          showToastMsg("Saving your score on-chain...");
          setMessage(`Submitting score ${round} for game ${currentGameId}...`);

          const { writeContract, readContract } = window.wagmi;

          const txResponse = await writeContract(configRef.current, {
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'endGame',
            args: [BigInt(currentGameId), BigInt(round)]
          });

          const endHash = (txResponse as any)?.hash || txResponse as any;
          if (endHash) {
            showToastMsg(`Score TX sent! Waiting for confirmation...`);
            setMessage(`Confirming score submission...`);

            await publicClientRef.current?.waitForTransactionReceipt({ hash: endHash });
            showToastMsg("Score submitted successfully!");

            const gameData = await readContract(configRef.current, {
              address: CONTRACT_ADDRESS,
              abi: ABI,
              functionName: 'games',
              args: [BigInt(currentGameId)]
            });

            const storedScore = Number(gameData[2]);
            setMessage(`Score ${storedScore} saved on-chain!`);
          }
        }

        if (round === MAX_SCORE && currentGameId) {
          setShowClaim(true);
          showToastMsg(`Perfect score ${MAX_SCORE}! Click "Claim 3k BONK" to get your reward!`, 4000);
          setMessage(`You scored ${MAX_SCORE}/7! Claim your reward!`);
        } else if (round < MAX_SCORE) {
          showToastMsg(`Good try! You scored ${round}. Reach ${MAX_SCORE} for a reward.`);
          setMessage(`Score ${round} saved. Try to reach ${MAX_SCORE}!`);
        }
      } catch (e: any) {
        console.error('EndGame error:', e);
        let errMsg = e?.shortMessage || e?.message || "Unknown error";
        showToastMsg(`Failed to save score: ${errMsg}`);
        setMessage(`Could not save on-chain: ${errMsg}`);
      }
    }, 2500);
  };

  const claimReward = async () => {
    if (!currentGameId) {
      showToastMsg('No active game to claim. Play and win first!');
      return;
    }

    if (finalScore !== MAX_SCORE) {
      showToastMsg(`Score must be exactly ${MAX_SCORE} to claim. You scored ${finalScore}.`);
      return;
    }

    try {
      const { readContract, writeContract } = window.wagmi;

      const gameData = await readContract(configRef.current, {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'games',
        args: [BigInt(currentGameId)]
      });

      const [player, ended, score, claimed] = gameData;

      if (claimed) {
        showToastMsg('Reward already claimed for this game!');
        setShowClaim(false);
        return;
      }

      if (!ended) {
        showToastMsg('Game not ended yet. Please wait.');
        return;
      }

      if (Number(score) !== MAX_SCORE) {
        showToastMsg(`Score is ${Number(score)}, must be exactly ${MAX_SCORE} to claim!`);
        return;
      }

      const txResponse = await writeContract(configRef.current, {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'claim',
        args: [BigInt(currentGameId)]
      });

      const hash = (txResponse as any)?.hash || (txResponse as any);

      if (!hash) {
        throw new Error('Transaction failed - no hash returned');
      }

      showToastMsg(`Claim TX sent! View TX`, 5000);
      setMessage('Waiting for confirmation...');

      await publicClientRef.current?.waitForTransactionReceipt({ hash });

      showToastMsg(`🎉 Reward claimed successfully! 3k BONK is yours!`, 4000);
      setMessage(`Successfully claimed 3k BONK tokens!`);
      setShowClaim(false);
      setShowShare(true);
    } catch (e: any) {
      console.error('Claim error:', e);
      let errMsg = e?.shortMessage || e?.message || 'Unknown error';

      if (errMsg.includes('Already claimed') || errMsg.includes('already claimed')) {
        showToastMsg('Reward already claimed!');
        setShowClaim(false);
      } else if (errMsg.includes('User rejected') || errMsg.includes('rejected')) {
        showToastMsg('Transaction cancelled by user');
      } else {
        showToastMsg(`Claim failed: ${errMsg}`);
      }
    }
  };

  const shareWin = async () => {
    try {
      showToastMsg('Opening cast composer...', 3000);

      await sdkRef.current?.actions.composeCast({
        text: `🎮 Just won 3,000 BONK tokens playing the memory game on @base! 
Can you beat my score? 🏆

Built by @pavankumarkr. `,
        embeds: [GAME_URL]
      });

      showToastMsg('Cast composer opened!', 3000);
    } catch (error) {
      console.error('Share error:', error);
      showToastMsg('Failed to open cast composer', 3000);
    }
  };

  const restartGame = () => {
    setSequence([]);
    setUserSequence([]);
    setRound(1);
    setDisplaying(false);
    setCurrentGameId(null);
    setFinalScore(0);
    setColorDisplayBg("rgba(0, 0, 0, 0.3)");
    setColorDisplay("Get Ready...");
    setMessage("Ready for your next game!");
    setButtonsEnabled(false);
    setShowRestart(false);
    setShowClaim(false);
    setShowShare(false);
    setShowStart(true);

    if (userAddress) {
      fetchDailyPlays(userAddress);
    } else {
      updateStartButtonText(currentDailyPlays);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { readContract } = window.wagmi;
      const [players, scores] = await readContract(configRef.current, {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'getTopPlayers',
        args: [10n]
      });

      if (!players || players.length === 0) {
        setLeaderboard([]);
        return;
      }

      const addressesParam = players.join(',');
      const response = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${addressesParam}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'api_key': NEYNAR_API_KEY
          }
        }
      );

      const farcasterUsers = response.ok ? await response.json() : {};

      const leaderboardData = players.map((address: string, idx: number) => {
        const users = farcasterUsers[address.toLowerCase()];
        let displayData: any = {
          rank: idx + 1,
          address: address,
          score: scores[idx].toString()
        };

        if (users && users.length > 0) {
          const user = users[0];
          displayData.pfp = user.pfp_url || 'https://via.placeholder.com/32';
          displayData.username = user.username || 'Unknown';
        }

        return displayData;
      });

      setLeaderboard(leaderboardData);
    } catch (e) {
      console.error('Leaderboard error:', e);
      setLeaderboard([]);
    }
  };

  return (
    <>
      {showRules && (
        <div className="rules-overlay">
          <div className="rules-container">
            <div className="rules-header">
              <h2 className="rules-title">Game Rules</h2>
            </div>
            <div className="rules-content">
              <p>
                <span className="rules-bullet">•</span>
                <span className="rules-text"><strong>You get 3 games per day.</strong> That's right, <strong>THREE.</strong> No more, no less. Don't waste 'em trying to be smart. Just play, loser 😎</span>
              </p>
              <p>
                <span className="rules-bullet">•</span>
                <span className="rules-text"><strong>Each game has 7 rounds.</strong> Think of it like 7 boss fights, except the bosses are your own bad decisions.</span>
              </p>
              <p>
                <span className="rules-bullet">•</span>
                <span className="rules-text"><strong>Reach Round 7 = YOU WIN LIFE.</strong> Congratulations, you absolute legend 🎉 You get <strong>3,000 $BONK tokens</strong> — enough to brag on Farcaster for at least 12 hours.</span>
              </p>
              <p>
                <span className="rules-bullet">•</span>
                <span className="rules-text"><strong>Don't make it to Round 7?</strong> Oof. Tough luck. Your score gets <strong>thrown onto the leaderboard</strong> so everyone can laugh — or cheer, if they're nice (they're not).</span>
              </p>
              <p>
                <span className="rules-bullet">•</span>
                <span className="rules-text"><strong>Leaderboard = Street Cred.</strong> More score = more flex. Less score = meme material.</span>
              </p>
            </div>
            <button
              className="rules-close-btn"
              onClick={() => {
                setShowRules(false);
                localStorage.setItem('hasSeenRules', 'true');
              }}
            >
              Got It! Let&apos;s Play 🚀
            </button>
          </div>
        </div>
      )}

      <div className="tabbar">
        <button
          className={activeTab === 'play' ? 'active' : ''}
          onClick={() => setActiveTab('play')}
        >
          Play
        </button>
        <button
          className={activeTab === 'leaderboard' ? 'active' : ''}
          onClick={() => {
            setActiveTab('leaderboard');
            loadLeaderboard();
          }}
        >
          Leaderboard
        </button>
      </div>

      {activeTab === 'play' && (
        <section id="playTab">
          <div className="game-container">
            <h1>Color Sequence</h1>

            <div className="score-info">
              <div className="score-box">
                <div className="score-label">Round</div>
                <div className="score-value">{round}</div>
              </div>
            </div>

            <div 
              id="colorDisplay" 
              className={pulseDisplay ? 'pulse' : ''}
              style={{ backgroundColor: colorDisplayBg }}
            >
              {colorDisplay}
            </div>

            <div className="buttons">
              <img src="/bonktoken.png" alt="BONK" className="bonk-token" />
              {colors.map((color) => (
                <button
                  key={color.name}
                  className={`colorBtn ${color.name === 'purple' ? 'purple-btn' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  data-color={color.name}
                  onClick={() => handleUserInput(color.name)}
                  disabled={!buttonsEnabled}
                >
                  {color.name.toUpperCase()}
                </button>
              ))}
            </div>

            <div id="message">{message}</div>

            <div className="btn-control">
              {showConnect && (
                <button className="start-btn" onClick={connectWallet}>
                  Connect Wallet
                </button>
              )}
              {showStart && (
                <button 
                  className="start-btn" 
                  onClick={initGame}
                  disabled={startBtnDisabled}
                >
                  {startBtnText}
                </button>
              )}
              {showRestart && (
                <button className="restart-btn" onClick={restartGame}>
                  Restart Game
                </button>
              )}
              {showClaim && (
                <button className="claim-btn" onClick={claimReward}>
                  Claim 3k BONK
                </button>
              )}
              {showShare && (
                <button className="share-btn" onClick={shareWin}>
                  🎉 Share Your Win on Farcaster
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'leaderboard' && (
        <section id="leaderboardTab" style={{ width: '100%', padding: '0 12px', marginBottom: '20px' }}>
          <div className="leaderboard-header">
            <h3>🏆 Top Players 🏆</h3>
            <p>Compete for the highest score and claim your glory!</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Rank</th>
                <th>Player</th>
                <th style={{ textAlign: 'center' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={3} className="center">Loading…</td>
                </tr>
              ) : (
                leaderboard.map((entry, idx) => (
                  <tr key={idx}>
                    <td className={`rank-cell ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : ''}`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : entry.rank}
                    </td>
                    <td>
                      {entry.username ? (
                        <div className="user-cell">
                          <img
                            src={entry.pfp}
                            alt={entry.username}
                            className="pfp"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32';
                            }}
                          />
                          <div className="user-info">
                            <div className="username">@{entry.username}</div>
                            <div className="address">{entry.address.slice(0, 6)}…{entry.address.slice(-4)}</div>
                          </div>
                        </div>
                      ) : (
                        <span>{entry.address.slice(0, 6)}…{entry.address.slice(-4)}</span>
                      )}
                    </td>
                    <td className="score-cell">{entry.score}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}

      {showToast && (
        <div className="toast show">
          <div dangerouslySetInnerHTML={{ __html: toastMsg }} />
        </div>
      )}
    </>
  );
}