/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Moon, Sun, Star, RefreshCcw, X, Trophy, Download, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Types for our prayers
interface Prayer {
  id: number;
  text: string;
  color: string;
  icon: React.ReactNode;
}

const PRAYERS: Prayer[] = [
  {
    id: 1,
    text: "Jesus querido, muito obrigado por este dia tão especial. Obrigado pela minha família, pelos meus amigos e por tudo o que aprendi hoje. Abençoa meu descanso e cuida de mim durante a noite. Amém.",
    color: "bg-blue-500",
    icon: <Heart className="w-8 h-8 text-white" />
  },
  {
    id: 2,
    text: "Senhor, eu Te agradeço pelo amor que recebo todos os dias. Mesmo quando estou cansado ou triste, sei que o Senhor está comigo. Dá-me um sono tranquilo e sonhos cheios de paz. Amém.",
    color: "bg-yellow-400",
    icon: <Sun className="w-8 h-8 text-white" />
  },
  {
    id: 3,
    text: "Meu Deus, abençoe o papai, a mamãe e toda a minha família. Abençoe também meus professores e meus amiguinhos. Que todos tenham uma noite feliz e protegida pelo Teu amor. Amém.",
    color: "bg-orange-500",
    icon: <Star className="w-8 h-8 text-white" />
  },
  {
    id: 4,
    text: "Papai do Céu, muito obrigado pelos brinquedos e pelas risadas de hoje. Abençoe meus amigos e todos que brincaram comigo. Cuida do meu sono nesta noite. Amém.",
    color: "bg-cyan-400",
    icon: <Sparkles className="w-8 h-8 text-white" />
  },
  {
    id: 5,
    text: "Jesus, obrigado pela comida gostosa que recebi hoje. Abençoe as crianças que não têm o que comer. Dá-nos um sono de paz e alegria. Amém.",
    color: "bg-green-500",
    icon: <Heart className="w-8 h-8 text-white" />
  },
  {
    id: 6,
    text: "Senhor, obrigado pela escola e pelos meus professores. Abençoe cada coleguinha da minha sala. Cuida de nós enquanto dormimos. Amém.",
    color: "bg-pink-500",
    icon: <Star className="w-8 h-8 text-white" />
  },
  {
    id: 7,
    text: "Meu Deus, perdoe quando desobedeci ou fiz algo errado. Me ensine a ser bondoso e obediente. Quero viver para alegrar o Teu coração. Amém.",
    color: "bg-purple-500",
    icon: <Sun className="w-8 h-8 text-white" />
  },
  {
    id: 8,
    text: "Jesus, obrigado por estar sempre pertinho de mim. Mesmo quando sinto medo, sei que Tu me guardas. Abençoe minha noite de descanso. Amém.",
    color: "bg-orange-400",
    icon: <Moon className="w-8 h-8 text-white" />
  },
  {
    id: 9,
    text: "Papai do Céu, muito obrigado pelo abraço do papai e da mamãe. Abençoe todos da minha família com saúde e paz. Cuida de nós esta noite. Amém.",
    color: "bg-indigo-500",
    icon: <Heart className="w-8 h-8 text-white" />
  },
  {
    id: 10,
    text: "Senhor, obrigado pelas flores, pelos passarinhos e pela natureza. Ajuda-me a cuidar da criação com amor. Abençoe meu sono com alegria. Amém.",
    color: "bg-emerald-500",
    icon: <Sun className="w-8 h-8 text-white" />
  }
];

const MAX_POINTS = 10;

export default function App() {
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [points, setPoints] = useState(0);
  const [childName, setChildName] = useState('');
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const drawPrayer = () => {
    if (points >= MAX_POINTS) {
      setShowCertificateForm(true);
      return;
    }
    setIsShaking(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * PRAYERS.length);
      setSelectedPrayer(PRAYERS[randomIndex]);
      setIsShaking(false);
    }, 800);
  };

  const closePrayer = () => {
    if (selectedPrayer && points < MAX_POINTS) {
      setPoints(prev => {
        const next = prev + 1;
        if (next === MAX_POINTS) {
          setTimeout(() => setShowCertificateForm(true), 500);
        }
        return next;
      });
    }
    setSelectedPrayer(null);
  };

  const handleGenerateCertificate = () => {
    if (!childName.trim()) return;
    setShowCertificateForm(false);
    setShowCertificatePreview(true);
  };

  const downloadCertificate = async (format: 'pdf' | 'png' | 'print') => {
    if (!certificateRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `Certificado-Oracao-${childName || 'Crianca'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a5'
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Certificado-Oracao-${childName || 'Crianca'}.pdf`);
      } else if (format === 'print') {
        const dataUrl = canvas.toDataURL('image/png');
        const windowContent = `<!DOCTYPE html><html><head><title>Imprimir Certificado</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${dataUrl}" style="max-width:100%;max-height:100%;" onload="window.print();window.close();"></body></html>`;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(windowContent);
          printWindow.document.close();
        }
      }
    } catch (error) {
      console.error('Erro ao processar certificado:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPoints = () => {
    setPoints(0);
    setChildName('');
    setShowCertificateForm(false);
    setShowCertificatePreview(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] overflow-hidden relative font-sans text-slate-100">
      {/* ... (stars background remains same) ... */}
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
        <div className="relative mb-12 group cursor-pointer" onClick={!selectedPrayer && !showCertificateForm && !showCertificatePreview ? drawPrayer : undefined}>
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
                    className={`w-6 h-8 rounded-sm shadow-sm ${PRAYERS[i % PRAYERS.length].color} opacity-80`}
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

          {!selectedPrayer && !isShaking && !showCertificateForm && !showCertificatePreview && (
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

          {points >= MAX_POINTS && !showCertificateForm && !showCertificatePreview && (
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
                className={`${selectedPrayer.color} w-full max-w-md p-8 rounded-3xl shadow-2xl relative border-4 border-white/30`}
              >
                <button
                  onClick={closePrayer}
                  className="absolute -top-4 -right-4 bg-white text-slate-900 p-2 rounded-full shadow-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-6 bg-white/20 p-4 rounded-full"
                  >
                    {selectedPrayer.icon}
                  </motion.div>
                  
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 mb-6">
                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-white drop-shadow-md">
                      “{selectedPrayer.text}”
                    </p>
                  </div>

                  <button 
                    onClick={closePrayer}
                    className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Amém!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Certificate Name Form Modal */}
        <AnimatePresence>
          {showCertificateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-indigo-950/90 backdrop-blur-lg"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-md"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-indigo-900">Parabéns! 🎉</h2>
                    <p className="text-slate-600">Você completou 10 orações!</p>
                  </div>
                  <button onClick={() => setShowCertificateForm(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Digite seu nome completo:
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Ex: João Silva Santos"
                    className="w-full px-6 py-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 outline-none text-lg font-medium transition-colors"
                  />
                </div>

                <button
                  disabled={!childName.trim()}
                  onClick={handleGenerateCertificate}
                  className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  Ver Meu Certificado
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Certificate Preview & Actions Modal */}
        <AnimatePresence>
          {showCertificatePreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-indigo-950/95 backdrop-blur-xl overflow-y-auto"
            >
              <div className="w-full max-w-4xl flex flex-col items-center py-8">
                <div className="flex justify-between w-full max-w-2xl mb-6 items-center px-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    Seu Certificado está pronto!
                  </h2>
                  <button onClick={() => setShowCertificatePreview(false)} className="bg-white/10 p-2 rounded-full text-white hover:bg-white/20">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Certificate Visual */}
                <div className="w-full overflow-x-auto flex justify-center mb-8 px-4">
                  <div 
                    ref={certificateRef}
                    className="w-[800px] h-[560px] bg-white p-12 flex flex-col items-center justify-between border-[16px] border-double border-yellow-500 relative shadow-2xl shrink-0"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
                      {[...Array(20)].map((_, i) => (
                        <Star key={i} className="absolute text-yellow-600" style={{ 
                          top: `${Math.random() * 100}%`, 
                          left: `${Math.random() * 100}%`,
                          width: `${20 + Math.random() * 40}px`,
                          height: `${20 + Math.random() * 40}px`
                        }} />
                      ))}
                    </div>

                    <div className="text-center z-10">
                      <div className="flex justify-center mb-4">
                        <div className="bg-yellow-100 p-4 rounded-full">
                          <Trophy className="w-16 h-16 text-yellow-600" />
                        </div>
                      </div>
                      <h1 className="text-5xl font-black text-indigo-900 mb-2 uppercase tracking-tighter">Certificado de Oração</h1>
                      <p className="text-xl text-slate-600 italic font-medium">"Deixai vir a mim as criancinhas"</p>
                    </div>

                    <div className="text-center z-10 flex-1 flex flex-col justify-center">
                      <p className="text-2xl text-slate-700 mb-4">Certificamos com muita alegria que</p>
                      <h2 className="text-5xl font-bold text-indigo-600 border-b-4 border-indigo-100 pb-2 px-8 inline-block min-w-[300px]">
                        {childName}
                      </h2>
                      <p className="text-2xl text-slate-700 mt-6 leading-relaxed">
                        completou com dedicação e fé o seu <br />
                        <span className="font-bold text-indigo-900">Potinho de Orações</span>.
                      </p>
                    </div>

                    <div className="w-full flex justify-between items-end z-10">
                      <div className="text-left">
                        <p className="text-sm text-slate-400 uppercase font-bold">Data:</p>
                        <p className="text-lg font-bold text-slate-700">{new Date().toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                        <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                        <Sparkles className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full max-w-md px-4">
                  <button
                    disabled={isGenerating}
                    onClick={() => downloadCertificate('print')}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-5 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-white/20"
                  >
                    {isGenerating ? (
                      <RefreshCcw className="w-6 h-6 animate-spin" />
                    ) : (
                      <Trophy className="w-6 h-6" />
                    )}
                    IMPRIMIR MEU CERTIFICADO
                  </button>
                  <p className="text-white/60 text-xs mt-4 font-medium uppercase tracking-widest">
                    Toque acima para abrir a impressora
                  </p>
                </div>

                <button 
                  onClick={resetPoints}
                  className="mt-12 bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Começar Novo Potinho
                </button>
              </div>
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
