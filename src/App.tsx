/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Moon, Sun, Star, RefreshCcw, X, Trophy, CheckCircle2 } from 'lucide-react';
import { PRAYERS_LIST, PrayerData } from './data/prayers';

const MAX_POINTS = 10;
const STORAGE_KEY = 'potinho_used_prayers';

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
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerData | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [points, setPoints] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [currentCongrats, setCurrentCongrats] = useState("");
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  // Helper to get consistent color/icon for a prayer
  const getPrayerStyle = (id: number) => {
    return {
      color: COLORS[id % COLORS.length],
      icon: ICONS[id % ICONS.length]
    };
  };

  // Load used prayers on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUsedIndices(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar orações usadas", e);
      }
    }
  }, []);

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
        localStorage.removeItem(STORAGE_KEY);
      }

      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const prayer = PRAYERS_LIST[randomIndex];
      
      setSelectedPrayer(prayer);
      
      const newUsed = [...usedIndices, randomIndex];
      setUsedIndices(newUsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsed));
      
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
      setPoints(prev => {
        const next = prev + 1;
        if (next === MAX_POINTS) {
          setTimeout(handleShowCongrats, 500);
        }
        return next;
      });
    }
    setSelectedPrayer(null);
  };

  const resetPoints = () => {
    setPoints(0);
    setShowCongrats(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] overflow-hidden relative font-sans text-slate-100">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ opacity: Math.random(), scale: Math.random() }}
            animate={{ 
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-8 -right-8 bg-yellow-400 text-indigo-900 p-4 rounded-full shadow-2xl font-black rotate-12 border-4 border-white"
            >
              10/10!
            </motion.div>
          )}
        </div>

        {/* Prayer Card Modal */}
        <AnimatePresence>
          {selectedPrayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.5, y: 100, rotate: -10 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: 100 }}
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
        </AnimatePresence>

        {/* Congrats Modal */}
        <AnimatePresence>
          {showCongrats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
        </AnimatePresence>

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
