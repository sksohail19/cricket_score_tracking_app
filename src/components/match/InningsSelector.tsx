import React from 'react';
import { Match } from '../../types/cricket';

interface InningSelectorProps {
  match: Match;
  currentInnings: number;
}

const InningsSelector: React.FC<InningSelectorProps> = ({ match, currentInnings }) => {
  // If match only has one innings, don't show selector
  if (match.innings.length === 1) {
    return (
      <div className="bg-white border border-gray-200 rounded-md p-2 text-center">
        <span className="font-medium">
          {match.team1.name} Innings
        </span>
      </div>
    );
  }
  
  return (
    <div className="flex overflow-hidden rounded-md border border-gray-200">
      <div 
        className={`flex-1 p-2 text-center cursor-pointer ${
          currentInnings === 0 
            ? 'bg-green-600 text-white' 
            : 'bg-white text-gray-800 hover:bg-green-50'
        }`}
      >
        <span className="font-medium">{match.team1.name} Innings</span>
      </div>
      <div 
        className={`flex-1 p-2 text-center cursor-pointer ${
          currentInnings === 1 
            ? 'bg-green-600 text-white' 
            : 'bg-white text-gray-800 hover:bg-green-50'
        }`}
      >
        <span className="font-medium">{match.team2.name} Innings</span>
      </div>
    </div>
  );
};

export default InningsSelector;