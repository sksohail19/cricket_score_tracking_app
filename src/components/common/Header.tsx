import React from 'react';
import { Ticket as Cricket, Home, History } from 'lucide-react';

interface HeaderProps {
  navigateHome: () => void;
  navigateHistory: () => void;
  currentView: string;
}

const Header: React.FC<HeaderProps> = ({ navigateHome, navigateHistory, currentView }) => {
  return (
    <header className="bg-green-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={navigateHome}
          >
            <Cricket size={28} className="text-white" />
            <h1 className="text-xl font-bold">Cricket Scorekeeper</h1>
          </div>
          
          <nav className="flex gap-4">
            <button 
              onClick={navigateHome} 
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                currentView === 'home' ? 'bg-green-600' : 'hover:bg-green-600'
              }`}
            >
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </button>
            
            <button 
              onClick={navigateHistory} 
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                currentView === 'history' ? 'bg-green-600' : 'hover:bg-green-600'
              }`}
            >
              <History size={18} />
              <span className="hidden sm:inline">History</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;