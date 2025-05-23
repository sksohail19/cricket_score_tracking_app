import { Match, MatchSummary } from '../types/cricket';

// Save a match to local storage
export const saveMatch = (match: Match): void => {
  try {
    // Get existing matches
    const matches = getMatches();
    
    // Update or add the match
    const existingIndex = matches.findIndex(m => m.id === match.id);
    if (existingIndex >= 0) {
      matches[existingIndex] = match;
    } else {
      matches.push(match);
    }
    
    // Save to local storage
    localStorage.setItem('cricketMatches', JSON.stringify(matches));
    
    // Also save as individual match file
    localStorage.setItem(`match_${match.id}`, JSON.stringify(match));
  } catch (error) {
    console.error('Failed to save match:', error);
  }
};

// Get all matches from local storage
export const getMatches = (): Match[] => {
  try {
    const matchesJson = localStorage.getItem('cricketMatches');
    return matchesJson ? JSON.parse(matchesJson) : [];
  } catch (error) {
    console.error('Failed to retrieve matches:', error);
    return [];
  }
};

// Get a specific match by ID
export const getMatchById = (id: string): Match | null => {
  try {
    const matchJson = localStorage.getItem(`match_${id}`);
    
    // Try to get from individual storage first
    if (matchJson) {
      return JSON.parse(matchJson);
    }
    
    // Fall back to the matches list
    const matches = getMatches();
    return matches.find(match => match.id === id) || null;
  } catch (error) {
    console.error('Failed to retrieve match:', error);
    return null;
  }
};

// Delete a match by ID
export const deleteMatch = (id: string): void => {
  try {
    // Remove from matches list
    const matches = getMatches();
    const filteredMatches = matches.filter(match => match.id !== id);
    localStorage.setItem('cricketMatches', JSON.stringify(filteredMatches));
    
    // Remove individual match storage
    localStorage.removeItem(`match_${id}`);
  } catch (error) {
    console.error('Failed to delete match:', error);
  }
};

// Get summary of all matches for display in history
export const getMatchSummaries = (): MatchSummary[] => {
  const matches = getMatches();
  
  return matches.map(match => {
    const team1Innings = match.innings.find(inn => inn.battingTeamId === 0) || {
      totalRuns: 0,
      totalWickets: 0
    };
    
    const team2Innings = match.innings.find(inn => inn.battingTeamId === 1) || {
      totalRuns: 0,
      totalWickets: 0
    };
    
    let result = 'In Progress';
    if (match.isComplete) {
      if (team1Innings.totalRuns > team2Innings.totalRuns) {
        result = `${match.team1.name} won`;
      } else if (team2Innings.totalRuns > team1Innings.totalRuns) {
        result = `${match.team2.name} won`;
      } else {
        result = 'Match Tied';
      }
    }
    
    return {
      id: match.id,
      date: match.date,
      team1Name: match.team1.name,
      team2Name: match.team2.name,
      team1Score: `${team1Innings.totalRuns}/${team1Innings.totalWickets}`,
      team2Score: `${team2Innings.totalRuns}/${team2Innings.totalWickets}`,
      result,
      tossWinner: match.tossWinner === 0 ? match.team1.name : match.team2.name,
      tossDecision: match.tossDecision
    };
  });
};

// Export a match as JSON (could be extended to download file)
export const exportMatch = (id: string): string => {
  const match = getMatchById(id);
  return match ? JSON.stringify(match, null, 2) : '';
};