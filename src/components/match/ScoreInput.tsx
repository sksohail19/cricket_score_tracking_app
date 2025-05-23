import React, { useState, useEffect } from 'react';
import { Match, Team, Delivery } from '../../types/cricket';
import { Clock, Clipboard, Check, XCircle } from 'lucide-react';

interface ScoreInputProps {
  match: Match;
  battingTeam: Team;
  bowlingTeam: Team;
  striker: number;
  nonStriker: number;
  bowler: number;
  onDeliveryAdded: (delivery: Delivery) => void;
}

const ScoreInput: React.FC<ScoreInputProps> = ({ 
  match,
  battingTeam,
  bowlingTeam,
  striker,
  nonStriker,
  bowler,
  onDeliveryAdded
}) => {
  const [selectedRuns, setSelectedRuns] = useState<number | null>(null);
  const [isWicket, setIsWicket] = useState<boolean>(false);
  const [selectedWicketType, setSelectedWicketType] = useState<string>('');
  const [newBowler, setNewBowler] = useState<number>(bowler);
  const [extraType, setExtraType] = useState<string | null>(null);
  const [extraRuns, setExtraRuns] = useState<number>(1);
  const [newBatsman, setNewBatsman] = useState<number>(-1);
  
  // Reset state if the bowler changes from props
  useEffect(() => {
    if (bowler !== -1) {
      setNewBowler(bowler);
    }
  }, [bowler]);

  // Initialize new batsman selection if needed
  useEffect(() => {
    if (striker === -1) {
      // Set the first available batsman
      const usedBatsmen = match.innings[match.currentInnings].overs.flatMap(over => 
        over.deliveries.map(delivery => delivery.batterId)
      );
      
      const availableBatsmen = battingTeam.players
        .map(player => player.id)
        .filter(id => !usedBatsmen.includes(id));
      
      if (availableBatsmen.length > 0) {
        setNewBatsman(availableBatsmen[0]);
      }
    }
  }, [striker, match, battingTeam]);

  const handleRunsClick = (runs: number) => {
    setSelectedRuns(runs);
    setIsWicket(false);
    setExtraType(null);
  };

  const handleExtraClick = (type: string) => {
    setExtraType(type);
    setIsWicket(false);
    setSelectedRuns(0);
    
    // Default extra runs based on type
    if (type === 'wide' || type === 'noBall') {
      setExtraRuns(1);
    } else {
      setExtraRuns(0);
    }
  };

  const handleWicketClick = () => {
    setIsWicket(true);
    setSelectedWicketType('bowled'); // Default wicket type
    setExtraType(null);
  };

  const handleDeliverySubmit = () => {
    // Validate required selections
    if (newBowler === -1) {
      alert("Please select a bowler");
      return;
    }
    
    if (striker === -1 && newBatsman === -1) {
      alert("Please select a batsman");
      return;
    }
    
    const currentBatsman = striker === -1 ? newBatsman : striker;
    
    let delivery: Delivery = {
      batterId: currentBatsman,
      bowlerId: newBowler,
      runs: selectedRuns || 0,
      isWicket: isWicket
    };
    
    // Add wicket type if there's a wicket
    if (isWicket) {
      delivery.wicketType = selectedWicketType as any;
    }
    
    // Add extras if any
    if (extraType) {
      delivery.extras = {
        type: extraType as any,
        runs: extraRuns
      };
    }
    
    onDeliveryAdded(delivery);
    
    // Reset selection state
    setSelectedRuns(null);
    setIsWicket(false);
    setExtraType(null);
    setExtraRuns(1);
  };

  // Get available bowlers (excluding the last bowler)
  const getAvailableBowlers = () => {
    const lastOverBowlerId = bowler;
    return bowlingTeam.players.filter(player => player.id !== lastOverBowlerId);
  };

  // Get available batsmen who haven't been dismissed
  const getAvailableBatsmen = () => {
    const dismissedBatsmen = new Set<number>();
    
    // Find all dismissed batsmen
    match.innings[match.currentInnings].overs.forEach(over => {
      over.deliveries.forEach(delivery => {
        if (delivery.isWicket) {
          dismissedBatsmen.add(delivery.batterId);
        }
      });
    });
    
    // Filter out dismissed batsmen and current batsmen
    return battingTeam.players.filter(player => 
      !dismissedBatsmen.has(player.id) && 
      player.id !== striker && 
      player.id !== nonStriker
    );
  };

  return (
    <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Ball Entry</h3>
      
      {/* Batsman and Bowler Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {striker === -1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Batsman
            </label>
            <select
              value={newBatsman}
              onChange={(e) => setNewBatsman(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="-1">Select batsman...</option>
              {getAvailableBatsmen().map(player => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {bowler === -1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bowler
            </label>
            <select
              value={newBowler}
              onChange={(e) => setNewBowler(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="-1">Select bowler...</option>
              {getAvailableBowlers().map(player => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Runs Buttons */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Runs
        </label>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map(runs => (
            <button
              key={runs}
              onClick={() => handleRunsClick(runs)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-colors ${
                selectedRuns === runs && !extraType && !isWicket
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-green-50'
              }`}
            >
              {runs}
            </button>
          ))}
        </div>
      </div>
      
      {/* Extras and Wicket Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Extras
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'wide', label: 'Wide' },
              { key: 'noBall', label: 'No Ball' },
              { key: 'bye', label: 'Bye' },
              { key: 'legBye', label: 'Leg Bye' }
            ].map(extra => (
              <button
                key={extra.key}
                onClick={() => handleExtraClick(extra.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  extraType === extra.key
                    ? 'bg-amber-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-amber-50'
                }`}
              >
                {extra.label}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wicket
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleWicketClick}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isWicket
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-red-50'
              }`}
            >
              Wicket
            </button>
          </div>
        </div>
      </div>
      
      {/* Extra Runs Input */}
      {extraType && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Extra Runs
          </label>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map(runs => (
              <button
                key={runs}
                onClick={() => setExtraRuns(runs)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border ${
                  extraRuns === runs
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-amber-50'
                }`}
              >
                {runs}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Wicket Type Selection */}
      {isWicket && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wicket Type
          </label>
          <select
            value={selectedWicketType}
            onChange={(e) => setSelectedWicketType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="bowled">Bowled</option>
            <option value="caught">Caught</option>
            <option value="lbw">LBW</option>
            <option value="runOut">Run Out</option>
            <option value="stumped">Stumped</option>
            <option value="hitWicket">Hit Wicket</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}
      
      {/* Submit Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleDeliverySubmit}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
          disabled={
            (selectedRuns === null && !extraType && !isWicket) || 
            (striker === -1 && newBatsman === -1) ||
            newBowler === -1
          }
        >
          <Check size={18} className="mr-1" />
          Record Ball
        </button>
      </div>
    </div>
  );
};

export default ScoreInput;