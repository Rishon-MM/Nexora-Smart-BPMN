import React, { useState } from 'react';
import { LogOut, ChevronUp, ChevronDown, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

export function UserCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, signOut } = useAuthStore();

  if (!user) return null;

  return (
    <div className="border-t bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
              {user.email}
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        )}
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-24" : "max-h-0"
        )}
      >
        <button
          onClick={signOut}
          className="w-full px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}