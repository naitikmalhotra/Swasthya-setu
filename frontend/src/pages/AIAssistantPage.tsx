import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import {
  ChatMessage,
  SymptomAssessment,
  NearbyFacility,
  Facility,
  Appointment
} from '../types';
import { AssessmentCard } from '../components/AssessmentCard';
import { FacilityCard } from '../components/FacilityCard';
import { BookingModal } from '../components/BookingModal';
import { FacilityDetailModal } from '../components/FacilityDetailModal';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  MapPin,
  RefreshCw,
  AlertCircle,
  Stethoscope,
  Info,
  Calendar,
  Building2,
  ShieldCheck,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface AIAssistantPageProps {
  onNavigateAppointments?: () => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  onNavigateAppointments
}) => {
  // Language for Chat & Voice
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'pa' | 'bn'>('hi');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Chat conversation
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'नमस्ते! मैं सेतु हूँ, आपका AI स्वास्थ्य सहायक। आप कैसा महसूस कर रहे हैं? अपने लक्षण बोलें या टाइप करें।\n\n(Hello! I am Setu, your AI Health Assistant. Tell me how you are feeling.)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);

  // Speech Recognition (STT)
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Symptom Assessment & Recommended Centres
  const [currentAssessment, setCurrentAssessment] = useState<SymptomAssessment | null>(null);
  const [nearbyCentres, setNearbyCentres] = useState<NearbyFacility[]>([]);
  const [loadingCentres, setLoadingCentres] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 25.5941, // Default Chandanpur/Bihar region demo coords
    lng: 85.1376
  });

  // Modal states
  const [bookingFacility, setBookingFacility] = useState<Facility | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  // Status & Error
  const [aiStatus, setAiStatus] = useState<{ ai_enabled: boolean; demo_mode: boolean; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, currentAssessment]);

  // Check AI status & setup speech recognition on mount
  useEffect(() => {
    api.getAiStatus()
      .then(setAiStatus)
      .catch(() => {
        setAiStatus({
          ai_enabled: false,
          demo_mode: true,
          message: 'Running in Demo Mode'
        });
      });

    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions or type your symptoms.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech was detected. Please tap the mic and speak clearly.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Set recognition language based on user selection
  useEffect(() => {
    if (recognitionRef.current) {
      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        pa: 'pa-IN',
        bn: 'bn-IN'
      };
      recognitionRef.current.lang = langMap[selectedLanguage] || 'hi-IN';
    }
  }, [selectedLanguage]);

  // Text-To-Speech (TTS)
  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for cleaner speech
      const cleanText = text.replace(/[*_~`#]/g, '').replace(/\n+/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        pa: 'pa-IN',
        bn: 'bn-IN'
      };
      utterance.lang = langMap[selectedLanguage] || 'hi-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (!speechSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. Please type your symptoms below.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setErrorMessage(null);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Failed to start recognition:', e);
      }
    }
  };

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isSending) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);
    setErrorMessage(null);

    try {
      // Build conversation payload
      const historyPayload = messages.concat(userMsg).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.aiChat(historyPayload, selectedLanguage === 'hi' ? 'hi' : 'en');

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(res.reply);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to AI assistant. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Perform Structured Symptom Assessment
  const handleRunAssessment = async () => {
    // Gather all user messages as symptoms input or use current input
    const userTexts = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('. ');

    const combinedSymptoms = inputText.trim() ? `${userTexts}. ${inputText.trim()}` : userTexts;

    if (!combinedSymptoms.trim()) {
      setErrorMessage('Please describe your symptoms first before requesting an assessment.');
      return;
    }

    setIsAssessing(true);
    setErrorMessage(null);

    try {
      const assessment = await api.aiSymptomAssessment(
        combinedSymptoms,
        selectedLanguage === 'hi' ? 'hi' : 'en'
      );

      setCurrentAssessment(assessment);
      speakText(
        selectedLanguage === 'hi'
          ? `आपके लक्षणों का आकलन पूर्ण हुआ। गंभीरता स्तर है: ${assessment.urgency}। ${assessment.explanation}`
          : `Assessment completed. Urgency level: ${assessment.urgency}. ${assessment.explanation}`
      );

      // Automatically search for nearby recommended facilities
      fetchNearbyFacilities(userCoords.lat, userCoords.lng, assessment.urgency);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not complete assessment. Showing demo triage guidance.');
    } finally {
      setIsAssessing(false);
    }
  };

  // Get Geolocation & Fetch Nearby Healthcare Centres
  const fetchNearbyFacilities = (lat: number, lng: number, urgency?: string) => {
    setLoadingCentres(true);
    api.getNearbyFacilities(lat, lng, 100, urgency)
      .then((res) => {
        setNearbyCentres(res.facilities || []);
      })
      .catch((err) => {
        console.warn('Failed to fetch nearby facilities:', err);
      })
      .finally(() => {
        setLoadingCentres(false);
      });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported by browser. Using default Chandanpur region.');
      fetchNearbyFacilities(userCoords.lat, userCoords.lng, currentAssessment?.urgency);
      return;
    }

    setLocationStatus('Locating your position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocationStatus(`Location detected: ${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`);
        fetchNearbyFacilities(coords.lat, coords.lng, currentAssessment?.urgency);
      },
      (err) => {
        console.warn('Location error:', err);
        setLocationStatus('Location permission denied. Using district default coordinates.');
        fetchNearbyFacilities(userCoords.lat, userCoords.lng, currentAssessment?.urgency);
      },
      { timeout: 8000 }
    );
  };

  // View facility detail modal
  const handleViewFacilityDetail = (fac: Facility) => {
    setSelectedFacilityId(fac.id);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* Page Title & Subtitle Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-teal-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-300" />
                AI-Powered Triage & Care Locator
              </span>
              {aiStatus?.demo_mode && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-[11px] font-semibold">
                  Demo Data Mode
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {selectedLanguage === 'hi' ? 'सेतु AI स्वास्थ्य सहायक' : 'Setu AI Health Assistant'}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-2xl">
              {selectedLanguage === 'hi'
                ? 'अपने लक्षण बोलें या टाइप करें। सेतु आपको उपयुक्त स्वास्थ्य केंद्र खोजने एवं स्लॉट बुक करने में मदद करेगा।'
                : 'Describe your symptoms with voice or text. Setu helps evaluate urgency, recommends facilities, and books slots.'}
            </p>
          </div>

          {/* Controls: Language & Voice Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-teal-950/70 border border-teal-700/60 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedLanguage === 'hi'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedLanguage === 'en'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('pa')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedLanguage === 'pa'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                ਪੰਜਾਬੀ
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('bn')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedLanguage === 'bn'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Voice Readout Toggle */}
            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? 'Voice readout active' : 'Voice readout muted'}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                voiceEnabled
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{voiceEnabled ? 'Voice: On' : 'Voice: Muted'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error / Warning Alert Banner */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left = Chat / Voice Interface, Right = Assessment & Nearby Centres */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chat Conversation & Voice Interaction (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Setu Health AI</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Triage Assistant
                </div>
              </div>
            </div>

            {/* Quick action: Assess button */}
            <button
              type="button"
              onClick={handleRunAssessment}
              disabled={isAssessing}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {isAssessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  <span>Assessing...</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>{selectedLanguage === 'hi' ? 'लक्षण जांचें' : 'Assess Symptoms'}</span>
                </>
              )}
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/40">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                      isUser
                        ? 'bg-slate-800 text-white'
                        : 'bg-teal-600 text-white shadow-xs'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        isUser ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Setu is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Listening Pulsing Indicator Banner */}
          {isListening && (
            <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-800 flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span>
                  {selectedLanguage === 'hi'
                    ? 'सुन रहा हूँ... कृपया अपने लक्षण बोलें'
                    : 'Listening... please speak your symptoms clearly'}
                </span>
              </div>
              <button
                onClick={toggleListening}
                className="text-[11px] font-bold text-rose-700 underline"
              >
                Stop
              </button>
            </div>
          )}

          {/* Chat Input & Mic Controls */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              {/* Tap to Speak Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Stop listening' : 'Tap to speak your symptoms'}
                className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse'
                    : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                placeholder={
                  selectedLanguage === 'hi'
                    ? 'अपने लक्षण लिखें या माइक दबाकर बोलें...'
                    : 'Type symptoms or tap mic to speak...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isSending}
                className={`p-3 rounded-xl text-white font-bold transition-all shrink-0 ${
                  !inputText.trim() || isSending
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-md shadow-teal-600/20'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Hint bar */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>🎤 Tap mic to speak in Hindi/English</span>
              <button
                type="button"
                onClick={handleRunAssessment}
                className="text-teal-700 hover:underline font-semibold"
              >
                ⚡ Get Medical Triage Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Assessment Result & Recommended Centres (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Assessment Result */}
          {currentAssessment ? (
            <AssessmentCard
              assessment={currentAssessment}
              language={selectedLanguage === 'hi' ? 'hi' : 'en'}
              onFindCentres={() => {
                handleGetLocation();
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                {selectedLanguage === 'hi' ? 'लक्षण जांच शुरू करें' : 'No Active Assessment'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {selectedLanguage === 'hi'
                  ? 'चैट में अपने लक्षण बताएं या बोलें, फिर "लक्षण जांचें" बटन पर क्लिक करें।'
                  : 'Describe your symptoms in the chat or speak into the mic, then click "Assess Symptoms".'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setInputText('मुझे 2 दिन से तेज बुखार, सिरदर्द और थकान है।');
                  handleSendMessage('मुझे 2 दिन से तेज बुखार, सिरदर्द और थकान है।');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <span>💡 Try Sample: Fever & Headache</span>
              </button>
            </div>
          )}

          {/* Recommended Facilities & Navigation Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {selectedLanguage === 'hi' ? 'सुझाए गए स्वास्थ्य केंद्र' : 'Recommended Healthcare Centres'}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                title="Refresh nearby centres based on GPS"
                className="p-1 text-slate-400 hover:text-teal-600 rounded"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCentres ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Location status */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-600" />
                {locationStatus || 'Chandanpur District Region (Default GPS)'}
              </span>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-teal-600 font-semibold hover:underline text-[11px]"
              >
                Use GPS
              </button>
            </div>

            {/* Centres List */}
            {loadingCentres ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                <span className="text-xs">Finding nearest suitable facilities...</span>
              </div>
            ) : nearbyCentres.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Click "Use GPS" or trigger an assessment to find nearest centres.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {nearbyCentres.map((fac) => (
                  <FacilityCard
                    key={fac.id}
                    facility={fac}
                    language={selectedLanguage === 'hi' ? 'hi' : 'en'}
                    onBookSlot={(f) => setBookingFacility(f)}
                    onSelect={(f) => handleViewFacilityDetail(f)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Slot Modal */}
      {bookingFacility && (
        <BookingModal
          facility={bookingFacility}
          isOpen={Boolean(bookingFacility)}
          onClose={() => setBookingFacility(null)}
          onBookingSuccess={(appt) => {
            setBookedAppointment(appt);
            // Announce booking confirmation via voice
            if (voiceEnabled && 'speechSynthesis' in window) {
              const text =
                selectedLanguage === 'hi'
                  ? `आपकी अपॉइंटमेंट बुक हो गई है। बुकिंग आईडी है: ${appt.appointment_id}`
                  : `Your appointment is confirmed. Booking ID is ${appt.appointment_id}`;
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
              window.speechSynthesis.speak(utterance);
            }
          }}
          language={selectedLanguage === 'hi' ? 'hi' : 'en'}
        />
      )}

      {/* Facility Inventory Detail Modal */}
      {selectedFacilityId && (
        <FacilityDetailModal
          facilityId={selectedFacilityId}
          onClose={() => setSelectedFacilityId(null)}
        />
      )}
    </div>
  );
};
