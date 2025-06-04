import React, { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import "./styles.css";
import { initBoard, renderBoard, gameOver, resign } from "./ChessEngine.js"; // Import your chess engine JS file

import { userService } from "../services/userService.ts";

interface ChessGameProps {
  gameMode: string;
  userName: string;
  onBack: () => void;
}

const ChessGame: React.FC<ChessGameProps> = ({
  gameMode,
  userName,
  onBack,
}) => {
  const getModeTitle = () => {
    switch (gameMode) {
      case "sandbox":
        return "Sandbox Mode";
      case "easy":
        return "Easy Mode";
      case "hard":
        return "Hard Mode";
      default:
        return "Chess Game";
    }
  };

  const getModeDescription = () => {
    switch (gameMode) {
      case "sandbox":
        return "Playing locally with a friend";
      case "easy":
        return "Playing against Easy AI";
      case "hard":
        return "Playing against Hard AI";
      default:
        return "Chess Game";
    }
  };

  const restartBoard = () => {
    // Logic to reset the board state
    initBoard(gameMode);
    renderBoard();
  };

  const [showBoard, setShowBoard] = useState(false);

  useEffect(() => {
    if (gameMode) {
      setShowBoard(true);

      // Delay to ensure the DOM elements exist
      setTimeout(() => {
        initBoard(gameMode);
        renderBoard();
      }, 0);
    }
  }, [gameMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="hidden md:block w-px h-6 bg-slate-300 dark:bg-slate-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {getModeTitle()}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getModeDescription()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Playing as{" "}
              <span className="font-semibold text-amber-600">{userName}</span>
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Game Controls
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={restartBoard}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Game</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={resign}
                >
                  <Flag className="w-4 h-4" />
                  <span>Resign</span>
                </Button>
              </div>
            </div>

            {/* Game Status */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Game Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Turn:
                  </span>
                  {/* <span className="font-semibold text-slate-800 dark:text-slate-200">White</span> */}
                  <div id="game-info"></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Moves:
                  </span>
                  <span
                    id="moves-number"
                    className="font-semibold text-slate-800 dark:text-slate-200"
                  ></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Status:
                  </span>
                  <span className="font-semibold text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chess Board Container */}
          {/* <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="aspect-square bg-gradient-to-br from-amber-50 to-amber-100 dark:from-slate-700 dark:to-slate-600 rounded-xl border-4 border-amber-200 dark:border-slate-500 relative overflow-hidden">
                {/* This is where your existing HTML chess board will be integrated }
                <div id="chess-board-container" className="w-full h-full">
                  {/* Placeholder for chess board - your existing HTML/JS chess board goes here }
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-4">♔</div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">
                        Chess Board Integration Point
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Your HTML/JS chess board will be integrated here
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
          {showBoard && (
            <div className="lg:col-span-2 flex justify-center">
              <div id="game" className="card w-full max-w-[500px]">
                <div
                  id="chess-board"
                  className="grid"
                  style={{
                    gridTemplateColumns: "repeat(8, 12.5%)",
                    gridAutoRows: "12.5%",
                  }}
                ></div>

                {/* Popups */}
                <div
                  id="game-over-popup"
                  style={{ display: "none" }}
                  className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
                >
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 w-[90%] max-w-md">
                    <span
                      id="close-popup"
                      className="close-btn absolute top-3 right-4 text-2xl cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                    >
                      &times;
                    </span>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                      Game Over
                    </h1>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      Feel free to play again or analyze the board
                    </p>
                  </div>
                </div>

                <div
                  id="moveKingInCheck-popup"
                  style={{ display: "none" }}
                  className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
                >
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 w-[90%] max-w-md">
                    <span
                      id="moveIntoCheck-popup"
                      className="close-btn absolute top-3 right-4 text-2xl cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                    >
                      &times;
                    </span>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                      Illegal Move
                    </h1>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      Cannot move your King into Check.
                    </p>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      Try to move to another square.
                    </p>
                  </div>
                </div>

                <div
                  id="illegalMove-popup"
                  style={{ display: "none" }}
                  className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
                >
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 w-[90%] max-w-md">
                    <span
                      id="illegalMove-popup"
                      className="close-btn absolute top-3 right-4 text-2xl cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                    >
                      &times;
                    </span>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                      Illegal Move
                    </h1>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      Piece cannot move here.
                    </p>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      Try to move to another square.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Move History & Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Move History
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  No moves yet
                </p>
              </div>
            </div>

            {/* Captured Pieces */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Captured Pieces
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    White:
                  </p>
                  <div
                    id="white-captured"
                    className="text-lg text-slate-500"
                  ></div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Black:
                  </p>
                  <div
                    id="black-captured"
                    className="text-lg text-slate-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChessGame;
