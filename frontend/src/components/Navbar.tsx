import React, { useState } from 'react';
import { useRole } from '../context/RoleContext';
import { Role } from '../types';
import { translations } from '../locales/translations';
import { api } from '../api/client';
import {
  HeartHandshake,
  Globe,
  RotateCcw,
  User,
  Stethoscope,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Info,
  Menu,
  X,
  Bot,
  Calendar,
  LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  onNavigateLanding?: () => void;
  onNavigateView?: (view: 'portal' | 'landing' | 'ai_assistant' | 'appointments') => void;
  currentView?: 'portal' | 'landing' | 'ai_assistant' | 'appointments';
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateLanding,
  onNavigateView,
  currentView = 'portal'
}) => {
  const { role, setRole, language, setLanguage, currentUser } = useRole();
  const t = translations[language];
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleReset = async () => {
    if (!window.confirm("Reset database to clean initial SIH demo state?")) return;
    setResetting(true);
    try {
      await api.resetDemoData();
      setResetMsg("Demo data reset successfully!");
      setTimeout(() => {
        setResetMsg(null);
        window.location.reload();
      }, 1200);
    } catch (err) {
      alert("Failed to reset demo data: " + err);
    } finally {
      setResetting(false);
    }
  };

  const roleConfigs: Array<{ id: Role; label: string; icon: React.ReactNode; color: string; desc: string }> = [
    {
      id: 'patient',
      label: 'Patient',
      icon: <User className="w-3.5 h-3.5" />,
      color: 'hover:border-blue-300 hover:text-blue-700',
      desc: 'patient@demo.com'
    },
    {
      id: 'health_worker',
      label: 'Health Worker',
      icon: <Stethoscope className="w-3.5 h-3.5" />,
      color: 'hover:border-teal-300 hover:text-teal-700',
      desc: 'worker@demo.com'
    },
    {
      id: 'facility',
      label: 'Hospital Facility',
      icon: <Building2 className="w-3.5 h-3.5" />,
      color: 'hover:border-purple-300 hover:text-purple-700',
      desc: 'facility@demo.com'
    },
    {
      id: 'admin',
      label: 'Govt Admin',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      color: 'hover:border-rose-300 hover:text-rose-700',
      desc: 'admin@demo.com'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Notification Bar for SIH Evaluation */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold px-2 py-0.5 rounded text-[10px]">
            SIH 2026 Prototype
          </span>
          <span className="hidden sm:inline text-slate-400">
            Problem Statement SIH26133: Rural Healthcare Accessibility & Continuity
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Current Actor:</span>
          <span className="font-semibold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {currentUser.name}
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            onClick={onNavigateLanding}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  Swasthya<span className="text-teal-600">Setu</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                  Coordination
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block font-medium">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Main Feature Tabs (AI Assistant, Appointments, Role Portals) */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigateView?.('ai_assistant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'ai_assistant'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Health Assistant</span>
            </button>

            <button
              onClick={() => onNavigateView?.('appointments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'appointments'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Appointments</span>
            </button>

            <button
              onClick={() => onNavigateView?.('portal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'portal'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Portals</span>
            </button>
          </div>

          {/* Desktop 1-Click Role Switcher */}
          <div className="hidden xl:flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
              Role:
            </span>
            {roleConfigs.map((cfg) => {
              const isActive = role === cfg.id;
              return (
                <button
                  key={cfg.id}
                  onClick={() => {
                    setRole(cfg.id);
                    onNavigateView?.('portal');
                  }}
                  title={`Switch to ${cfg.label} (${cfg.desc})`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span className={isActive ? 'text-teal-600' : 'text-slate-400'}>
                    {cfg.icon}
                  </span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Actions: Bilingual Toggle & Reset Demo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  language === 'en' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  language === 'hi' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleReset}
              disabled={resetting}
              title="Reset test data back to pristine demo state"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${resetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden px-4 pt-2 pb-4 bg-white border-t border-slate-200 space-y-3">
          {/* Navigation Links */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Features</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onNavigateView?.('ai_assistant');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 border ${
                  currentView === 'ai_assistant'
                    ? 'bg-teal-600 text-white border-teal-700'
                    : 'bg-teal-50 text-teal-800 border-teal-200'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Health</span>
              </button>

              <button
                onClick={() => {
                  onNavigateView?.('appointments');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 border ${
                  currentView === 'appointments'
                    ? 'bg-teal-600 text-white border-teal-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Bookings</span>
              </button>

              <button
                onClick={() => {
                  onNavigateView?.('portal');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 border ${
                  currentView === 'portal'
                    ? 'bg-teal-600 text-white border-teal-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Portals</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Switch Portal Role</p>
            <div className="grid grid-cols-2 gap-2">
              {roleConfigs.map((cfg) => {
                const isActive = role === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    onClick={() => {
                      setRole(cfg.id);
                      onNavigateView?.('portal');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold border ${
                      isActive
                        ? 'bg-teal-50 border-teal-300 text-teal-900'
                        : 'border-slate-200 text-slate-700 bg-slate-50'
                    }`}
                  >
                    {cfg.icon}
                    <div className="text-left">
                      <div>{cfg.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{cfg.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reset toast */}
      {resetMsg && (
        <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {resetMsg}
        </div>
      )}
    </header>
  );
};
