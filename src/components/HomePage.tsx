import React from 'react';
import { PlusCircle, History, Award, Info } from 'lucide-react';

interface HomePageProps {
  onNewMatch: () => void;
  onViewHistory: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNewMatch, onViewHistory }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Cricket Score Tracker</h1>
        <p className="text-gray-600">Simple and intuitive cricket scoring for small teams</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
          <PlusCircle size={48} className="text-green-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">New Match</h2>
          <p className="text-gray-600 text-center mb-4">
            Start scoring a new cricket match with customizable teams and settings
          </p>
          <button
            onClick={onNewMatch}
            className="mt-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Create Match
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
          <History size={48} className="text-green-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Match History</h2>
          <p className="text-gray-600 text-center mb-4">
            View previous matches, scores, and detailed statistics
          </p>
          <button
            onClick={onViewHistory}
            className="mt-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            View History
          </button>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <Info size={24} className="text-green-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">About This App</h3>
            <p className="text-gray-700 mb-2">
              This Cricket Score Tracker is designed for small teams, local matches, and informal games.
              It allows you to:
            </p>
            <ul className="list-disc pl-5 mb-2 text-gray-700 space-y-1">
              <li>Record ball-by-ball details for complete match statistics</li>
              <li>Track player performances including batting and bowling figures</li>
              <li>Save match data locally for future reference</li>
              <li>Export match data for sharing or backup</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <Award size={20} className="text-green-600 mr-2" />
          Features
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-md p-3 hover:border-green-300 transition-colors">
            <h4 className="font-medium mb-1">Match Setup</h4>
            <p className="text-sm text-gray-600">Customize teams, players, and match parameters</p>
          </div>
          <div className="border border-gray-200 rounded-md p-3 hover:border-green-300 transition-colors">
            <h4 className="font-medium mb-1">Ball-by-Ball Scoring</h4>
            <p className="text-sm text-gray-600">Detailed recording of every delivery</p>
          </div>
          <div className="border border-gray-200 rounded-md p-3 hover:border-green-300 transition-colors">
            <h4 className="font-medium mb-1">Player Statistics</h4>
            <p className="text-sm text-gray-600">Track individual batting and bowling performances</p>
          </div>
          <div className="border border-gray-200 rounded-md p-3 hover:border-green-300 transition-colors">
            <h4 className="font-medium mb-1">Match History</h4>
            <p className="text-sm text-gray-600">Review and analyze past matches</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;