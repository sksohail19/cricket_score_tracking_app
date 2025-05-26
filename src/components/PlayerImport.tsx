
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Import, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PlayerImportProps {
  onImportPlayers: (players: string[]) => void;
  maxPlayers: number;
  currentPlayers: string[];
  teamName: string;
}

export const PlayerImport = ({ onImportPlayers, maxPlayers, currentPlayers, teamName }: PlayerImportProps) => {
  const [pastMatches, setPastMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState<string[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedMatches = JSON.parse(localStorage.getItem('cricketMatches') || '[]');
    setPastMatches(savedMatches);
  }, []);

  useEffect(() => {
    if (selectedMatch && selectedTeam) {
      const match = pastMatches.find(m => m.id === selectedMatch);
      if (match) {
        const teamData = selectedTeam === 'team1' ? match.team1 : match.team2;
        const players = teamData.players.filter((player: string) => 
          !currentPlayers.includes(player)
        );
        setAvailablePlayers(players);
        setSelectedPlayers([]);
      }
    }
  }, [selectedMatch, selectedTeam, pastMatches, currentPlayers]);

  const handlePlayerToggle = (player: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(player)) {
        return prev.filter(p => p !== player);
      } else {
        const newTotal = currentPlayers.length + prev.length + 1;
        if (newTotal <= maxPlayers) {
          return [...prev, player];
        }
        return prev;
      }
    });
  };

  const handleImport = () => {
    onImportPlayers(selectedPlayers);
    setIsOpen(false);
    setSelectedMatch('');
    setSelectedTeam('');
    setSelectedPlayers([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (pastMatches.length === 0) {
    return null;
  }

  const canAddMore = currentPlayers.length < maxPlayers;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={!canAddMore}
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <Import className="h-4 w-4 mr-2" />
          Import Players
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Players for {teamName}</DialogTitle>
          <DialogDescription>
            Select players from past matches to add to your current team.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Past Match</label>
            <Select value={selectedMatch} onValueChange={setSelectedMatch}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a past match" />
              </SelectTrigger>
              <SelectContent>
                {pastMatches.map((match) => (
                  <SelectItem key={match.id} value={match.id}>
                    {match.team1.name} vs {match.team2.name} - {formatDate(match.matchDate)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMatch && (
            <div>
              <label className="text-sm font-medium mb-2 block">Select Team</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent>
                  {pastMatches
                    .find(m => m.id === selectedMatch)
                    && [
                      <SelectItem key="team1" value="team1">
                        {pastMatches.find(m => m.id === selectedMatch)?.team1.name}
                      </SelectItem>,
                      <SelectItem key="team2" value="team2">
                        {pastMatches.find(m => m.id === selectedMatch)?.team2.name}
                      </SelectItem>
                    ]}
                </SelectContent>
              </Select>
            </div>
          )}

          {availablePlayers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Available Players</CardTitle>
                <p className="text-xs text-gray-600">
                  You can add {maxPlayers - currentPlayers.length} more players
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availablePlayers.map((player) => (
                    <div 
                      key={player}
                      className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                        selectedPlayers.includes(player) 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handlePlayerToggle(player)}
                    >
                      <span className="text-sm">{player}</span>
                      {selectedPlayers.includes(player) && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Selected
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedPlayers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Players ({selectedPlayers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedPlayers.map((player) => (
                    <Badge 
                      key={player} 
                      variant="secondary"
                      className="bg-green-100 text-green-800 cursor-pointer"
                      onClick={() => handlePlayerToggle(player)}
                    >
                      {player}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={selectedPlayers.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Import {selectedPlayers.length} Players
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
