import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trophy, Star } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LiveScorecardProps {
  match: any;
  onSaveExit: () => void;
}

export const LiveScorecard = ({ match, onSaveExit }: LiveScorecardProps) => {
  const [currentMatch, setCurrentMatch] = useState(match);
  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');
  const [ballHistory, setBallHistory] = useState([]);
  const [currentOverBalls, setCurrentOverBalls] = useState([]);
  const [previousOverBalls, setPreviousOverBalls] = useState([]);
  const [allOvers, setAllOvers] = useState([]);
  const [showExtraRunsDialog, setShowExtraRunsDialog] = useState(false);
  const [showWicketDialog, setShowWicketDialog] = useState(false);
  const [extraType, setExtraType] = useState('');
  const [wicketType, setWicketType] = useState('');
  const [newBatsman, setNewBatsman] = useState('');
  const [runOutRuns, setRunOutRuns] = useState(0);

  useEffect(() => {
    if (match) {
      setCurrentMatch(match);
      // Initialize players
      const battingTeamPlayers = match.battingTeam === match.team1.name ? match.team1.players : match.team2.players;
      if (!striker && battingTeamPlayers.length > 0) setStriker(battingTeamPlayers[0]);
      if (!nonStriker && battingTeamPlayers.length > 1) setNonStriker(battingTeamPlayers[1]);
      
      const bowlingTeamPlayers = match.bowlingTeam === match.team1.name ? match.team1.players : match.team2.players;
      if (!bowler && bowlingTeamPlayers.length > 0) setBowler(bowlingTeamPlayers[0]);
    }
  }, [match]);

  const getCurrentBattingTeam = () => {
    return currentMatch.battingTeam === currentMatch.team1.name ? 'team1' : 'team2';
  };

  const getTarget = () => {
    if (currentMatch.innings === 2) {
      const firstInningsTeam = getCurrentBattingTeam() === 'team1' ? 'team2' : 'team1';
      return currentMatch.score[firstInningsTeam].runs + 1;
    }
    return null;
  };

  const checkMatchComplete = (newMatch: any, battingTeam: string) => {
    const teamScore = newMatch.score[battingTeam];
    const maxOvers = newMatch.overs;
    const totalPlayers = battingTeam === 'team1' ? newMatch.team1.players.length : newMatch.team2.players.length;
    
    // Check if innings should end
    const oversCompleted = Math.floor(teamScore.balls / 6) >= maxOvers;
    const allOut = teamScore.wickets >= (totalPlayers - 1); // Fixed: should be totalPlayers - 1
    
    // Check if target is chased in second innings
    const target = getTarget();
    const targetChased = newMatch.innings === 2 && target && teamScore.runs >= target;
    
    if (oversCompleted || allOut || targetChased) {
      if (newMatch.innings === 1) {
        // End of first innings, start second innings
        const otherTeam = battingTeam === 'team1' ? 'team2' : 'team1';
        newMatch.innings = 2;
        newMatch.battingTeam = otherTeam === 'team1' ? newMatch.team1.name : newMatch.team2.name;
        newMatch.bowlingTeam = battingTeam === 'team1' ? newMatch.team1.name : newMatch.team2.name;
        
        // Reset current over
        setCurrentOverBalls([]);
        setPreviousOverBalls([]);
        
        // Reset players for new innings
        const newBattingTeamPlayers = otherTeam === 'team1' ? newMatch.team1.players : newMatch.team2.players;
        const newBowlingTeamPlayers = battingTeam === 'team1' ? newMatch.team1.players : newMatch.team2.players;
        
        if (newBattingTeamPlayers.length > 0) setStriker(newBattingTeamPlayers[0]);
        if (newBattingTeamPlayers.length > 1) setNonStriker(newBattingTeamPlayers[1]);
        if (newBowlingTeamPlayers.length > 0) setBowler(newBowlingTeamPlayers[0]);
      } else {
        // End of second innings, match completed
        newMatch.status = 'completed';
        
        // Determine winner
        const team1Score = newMatch.score.team1;
        const team2Score = newMatch.score.team2;
        
        if (targetChased) {
          // Team chased the target successfully
          newMatch.winner = newMatch.battingTeam;
          const wicketsRemaining = (newMatch.battingTeam === newMatch.team1.name ? newMatch.team1.players.length : newMatch.team2.players.length) - 1 - teamScore.wickets;
          newMatch.winMargin = `${wicketsRemaining} wickets`;
        } else if (team1Score.runs > team2Score.runs) {
          newMatch.winner = newMatch.team1.name;
          newMatch.winMargin = `${team1Score.runs - team2Score.runs} runs`;
        } else if (team2Score.runs > team1Score.runs) {
          newMatch.winner = newMatch.team2.name;
          newMatch.winMargin = `${team2Score.runs - team1Score.runs} runs`;
        } else {
          newMatch.winner = 'Tie';
          newMatch.winMargin = '';
        }
      }
    }
    
    return newMatch;
  };

  const updateScore = (runs: number, isWide = false, isNoBall = false, isWicket = false) => {
    const battingTeam = getCurrentBattingTeam();
    const newMatch = { ...currentMatch };
    
    // Handle wickets - just show dialog, don't update score yet
    if (isWicket) {
      setShowWicketDialog(true);
      return;
    }
    
    // Update runs
    newMatch.score[battingTeam].runs += runs;
    
    // Handle extras (wide/no-ball adds 1 extra run)
    /*if (isWide || isNoBall) {
      newMatch.score[battingTeam].runs += 1;
    }*/
    
    // Handle balls (only count if not wide or no-ball)
    if (!isWide && !isNoBall) {
      newMatch.score[battingTeam].balls += 1;
    }
    
    // Handle strike rotation for odd runs
    if (runs % 2 === 1 && !isWicket) {
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    }
    
    // Create ball data
    const ballData = {
      ball: newMatch.score[battingTeam].balls,
      runs,
      isWide,
      isNoBall,
      isWicket: false,
      striker,
      bowler,
    };
    
    // Add to ball history
    setBallHistory(prev => [...prev, ballData]);
    
    // Update current over balls
    const newCurrentOverBalls = [...currentOverBalls, ballData];
    
    // Check if over is complete (6 valid balls)
    const validBalls = newCurrentOverBalls.filter(ball => !ball.isWide && !ball.isNoBall);
    if (validBalls.length === 6) {
      // Move current over to all overs and previous over
      const overData = {
        overNumber: Math.floor(newMatch.score[battingTeam].balls / 6),
        bowler,
        balls: newCurrentOverBalls,
        runs: newCurrentOverBalls.reduce((total, ball) => {
          let ballRuns = ball.runs;
          //if (ball.isWide || ball.isNoBall) ballRuns += 1;
          return total + ballRuns;
        }, 0)
      };
      
      setAllOvers(prev => [...prev, overData]);
      setPreviousOverBalls(newCurrentOverBalls);
      setCurrentOverBalls([]);
      
      // Rotate strike at end of over
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    } else {
      setCurrentOverBalls(newCurrentOverBalls);
    }
    
    // Check if match should end
    const finalMatch = checkMatchComplete(newMatch, battingTeam);
    setCurrentMatch(finalMatch);
    
    // Save to localStorage
    const savedMatches = JSON.parse(localStorage.getItem('cricketMatches') || '[]');
    const matchIndex = savedMatches.findIndex((m: any) => m.id === currentMatch.id);
    if (matchIndex >= 0) {
      savedMatches[matchIndex] = finalMatch;
    } else {
      savedMatches.push(finalMatch);
    }
    localStorage.setItem('cricketMatches', JSON.stringify(savedMatches));
  };

  const handleWicketDismissal = () => {
    if (!wicketType || (availableBatsmen.length > 0 && !newBatsman)) return;
    
    const battingTeam = getCurrentBattingTeam();
    const newMatch = { ...currentMatch };
    
    // For run-out, add the runs scored before the dismissal
    const runsToAdd = wicketType === 'run-out' ? runOutRuns : 0;
    
    // Update runs, wickets and balls
    newMatch.score[battingTeam].runs += runsToAdd;
    newMatch.score[battingTeam].wickets += 1;
    newMatch.score[battingTeam].balls += 1;
    
    // Handle strike rotation for run-out based on runs scored
    let shouldRotateStrike = false;
    if (wicketType === 'run-out' && runsToAdd % 2 === 1) {
      shouldRotateStrike = true;
    }
    
    // Create ball data for wicket
    const ballData = {
      ball: newMatch.score[battingTeam].balls,
      runs: runsToAdd,
      isWide: false,
      isNoBall: false,
      isWicket: true,
      wicketType,
      outPlayer: striker,
      striker,
      bowler,
    };
    
    // Add to ball history
    setBallHistory(prev => [...prev, ballData]);
    
    // Update current over balls
    const newCurrentOverBalls = [...currentOverBalls, ballData];
    
    // Check if over is complete (6 valid balls)
    const validBalls = newCurrentOverBalls.filter(ball => !ball.isWide && !ball.isNoBall);
    if (validBalls.length === 6) {
      // Move current over to all overs and previous over
      const overData = {
        overNumber: Math.floor(newMatch.score[battingTeam].balls / 6),
        bowler,
        balls: newCurrentOverBalls,
        runs: newCurrentOverBalls.reduce((total, ball) => {
          let ballRuns = ball.runs;
          //if (ball.isWide || ball.isNoBall) ballRuns += 1;
          return total + ballRuns;
        }, 0)
      };
      
      setAllOvers(prev => [...prev, overData]);
      setPreviousOverBalls(newCurrentOverBalls);
      setCurrentOverBalls([]);
      
      // Rotate strike at end of over if new batsman is non-striker
      if (newBatsman && newBatsman === nonStriker) {
        setStriker(nonStriker);
        setNonStriker(newBatsman);
      }
    } else {
      setCurrentOverBalls(newCurrentOverBalls);
    }
    
    // Replace striker with new batsman (if available)
    if (newBatsman) {
      if (shouldRotateStrike) {
        // If strike should rotate due to odd runs in run-out, swap roles
        setNonStriker(newBatsman);
      } else {
        setStriker(newBatsman);
      }
    }
    
    // Check if match should end
    const finalMatch = checkMatchComplete(newMatch, battingTeam);
    setCurrentMatch(finalMatch);
    
    // Save to localStorage
    const savedMatches = JSON.parse(localStorage.getItem('cricketMatches') || '[]');
    const matchIndex = savedMatches.findIndex((m: any) => m.id === currentMatch.id);
    if (matchIndex >= 0) {
      savedMatches[matchIndex] = finalMatch;
    } else {
      savedMatches.push(finalMatch);
    }
    localStorage.setItem('cricketMatches', JSON.stringify(savedMatches));
    
    // Reset dialog state
    setShowWicketDialog(false);
    setWicketType('');
    setNewBatsman('');
    setRunOutRuns(0);
  };

  const handleExtraRuns = (extraRuns: number) => {
    if (extraType === 'wide') {
      updateScore(extraRuns, true, false, false);
    } else if (extraType === 'noball') {
      updateScore(extraRuns, false, true, false);
    }
    setShowExtraRunsDialog(false);
    setExtraType('');
  };

  const handleWideClick = () => {
    setExtraType('wide');
    setShowExtraRunsDialog(true);
  };

  const handleNoBallClick = () => {
    setExtraType('noball');
    setShowExtraRunsDialog(true);
  };

  const handleEndMatch = () => {
    const newMatch = { ...currentMatch, status: 'completed' };
    
    // Determine winner if match is ended manually
    if (newMatch.innings === 1) {
      // If ended in first innings, no winner yet
      newMatch.winner = 'Match ended early';
    } else {
      // Determine winner based on current scores
      const team1Score = newMatch.score.team1;
      const team2Score = newMatch.score.team2;
      
      if (team1Score.runs > team2Score.runs) {
        newMatch.winner = newMatch.team1.name;
        newMatch.winMargin = `${team1Score.runs - team2Score.runs} runs`;
      } else if (team2Score.runs > team1Score.runs) {
        newMatch.winner = newMatch.team2.name;
        newMatch.winMargin = `${team2Score.runs - team1Score.runs} runs`;
      } else {
        newMatch.winner = 'Tie';
        newMatch.winMargin = '';
      }
    }
    
    setCurrentMatch(newMatch);
    
    // Save to localStorage
    const savedMatches = JSON.parse(localStorage.getItem('cricketMatches') || '[]');
    const matchIndex = savedMatches.findIndex((m: any) => m.id === currentMatch.id);
    if (matchIndex >= 0) {
      savedMatches[matchIndex] = newMatch;
    } else {
      savedMatches.push(newMatch);
    }
    localStorage.setItem('cricketMatches', JSON.stringify(savedMatches));
    
    onSaveExit();
  };

  const calculateRunRate = (runs: number, balls: number) => {
    if (balls === 0) return 0;
    return ((runs / balls) * 6).toFixed(2);
  };

  const calculateOverRuns = (balls: any[]) => {
    return balls.reduce((total, ball) => {
      let ballRuns = ball.runs;
      //if (ball.isWide || ball.isNoBall) ballRuns += 1;
      return total + ballRuns;
    }, 0);
  };

  const battingTeam = getCurrentBattingTeam();
  const currentScore = currentMatch.score[battingTeam];
  const battingTeamPlayers = currentMatch.battingTeam === currentMatch.team1.name ? currentMatch.team1.players : currentMatch.team2.players;
  const bowlingTeamPlayers = currentMatch.bowlingTeam === currentMatch.team1.name ? currentMatch.team1.players : currentMatch.team2.players;
  
  // Get available batsmen (excluding current striker and non-striker)
  const availableBatsmen = battingTeamPlayers.filter(player => 
    player !== striker && player !== nonStriker
  );

  const target = getTarget();

  // Match completed view
  if (currentMatch.status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Trophy className="h-12 w-12 text-yellow-500" />
              <h2 className="text-3xl font-bold text-green-800">Match Completed!</h2>
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
            
            <Card className="mb-6 border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex justify-center items-center gap-3 text-2xl">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <span className="text-green-800">
                    {currentMatch.winner === 'Tie' ? 'Match Tied!' : `${currentMatch.winner} Wins!`}
                  </span>
                  <Star className="h-8 w-8 text-yellow-600" />
                </CardTitle>
                {currentMatch.winMargin && (
                  <p className="text-lg text-green-700 font-semibold">
                    by {currentMatch.winMargin}
                  </p>
                )}
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">{currentMatch.team1.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {currentMatch.score.team1.runs}/{currentMatch.score.team1.wickets}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Math.floor(currentMatch.score.team1.balls / 6)}.{currentMatch.score.team1.balls % 6} overs
                  </div>
                  <div className="text-sm text-green-600">
                    Run Rate: {calculateRunRate(currentMatch.score.team1.runs, currentMatch.score.team1.balls)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">{currentMatch.team2.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {currentMatch.score.team2.runs}/{currentMatch.score.team2.wickets}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Math.floor(currentMatch.score.team2.balls / 6)}.{currentMatch.score.team2.balls % 6} overs
                  </div>
                  <div className="text-sm text-green-600">
                    Run Rate: {calculateRunRate(currentMatch.score.team2.runs, currentMatch.score.team2.balls)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={onSaveExit}
              className="bg-green-700 hover:bg-green-800 text-lg px-8 py-3"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-green-800">Live Scorecard</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSaveExit}>
              Save & Exit
            </Button>
            <Button variant="destructive" onClick={handleEndMatch}>
              End Match
            </Button>
          </div>
        </div>

        {/* Match Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{currentMatch.team1.name} vs {currentMatch.team2.name}</span>
              <Badge>Innings {currentMatch.innings}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">
                  {currentScore.runs}/{currentScore.wickets}
                </div>
                <div className="text-sm text-gray-600">
                  {Math.floor(currentScore.balls / 6)}.{currentScore.balls % 6} overs
                </div>
                <div className="text-sm text-green-600">
                  CRR: {((currentScore.runs / currentScore.balls) * 6).toFixed(2)}
                </div>
                {target && (
                  <div className="text-sm text-blue-600">
                    Target: {target} (Need {target - currentScore.runs} in {(currentMatch.overs * 6) - currentScore.balls} balls)
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-800">Batting</div>
                <div>{currentMatch.battingTeam}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-800">Bowling</div>
                <div>{currentMatch.bowlingTeam}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Selection */}
        {currentMatch.status === 'live' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Striker *</label>
                  <Select value={striker} onValueChange={setStriker}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select striker" />
                    </SelectTrigger>
                    <SelectContent>
                      {battingTeamPlayers.map((player: string) => (
                        <SelectItem key={player} value={player}>{player}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Non-Striker</label>
                  <Select value={nonStriker} onValueChange={setNonStriker}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select non-striker" />
                    </SelectTrigger>
                    <SelectContent>
                      {battingTeamPlayers.map((player: string) => (
                        <SelectItem key={player} value={player}>{player}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bowler</label>
                  <Select value={bowler} onValueChange={setBowler}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bowler" />
                    </SelectTrigger>
                    <SelectContent>
                      {bowlingTeamPlayers.map((player: string) => (
                        <SelectItem key={player} value={player}>{player}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scoring Buttons */}
        {currentMatch.status === 'live' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ball Outcome</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Runs (0-6)</label>
                  <div className="flex gap-2 flex-wrap">
                    {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
                      <Button
                        key={runs}
                        onClick={() => updateScore(runs)}
                        className={`w-12 h-12 rounded-full ${
                          runs === 4 || runs === 6 
                            ? 'bg-orange-500 hover:bg-orange-600' 
                            : 'bg-green-700 hover:bg-green-800'
                        }`}
                      >
                        {runs}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Extras & Dismissals</label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={handleWideClick}
                      variant="outline"
                      className="border-yellow-500 text-yellow-700"
                    >
                      Wide
                    </Button>
                    <Button
                      onClick={handleNoBallClick}
                      variant="outline"
                      className="border-orange-500 text-orange-700"
                    >
                      No Ball
                    </Button>
                    <Button
                      onClick={() => updateScore(0, false, false, true)}
                      variant="destructive"
                    >
                      Wicket
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Over and Previous Over */}
        <div className="space-y-4">
          {/* Current Over */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Current Over</span>
                <span className="text-sm font-normal text-green-600">
                  Runs: {currentOverBalls.reduce((total, ball) => {
                    let ballRuns = ball.runs;
                    //if (ball.isWide || ball.isNoBall) ballRuns += 1;
                    return total + ballRuns;
                  }, 0)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {currentOverBalls.map((ball: any, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      ball.isWicket
                        ? 'bg-red-500 text-white'
                        : ball.isWide || ball.isNoBall
                        ? 'bg-yellow-500 text-white'
                        : ball.runs === 4 || ball.runs === 6
                        ? 'bg-orange-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {ball.isWicket ? 'W' : ball.runs}
                  </div>
                ))}
                {currentOverBalls.length === 0 && (
                  <div className="text-gray-500 text-sm">No balls bowled yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Previous Over */}
          {previousOverBalls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Previous Over</span>
                  <span className="text-sm font-normal text-green-600">
                    Runs: {previousOverBalls.reduce((total, ball) => {
                      let ballRuns = ball.runs;
                     // if (ball.isWide || ball.isNoBall) ballRuns += 1;
                      return total + ballRuns;
                    }, 0)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {previousOverBalls.map((ball: any, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        ball.isWicket
                          ? 'bg-red-500 text-white'
                          : ball.isWide || ball.isNoBall
                          ? 'bg-yellow-500 text-white'
                          : ball.runs === 4 || ball.runs === 6
                          ? 'bg-orange-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {ball.isWicket ? 'W' : ball.runs}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Overs Bowled */}
          {allOvers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>All Overs Bowled</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Over</TableHead>
                      <TableHead>Bowler</TableHead>
                      <TableHead>Runs</TableHead>
                      <TableHead>Balls</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allOvers.map((over: any, index) => (
                      <TableRow key={index}>
                        <TableCell>{over.overNumber}</TableCell>
                        <TableCell>{over.bowler}</TableCell>
                        <TableCell>{over.runs}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {over.balls.map((ball: any, ballIndex: number) => (
                              <div
                                key={ballIndex}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                  ball.isWicket
                                    ? 'bg-red-500 text-white'
                                    : ball.isWide || ball.isNoBall
                                    ? 'bg-yellow-500 text-white'
                                    : ball.runs === 4 || ball.runs === 6
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-green-500 text-white'
                                }`}
                              >
                                {ball.isWicket ? 'W' : ball.runs}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Extra Runs Dialog */}
        <Dialog open={showExtraRunsDialog} onOpenChange={setShowExtraRunsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {extraType === 'wide' ? 'Wide Ball' : 'No Ball'} - Select Additional Runs
              </DialogTitle>
              <DialogDescription>
                Select runs scored off the {extraType === 'wide' ? 'wide' : 'no'} ball (0-6):
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
                  <Button
                    key={runs}
                    onClick={() => handleExtraRuns(runs)}
                    className="w-12 h-12 rounded-full bg-green-700 hover:bg-green-800"
                  >
                    {runs}
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Wicket Dialog */}
        <Dialog open={showWicketDialog} onOpenChange={setShowWicketDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wicket Details</DialogTitle>
              <DialogDescription>
                How was {striker} dismissed?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Dismissal Type</label>
                <Select value={wicketType} onValueChange={setWicketType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dismissal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bowled">Bowled</SelectItem>
                    <SelectItem value="caught">Caught</SelectItem>
                    <SelectItem value="lbw">LBW</SelectItem>
                    <SelectItem value="run-out">Run Out</SelectItem>
                    <SelectItem value="stumped">Stumped</SelectItem>
                    <SelectItem value="hit-wicket">Hit Wicket</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {wicketType === 'run-out' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Runs scored before run-out (0-6)</label>
                  <div className="flex gap-2 flex-wrap">
                    {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
                      <Button
                        key={runs}
                        onClick={() => setRunOutRuns(runs)}
                        variant={runOutRuns === runs ? "default" : "outline"}
                        className="w-12 h-12 rounded-full"
                      >
                        {runs}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {availableBatsmen.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">New Batsman</label>
                  <Select value={newBatsman} onValueChange={setNewBatsman}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new batsman" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBatsmen.map((player: string) => (
                        <SelectItem key={player} value={player}>{player}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button 
                onClick={handleWicketDismissal}
                disabled={!wicketType || (availableBatsmen.length > 0 && !newBatsman)}
                className="w-full"
              >
                Confirm Wicket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
