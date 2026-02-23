/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Moon, Sun, Star, RefreshCcw, X, Trophy, CheckCircle2, LogIn, UserPlus, LogOut } from 'lucide-react';
import { PRAYERS_LIST, PrayerData } from './data/prayers';

const MAX_POINTS = 10;
const STORAGE_KEY = 'potinho_used_prayers';
const AUTH_TOKEN_KEY = 'potinho_auth_token';

// --- AUTH COMPONENTS ---

interface AuthProps {
  onAuthSuccess: (token: string, userData: any) => void;
}

const AuthScreen: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) setServerStatus('online');
        else setServerStatus('offline');
      } catch (e) {
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  // Stabilize background elements to prevent hydration/DOM issues
  const bgElements = React.useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scale: 0.5 + Math.random(),
      duration: 3 + Math.random() * 4,
      type: i % 3
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos! ✍️');
      return;
    }

    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    console.log(`[AUTH] Enviando requisição para: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log(`[AUTH] Resposta recebida: ${response.status} ${response.statusText}`);
      
      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('[AUTH] Erro ao parsear JSON:', text);
        throw new Error('O servidor retornou uma resposta inválida. Tente novamente.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro na autenticação');
      }
      
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      setError(err.message || 'Ocorreu um erro inesperado. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-sky-400 to-indigo-600 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {bgElements.map((el) => (
          <motion.div
            key={el.id}
            className="absolute text-white/20"
            initial={{ 
              top: el.top, 
              left: el.left,
              scale: el.scale
            }}
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {el.type === 0 ? <Star className="w-12 h-12" /> : el.type === 1 ? <Heart className="w-10 h-10" /> : <Sparkles className="w-8 h-8" />}
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-md relative z-10 border-8 border-yellow-300"
      >
        <div className="text-center mb-8">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-pink-200 shadow-inner"
          >
            <Heart className="text-pink-500 w-10 h-10 fill-pink-500" />
          </motion.div>
          <h2 className="text-3xl font-black text-indigo-900 tracking-tight">
            {isLogin ? (
              <span key="login-title">Olá de novo! 👋</span>
            ) : (
              <span key="register-title">Vamos começar! ✨</span>
            )}
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            {isLogin ? (
              <span key="login-sub">Entre para ver suas orações</span>
            ) : (
              <span key="register-sub">Crie sua conta para guardar seus pontos</span>
            )}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-500' : serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Servidor: {serverStatus === 'online' ? 'Conectado' : serverStatus === 'offline' ? 'Desconectado' : 'Verificando...'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-indigo-400 mb-2 uppercase tracking-widest ml-1">Email do Papai ou Mamãe</label>
            <div className="relative">
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-4 border-slate-100 focus:border-sky-400 outline-none transition-all text-lg font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="exemplo@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-indigo-400 mb-2 uppercase tracking-widest ml-1">Senha Secreta</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border-4 border-slate-100 focus:border-sky-400 outline-none transition-all text-lg font-bold text-slate-700 placeholder:text-slate-300"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold text-center border-2 border-red-100"
            >
              {error}
            </motion.div>
          )}

          <motion.button 
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-5 rounded-2xl font-black text-xl shadow-[0_10px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_15px_25px_rgba(236,72,153,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 border-b-4 border-purple-800"
          >
            {loading ? (
              <span key="loading-spinner" className="flex items-center justify-center">
                <RefreshCcw className="w-6 h-6 animate-spin" />
              </span>
            ) : isLogin ? (
              <span key="login-text" className="flex items-center justify-center gap-3">
                <LogIn className="w-6 h-6" /> ENTRAR
              </span>
            ) : (
              <span key="register-text" className="flex items-center justify-center gap-3">
                <UserPlus className="w-6 h-6" /> CADASTRAR
              </span>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-600 font-black hover:text-pink-500 transition-colors text-sm uppercase tracking-wider"
          >
            {isLogin ? (
              <span key="to-register">Ainda não tem conta? Clique aqui! 🌟</span>
            ) : (
              <span key="to-login">Já tem uma conta? Entre aqui! 🏠</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN APP ---

const CONGRATS_MESSAGES = [
  "Parabéns! Você é uma criança muito especial e o Papai do Céu está muito feliz com sua dedicação!",
  "Uau! Você completou o desafio! Que alegria ver você conversando com Deus todos os dias!",
  "Incrível! Você brilhou como uma estrelinha completando todas as orações. Continue assim!",
  "Que bênção! Você terminou o seu potinho de orações. Seu coração deve estar muito quentinho e cheio de paz!",
  "Parabéns, pequeno(a) fiel! Você mostrou que orar é um momento maravilhoso. Deus te abençoe muito!",
  "Sensacional! Você completou 10 orações com muito carinho. O céu está em festa por você!",
  "Muito bem! Você é um exemplo de amor e fé. Que seus sonhos sejam sempre lindos e protegidos!",
  "Vitória! Você chegou ao fim do desafio. Que o Papai do Céu continue sempre pertinho de você!"
];

const COLORS = [
  "bg-blue-500", "bg-yellow-400", "bg-orange-500", "bg-cyan-400", 
  "bg-green-500", "bg-pink-500", "bg-purple-500", "bg-orange-400", 
  "bg-indigo-500", "bg-emerald-500"
];

const ICONS = [
  <Heart className="w-8 h-8 text-white" />,
  <Sun className="w-8 h-8 text-white" />,
  <Star className="w-8 h-8 text-white" />,
  <Sparkles className="w-8 h-8 text-white" />,
  <Moon className="w-8 h-8 text-white" />
];

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerData | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [points, setPoints] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [currentCongrats, setCurrentCongrats] = useState("");
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [loading, setLoading] = useState(!!token);

  // Stabilize background stars
  const stars = React.useMemo(() => {
    return [...Array(30)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random(),
      scale: Math.random(),
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 5
    }));
  }, []);

  // Sync progress with backend
  const syncProgress = async (newPoints: number, newUsed: number[]) => {
    if (!token) return;
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ points: newPoints, used_prayers: newUsed }),
      });
    } catch (err) {
      console.error('Erro ao sincronizar progresso:', err);
    }
  };

  // Load progress on mount or login
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/progress', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPoints(data.points);
          setUsedIndices(data.used_prayers);
        } else if (response.status === 401 || response.status === 403) {
          handleLogout();
        }
      } catch (err) {
        console.error('Erro ao carregar progresso:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [token]);

  const handleAuthSuccess = (newToken: string, userData: any) => {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    setToken(newToken);
    setPoints(userData.points);
    setUsedIndices(userData.used_prayers);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setPoints(0);
    setUsedIndices([]);
  };

  // Helper to get consistent color/icon for a prayer
  const getPrayerStyle = (id: number) => {
    return {
      color: COLORS[id % COLORS.length],
      icon: ICONS[id % ICONS.length]
    };
  };

  const drawPrayer = () => {
    if (points >= MAX_POINTS) {
      handleShowCongrats();
      return;
    }

    setIsShaking(true);
    
    setTimeout(() => {
      let availableIndices = PRAYERS_LIST.map((_, i) => i).filter(i => !usedIndices.includes(i));
      
      // If all 365 read, reset
      if (availableIndices.length === 0) {
        availableIndices = PRAYERS_LIST.map((_, i) => i);
        setUsedIndices([]);
        syncProgress(points, []);
      }

      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const prayer = PRAYERS_LIST[randomIndex];
      
      setSelectedPrayer(prayer);
      
      const newUsed = [...usedIndices, randomIndex];
      setUsedIndices(newUsed);
      syncProgress(points, newUsed);
      
      setIsShaking(false);
    }, 800);
  };

  const handleShowCongrats = () => {
    const randomIndex = Math.floor(Math.random() * CONGRATS_MESSAGES.length);
    setCurrentCongrats(CONGRATS_MESSAGES[randomIndex]);
    setShowCongrats(true);
  };

  const closePrayer = () => {
    if (selectedPrayer && points < MAX_POINTS) {
      const nextPoints = points + 1;
      setPoints(nextPoints);
      syncProgress(nextPoints, usedIndices);
      
      if (nextPoints === MAX_POINTS) {
        setTimeout(handleShowCongrats, 500);
      }
    }
    setSelectedPrayer(null);
  };

  const resetPoints = () => {
    setPoints(0);
    setShowCongrats(false);
    syncProgress(0, usedIndices);
  };

  if (!token) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <RefreshCcw className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] overflow-hidden relative font-sans text-slate-100">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ opacity: star.opacity, scale: star.scale }}
            animate={{ 
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay
            }}
            style={{
              top: star.top,
              left: star.left,
            }}
          />
        ))}
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="absolute top-6 right-6 z-20 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all flex items-center gap-2"
        title="Sair"
      >
        <LogOut className="w-5 h-5" />
      </button>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 max-w-2xl mx-auto text-center">
        
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            Meu Potinho de Orações
          </h1>
          <p className="text-lg text-slate-300 font-medium italic">
            "Um momento especial com o Papai do Céu"
          </p>
        </motion.header>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400" />
              Progresso de Orações
            </span>
            <span className="text-xs font-bold text-yellow-400">{points}/{MAX_POINTS}</span>
          </div>
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${(points / MAX_POINTS) * 100}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {[...Array(MAX_POINTS)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < points ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} 
              />
            ))}
          </div>
        </motion.div>

        {/* The Jar */}
        <div className="relative mb-12 group cursor-pointer" onClick={!selectedPrayer && !showCongrats ? drawPrayer : undefined}>
          <motion.div
            animate={isShaking ? {
              x: [-5, 5, -5, 5, 0],
              rotate: [-2, 2, -2, 2, 0],
            } : {
              y: [0, -10, 0],
            }}
            transition={isShaking ? {
              duration: 0.2,
              repeat: 4
            } : {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            {/* Jar Visual */}
            <div className="w-48 h-64 md:w-56 md:h-72 bg-white/10 backdrop-blur-md border-4 border-white/20 rounded-t-[40px] rounded-b-[60px] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-white/30 rounded-full -mt-2 border-b-2 border-white/10" />
              <div className="absolute inset-0 flex flex-wrap justify-center items-end p-4 gap-1">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-6 h-8 rounded-sm shadow-sm ${COLORS[i % COLORS.length]} opacity-80`}
                    animate={{ rotate: [0, 5, -5, 0], y: [0, -5, 0] }}
                    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                  />
                ))}
              </div>
              <div className="absolute top-0 left-4 w-4 h-full bg-white/10 rounded-full blur-sm" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 px-4 py-2 rounded-lg shadow-lg rotate-[-2deg]">
              <span className="text-indigo-900 font-bold text-sm uppercase tracking-wider">Orações</span>
            </div>
          </motion.div>

          {!selectedPrayer && !isShaking && !showCongrats && (
            <motion.div
              key="draw-button-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full"
            >
              <button
                onClick={drawPrayer}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
              >
                <RefreshCcw className="w-5 h-5" />
                Sortear Oração
              </button>
              <p className="text-xs text-slate-400 mt-3 uppercase tracking-widest font-semibold">Toque no potinho para sortear</p>
            </motion.div>
          )}

          {points >= MAX_POINTS && !showCongrats && (
            <motion.div
              key="max-points-badge"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute -top-8 -right-8 bg-yellow-400 text-indigo-900 p-4 rounded-full shadow-2xl font-black rotate-12 border-4 border-white"
            >
              10/10!
            </motion.div>
          )}
        </div>

        {/* Prayer Card Modal */}
        {selectedPrayer && (
          <motion.div
            key="prayer-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, rotate: -10 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              className={`${getPrayerStyle(selectedPrayer.id).color} w-full max-w-md p-8 rounded-3xl shadow-2xl relative border-4 border-white/30`}
            >
              <button
                onClick={() => setSelectedPrayer(null)}
                className="absolute -top-2 -right-2 bg-white text-slate-900 p-1 rounded-full shadow-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="flex flex-col items-center text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-6 bg-white/20 p-4 rounded-full"
                >
                  {getPrayerStyle(selectedPrayer.id).icon}
                </motion.div>
                
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 mb-6">
                  <p className="text-sm font-bold text-white/60 uppercase tracking-widest mb-2">{selectedPrayer.theme}</p>
                  <p className="text-xl md:text-2xl font-medium leading-relaxed text-white drop-shadow-md">
                    “{selectedPrayer.text}”
                  </p>
                </div>

                <motion.button 
                  onClick={closePrayer}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ 
                    boxShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 20px rgba(255,255,255,0.5)", "0px 0px 0px rgba(255,255,255,0)"]
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity }
                  }}
                  className="bg-white text-indigo-900 px-10 py-4 rounded-full font-black text-lg shadow-xl flex items-center gap-2"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  Amém!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Congrats Modal */}
        {showCongrats && (
          <motion.div
            key="congrats-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-indigo-950/90 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
            >
              {/* Decorative background sparkles */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500" />
              
              <div className="flex flex-col items-center text-center py-4">
                <div className="bg-yellow-100 p-4 rounded-full mb-6">
                  <Trophy className="w-16 h-16 text-yellow-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-indigo-900 mb-4">Parabéns! 🎉</h2>
                
                <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 mb-8">
                  <p className="text-xl text-indigo-900 font-medium leading-relaxed">
                    {currentCongrats}
                  </p>
                </div>

                <button
                  onClick={resetPoints}
                  className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Começar Novo Desafio
                </button>
              </div>

              {/* Floating icons */}
              <div className="absolute -bottom-4 -left-4 opacity-10">
                <Sparkles className="w-24 h-24 text-indigo-900" />
              </div>
              <div className="absolute -top-4 -right-4 opacity-10">
                <Heart className="w-20 h-20 text-pink-500" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Footer Info */}
        <footer className="mt-auto pt-12 pb-6 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} • Feito com amor para pequenos corações</p>
        </footer>
      </main>

      {/* Floating Decorative Icons */}
      <div className="absolute top-20 left-10 opacity-20 hidden md:block">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          <Star className="w-16 h-16 text-yellow-400" />
        </motion.div>
      </div>
      <div className="absolute bottom-20 right-10 opacity-20 hidden md:block">
        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity }}>
          <Moon className="w-20 h-20 text-blue-300" />
        </motion.div>
      </div>
    </div>
  );
}
