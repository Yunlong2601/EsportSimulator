import React from 'react';
import { PATCH_NOTES_HISTORY } from '../data/patchNotes';
import { Flame, ArrowUpCircle, ArrowDownCircle, RefreshCw, X } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PatchNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatchNotesModal: React.FC<PatchNotesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const currentPatch = PATCH_NOTES_HISTORY[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-tech font-bold text-white text-base">
                {currentPatch.version}
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">{currentPatch.headline}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Patch Description */}
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-xs text-slate-300 font-sans leading-relaxed">
          {currentPatch.description}
        </div>

        {/* Champion Changes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {currentPatch.changes.map((change) => (
            <div
              key={change.champId}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-tech font-bold text-white">
                  <span>{change.champName}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-code uppercase font-bold flex items-center gap-1 ${
                      change.type === 'BUFF'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {change.type === 'BUFF' ? (
                      <ArrowUpCircle className="w-3 h-3" />
                    ) : (
                      <ArrowDownCircle className="w-3 h-3" />
                    )}
                    {change.type} ({change.powerDelta > 0 ? `+${change.powerDelta}` : change.powerDelta} Power)
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {change.changeText}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-tech font-bold text-xs uppercase cursor-pointer"
          >
            Understood (Back to Draft)
          </button>
        </div>
      </div>
    </div>
  );
};
