import React, { useState, useEffect } from 'react';
import { Circle } from 'lucide-react';

type Player = {
  id: number;
  x: number;
  y: number;
  isSeeker: boolean;
};

type GameState = 'selection' | 'playing';

function App() {
  const [gameState, setGameState] = useState<GameState>('selection');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isPlayerSeeker, setIsPlayerSeeker] = useState<boolean | null>(null);
  const gridSize = 10;

  // Initialize game with players
  const startGame = (playerIsSeeker: boolean) => {
    setIsPlayerSeeker(playerIsSeeker);
    const newPlayers: Player[] = [];
    
    // Add player
    newPlayers.push({
      id: 0,
      x: playerIsSeeker ? 0 : gridSize - 1,
      y: playerIsSeeker ? 0 : gridSize - 1,
      isSeeker: playerIsSeeker
    });

    // Add AI players
    for (let i = 1; i < 4; i++) {
      newPlayers.push({
        id: i,
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
        isSeeker: !playerIsSeeker
      });
    }

    setPlayers(newPlayers);
    setGameState('playing');
  };

  // Handle player movement
  const handleKeyPress = (e: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const playerIndex = 0; // Player is always first in array

      const movePlayer = (dx: number, dy: number) => {
        const newX = Math.max(0, Math.min(gridSize - 1, newPlayers[playerIndex].x + dx));
        const newY = Math.max(0, Math.min(gridSize - 1, newPlayers[playerIndex].y + dy));
        newPlayers[playerIndex] = { ...newPlayers[playerIndex], x: newX, y: newY };
      };

      switch (e.key) {
        case 'ArrowUp':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
          movePlayer(1, 0);
          break;
      }

      return newPlayers;
    });
  };

  // Move AI players
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        
        // Move each AI player
        for (let i = 1; i < newPlayers.length; i++) {
          const player = newPlayers[i];
          const playerPos = { x: newPlayers[0].x, y: newPlayers[0].y };
          
          // Simple AI: move away from or towards player based on role
          const dx = player.isSeeker ? Math.sign(playerPos.x - player.x) : Math.sign(player.x - playerPos.x);
          const dy = player.isSeeker ? Math.sign(playerPos.y - player.y) : Math.sign(player.y - playerPos.y);
          
          const newX = Math.max(0, Math.min(gridSize - 1, player.x + dx));
          const newY = Math.max(0, Math.min(gridSize - 1, player.y + dy));
          
          newPlayers[i] = { ...player, x: newX, y: newY };
        }
        
        return newPlayers;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [gameState]);

  // Set up keyboard controls
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Check for collisions
  useEffect(() => {
    if (gameState !== 'playing') return;

    const player = players[0];
    const otherPlayers = players.slice(1);

    otherPlayers.forEach(other => {
      if (player.x === other.x && player.y === other.y) {
        setGameState('selection');
        setPlayers([]);
        setIsPlayerSeeker(null);
      }
    });
  }, [players, gameState]);

  if (gameState === 'selection') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-3xl font-bold text-white mb-8">Tag Game</h1>
          <div className="space-y-4">
            <button
              onClick={() => startGame(true)}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Play as Seeker
            </button>
            <button
              onClick={() => startGame(false)}
              className="w-full bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Play as Runner
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
        <div className="grid gap-2" style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` 
        }}>
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const x = index % gridSize;
            const y = Math.floor(index / gridSize);
            const player = players.find(p => p.x === x && p.y === y);

            return (
              <div 
                key={index} 
                className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center"
              >
                {player && (
                  <Circle
                    className={`${
                      player.isSeeker ? 'text-red-500' : 'text-white'
                    } ${player.id === 0 ? 'animate-pulse' : ''}`}
                    size={24}
                    fill="currentColor"
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-white mt-4 text-center">
          Use arrow keys to move. {isPlayerSeeker ? 'Catch the runners!' : 'Avoid the seeker!'}
        </p>
      </div>
    </div>
  );
}

export default App;