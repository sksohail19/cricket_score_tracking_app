import React, { useState } from 'react';
import { Ticket as Cricket } from 'lucide-react';
import HomePage from './components/HomePage';
import NewMatchForm from './components/match/NewMatchForm';
import MatchScorecard from './components/match/MatchScorecard';
import MatchHistory from './components/history/MatchHistory';
import MatchDetails from './components/history/MatchDetails';
import Header from './components/common/Header';
import { Match } from './types/cricket';

type AppView = 'home' | 'new-match' | 'scorecard' | 'history' | 'match-details';

function App() {
  const [view, setView] = useState<AppView>('home');
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const navigateTo = (destination: AppView) => {
    setView(destination);
  };

  const startNewMatch = (match: Match) => {
    setCurrentMatch(match);
    setView('scorecard');
  };

  const viewMatchDetails = (id: string) => {
    setSelectedMatchId(id);
    setView('match-details');
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return <HomePage onNewMatch={() => navigateTo('new-match')} onViewHistory={() => navigateTo('history')} />;
      case 'new-match':
        return <NewMatchForm onMatchCreated={startNewMatch} onCancel={() => navigateTo('home')} />;
      case 'scorecard':
        return currentMatch ? 
          <MatchScorecard 
            match={currentMatch} 
            onMatchUpdate={setCurrentMatch} 
            onFinish={() => navigateTo('home')} 
          /> : 
          <div className="text-center py-8">
            <p className="text-red-600">No match data available</p>
            <button 
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              onClick={() => navigateTo('home')}
            >
              Back to Home
            </button>
          </div>;
      case 'history':
        return <MatchHistory onViewMatch={viewMatchDetails} onBack={() => navigateTo('home')} />;
      case 'match-details':
        return (
          <MatchDetails 
            matchId={selectedMatchId!} 
            onBack={() => navigateTo('history')} 
            onContinueMatch={(match) => {
              setCurrentMatch(match);
              setView('scorecard');
            }}
          />
        );
      default:
        return <HomePage onNewMatch={() => navigateTo('new-match')} onViewHistory={() => navigateTo('history')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        navigateHome={() => navigateTo('home')}
        navigateHistory={() => navigateTo('history')}
        currentView={view}
      />
      <main className="flex-1 container mx-auto px-4 py-6">
        {renderView()}
      </main>
      <footer className="bg-green-800 text-white text-center py-4 text-sm">
        <p>Cricket Score Tracker © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;