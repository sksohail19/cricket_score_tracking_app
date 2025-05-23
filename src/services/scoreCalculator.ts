import { Match, Innings, Over, Delivery, Player } from '../types/cricket';

export const calculateExtras = (innings: Innings): number => {
  const { extras } = innings;
  return extras.wides + extras.noBalls + extras.byes + extras.legByes + extras.penalty;
};

export const calculateTotalRuns = (innings: Innings): number => {
  let totalRuns = 0;
  
  // Add runs from all overs
  innings.overs.forEach(over => {
    over.deliveries.forEach(delivery => {
      // Add runs scored off the bat
      totalRuns += delivery.runs;
      
      // Add extra runs
      if (delivery.extras) {
        totalRuns += delivery.extras.runs;
      }
    });
  });
  
  return totalRuns;
};

export const calculateTotalWickets = (innings: Innings): number => {
  let wickets = 0;
  
  innings.overs.forEach(over => {
    over.deliveries.forEach(delivery => {
      if (delivery.isWicket) {
        wickets++;
      }
    });
  });
  
  return wickets;
};

export const calculateCompletedOvers = (innings: Innings): string => {
  const completedFullOvers = innings.overs.filter(over => over.deliveries.length === 6).length;
  
  // Get balls in current over (if incomplete)
  const currentOverBalls = innings.overs.length > 0 && 
    innings.overs[innings.overs.length - 1].deliveries.length < 6 ?
    innings.overs[innings.overs.length - 1].deliveries.length : 0;
  
  // Only show partial over if it exists
  if (currentOverBalls > 0) {
    return `${completedFullOvers}.${currentOverBalls}`;
  }
  
  return completedFullOvers.toString();
};

export const calculateRunRate = (runs: number, overs: string): string => {
  const [fullOvers, balls] = overs.split('.');
  const totalOvers = parseInt(fullOvers) + (balls ? parseInt(balls) / 6 : 0);
  
  if (totalOvers === 0) return '0.00';
  
  const runRate = runs / totalOvers;
  return runRate.toFixed(2);
};

export const calculateRequiredRunRate = (match: Match): string => {
  if (match.innings.length < 2) return 'N/A';
  
  const firstInningsRuns = match.innings[0].totalRuns;
  const secondInnings = match.innings[1];
  const runsScored = secondInnings.totalRuns;
  const runsNeeded = firstInningsRuns - runsScored + 1;
  
  if (runsNeeded <= 0) return '0.00';
  
  const oversCompleted = calculateCompletedOvers(secondInnings);
  const [fullOvers, balls] = oversCompleted.split('.');
  const oversRemaining = match.totalOvers - parseInt(fullOvers) - (balls ? parseInt(balls) / 6 : 0);
  
  if (oversRemaining <= 0) return 'N/A';
  
  const requiredRate = runsNeeded / oversRemaining;
  return requiredRate.toFixed(2);
};

export const calculateBatsmanStats = (innings: Innings, playerId: number): {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
} => {
  let runs = 0;
  let balls = 0;
  let fours = 0;
  let sixes = 0;
  
  innings.overs.forEach(over => {
    over.deliveries.forEach(delivery => {
      if (delivery.batterId === playerId) {
        // Count the ball faced (unless it's a wide)
        if (!delivery.extras || delivery.extras.type !== 'wide') {
          balls++;
        }
        
        // Add runs scored
        runs += delivery.runs;
        
        // Count boundaries
        if (delivery.runs === 4) fours++;
        if (delivery.runs === 6) sixes++;
      }
    });
  });
  
  // Calculate strike rate (runs per 100 balls)
  const strikeRate = balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00';
  
  return { runs, balls, fours, sixes, strikeRate };
};

export const calculateBowlerStats = (innings: Innings, playerId: number): {
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string;
} => {
  let balls = 0;
  let runs = 0;
  let wickets = 0;
  let maidens = 0;
  let currentOverRuns = 0;
  
  // Group deliveries by over
  const overMap = new Map<number, Delivery[]>();
  
  innings.overs.forEach(over => {
    const overDeliveries = over.deliveries.filter(
      delivery => delivery.bowlerId === playerId
    );
    
    if (overDeliveries.length > 0) {
      overMap.set(over.number, overDeliveries);
    }
  });
  
  // Calculate stats
  overMap.forEach((deliveries, overNumber) => {
    currentOverRuns = 0;
    
    deliveries.forEach(delivery => {
      balls++;
      
      // Add runs conceded (including extras except byes and leg byes)
      runs += delivery.runs;
      if (delivery.extras) {
        if (delivery.extras.type !== 'bye' && delivery.extras.type !== 'legBye') {
          runs += delivery.extras.runs;
        }
      }
      
      currentOverRuns += delivery.runs;
      if (delivery.extras) {
        if (delivery.extras.type !== 'bye' && delivery.extras.type !== 'legBye') {
          currentOverRuns += delivery.extras.runs;
        }
      }
      
      // Count wickets
      if (delivery.isWicket && delivery.wicketType !== 'runOut') {
        wickets++;
      }
    });
    
    // Check if the over was a maiden (complete over with no runs)
    if (deliveries.length === 6 && currentOverRuns === 0) {
      maidens++;
    }
  });
  
  // Calculate overs (whole overs plus balls)
  const completeOvers = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  const overs = remainingBalls > 0 ? `${completeOvers}.${remainingBalls}` : `${completeOvers}`;
  
  // Calculate economy rate (runs per over)
  const totalOvers = completeOvers + (remainingBalls / 6);
  const economy = totalOvers > 0 ? (runs / totalOvers).toFixed(2) : '0.00';
  
  return { overs, maidens, runs, wickets, economy };
};

export const updateMatchStatus = (match: Match): Match => {
  // Deep clone to avoid mutation
  const updatedMatch = JSON.parse(JSON.stringify(match));
  
  // Update innings statistics
  updatedMatch.innings.forEach((innings: Innings) => {
    innings.totalRuns = calculateTotalRuns(innings);
    innings.totalWickets = calculateTotalWickets(innings);
    innings.completedOvers = parseInt(calculateCompletedOvers(innings).split('.')[0]);
  });
  
  // Check if match is complete
  const firstInnings = updatedMatch.innings[0];
  
  if (updatedMatch.innings.length > 1) {
    const secondInnings = updatedMatch.innings[1];
    
    // Match is complete if:
    // 1. Second innings is complete (all overs bowled)
    // 2. Second innings team is all out
    // 3. Second innings team has exceeded first innings score
    if (
      secondInnings.completedOvers >= updatedMatch.totalOvers ||
      secondInnings.totalWickets >= updatedMatch.playersPerTeam - 1 ||
      secondInnings.totalRuns > firstInnings.totalRuns
    ) {
      updatedMatch.isComplete = true;
    }
  } else {
    // First innings is complete if:
    // 1. All overs bowled
    // 2. Batting team is all out
    if (
      firstInnings.completedOvers >= updatedMatch.totalOvers ||
      firstInnings.totalWickets >= updatedMatch.playersPerTeam - 1
    ) {
      // Create second innings
      if (updatedMatch.currentInnings === 0) {
        const emptyExtras = {
          wides: 0,
          noBalls: 0,
          byes: 0,
          legByes: 0,
          penalty: 0
        };
        
        const secondInnings: Innings = {
          battingTeamId: 1,
          bowlingTeamId: 0,
          overs: [],
          totalRuns: 0,
          totalWickets: 0,
          completedOvers: 0,
          extras: { ...emptyExtras }
        };
        
        updatedMatch.innings.push(secondInnings);
        updatedMatch.currentInnings = 1;
      }
    }
  }
  
  return updatedMatch;
};

export const getCurrentBatsmen = (match: Match): [number, number] => {
  const currentInnings = match.innings[match.currentInnings];
  if (!currentInnings || currentInnings.overs.length === 0) return [-1, -1];
  
  const allDeliveries = currentInnings.overs.flatMap(over => 
    over.deliveries.map(delivery => ({
      batterId: delivery.batterId,
      isWicket: delivery.isWicket
    }))
  );
  
  // Track all batsmen who have batted
  const battedPlayers = new Set<number>();
  // Track out batsmen
  const outPlayers = new Set<number>();
  
  allDeliveries.forEach(({ batterId, isWicket }) => {
    battedPlayers.add(batterId);
    if (isWicket) outPlayers.add(batterId);
  });
  
  // Get last over and delivery to find current striker
  const lastOver = currentInnings.overs[currentInnings.overs.length - 1];
  const lastDelivery = lastOver.deliveries[lastOver.deliveries.length - 1];
  
  // Current batsmen are the last two who are not out
  const notOutBatsmen = Array.from(battedPlayers)
    .filter(id => !outPlayers.has(id))
    .slice(-2);
  
  // If we have 2 batsmen, determine who is on strike
  if (notOutBatsmen.length === 2) {
    const [batsman1, batsman2] = notOutBatsmen;
    
    // Check if striker changed on the last ball
    const isLastBallOfOver = lastOver.deliveries.length === 6;
    const isOddRuns = lastDelivery.runs % 2 === 1;
    
    // Striker is determined by whether runs on last ball were odd/even
    // and whether it was the last ball of the over
    if ((isLastBallOfOver && !isOddRuns) || (!isLastBallOfOver && isOddRuns)) {
      return lastDelivery.batterId === batsman1 ? [batsman2, batsman1] : [batsman1, batsman2];
    } else {
      return lastDelivery.batterId === batsman1 ? [batsman1, batsman2] : [batsman2, batsman1];
    }
  }
  
  // If we have fewer than 2 batsmen, return available batsman and -1
  return notOutBatsmen.length === 1 ? [notOutBatsmen[0], -1] : [-1, -1];
};

export const getCurrentBowler = (match: Match): number => {
  const currentInnings = match.innings[match.currentInnings];
  if (!currentInnings || currentInnings.overs.length === 0) return -1;
  
  const lastOver = currentInnings.overs[currentInnings.overs.length - 1];
  
  // If current over has deliveries, return the bowler of this over
  if (lastOver.deliveries.length > 0) {
    return lastOver.deliveries[0].bowlerId;
  }
  
  // Otherwise return -1 indicating we need a new bowler
  return -1;
};

export const getWicketStatus = (innings: Innings, playerId: number): string => {
  if (!innings) return '';
  
  // Get all deliveries where this batsman got out
  for (const over of innings.overs) {
    for (const delivery of over.deliveries) {
      if (delivery.batterId === playerId && delivery.isWicket) {
        switch (delivery.wicketType) {
          case 'bowled':
            return `b ${getBowlerName(innings.bowlingTeamId === 0 ? 
              match.team1.players : match.team2.players, delivery.bowlerId)}`;
          case 'caught':
            return `c & b ${getBowlerName(innings.bowlingTeamId === 0 ? 
              match.team1.players : match.team2.players, delivery.bowlerId)}`;
          case 'lbw':
            return `lbw b ${getBowlerName(innings.bowlingTeamId === 0 ? 
              match.team1.players : match.team2.players, delivery.bowlerId)}`;
          case 'runOut':
            return 'run out';
          case 'stumped':
            return `st & b ${getBowlerName(innings.bowlingTeamId === 0 ? 
              match.team1.players : match.team2.players, delivery.bowlerId)}`;
          case 'hitWicket':
            return `hit wicket b ${getBowlerName(innings.bowlingTeamId === 0 ? 
              match.team1.players : match.team2.players, delivery.bowlerId)}`;
          default:
            return 'out';
        }
      }
    }
  }
  
  // Batsman did not bat or is not out
  const hasBatted = innings.overs.some(over => 
    over.deliveries.some(delivery => delivery.batterId === playerId)
  );
  
  return hasBatted ? 'not out' : 'did not bat';
};

const match = {
  team1: { players: [] },
  team2: { players: [] }
};

const getBowlerName = (players: Player[], bowlerId: number): string => {
  const bowler = players.find(p => p.id === bowlerId);
  return bowler ? bowler.name : 'Unknown';
};