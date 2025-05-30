import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GameModeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  difficulty?: string;
  onClick: () => void;
  gradient: string;
}

const GameModeCard: React.FC<GameModeCardProps> = ({
  title,
  description,
  icon: Icon,
  difficulty,
  onClick,
  gradient
}) => {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 overflow-hidden"
      onClick={onClick}
    >
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-8 bg-white dark:bg-slate-800">
        <div className="flex items-center space-x-4 mb-4">
          <div className={`p-4 rounded-full bg-gradient-to-r ${gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 transition-colors duration-300">
              {title}
            </h3>
            {difficulty && (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {difficulty}
              </span>
            )}
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>
        <div className="mt-6 flex items-center text-amber-600 font-semibold group-hover:text-amber-700 transition-colors duration-300">
          <span>Start Game</span>
          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameModeCard;
