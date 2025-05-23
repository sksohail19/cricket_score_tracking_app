import React, { useEffect, useState } from 'react';
import { getMatchById } from '../../services/matchStorage';
import { Match, Innings } from '../../types/cricket';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import BattingScorecard from '../match/BattingScorecard';
import BowlingScorecard from '../match/BowlingScorecard';

interface MatchDetailsProps {
  matchId: string;
  onBack: () => void;
  onContinueMatch: (match: Match) => void;
}

const MatchDetails: React.FC<MatchDetailsProps> = ({ 
  matchId, 
  onBack, 
  onContinueMatch 
}) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [selectedInnings, setSelectedInnings] = useState<number>(0);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [matchJson, setMatchJson] = useState<string>('');
  
  useEffect(() => {
    const loadMatch = async () => {
      const matchData = getMatchById(matchId);
      if (matchData) {
        setMatch(matchData);
      }
    };
    
    loadMatch();
  }, [matchId]);
  
  const handleExport = () => {
    if (match) {
      const jsonString = JSON.stringify(match, null, 2);
      setMatchJson(jsonString);
      setShowExportModal(true);
    }
  };
  
  const downloadMatchData = () => {
    if (!match) return;
    
    const jsonString = JSON.stringify(match, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `cricket_match_${match.team1.name}_vs_${match.team2.name}_${match.date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (!match) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading match details...</p>
      </div>
    );
  }
  
  const battingTeam = selectedInnings === 0 ? match.team1 : match.team2;
  const bowlingTeam = selectedInnings === 0 ? match.team2 : match.team1;
  const innings = match.innings[selectedInnings];
  
  const getMatchResult = () => {
    if (!match.isComplete) {
      return 'Match in progress';
    }
    
    if (match.innings.length < 2) {
      return 'Match incomplete';
    }
    
    const team1Runs = match.innings[0].totalRuns;
    const team2Runs = match.innings[1].totalRuns;
    
    if (team1Runs > team2Runs) {
      return `${match.team1.name} won by ${team1Runs - team2Runs} runs`;
    } else if (team2Runs > team1Runs) {
      const wicketsRemaining = match.playersPerTeam - 1 - match.innings[1].totalWickets;
      return `${match.team2.name} won by ${wicketsRemaining} wickets`;
    } else {
      return 'Match tied';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-green-800">Match Details</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-green-700 text-white p-4">
          <h2 className="text-xl font-bold mb-1">
            {match.team1.name} vs {match.team2.name}
          </h2>
          <p className="text-sm opacity-90">
            {new Date(match.date).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            {match.venue ? ` at ${match.venue}` : ''}
          </p>
          <p className="text-sm opacity-90 mt-1">
            {match.totalOvers} overs match
          </p>
          <p className="text-sm opacity-90 mt-1">
            Toss: {match.tossWinner === 0 ? match.team1.name : match.team2.name} won and elected to {match.tossDecision}
          </p>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-lg">{getMatchResult()}</h3>
            </div>
            <div className="flex space-x-2">
              {!match.isComplete && (
                <button
                  onClick={() => onContinueMatch(match)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
                >
                  Continue Match
                </button>
              )}
              <button
                onClick={handleExport}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
              >
                <FileText size={16} className="mr-1" />
                Export
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-md p-3 border border-green-200">
              <h4 className="font-medium mb-2">{match.team1.name}</h4>
              {match.innings[0] && (
                <div className="font-bold text-2xl">
                  {match.innings[0].totalRuns}/{match.innings[0].totalWickets}
                  <span className="text-sm font-normal ml-2">
                    ({match.innings[0].completedOvers} ov)
                  </span>
                </div>
              )}
            </div>
            
            <div className="bg-green-50 rounded-md p-3 border border-green-200">
              <h4 className="font-medium mb-2">{match.team2.name}</h4>
              {match.innings[1] ? (
                <div className="font-bold text-2xl">
                  {match.innings[1].totalRuns}/{match.innings[1].totalWickets}
                  <span className="text-sm font-normal ml-2">
                    ({match.innings[1].completedOvers} ov)
                  </span>
                </div>
              ) : (
                <div className="text-gray-500 italic">Did not bat</div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex overflow-hidden rounded-md border border-gray-200">
              <button 
                onClick={() => setSelectedInnings(0)}
                className={`flex-1 p-2 text-center ${
                  selectedInnings === 0 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-800 hover:bg-green-50'
                }`}
              >
                {match.team1.name} Innings
              </button>
              {match.innings.length > 1 && (
                <button 
                  onClick={() => setSelectedInnings(1)}
                  className={`flex-1 p-2 text-center ${
                    selectedInnings === 1 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-800 hover:bg-green-50'
                  }`}
                >
                  {match.team2.name} Innings
                </button>
              )}
            </div>
          </div>
          
          <div className="border-b border-gray-200 mb-4">
            <div className="flex">
              <button
                className={`px-4 py-2 font-medium text-green-600 border-b-2 border-green-600`}
              >
                Scorecard
              </button>
            </div>
          </div>
          
          {innings ? (
            <div>
              <BattingScorecard 
                match={match}
                innings={innings}
                battingTeam={battingTeam}
              />
              
              <div className="my-6 border-t border-gray-200 pt-6">
                <BowlingScorecard 
                  match={match}
                  innings={innings}
                  bowlingTeam={bowlingTeam}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data available for this innings
            </div>
          )}
        </div>
      </div>
      
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Match Data</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="flex justify-end mb-4">
              <button
                onClick={downloadMatchData}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
              >
                <Download size={16} className="mr-1" />
                Download JSON
              </button>
            </div>
            
            <div className="overflow-auto flex-1 bg-gray-100 p-3 rounded-md">
              <pre className="text-xs">{matchJson}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;