import React, { useState, useEffect } from 'react';
import { Match, Innings, Over, Delivery } from '../../types/cricket';
import { saveMatch } from '../../services/matchStorage';
import { 
  calculateCompletedOvers, 
  calculateRunRate, 
  calculateRequiredRunRate,
  getCurrentBatsmen,
  getCurrentBowler,
  updateMatchStatus
} from '../../services/scoreCalculator';
import ScoreInput from './ScoreInput';
import CurrentScoreboard from './CurrentScoreboard';
import InningsSelector from './InningsSelector';
import BattingScorecard from './BattingScorecard';
import BowlingScorecard from './BowlingScorecard';

interface MatchScorecardProps {
  match: Match;
  onMatchUpdate: (updatedMatch: Match) => void;
  onFinish: () => void;
}

const MatchScorecard: React.FC<MatchScorecardProps> = ({ match, onMatchUpdate, onFinish }) => {
  const [selectedTab, setSelectedTab] = useState<'live' | 'batting' | 'bowling'>('live');
  const [showEndMatchModal, setShowEndMatchModal] = useState<boolean>(false);
  const [updateCounter, setUpdateCounter] = useState<number>(0);

  // Get current innings, batsmen and bowler
  const currentInnings = match.innings[match.currentInnings];
  const battingTeam = match.currentInnings === 0 ? match.team1 : match.team2;
  const bowlingTeam = match.currentInnings === 0 ? match.team2 : match.team1;
  const [striker, nonStriker] = getCurrentBatsmen(match);
  const bowler = getCurrentBowler(match);

  // Auto-save match when it updates
  useEffect(() => {
    saveMatch(match);
  }, [match, updateCounter]);

  const handleDeliveryAdded = (delivery: Delivery) => {
    // Create a deep copy of the match to avoid mutation
    const updatedMatch = JSON.parse(JSON.stringify(match));
    const innings = updatedMatch.innings[updatedMatch.currentInnings];
    
    // Check if we need to create a new over
    if (innings.overs.length === 0 || 
        innings.overs[innings.overs.length - 1].deliveries.length >= 6) {
      const newOverNumber = innings.overs.length;
      innings.overs.push({
        number: newOverNumber,
        deliveries: []
      });
    }
    
    // Add delivery to the current over
    const currentOver = innings.overs[innings.overs.length - 1];
    currentOver.deliveries.push(delivery);
    
    // Update match statistics
    const finalUpdatedMatch = updateMatchStatus(updatedMatch);
    
    // Update state
    onMatchUpdate(finalUpdatedMatch);
    setUpdateCounter(prev => prev + 1);
  };

  const handleEndMatch = () => {
    const updatedMatch = { ...match, isComplete: true };
    saveMatch(updatedMatch);
    onMatchUpdate(updatedMatch);
    onFinish();
  };

  // Calculate statistics for display
  const oversCompleted = calculateCompletedOvers(currentInnings);
  const currentRunRate = calculateRunRate(currentInnings.totalRuns, oversCompleted);
  const requiredRunRate = match.currentInnings === 1 ? calculateRequiredRunRate(match) : 'N/A';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-green-700 text-white p-4">
          <h1 className="text-xl font-bold">
            {match.team1.name} vs {match.team2.name}
          </h1>
          <p className="text-sm opacity-90">
            {match.date} {match.venue ? `at ${match.venue}` : ''}
          </p>
        </div>

        <div className="p-4">
          <InningsSelector 
            match={match} 
            currentInnings={match.currentInnings}
          />
          
          <div className="mt-4 border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-4 py-2 font-medium ${
                  selectedTab === 'live' 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('live')}
              >
                Live Scoring
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  selectedTab === 'batting' 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('batting')}
              >
                Batting
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  selectedTab === 'bowling' 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('bowling')}
              >
                Bowling
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            {selectedTab === 'live' && (
              <div>
                <CurrentScoreboard
                  match={match}
                  innings={currentInnings}
                  battingTeam={battingTeam}
                  bowlingTeam={bowlingTeam}
                  striker={striker}
                  nonStriker={nonStriker}
                  bowler={bowler}
                  currentRunRate={currentRunRate}
                  requiredRunRate={requiredRunRate}
                />
                
                {!match.isComplete && (
                  <ScoreInput
                    match={match}
                    battingTeam={battingTeam}
                    bowlingTeam={bowlingTeam}
                    striker={striker}
                    nonStriker={nonStriker}
                    bowler={bowler}
                    onDeliveryAdded={handleDeliveryAdded}
                  />
                )}
              </div>
            )}
            
            {selectedTab === 'batting' && (
              <BattingScorecard 
                match={match}
                innings={currentInnings}
                battingTeam={battingTeam}
              />
            )}
            
            {selectedTab === 'bowling' && (
              <BowlingScorecard 
                match={match}
                innings={currentInnings}
                bowlingTeam={bowlingTeam}
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onFinish}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Save & Exit
        </button>
        
        {!match.isComplete && (
          <button
            onClick={() => setShowEndMatchModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            End Match
          </button>
        )}
      </div>
      
      {/* End Match Confirmation Modal */}
      {showEndMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">End Match?</h3>
            <p className="mb-6">
              Are you sure you want to end this match? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowEndMatchModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEndMatch}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                End Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchScorecard;