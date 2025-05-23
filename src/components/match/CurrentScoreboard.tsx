import React from 'react';
import { Match, Innings, Team } from '../../types/cricket';
import { calculateBatsmanStats, calculateBowlerStats } from '../../services/scoreCalculator';

interface CurrentScoreboardProps {
  match: Match;
  innings: Innings;
  battingTeam: Team;
  bowlingTeam: Team;
  striker: number;
  nonStriker: number;
  bowler: number;
  currentRunRate: string;
  requiredRunRate: string;
}

const CurrentScoreboard: React.FC<CurrentScoreboardProps> = ({
  match,
  innings,
  battingTeam,
  bowlingTeam,
  striker,
  nonStriker,
  bowler,
  currentRunRate,
  requiredRunRate
}) => {
  // Get batsman details
  const getStrikerDetails = () => {
    if (striker === -1) return null;
    const player = battingTeam.players.find(p => p.id === striker);
    if (!player) return null;
    
    const stats = calculateBatsmanStats(innings, striker);
    return { player, stats };
  };
  
  const getNonStrikerDetails = () => {
    if (nonStriker === -1) return null;
    const player = battingTeam.players.find(p => p.id === nonStriker);
    if (!player) return null;
    
    const stats = calculateBatsmanStats(innings, nonStriker);
    return { player, stats };
  };
  
  // Get bowler details
  const getBowlerDetails = () => {
    if (bowler === -1) return null;
    const player = bowlingTeam.players.find(p => p.id === bowler);
    if (!player) return null;
    
    const stats = calculateBowlerStats(innings, bowler);
    return { player, stats };
  };
  
  const strikerDetails = getStrikerDetails();
  const nonStrikerDetails = getNonStrikerDetails();
  const bowlerDetails = getBowlerDetails();
  
  // Get current over deliveries
  const getCurrentOverDeliveries = () => {
    if (innings.overs.length === 0) return [];
    
    const lastOver = innings.overs[innings.overs.length - 1];
    if (lastOver.deliveries.length >= 6) return [];
    
    return lastOver.deliveries;
  };
  
  const currentOverDeliveries = getCurrentOverDeliveries();
  
  // Get previous over runs
  const getPreviousOverRuns = () => {
    if (innings.overs.length <= 1) return null;
    
    const previousOver = innings.overs[innings.overs.length - 2];
    const runs = previousOver.deliveries.reduce((sum, delivery) => {
      return sum + delivery.runs + (delivery.extras ? delivery.extras.runs : 0);
    }, 0);
    
    return runs;
  };
  
  const previousOverRuns = getPreviousOverRuns();
  
  // Target information
  const getTargetInfo = () => {
    if (match.currentInnings !== 1) return null;
    
    const firstInningsRuns = match.innings[0].totalRuns;
    const runsNeeded = firstInningsRuns - innings.totalRuns + 1;
    
    return {
      target: firstInningsRuns + 1,
      runsNeeded,
      ballsRemaining: (match.totalOvers * 6) - (innings.overs.reduce((count, over) => {
        return count + over.deliveries.length;
      }, 0))
    };
  };
  
  const targetInfo = getTargetInfo();

  // Format for current over display
  const formatDelivery = (delivery: any) => {
    if (delivery.isWicket) return 'W';
    
    let result = delivery.runs.toString();
    
    if (delivery.extras) {
      switch (delivery.extras.type) {
        case 'wide':
          result = 'Wd';
          break;
        case 'noBall':
          result = 'Nb';
          break;
        case 'bye':
          result = delivery.runs + 'B';
          break;
        case 'legBye':
          result = delivery.runs + 'Lb';
          break;
      }
    }
    
    return result;
  };

  return (
    <div className="bg-green-50 p-4 rounded-md border border-green-200">
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-green-800">
            {battingTeam.name} <span className="font-bold">{innings.totalRuns}/{innings.totalWickets}</span>
          </h3>
          <p className="text-sm text-gray-600">
            Overs: {innings.completedOvers} / {match.totalOvers}
          </p>
        </div>
        
        <div className="md:text-right mt-2 md:mt-0">
          <p className="text-sm font-medium">
            CRR: <span className="font-semibold">{currentRunRate}</span>
          </p>
          {targetInfo && (
            <p className="text-sm font-medium">
              RRR: <span className="font-semibold">{requiredRunRate}</span>
            </p>
          )}
        </div>
      </div>
      
      {targetInfo && (
        <div className="bg-green-100 p-2 rounded-md mb-4 text-sm font-medium text-green-800 text-center">
          Need {targetInfo.runsNeeded} runs from {Math.ceil(targetInfo.ballsRemaining / 6)} overs
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Batsmen</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 flex items-center">
                  {strikerDetails ? (
                    <>
                      <span className="mr-1">•</span>
                      {strikerDetails.player.name}
                    </>
                  ) : (
                    'Striker'
                  )}
                </td>
                <td className="py-2 text-right">
                  {strikerDetails ? `${strikerDetails.stats.runs} (${strikerDetails.stats.balls})` : ''}
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  {nonStrikerDetails ? nonStrikerDetails.player.name : 'Non-striker'}
                </td>
                <td className="py-2 text-right">
                  {nonStrikerDetails ? `${nonStrikerDetails.stats.runs} (${nonStrikerDetails.stats.balls})` : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Bowler</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-2">
                  {bowlerDetails ? bowlerDetails.player.name : 'Current Bowler'}
                </td>
                <td className="py-2 text-right">
                  {bowlerDetails ? 
                    `${bowlerDetails.stats.overs} - ${bowlerDetails.stats.maidens} - ${bowlerDetails.stats.runs} - ${bowlerDetails.stats.wickets}` : 
                    ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">This Over</h4>
        <div className="flex items-center space-x-2">
          {currentOverDeliveries.length > 0 ? (
            currentOverDeliveries.map((delivery, index) => (
              <div 
                key={index} 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  delivery.isWicket ? 
                    'bg-red-100 text-red-700 border border-red-300' : 
                    (delivery.extras ? 
                      'bg-amber-100 text-amber-700 border border-amber-300' : 
                      'bg-white text-gray-700 border border-gray-300')
                }`}
              >
                {formatDelivery(delivery)}
              </div>
            ))
          ) : (
            <span className="text-gray-500 italic text-sm">New over</span>
          )}
        </div>
      </div>
      
      {previousOverRuns !== null && (
        <div className="text-sm text-gray-600">
          Previous over: {previousOverRuns} runs
        </div>
      )}
    </div>
  );
};

export default CurrentScoreboard;