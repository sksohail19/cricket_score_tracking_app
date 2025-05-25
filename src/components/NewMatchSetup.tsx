import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewMatchSetupProps {
  onMatchStart: (match: any) => void;
}

export const NewMatchSetup = ({ onMatchStart }: NewMatchSetupProps) => {
  const [step, setStep] = useState(1);
  const [matchSettings, setMatchSettings] = useState({
    overs: '',
    playersPerTeam: '',
    matchDate: new Date().toISOString().split('T')[0],
  });
  
  const [teams, setTeams] = useState({
    team1: { name: '', players: [] },
    team2: { name: '', players: [] },
  });

  const [toss, setToss] = useState({
    caller: '',
    call: '',
    result: '',
    winner: '',
    decision: '',
  });

  const handleMatchSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchSettings.overs && matchSettings.playersPerTeam) {
      setStep(2);
    }
  };

  const handleTeamSetup = (teamKey: 'team1' | 'team2', field: string, value: any) => {
    setTeams(prev => ({
      ...prev,
      [teamKey]: {
        ...prev[teamKey],
        [field]: value,
      },
    }));
  };

  const addPlayer = (teamKey: 'team1' | 'team2', playerName: string) => {
    if (playerName.trim() && teams[teamKey].players.length < parseInt(matchSettings.playersPerTeam)) {
      setTeams(prev => ({
        ...prev,
        [teamKey]: {
          ...prev[teamKey],
          players: [...prev[teamKey].players, playerName.trim()],
        },
      }));
    }
  };

  const simulateToss = () => {
    const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
    const winner = result === toss.call ? toss.caller : (toss.caller === teams.team1.name ? teams.team2.name : teams.team1.name);
    
    setToss(prev => ({
      ...prev,
      result,
      winner,
    }));
  };

  const startMatch = () => {
    const match = {
      id: Date.now().toString(),
      ...matchSettings,
      ...teams,
      toss,
      status: 'live',
      innings: 1,
      score: { team1: { runs: 0, wickets: 0, overs: 0, balls: 0 }, team2: { runs: 0, wickets: 0, overs: 0, balls: 0 } },
      battingTeam: toss.decision === 'Batting' ? toss.winner : (toss.winner === teams.team1.name ? teams.team2.name : teams.team1.name),
      bowlingTeam: toss.decision === 'Bowling' ? toss.winner : (toss.winner === teams.team1.name ? teams.team2.name : teams.team1.name),
    };
    
    onMatchStart(match);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 pt-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800">New Match Setup</h2>
            <div className="text-sm text-green-600">Step {step} of 3</div>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Match Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMatchSettingsSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="overs">Number of Overs</Label>
                  <Input
                    id="overs"
                    type="number"
                    min="1"
                    max="50"
                    value={matchSettings.overs}
                    onChange={(e) => setMatchSettings(prev => ({ ...prev, overs: e.target.value }))}
                    placeholder="e.g., 20"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="players">Players per Team</Label>
                  <Input
                    id="players"
                    type="number"
                    min="1"
                    max="15"
                    value={matchSettings.playersPerTeam}
                    onChange={(e) => setMatchSettings(prev => ({ ...prev, playersPerTeam: e.target.value }))}
                    placeholder="e.g., 11"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Match Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={matchSettings.matchDate}
                    onChange={(e) => setMatchSettings(prev => ({ ...prev, matchDate: e.target.value }))}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">
                  Continue to Team Setup
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {['team1', 'team2'].map((teamKey, index) => (
              <Card key={teamKey}>
                <CardHeader>
                  <CardTitle>Team {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`${teamKey}-name`}>Team Name</Label>
                    <Input
                      id={`${teamKey}-name`}
                      value={teams[teamKey as keyof typeof teams].name}
                      onChange={(e) => handleTeamSetup(teamKey as 'team1' | 'team2', 'name', e.target.value)}
                      placeholder={`Enter Team ${index + 1} name`}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Players ({teams[teamKey as keyof typeof teams].players.length}/{matchSettings.playersPerTeam})</Label>
                    <div className="space-y-2">
                      {teams[teamKey as keyof typeof teams].players.map((player, playerIndex) => (
                        <div key={playerIndex} className="flex items-center gap-2">
                          <span className="text-sm text-green-700">#{playerIndex + 1}</span>
                          <span className="flex-1 p-2 bg-green-50 rounded">{player}</span>
                        </div>
                      ))}
                      {teams[teamKey as keyof typeof teams].players.length < parseInt(matchSettings.playersPerTeam) && (
                        <div className="flex gap-2">
                          <Input
                            placeholder={`Player ${teams[teamKey as keyof typeof teams].players.length + 1} name`}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addPlayer(teamKey as 'team1' | 'team2', e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              addPlayer(teamKey as 'team1' | 'team2', input.value);
                              input.value = '';
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                className="flex-1 bg-green-700 hover:bg-green-800"
                disabled={!teams.team1.name || !teams.team2.name || 
                         teams.team1.players.length !== parseInt(matchSettings.playersPerTeam) ||
                         teams.team2.players.length !== parseInt(matchSettings.playersPerTeam)}
              >
                Continue to Toss
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Toss Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Toss Calling Team</Label>
                <Select value={toss.caller} onValueChange={(value) => setToss(prev => ({ ...prev, caller: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team to call toss" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={teams.team1.name}>{teams.team1.name}</SelectItem>
                    <SelectItem value={teams.team2.name}>{teams.team2.name}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Toss Call</Label>
                <Select value={toss.call} onValueChange={(value) => setToss(prev => ({ ...prev, call: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Heads or Tails" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Heads">Heads</SelectItem>
                    <SelectItem value="Tails">Tails</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {toss.caller && toss.call && !toss.result && (
                <Button onClick={simulateToss} className="w-full bg-green-700 hover:bg-green-800">
                  Flip Coin
                </Button>
              )}
              
              {toss.result && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-center text-lg font-semibold text-green-800">
                      Coin Result: {toss.result}
                    </p>
                    <p className="text-center text-green-700">
                      Winner: {toss.winner}
                    </p>
                  </div>
                  
                  <div>
                    <Label>Choose to Bat or Bowl</Label>
                    <Select value={toss.decision} onValueChange={(value) => setToss(prev => ({ ...prev, decision: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Batting">Choose to Bat First</SelectItem>
                        <SelectItem value="Bowling">Choose to Bowl First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={startMatch}
                  className="flex-1 bg-green-700 hover:bg-green-800"
                  disabled={!toss.decision}
                >
                  Start Match
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
