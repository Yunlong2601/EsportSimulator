import React from 'react';
import { SOCIAL_POSTS_INITIAL } from '../data/socialFeed';
import { MessageSquare, Heart, Repeat2, X, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface SocialFeedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialFeedDrawer: React.FC<SocialFeedDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="font-tech font-bold text-white text-sm">
                Esports Community Feed
              </h3>
              <p className="text-[10px] text-slate-400">Live Reddit & Twitter Fan Reactions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Post Feed */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {SOCIAL_POSTS_INITIAL.map((post) => (
            <div
              key={post.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{post.avatar}</span>
                  <div>
                    <div className="flex items-center gap-1 font-tech font-bold text-white text-xs">
                      <span>{post.author}</span>
                      {post.badge && (
                        <span className="text-[8px] px-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-sans">
                          {post.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{post.handle} • {post.timeAgo}</span>
                  </div>
                </div>
                <span className="text-[9px] font-tech text-slate-500 uppercase">{post.platform}</span>
              </div>

              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                {post.content}
              </p>

              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-code pt-1 border-t border-slate-900">
                <span className="flex items-center gap-1 text-rose-400">
                  <Heart className="w-3 h-3" /> {post.likes}
                </span>
                {post.retweets && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Repeat2 className="w-3 h-3" /> {post.retweets}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-tech font-bold text-xs uppercase cursor-pointer"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
