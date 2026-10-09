import React from 'react';
import { Mail, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ScoutOfferModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ScoutOfferModal: React.FC<ScoutOfferModalProps> = ({
  isOpen,
  onAccept,
  onDecline
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-lg w-full bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] text-left chamfer-card">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-tech text-cyan-400 font-bold">
              Official Team Scouting Inquiry
            </div>
            <h3 className="text-2xl font-bold font-tech text-white">
              Contract Offer: Pro Academy Starting Roster
            </h3>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-4 mb-5 text-sm text-slate-300 font-sans space-y-3">
          <p className="leading-relaxed">
            <span className="text-cyan-400 font-semibold font-tech">"Greetings Prodigy.</span> Our global head coach and analytics division have been tracking your 1,000 LP Challenger climb. Your mechanical reaction times and split-second game sense are world-class."
          </p>
          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-slate-400">Position:</span>
              <span className="font-semibold text-white">Starting Mid / Shotcaller</span>
            </div>
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-slate-400">Initial Stipend:</span>
              <span className="font-semibold text-emerald-400">$15,000 / month + Housing</span>
            </div>
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-slate-400">Target Objective:</span>
              <span className="font-semibold text-amber-400">Qualify for Regional Finals</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 italic">
            *Signing moves you immediately onto the professional stage where you will command the Pick/Ban Draft Phase and lead the team in stadium matches.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              onAccept();
            }}
            className="flex-1 py-3 px-5 rounded-xl font-bold font-tech text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer active:scale-98"
          >
            <span>Sign Pro Contract & Go Pro</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onDecline();
            }}
            className="py-3 px-4 rounded-xl font-tech text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition cursor-pointer text-sm"
          >
            Stay in Solo Q
          </button>
        </div>
      </div>
    </div>
  );
};
