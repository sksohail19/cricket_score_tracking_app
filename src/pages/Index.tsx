
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { NewMatchSetup } from '@/components/NewMatchSetup';
import { MatchHistory } from '@/components/MatchHistory';
import { LiveScorecard } from '@/components/LiveScorecard';

const Index = () => {
  const [activeView, setActiveView] = useState('home');
  const [currentMatch, setCurrentMatch] = useState(null);

  const handleMatchStart = (match: any) => {
    setCurrentMatch(match);
    setActiveView('live-scorecard');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'new-match':
        return <NewMatchSetup onMatchStart={handleMatchStart} />;
      case 'match-history':
        return <MatchHistory onContinueMatch={(match) => {
          setCurrentMatch(match);
          setActiveView('live-scorecard');
        }} />;
      case 'live-scorecard':
        return <LiveScorecard match={currentMatch} onSaveExit={() => setActiveView('home')} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
            <div className="max-w-4xl mx-auto pt-20">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-green-800 mb-4">🏏 Cricket Score Tracker</h1>
                <p className="text-xl text-green-600 mb-8">Track your cricket matches with professional precision</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('new-match')}>
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      🆕 Start New Match
                    </CardTitle>
                    <CardDescription>
                      Set up teams, players, and begin scoring your cricket match
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-green-700 hover:bg-green-800">
                      Create New Match
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('match-history')}>
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      📜 Match History
                    </CardTitle>
                    <CardDescription>
                      View past matches, scorecards, and detailed statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full border-green-700 text-green-700 hover:bg-green-50">
                      View History
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {currentMatch && (
                <Card className="border-green-300 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">Continue Current Match</CardTitle>
                    <CardDescription>
                      {currentMatch.team1.name} vs {currentMatch.team2.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full bg-green-700 hover:bg-green-800"
                      onClick={() => setActiveView('live-scorecard')}
                    >
                      Continue Scoring
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Navigation activeView={activeView} setActiveView={setActiveView} />
      {renderContent()}
    </div>
  );
};

export default Index;
