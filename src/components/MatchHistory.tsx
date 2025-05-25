
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MatchHistoryProps {
  onContinueMatch: (match: any) => void;
}

export const MatchHistory = ({ onContinueMatch }: MatchHistoryProps) => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from localStorage or a database
    const savedMatches = JSON.parse(localStorage.getItem('cricketMatches') || '[]');
    setMatches(savedMatches);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMatchResult = (match: any) => {
    if (match.status === 'live') return 'Live';
    if (match.status === 'completed') {
      const team1Score = `${match.score.team1.runs}/${match.score.team1.wickets}`;
      const team2Score = `${match.score.team2.runs}/${match.score.team2.wickets}`;
      return `${match.team1.name}: ${team1Score}, ${match.team2.name}: ${team2Score}`;
    }
    return 'Not Started';
  };

  const handleDeleteMatch = (matchId: string) => {
    const updatedMatches = matches.filter((match: any) => match.id !== matchId);
    setMatches(updatedMatches);
    localStorage.setItem('cricketMatches', JSON.stringify(updatedMatches));
  };

  const handleExportMatch = (match: any) => {
    const dataStr = JSON.stringify(match, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cricket-match-${match.team1.name}-vs-${match.team2.name}-${match.matchDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (selectedMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => setSelectedMatch(null)}>
              ← Back to History
            </Button>
            <h2 className="text-2xl font-bold text-green-800">Match Details</h2>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{selectedMatch.team1.name} vs {selectedMatch.team2.name}</span>
                  <Badge variant={selectedMatch.status === 'live' ? 'default' : 'secondary'}>
                    {selectedMatch.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Match Info</h4>
                    <p><strong>Date:</strong> {formatDate(selectedMatch.matchDate)}</p>
                    <p><strong>Overs:</strong> {selectedMatch.overs}</p>
                    <p><strong>Players per Team:</strong> {selectedMatch.playersPerTeam}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Toss Details</h4>
                    <p><strong>Caller:</strong> {selectedMatch.toss.caller}</p>
                    <p><strong>Call:</strong> {selectedMatch.toss.call}</p>
                    <p><strong>Result:</strong> {selectedMatch.toss.result}</p>
                    <p><strong>Winner:</strong> {selectedMatch.toss.winner}</p>
                    <p><strong>Decision:</strong> {selectedMatch.toss.decision}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scorecard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-800 mb-3">{selectedMatch.team1.name}</h4>
                    <div className="text-2xl font-bold text-green-700 mb-2">
                      {selectedMatch.score.team1.runs}/{selectedMatch.score.team1.wickets}
                    </div>
                    <p className="text-sm text-gray-600">
                      Overs: {Math.floor(selectedMatch.score.team1.balls / 6)}.{selectedMatch.score.team1.balls % 6}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-3">{selectedMatch.team2.name}</h4>
                    <div className="text-2xl font-bold text-green-700 mb-2">
                      {selectedMatch.score.team2.runs}/{selectedMatch.score.team2.wickets}
                    </div>
                    <p className="text-sm text-gray-600">
                      Overs: {Math.floor(selectedMatch.score.team2.balls / 6)}.{selectedMatch.score.team2.balls % 6}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedMatch.status === 'live' && (
              <Card className="border-green-300 bg-green-50">
                <CardContent className="pt-6">
                  <Button 
                    onClick={() => onContinueMatch(selectedMatch)}
                    className="w-full bg-green-700 hover:bg-green-800"
                  >
                    Continue Match
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Match History</h2>
        
        {matches.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">No matches found</p>
              <p className="text-sm text-gray-500">Start a new match to see it appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match: any) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-green-800">
                          {match.team1.name} vs {match.team2.name}
                        </h3>
                        <Badge variant={match.status === 'live' ? 'default' : 'secondary'}>
                          {match.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDate(match.matchDate)} • {match.overs} overs
                      </p>
                      <p className="text-sm text-green-700">
                        Toss: {match.toss.winner} won, chose to {match.toss.decision.toLowerCase()}
                      </p>
                      <p className="text-sm font-medium text-gray-800 mt-2">
                        {getMatchResult(match)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportMatch(match)}
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Match</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this match? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteMatch(match.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMatch(match)}
                        className="border-green-700 text-green-700 hover:bg-green-50"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
