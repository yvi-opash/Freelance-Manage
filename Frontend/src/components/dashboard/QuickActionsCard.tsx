import React from 'react';
import Card from '../Card';
import { Link } from 'react-router-dom';

interface QuickAction {
  name: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

interface Props {
  actions: QuickAction[];
}

const QuickActionsCard: React.FC<Props> = ({ actions }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action) => (
        <Link key={action.name} to={action.path}>
          <Card className="h-full hover:border-orange-200 hover:shadow-orange-100/50 transition-all group">
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`p-4 ${action.color} rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-700">{action.name}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default QuickActionsCard;
