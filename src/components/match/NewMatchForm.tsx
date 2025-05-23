import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Match, Team, Innings, Extras } from '../../types/cricket';
import TeamSetup from './TeamSetup';
import { Calendar, Clock, MapPin, Users, Shuffle } from 'lucide-react';

interface NewMatchFormProps {
  onMatchCreated: (match: Match) => void;
  onCancel: () => void;
}

const NewMatchForm: React.FC<NewMatchFormProps> = ({ onMatchCreated, onCancel }) => {
  const [matchDate, setMatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [venue, setVenue] = useState<string>('');
  const [totalOvers, setTotalOvers] = useState<number>(20);
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(11);
  const [team1Name, setTeam1Name] = useState<string>('Team 1');
  const [team2Name, setTeam2Name] = useState<string>('Team 2');
  const [step, setStep] = useState<number>(1);
  const [team1Players, setTeam1Players] = useState<string[]>(Array(11).fill('').map((_, i) => `Player ${i + 1}`));
  const [team2Players, setTeam2Players] = useState<string[]>(Array(11).fill('').map((_, i) => `Player ${i + 1}`));
  const [tossWinner, setTossWinner] = useState<number>(0);
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');
  
  const handleNextStep = () => {
    if (step === 1) {
      if (!matchDate || totalOvers <= 0 || playersPerTeam <= 0) {
        alert('Please fill in all required fields with valid values');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (team1Players.length !== playersPerTeam) {
        setTeam1Players(prev => {
          if (prev.length < playersPerTeam) {
            return [...prev, ...Array(playersPerTeam - prev.length).fill('').map((_, i) => `Player ${prev.length + i + 1}`)];
          } else {
            return prev.slice(0, playersPerTeam);
          }
        });
      }
      setStep(3);
    } else if (step === 3) {
      if (team2Players.length !== playersPerTeam) {
        setTeam2Players(prev => {
          if (prev.length < playersPerTeam) {
            return [...prev, ...Array(playersPerTeam - prev.length).fill('').map((_, i) => `Player ${prev.length + i + 1}`)];
          } else {
            return prev.slice(0, playersPerTeam);
          }
        });
      }
      setStep(4);
    } else if (step === 4) {
      createMatch();
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };
  
  const createMatch = () => {
    const team1 = {
      name: team1Name,
      players: team1Players.map((name, index) => ({
        id: index,
        name
      }))
    };
    
    const team2 = {
      name: team2Name,
      players: team2Players.map((name, index) => ({
        id: index,
        name
      }))
    };
    
    const emptyExtras: Extras = {
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      penalty: 0
    };
    
    // Determine batting order based on toss
    const firstBattingTeamId = tossWinner === 0 && tossDecision === 'bat' || tossWinner === 1 && tossDecision === 'bowl' ? 0 : 1;
    
    const innings: Innings[] = [
      {
        battingTeamId: firstBattingTeamId,
        bowlingTeamId: firstBattingTeamId === 0 ? 1 : 0,
        overs: [],
        totalRuns: 0,
        totalWickets: 0,
        completedOvers: 0,
        extras: { ...emptyExtras }
      }
    ];
    
    const newMatch: Match = {
      id: uuidv4(),
      date: matchDate,
      venue: venue,
      totalOvers,
      playersPerTeam,
      team1,
      team2,
      innings,
      currentInnings: 0,
      isComplete: false,
      tossWinner,
      tossDecision
    };
    
    onMatchCreated(newMatch);
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-green-800 border-b border-gray-200 pb-2">Match Details</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="flex items-center mb-1 text-sm font-medium text-gray-700">
                  <Calendar size={16} className="mr-1" />
                  Match Date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="flex flex-col">
                <label className="flex items-center mb-1 text-sm font-medium text-gray-700">
                  <MapPin size={16} className="mr-1" />
                  Venue
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Enter venue name"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="flex items-center mb-1 text-sm font-medium text-gray-700">
                  <Clock size={16} className="mr-1" />
                  Total Overs<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={totalOvers}
                  onChange={(e) => setTotalOvers(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="flex flex-col">
                <label className="flex items-center mb-1 text-sm font-medium text-gray-700">
                  <Users size={16} className="mr-1" />
                  Players Per Team<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="2"
                  max="11"
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <TeamSetup
            teamName={team1Name}
            onTeamNameChange={setTeam1Name}
            playerNames={team1Players}
            onPlayerNamesChange={setTeam1Players}
            playersCount={playersPerTeam}
            teamNumber={1}
          />
        );
      case 3:
        return (
          <TeamSetup
            teamName={team2Name}
            onTeamNameChange={setTeam2Name}
            playerNames={team2Players}
            onPlayerNamesChange={setTeam2Players}
            playersCount={playersPerTeam}
            teamNumber={2}
          />
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-green-800 border-b border-gray-200 pb-2">
              <div className="flex items-center">
                <Shuffle size={20} className="mr-2" />
                Toss Details
              </div>
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Toss Winner
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTossWinner(0)}
                    className={`flex-1 py-2 px-4 rounded-md border ${
                      tossWinner === 0
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-300 hover:bg-green-50'
                    }`}
                  >
                    {team1Name}
                  </button>
                  <button
                    onClick={() => setTossWinner(1)}
                    className={`flex-1 py-2 px-4 rounded-md border ${
                      tossWinner === 1
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-300 hover:bg-green-50'
                    }`}
                  >
                    {team2Name}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Elected to
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTossDecision('bat')}
                    className={`flex-1 py-2 px-4 rounded-md border ${
                      tossDecision === 'bat'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-300 hover:bg-green-50'
                    }`}
                  >
                    Bat
                  </button>
                  <button
                    onClick={() => setTossDecision('bowl')}
                    className={`flex-1 py-2 px-4 rounded-md border ${
                      tossDecision === 'bowl'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-300 hover:bg-green-50'
                    }`}
                  >
                    Bowl
                  </button>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-800 mb-2">Match Summary</h3>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-medium">Date:</span> {new Date(matchDate).toLocaleDateString()}</li>
                  {venue && <li><span className="font-medium">Venue:</span> {venue}</li>}
                  <li><span className="font-medium">Overs:</span> {totalOvers}</li>
                  <li><span className="font-medium">Players:</span> {playersPerTeam} per team</li>
                  <li>
                    <span className="font-medium">Toss:</span> {tossWinner === 0 ? team1Name : team2Name} won the toss and elected to {tossDecision} first
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6 text-center">Create New Match</h1>
      
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= stepNumber ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
              <span className="text-xs mt-1 text-gray-600">
                {stepNumber === 1 ? 'Match Details' : 
                 stepNumber === 2 ? 'Team 1 Setup' : 
                 stepNumber === 3 ? 'Team 2 Setup' : 'Toss'}
              </span>
            </div>
          ))}
          
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
            <div 
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${(step - 1) * 33.33}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        {renderStepContent()}
      </div>
      
      <div className="flex justify-between">
        {step > 1 ? (
          <button
            onClick={handlePrevStep}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
        
        <button
          onClick={handleNextStep}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          {step === 4 ? 'Create Match' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default NewMatchForm;