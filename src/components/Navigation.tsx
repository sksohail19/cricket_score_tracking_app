
import { Button } from '@/components/ui/button';

interface NavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navigation = ({ activeView, setActiveView }: NavigationProps) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'new-match', label: 'New Match', icon: '🆕' },
    { id: 'match-history', label: 'Match History', icon: '📜' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-green-200 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏏</span>
            <span className="font-bold text-green-800 text-lg">Cricket Tracker</span>
          </div>
          
          <div className="flex gap-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                className={activeView === item.id 
                  ? "bg-green-700 hover:bg-green-800" 
                  : "text-green-700 hover:bg-green-50"
                }
                onClick={() => setActiveView(item.id)}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
