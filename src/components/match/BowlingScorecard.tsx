import React from 'react';
import { Match, Innings, Team } from '../../types/cricket';
import { calculateBowlerStats } from '../../services/scoreCalculator';

interface BowlingScorecardProps {
  match: Match;
  innings: Innings;
  bowlingTeam: Team;
}

const BowlingScorecard: React.FC<BowlingScorecardProps> = ({ match, innings, bowlingTeam }) => {
  // Get bowlers who have bowled
  const getBowlers = () => {
    const bowlerIds = new Set<number>();
    
    innings.overs.forEach(over => {
      if (over.deliveries.length > 0) {
        bowlerIds.add(over.deliveries[0].bowlerId);
      }
    });
    
    return Array.from(bowlerIds);
  };
  
  const bowlerIds = getBowlers();

  return (
    <div>
      <h3 className="text-lg font-semibold text-green-800 mb-4">
        {bowlingTeam.name} Bowling
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-50 border-b border-green-200">
              <th className="text-left py-2 px-4">Bowler</th>
              <th className="text-right py-2 px-4">O</th>
              <th className="text-right py-2 px-4">M</th>
              <th className="text-right py-2 px-4">R</th>
              <th className="text-right py-2 px-4">W</th>
              <th className="text-right py-2 px-4">Econ</th>
            </tr>
          </thead>
          <tbody>
            {bowlerIds.map(id => {
              const bowler = bowlingTeam.players.find(p => p.id === id);
              if (!bowler) return null;
              
              const stats = calculateBowlerStats(innings, id);
              
              return (
                <tr key={id} className="border-b border-gray-200">
                  <td className="py-2 px-4">{bowler.name}</td>
                  <td className="py-2 px-4 text-right">{stats.overs}</td>
                  <td className="py-2 px-4 text-right">{stats.maidens}</td>
                  <td className="py-2 px-4 text-right">{stats.runs}</td>
                  <td className="py-2 px-4 text-right font-medium">{stats.wickets}</td>
                  <td className="py-2 px-4 text-right">{stats.economy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6">
        <h4 className="text-md font-medium text-green-800 mb-2">Fall of Wickets</h4>
        <div className="bg-green-50 p-3 rounded-md text-sm">
          {getFallOfWickets(innings, match)}
        </div>
      </div>
    </div>
  );
};

// Helper function to get fall of wickets
const getFallOfWickets = (innings: Innings, match: Match) => {
  const wickets: { playerId: number; score: number; over: string }[] = [];
  let totalRuns = 0;
  
  innings.overs.forEach(over => {
    over.deliveries.forEach(delivery => {
      // Add runs to total
      totalRuns += delivery.runs;
      if (delivery.extras) {
        totalRuns += delivery.extras.runs;
      }
      
      // Record wicket
      if (delivery.isWicket) {
        const overNumber = over.number;
        const ballNumber = over.deliveries.indexOf(delivery) + 1;
        const overString = `${overNumber}.${ballNumber}`;
        
        wickets.push({
          playerId: delivery.batterId,
          score: totalRuns,
          over: overString
        });
      }
    });
  });
  
  if (wickets.length === 0) {
    return <p className="italic">No wickets have fallen</p>;
  }
  
  const battingTeamId = innings.battingTeamId;
  const battingTeam = battingTeamId === 0 ? match.team1 : match.team2;
  
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {wickets.map((wicket, index) => {
        const player = battingTeam.players.find(p => p.id === wicket.playerId);
        return (
          <div key={index} className="text-sm">
            <span className="font-medium">{index + 1}-{wicket.score}</span>
            <span className="text-gray-600 ml-1">
              ({player?.name}, {wicket.over} ov)
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default BowlingScorecard;