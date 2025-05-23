import React from 'react';
import { Match, Innings, Team } from '../../types/cricket';
import { calculateBatsmanStats } from '../../services/scoreCalculator';

interface BattingScorecardProps {
  match: Match;
  innings: Innings;
  battingTeam: Team;
}

const BattingScorecard: React.FC<BattingScorecardProps> = ({ match, innings, battingTeam }) => {
  // Get batsmen who have batted
  const getBatsmen = () => {
    const batsmenIds = new Set<number>();
    
    innings.overs.forEach(over => {
      over.deliveries.forEach(delivery => {
        batsmenIds.add(delivery.batterId);
      });
    });
    
    return Array.from(batsmenIds);
  };
  
  const getBatsmanDismissal = (playerId: number) => {
    for (const over of innings.overs) {
      for (const delivery of over.deliveries) {
        if (delivery.batterId === playerId && delivery.isWicket) {
          const bowler = match.innings[match.currentInnings].bowlingTeamId === 0 
            ? match.team1.players.find(p => p.id === delivery.bowlerId)
            : match.team2.players.find(p => p.id === delivery.bowlerId);
          
          const bowlerName = bowler ? bowler.name : 'Unknown';
          
          switch (delivery.wicketType) {
            case 'bowled':
              return `b ${bowlerName}`;
            case 'caught':
              return `c & b ${bowlerName}`;
            case 'lbw':
              return `lbw b ${bowlerName}`;
            case 'runOut':
              return 'run out';
            case 'stumped':
              return `st b ${bowlerName}`;
            case 'hitWicket':
              return `hit wicket b ${bowlerName}`;
            default:
              return 'out';
          }
        }
      }
    }
    
    return 'not out';
  };
  
  const batsmenIds = getBatsmen();
  const extrasTotal = innings.extras.wides + innings.extras.noBalls + innings.extras.byes + innings.extras.legByes + innings.extras.penalty;

  return (
    <div>
      <h3 className="text-lg font-semibold text-green-800 mb-4">
        {battingTeam.name} Batting
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-50 border-b border-green-200">
              <th className="text-left py-2 px-4">Batsman</th>
              <th className="text-center py-2 px-4">Dismissal</th>
              <th className="text-right py-2 px-4">Runs</th>
              <th className="text-right py-2 px-4">Balls</th>
              <th className="text-right py-2 px-4">4s</th>
              <th className="text-right py-2 px-4">6s</th>
              <th className="text-right py-2 px-4">SR</th>
            </tr>
          </thead>
          <tbody>
            {batsmenIds.map(id => {
              const batsman = battingTeam.players.find(p => p.id === id);
              if (!batsman) return null;
              
              const stats = calculateBatsmanStats(innings, id);
              const dismissal = getBatsmanDismissal(id);
              
              return (
                <tr key={id} className="border-b border-gray-200">
                  <td className="py-2 px-4">{batsman.name}</td>
                  <td className="py-2 px-4 text-center">{dismissal}</td>
                  <td className="py-2 px-4 text-right font-medium">{stats.runs}</td>
                  <td className="py-2 px-4 text-right">{stats.balls}</td>
                  <td className="py-2 px-4 text-right">{stats.fours}</td>
                  <td className="py-2 px-4 text-right">{stats.sixes}</td>
                  <td className="py-2 px-4 text-right">{stats.strikeRate}</td>
                </tr>
              );
            })}
            
            {/* Yet to bat */}
            {battingTeam.players
              .filter(player => !batsmenIds.includes(player.id))
              .map(player => (
                <tr key={player.id} className="border-b border-gray-200 text-gray-500">
                  <td className="py-2 px-4">{player.name}</td>
                  <td className="py-2 px-4 text-center">DNB</td>
                  <td className="py-2 px-4 text-right">-</td>
                  <td className="py-2 px-4 text-right">-</td>
                  <td className="py-2 px-4 text-right">-</td>
                  <td className="py-2 px-4 text-right">-</td>
                  <td className="py-2 px-4 text-right">-</td>
                </tr>
              ))
            }
            
            {/* Extras row */}
            <tr className="border-b border-gray-200 bg-gray-50">
              <td colSpan={2} className="py-2 px-4 font-medium">Extras</td>
              <td className="py-2 px-4 text-right font-medium" colSpan={5}>
                {extrasTotal} (W: {innings.extras.wides}, NB: {innings.extras.noBalls}, 
                B: {innings.extras.byes}, LB: {innings.extras.legByes})
              </td>
            </tr>
            
            {/* Total row */}
            <tr className="bg-green-50 font-medium">
              <td colSpan={2} className="py-2 px-4">Total</td>
              <td className="py-2 px-4 text-right">{innings.totalRuns}</td>
              <td colSpan={4} className="py-2 px-4 text-left pl-8">
                {innings.totalWickets} wickets, {innings.completedOvers} overs
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BattingScorecard;