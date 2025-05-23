import React, { useState } from 'react';
import { Coins, Users, Trophy, Play } from 'lucide-react';

type CoinSide = 'Heads' | 'Tails';
type GameAction = 'bat' | 'bowl';

interface CoinTossProps {
  team1Name: string;
  team2Name: string;
  onTossComplete: (winner: number, decision: 'bat' | 'bowl') => void;
}

const CoinComponent: React.FC<{ 
  side: CoinSide | null; 
  isFlipping: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  className?: string;
}> = ({ side, isFlipping, size = 'medium', onClick, className = '' }) => {
  const sizeConfig = {
    small: { width: '80px', height: '80px', fontSize: '24px' },
    medium: { width: '100px', height: '100px', fontSize: '32px' },
    large: { width: '120px', height: '120px', fontSize: '40px' }
  };

  const config = sizeConfig[size];
  
  return (
    <div className="coin-flip-container">
      <div
        className={`coin-container ${isFlipping ? 'flipping' : ''} ${side ? `result-${side.toLowerCase()}` : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
        style={{
          width: config.width,
          height: config.height,
          perspective: '1000px',
        }}
      >
        <div
          className="coin"
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: isFlipping ? 'none' : 'transform 0.3s ease',
            transform: side === 'Tails' ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            className="coin-face heads"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: config.fontSize,
              fontWeight: 'bold',
              background: 'linear-gradient(145deg, #ffd700, #ffed4e)',
              border: '4px solid #b8860b',
              backfaceVisibility: 'hidden',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              color: '#8b4513',
            }}
          >
            <div style={{ fontSize: '0.7em', marginBottom: '2px' }}>👑</div>
            <div style={{ fontSize: '0.4em' }}>HEADS</div>
          </div>
          
          <div
            className="coin-face tails"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: config.fontSize,
              fontWeight: 'bold',
              background: 'linear-gradient(145deg, #c0c0c0, #e6e6e6)',
              border: '4px solid #808080',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              color: '#2c2c2c',
            }}
          >
            <div style={{ fontSize: '0.7em', marginBottom: '2px' }}>🦅</div>
            <div style={{ fontSize: '0.4em' }}>TAILS</div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .coin-container.flipping .coin {
          animation: flipCoin 2s linear;
        }

        @keyframes flipCoin {
          0% { transform: rotateY(0deg) translateY(0px); }
          25% { transform: rotateY(450deg) translateY(-60px); }
          50% { transform: rotateY(900deg) translateY(-100px); }
          75% { transform: rotateY(1350deg) translateY(-60px); }
          100% { transform: rotateY(1800deg) translateY(0px); }
        }

        .coin-container:hover:not(.flipping) {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }

        .coin-face {
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

const CoinToss: React.FC<CoinTossProps> = ({ team1Name, team2Name, onTossComplete }) => {
  const [callingTeam, setCallingTeam] = useState<number | null>(null);
  const [selectedCall, setSelectedCall] = useState<CoinSide | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [winningTeam, setWinningTeam] = useState<number | null>(null);
  const [showDecision, setShowDecision] = useState(false);

  const handleTeamSelection = (teamIndex: number) => {
    setCallingTeam(teamIndex);
  };

  const handleCoinCall = (call: CoinSide) => {
    setSelectedCall(call);
    performToss();
  };

  const performToss = () => {
    setIsFlipping(true);
    
    setTimeout(() => {
      const tossResult: CoinSide = Math.random() < 0.5 ? 'Heads' : 'Tails';
      setResult(tossResult);
      
      const winner = tossResult === selectedCall ? callingTeam : (callingTeam === 0 ? 1 : 0);
      setWinningTeam(winner);
      setIsFlipping(false);
      setShowDecision(true);
    }, 2000);
  };

  const handleDecision = (decision: GameAction) => {
    if (winningTeam !== null) {
      onTossComplete(winningTeam, decision);
    }
  };

  if (showDecision && winningTeam !== null) {
    return (
      <div className="text-center">
        <Trophy className="mx-auto mb-4 text-yellow-500" size={48} />
        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <div className="flex justify-center mb-4">
            <CoinComponent 
              side={result}
              isFlipping={false}
              size="medium"
            />
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-4">
            {winningTeam === 0 ? team1Name : team2Name} won the toss!
          </h3>
          <p className="text-gray-600 mb-4">Choose to bat or bowl first</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleDecision('bat')}
            className="p-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <div className="text-2xl mb-2">🏏</div>
            Bat First
          </button>
          <button
            onClick={() => handleDecision('bowl')}
            className="p-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            <div className="text-2xl mb-2">⚾</div>
            Bowl First
          </button>
        </div>
      </div>
    );
  }

  if (callingTeam === null) {
    return (
      <div className="text-center">
        <Users className="mx-auto mb-4 text-green-600" size={48} />
        <h3 className="text-2xl font-bold mb-6 text-green-800">Who will call the toss?</h3>
        <div className="space-y-4">
          <button
            onClick={() => handleTeamSelection(0)}
            className="w-full p-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {team1Name}
          </button>
          <button
            onClick={() => handleTeamSelection(1)}
            className="w-full p-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            {team2Name}
          </button>
        </div>
      </div>
    );
  }

  if (selectedCall === null) {
    return (
      <div className="text-center">
        <div className={`inline-block px-4 py-2 rounded-lg ${callingTeam === 0 ? 'bg-blue-600' : 'bg-red-600'} text-white font-semibold mb-6`}>
          {callingTeam === 0 ? team1Name : team2Name}
        </div>
        <h3 className="text-2xl font-bold mb-6 text-green-800">Make Your Call</h3>
        <div className="text-gray-600 mb-8">Choose heads or tails by clicking on the coin</div>
        
        <div className="flex justify-center gap-12">
          <div className="text-center">
            <CoinComponent 
              side="Heads"
              isFlipping={false}
              size="large"
              onClick={() => handleCoinCall('Heads')}
            />
            <p className="mt-4 font-semibold text-gray-700 text-lg">Click for Heads</p>
          </div>
          <div className="text-center">
            <CoinComponent 
              side="Tails"
              isFlipping={false}
              size="large"
              onClick={() => handleCoinCall('Tails')}
            />
            <p className="mt-4 font-semibold text-gray-700 text-lg">Click for Tails</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className={`inline-block px-4 py-2 rounded-lg ${callingTeam === 0 ? 'bg-blue-600' : 'bg-red-600'} text-white font-semibold mb-4`}>
        {callingTeam === 0 ? team1Name : team2Name} called {selectedCall}
      </div>
      <h3 className="text-2xl font-bold mb-6 text-green-800">Tossing the coin...</h3>
      <div className="flex justify-center mb-6">
        <CoinComponent 
          side={result}
          isFlipping={isFlipping}
          size="large"
        />
      </div>
      <div className="text-lg text-gray-600">The coin is spinning...</div>
    </div>
  );
};

export default CoinToss;