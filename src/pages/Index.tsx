import React, { useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthForm from '@/components/AuthForm';
import Dashboard from '@/components/Dashboard';
import ChessGame from '@/components/ChessGame';
import { toast } from '@/hooks/use-toast';
import { userService } from '@/services/userService';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'game'>('dashboard');
  const [gameMode, setGameMode] = useState('');

  const handleAuthSubmit = (data: { username: string; password: string }) => {
    console.log('Auth data:', data);
    
    if (isSignUp) {
      // Register new user
      const success = userService.register(data);
      if (success) {
        setUserName(data.username);
        setIsAuthenticated(true);
        toast({
          title: "Account created successfully!",
          description: `Welcome to ChessMaster, ${data.username}!`,
        });
      } else {
        toast({
          title: "Registration failed",
          description: "Username already exists. Please choose a different one.",
          variant: "destructive",
        });
      }
    } else {
      // Login existing user
      const user = userService.login(data);
      if (user) {
        setUserName(user.username);
        setIsAuthenticated(true);
        toast({
          title: "Welcome back!",
          description: `Signed in successfully as ${user.username}.`,
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName('');
    setCurrentPage('dashboard');
    setGameMode('');
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const handleGameModeSelect = (mode: string) => {
    console.log(`Starting ${mode} mode`);
    setGameMode(mode);
    setCurrentPage('game');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setGameMode('');
  };

  return (
    <ThemeProvider>
      <div className="transition-colors duration-300">
        {!isAuthenticated ? (
          <AuthForm
            isSignUp={isSignUp}
            onToggleMode={() => setIsSignUp(!isSignUp)}
            onSubmit={handleAuthSubmit}
          />
        ) : currentPage === 'dashboard' ? (
          <Dashboard
            userName={userName}
            onLogout={handleLogout}
            onGameModeSelect={handleGameModeSelect}
          />
        ) : (
          <ChessGame
            gameMode={gameMode}
            userName={userName}
            onBack={handleBackToDashboard}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default Index;
