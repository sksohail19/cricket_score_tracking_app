import React, { useEffect, useState } from 'react';
import { getMatchSummaries, deleteMatch } from '../../services/matchStorage';
import { MatchSummary } from '../../types/cricket';
import { Calendar, Eye, Trash2, ArrowLeft, Shuffle } from 'lucide-react';

interface MatchHistoryProps {
  onViewMatch: (id: string) => void;
  onBack: () => void;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ onViewMatch, onBack }) => {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    loadMatches();
  }, []);
  
  const loadMatches = () => {
    const summaries = getMatchSummaries();
    summaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMatches(summaries);
  };
  
  const confirmDelete = (id: string) => {
    setMatchToDelete(id);
    setShowDeleteModal(true);
  };
  
  const handleDelete = () => {
    if (matchToDelete) {
      deleteMatch(matchToDelete);
      loadMatches();
      setShowDeleteModal(false);
      setMatchToDelete(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-green-800">Match History</h1>
      </div>
      
      {matches.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">No match records found</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Create New Match
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Teams</th>
                  <th className="py-3 px-4 text-left">Score</th>
                  <th className="py-3 px-4 text-left">Toss</th>
                  <th className="py-3 px-4 text-left">Result</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id} className="border-b border-gray-200 hover:bg-green-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-green-600" />
                        <span>{formatDate(match.date)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {match.team1Name} vs {match.team2Name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div>{match.team1Name}: <span className="font-medium">{match.team1Score}</span></div>
                        <div>{match.team2Name}: <span className="font-medium">{match.team2Score}</span></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Shuffle size={16} className="mr-2 text-green-600" />
                        <span>{match.tossWinner} elected to {match.tossDecision}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        match.result.includes('won') 
                          ? 'bg-green-100 text-green-800' 
                          : match.result === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {match.result}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => onViewMatch(match.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="View Match"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(match.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                          title="Delete Match"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Delete Match</h3>
            <p className="mb-6">
              Are you sure you want to delete this match? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;