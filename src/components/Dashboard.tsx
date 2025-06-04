import React, { useState, useEffect } from "react";
import { Users, Zap, Brain, LogOut, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import GameModeCard from "./GameModeCard";
import { userService, UserData } from "@/services/userService";

interface DashboardProps {
  userName: string;
  onLogout: () => void;
  onGameModeSelect: (mode: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  onLogout,
  onGameModeSelect,
}) => {
  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    winStreak: 0,
  });

  useEffect(() => {
    const stats = userService.getUserStats(userName);
    if (stats) {
      setUserStats(stats);
    }
  }, [userName]);

  const gameModes = [
    {
      title: "Sandbox",
      description:
        "Play with a friend locally. No time limits, no pressure - just pure chess enjoyment.",
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      onClick: () => onGameModeSelect("sandbox"),
    },
    {
      title: "Easy Mode",
      description:
        "Perfect for beginners. Face an AI opponent designed to help you learn and improve your skills.",
      icon: Zap,
      difficulty: "Beginner",
      gradient: "from-green-500 to-green-600",
      onClick: () => onGameModeSelect("easy"),
    },
    {
      title: "Hard Mode",
      description: (
        <>
          Challenge yourself against a formidable AI. Test your skills and
          strategic thinking.
          <strong className="font-semibold group-hover:text-amber-500 transition-colors duration-300">
            {" "}
            Hard Mode doesn't affect your winstreak.
          </strong>
        </>
      ),
      icon: Brain,
      difficulty: "Expert",
      gradient: "from-red-500 to-red-600",
      onClick: () => onGameModeSelect("hard"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-amber-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                ChessMaster
              </h1>
            </div>
            <div className="hidden md:block w-px h-6 bg-slate-300 dark:bg-slate-600" />
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              Hi{" "}
              <span className="text-amber-600 font-semibold">{userName}</span>!
              👋
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-950 dark:hover:border-red-700 dark:hover:text-red-400 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Choose Your Chess Adventure
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Whether you're practicing with friends, learning the basics, or
            testing your mastery, we have the perfect game mode for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gameModes.map((mode, index) => (
            <GameModeCard key={index} {...mode} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-center">
            Your Chess Journey
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-2xl border border-amber-200 dark:border-amber-800/30">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                {userStats.gamesPlayed}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Games Played
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-800/30">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {userStats.gamesWon}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Games Won
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200 dark:border-blue-800/30">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {userStats.winStreak}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Win Streak
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
