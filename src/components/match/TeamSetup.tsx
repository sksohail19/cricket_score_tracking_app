import React from 'react';
import { Users } from 'lucide-react';

interface TeamSetupProps {
  teamName: string;
  onTeamNameChange: (name: string) => void;
  playerNames: string[];
  onPlayerNamesChange: (names: string[]) => void;
  playersCount: number;
  teamNumber: number;
}

const TeamSetup: React.FC<TeamSetupProps> = ({
  teamName,
  onTeamNameChange,
  playerNames,
  onPlayerNamesChange,
  playersCount,
  teamNumber
}) => {
  // Update a specific player's name
  const handlePlayerNameChange = (index: number, name: string) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = name;
    onPlayerNamesChange(updatedNames);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-green-800 border-b border-gray-200 pb-2">
        Team {teamNumber} Setup
      </h2>
      
      <div className="mb-4">
        <label className="flex items-center mb-1 text-sm font-medium text-gray-700">
          <Users size={16} className="mr-1" />
          Team Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => onTeamNameChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter team name"
          required
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Players ({playersCount})
        </label>
        
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {Array.from({ length: playersCount }).map((_, index) => (
            <div key={index} className="flex items-center">
              <span className="w-8 text-gray-500 text-sm">{index + 1}.</span>
              <input
                type="text"
                value={playerNames[index] || ''}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={`Player ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamSetup;