import React, { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Volume2,
  PenTool,
  Eye,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Copy,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getCharacterDetail,
  getWordDetail,
  isFavorite,
  toggleFavorite,
} from "../../lib/dictionary";
import { HSKLevel } from "../../types";

interface StrokeOrderModalProps {
  initialHanzi: string;
  onClose: () => void;
}

const charDataCache = new Map<string, any>();

async function loadCharData(char: string) {
  if (charDataCache.has(char)) {
    return charDataCache.get(char);
  }
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${encodeURIComponent(char)}.json`,
  );
  if (!res.ok) {
    throw new Error(`Ханзны өгөгдөл олдсонгүй: ${char}`);
  }
  const data = await res.json();
  charDataCache.set(char, data);
  return data;
}

export function playChineseAudio(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.8;
  window.speechSynthesis.speak(utterance);
}

export default function StrokeOrderModal({
  initialHanzi,
  onClose,
}: StrokeOrderModalProps) {
  // Extract individual Chinese characters from initialHanzi
  const chars = initialHanzi.split("").filter((c) => /[\u4e00-\u9fff]/.test(c));
  const validChars = chars.length > 0 ? chars : ["学"];

  const [selectedCharIndex, setSelectedCharIndex] = useState(0);
  const currentChar = validChars[selectedCharIndex] || validChars[0];

  // Mode: 'animate' (watch strokes) or 'quiz' (practice drawing)
  const [mode, setMode] = useState<"animate" | "quiz">("animate");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [showOutline, setShowOutline] = useState(true);
  const [strokesCount, setStrokesCount] = useState<number | null>(null);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState<number | null>(
    null,
  );
  const [loadingCharData, setLoadingCharData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Quiz state
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizMistakes, setQuizMistakes] = useState(0);
  const [quizStrokesCompleted, setQuizStrokesCompleted] = useState(0);

  // Bookmarking
  const [isFav, setIsFav] = useState(false);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);

  // Word and character details
  const wordInfo = getWordDetail(initialHanzi);
  const charInfo = getCharacterDetail(currentChar);

  useEffect(() => {
    setIsFav(
      isFavorite(currentChar) ||
        (wordInfo ? isFavorite(wordInfo.hanzi) : false),
    );
  }, [currentChar, wordInfo]);

  // Initialize or re-render HanziWriter when character or mode changes
  useEffect(() => {
    let isCancelled = false;
    setLoadingCharData(true);
    setLoadError(null);
    setQuizComplete(false);
    setQuizMistakes(0);
    setQuizStrokesCompleted(0);
    setCurrentStrokeIndex(null);

    // Clean up previous writer
    if (writerRef.current) {
      try {
        writerRef.current.cancelQuiz();
      } catch {}
      writerRef.current = null;
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    loadCharData(currentChar)
      .then((data) => {
        if (isCancelled || !containerRef.current) return;
        setStrokesCount(data.strokes ? data.strokes.length : 0);
        setLoadingCharData(false);

        // Responsive dimension
        const size = Math.min(280, window.innerWidth - 64);

        const writer = HanziWriter.create(containerRef.current, currentChar, {
          width: size,
          height: size,
          padding: 20,
          showOutline: showOutline,
          strokeAnimationSpeed: speed,
          delayBetweenStrokes: 220,
          strokeColor: "#ea580c", // primary orange
          radicalColor: "#dc2626", // red for radical
          outlineColor: "#e2e8f0", // soft gray outline
          drawingColor: "#2563eb", // blue when user draws
          drawingWidth: 18,
          showCharacter: mode === "animate",
          showHintAfterMisses: 2,
          markStrokeCorrectAfterMisses: 3,
          charDataLoader: (
            char: string,
            onComplete: (charData: any) => void,
            onFail: (error: Error) => void,
          ) => {
            loadCharData(char).then(onComplete).catch(onFail);
          },
        });

        writerRef.current = writer;

        if (mode === "animate") {
          setIsPlaying(true);
          writer.animateCharacter({
            onComplete: () => {
              if (isCancelled) return;
              setIsPlaying(false);
              if (isLooping) {
                setTimeout(() => {
                  if (!isCancelled && writerRef.current) {
                    setIsPlaying(true);
                    writerRef.current.animateCharacter({
                      onComplete: () => setIsPlaying(false),
                    });
                  }
                }, 800);
              }
            },
          });
        } else if (mode === "quiz") {
          writer.hideCharacter();
          startQuiz(writer);
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error("Error loading char:", err);
        setLoadingCharData(false);
        setLoadError("Энэ ханзны зуралтын дараалал ачааллахад алдаа гарлаа.");
      });

    return () => {
      isCancelled = true;
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch {}
        writerRef.current = null;
      }
    };
  }, [currentChar, mode]);

  // Speed change effect
  useEffect(() => {
    if (writerRef.current && mode === "animate") {
      // Re-trigger animation with new speed
      handleReplay();
    }
  }, [speed]);

  // Outline toggle effect
  useEffect(() => {
    if (writerRef.current) {
      if (showOutline) {
        writerRef.current.showOutline();
      } else {
        writerRef.current.hideOutline();
      }
    }
  }, [showOutline]);

  const startQuiz = (writerInstance?: any) => {
    const writer = writerInstance || writerRef.current;
    if (!writer) return;

    setQuizComplete(false);
    setQuizMistakes(0);
    setQuizStrokesCompleted(0);
    writer.hideCharacter();

    writer.quiz({
      onMistake: (strokeData: any) => {
        setQuizMistakes((prev) => prev + 1);
        toast.error(`Зураас буруу! Зөв дарааллаар дахин зурна уу.`, {
          id: "quiz-mistake",
          duration: 1500,
        });
      },
      onCorrectStroke: (strokeData: any) => {
        setQuizStrokesCompleted(strokeData.strokeNum + 1);
      },
      onComplete: (summaryData: any) => {
        setQuizComplete(true);
        toast.success("Маш сайн! Та уг ханзыг амжилттай зөв бичлээ! 🎉", {
          duration: 3000,
        });
      },
    });
  };

  const handlePlayPause = () => {
    if (!writerRef.current) return;
    if (isPlaying) {
      writerRef.current.pauseAnimation();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      writerRef.current.animateCharacter({
        onComplete: () => {
          setIsPlaying(false);
        },
      });
    }
  };

  const handleReplay = () => {
    if (!writerRef.current) return;
    setIsPlaying(true);
    setCurrentStrokeIndex(null);
    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsPlaying(false);
      },
    });
  };

  const handleAnimateStroke = (strokeIdx: number) => {
    if (!writerRef.current) return;
    setCurrentStrokeIndex(strokeIdx);
    setIsPlaying(false);
    writerRef.current.animateStroke(strokeIdx);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentChar);
    toast.success(`"${currentChar}" санах ойд хуулагдлаа!`);
  };

  const handleToggleFav = () => {
    const itemToFav = validChars.length > 1 ? initialHanzi : currentChar;
    const nowFav = toggleFavorite(itemToFav);
    setIsFav(nowFav);
    toast.success(
      nowFav ? "Хадгалсан үгсэд нэмэгдлээ ⭐" : "Хадгалсан үгсээс хасагдлаа",
    );
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/70 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-4xl sm:rounded-[40px] shadow-2xl overflow-hidden my-auto z-10 flex flex-col max-h-[92vh]"
      >
        {/* Top bar header */}
        <div className="p-5 sm:p-6 border-b border-border-sub bg-bg-soft flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-primary-orange text-xl sm:text-2xl font-black">
              ✍️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-ink">
                  Ханз зурах дараалал
                </h3>
                {charInfo?.lowestLevel && (
                  <span className="px-2 py-0.5 bg-primary-orange/10 text-primary-orange text-[10px] font-black rounded-full uppercase tracking-wider">
                    HSK {charInfo.lowestLevel}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink/50 font-medium">
                Зураас бүрийн дэс дараалал, бичих хөдөлгөөнийг эзэмших
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFav}
              className="w-10 h-10 rounded-full hover:bg-white border border-border-sub flex items-center justify-center text-ink/60 hover:text-primary-orange transition-all"
              title={isFav ? "Хадгалснаас хасах" : "Хадгалах"}
            >
              {isFav ? (
                <BookmarkCheck className="w-5 h-5 text-primary-orange fill-primary-orange" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white border border-border-sub flex items-center justify-center text-ink/60 hover:text-ink transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Character selector tabs if multiple characters in word */}
          {validChars.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-black text-ink/40 uppercase tracking-wider">
                Үгийн ханзууд:
              </span>
              <div className="flex flex-wrap gap-2">
                {validChars.map((c, idx) => {
                  const subCharInfo = getCharacterDetail(c);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedCharIndex(idx);
                        setCurrentStrokeIndex(null);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all border ${
                        selectedCharIndex === idx
                          ? "bg-primary-orange text-white border-primary-orange shadow-md shadow-orange-100 scale-105"
                          : "bg-white text-ink/70 border-border-sub hover:border-ink/20 hover:bg-bg-soft"
                      }`}
                    >
                      <span className="text-lg font-black">{c}</span>
                      <span className="text-xs opacity-80">
                        {subCharInfo?.pinyin || ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode Switcher Buttons */}
          <div className="grid grid-cols-2 p-1.5 bg-bg-soft rounded-2xl border border-border-sub">
            <button
              onClick={() => setMode("animate")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                mode === "animate"
                  ? "bg-white text-primary-orange shadow-sm font-black"
                  : "text-ink/50 hover:text-ink"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Зуралт харах (Анимаци)</span>
            </button>
            <button
              onClick={() => setMode("quiz")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                mode === "quiz"
                  ? "bg-white text-blue-600 shadow-sm font-black"
                  : "text-ink/50 hover:text-ink"
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Бичих дадлага (Зурах)</span>
            </button>
          </div>

          {/* Canvas Practice Grid Area */}
          <div className="flex flex-col items-center justify-center">
            {/* Tianzige (田字格) / Mige Practice Box */}
            <div className="relative rounded-3xl p-4 bg-amber-50/40 border-2 border-amber-200/70 shadow-inner flex items-center justify-center select-none overflow-hidden">
              {/* Authentic Red/Crimson Calligraphy Grid lines */}
              <div className="absolute inset-4 pointer-events-none border border-red-300/40">
                {/* Horizontal center dashed line */}
                <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-red-300/60 -translate-y-1/2" />
                {/* Vertical center dashed line */}
                <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-red-300/60 -translate-x-1/2" />
                {/* Diagonal guidelines */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-20 stroke-red-400 stroke-1"
                  strokeDasharray="4 4"
                >
                  <line x1="0" y1="0" x2="100%" y2="100%" />
                  <line x1="100%" y1="0" x2="0" y2="100%" />
                </svg>
              </div>

              {/* HanziWriter Target DOM Element */}
              <div
                ref={containerRef}
                className="relative z-10 cursor-crosshair flex items-center justify-center min-w-60 min-h-60"
                id="hanzi-writer-canvas"
              />

              {loadingCharData && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs">
                  <div className="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs font-bold text-ink/60">
                    Зуралтын өгөгдлийг ачааллаж байна...
                  </span>
                </div>
              )}

              {loadError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-4 text-center">
                  <span className="text-red-500 font-bold text-sm mb-2">
                    {loadError}
                  </span>
                  <span className="text-4xl font-black text-ink mb-3">
                    {currentChar}
                  </span>
                  <button
                    onClick={() => {
                      setLoadError(null);
                      setLoadingCharData(true);
                    }}
                    className="px-4 py-2 bg-primary-orange text-white rounded-xl text-xs font-bold"
                  >
                    Дахин турших
                  </button>
                </div>
              )}

              {/* Quiz Completion Overlay */}
              <AnimatePresence>
                {quizComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xs p-6 text-center space-y-3"
                  >
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-emerald-100">
                      🎉
                    </div>
                    <h4 className="text-lg font-black text-ink">
                      Гайхалтай бичлээ!
                    </h4>
                    <p className="text-xs text-ink/60 max-w-xs">
                      Та{" "}
                      <span className="font-bold text-ink">
                        "{currentChar}"
                      </span>{" "}
                      ханзыг {strokesCount} зураасаар амжилттай зөв бичлээ.
                      {quizMistakes > 0
                        ? ` (${quizMistakes} алдаа гаргасан)`
                        : " (Нэг ч алдаагүй! ⭐)"}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => startQuiz()}
                        className="px-4 py-2 bg-ink text-white rounded-xl font-bold text-xs hover:bg-ink/90 transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Дахин бичих</span>
                      </button>
                      {validChars.length > 1 &&
                        selectedCharIndex < validChars.length - 1 && (
                          <button
                            onClick={() => {
                              setSelectedCharIndex((prev) => prev + 1);
                            }}
                            className="px-4 py-2 bg-primary-orange text-white rounded-xl font-bold text-xs hover:opacity-95 transition-all flex items-center gap-1.5"
                          >
                            <span>Дараагийн ханз</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Subtext info under canvas */}
            <div className="mt-3 flex items-center justify-between w-full max-w-xs text-xs text-ink/60 font-medium">
              <span>
                Зураасны тоо:{" "}
                <strong className="text-ink">{strokesCount ?? "..."}</strong>
              </span>
              {mode === "quiz" && (
                <span>
                  Явц:{" "}
                  <strong className="text-blue-600">
                    {quizStrokesCompleted}/{strokesCount || 0}
                  </strong>
                </span>
              )}
              {mode === "animate" && currentStrokeIndex !== null && (
                <span>
                  Сонгосон:{" "}
                  <strong className="text-primary-orange">
                    {currentStrokeIndex + 1}-р зураас
                  </strong>
                </span>
              )}
            </div>
          </div>

          {/* Mode Controls */}
          {mode === "animate" ? (
            <div className="space-y-4 bg-bg-soft p-4 sm:p-5 rounded-3xl border border-border-sub">
              {/* Playback Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayPause}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-orange text-white rounded-xl font-bold text-xs shadow-md shadow-orange-100 hover:opacity-95 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span>{isPlaying ? "Зогсоох" : "Тоглуулах"}</span>
                  </button>

                  <button
                    onClick={handleReplay}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white text-ink border border-border-sub hover:bg-slate-50 rounded-xl font-bold text-xs transition-all"
                    title="Дахин эхнээс нь тоглуулах"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Дахин үзэх</span>
                  </button>

                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border transition-all ${
                      isLooping
                        ? "bg-orange-100 border-orange-300 text-primary-orange"
                        : "bg-white border-border-sub text-ink/60 hover:text-ink"
                    }`}
                    title="Тасралтгүй давтах"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Давтах</span>
                  </button>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-border-sub">
                  {[0.75, 1, 1.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        speed === s
                          ? "bg-primary-orange text-white"
                          : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Step by step stroke breakdown */}
              {strokesCount && strokesCount > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border-sub">
                  <div className="flex items-center justify-between text-[11px] font-black text-ink/50 uppercase tracking-wider">
                    <span>Зураас бүрээр үзэх ({strokesCount}):</span>
                    <span>Дарж тухайн зураасыг харах</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-1">
                    {Array.from({ length: strokesCount }).map((_, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleAnimateStroke(sIdx)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center ${
                          currentStrokeIndex === sIdx
                            ? "bg-primary-orange text-white shadow-sm scale-105"
                            : "bg-white text-ink/70 border border-border-sub hover:border-primary-orange hover:text-primary-orange"
                        }`}
                        title={`${sIdx + 1}-р зураас`}
                      >
                        {sIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz / Practice Mode Controls */
            <div className="space-y-4 bg-bg-soft p-4 sm:p-5 rounded-3xl border border-border-sub">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startQuiz()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-ink text-white rounded-xl font-bold text-xs hover:bg-ink/90 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Арилгаж, дахин зурах</span>
                  </button>

                  <button
                    onClick={() => setShowOutline(!showOutline)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border transition-all ${
                      showOutline
                        ? "bg-blue-50 border-blue-200 text-blue-600"
                        : "bg-white border-border-sub text-ink/60"
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>
                      {showOutline
                        ? "Бүдэг тоймыг нуух"
                        : "Бүдэг тойм харуулах"}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-ink/60">
                  <span>
                    Алдаа:{" "}
                    <strong className="text-red-500">{quizMistakes}</strong>
                  </span>
                </div>
              </div>

              <p className="text-xs text-ink/50">
                💡 <strong>Зөвлөмж:</strong> Хуруу эсвэл хулганаараа дэлгэц
                дээрх дөрвөлжин дотор зураасыг зөв дарааллаар зурна уу. Зөв
                зурсан тохиолдолд дараагийн зураас автоматаар идэвхжинэ.
              </p>
            </div>
          )}

          {/* Character & Word Information Card */}
          <div className="bg-white p-5 rounded-3xl border border-border-sub space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-ink">
                    {currentChar}
                  </span>
                  <span className="text-lg font-bold text-primary-orange">
                    {charInfo?.pinyin || wordInfo?.pinyin || ""}
                  </span>
                  <button
                    onClick={() => playChineseAudio(currentChar)}
                    className="w-8 h-8 rounded-full bg-orange-50 text-primary-orange hover:bg-primary-orange hover:text-white flex items-center justify-center transition-colors"
                    title="Дуудлага сонсох"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="w-8 h-8 rounded-full bg-bg-soft text-ink/60 hover:text-ink flex items-center justify-center transition-colors"
                    title="Ханз хуулах"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-ink/70 font-medium">
                  {charInfo?.meaning || wordInfo?.mongolian || "Орчуулга"}
                </p>
              </div>

              {wordInfo && (
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-ink/40 block">
                    Бүтэн үг:
                  </span>
                  <span className="font-bold text-ink text-sm">
                    {wordInfo.hanzi} ({wordInfo.pinyin})
                  </span>
                  <span className="text-xs text-ink/60 block">
                    {wordInfo.mongolian}
                  </span>
                </div>
              )}
            </div>

            {/* Related Words containing this character */}
            {charInfo?.words && charInfo.words.length > 0 && (
              <div className="pt-3 border-t border-border-sub space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-ink/40">
                  Энэ ханз орсон үгс:
                </span>
                <div className="flex flex-wrap gap-2">
                  {charInfo.words.slice(0, 6).map((rw, rIdx) => (
                    <div
                      key={rIdx}
                      className="px-2.5 py-1 bg-bg-soft rounded-xl text-xs flex items-center gap-1.5 border border-border-sub"
                    >
                      <span className="font-bold text-ink">{rw.hanzi}</span>
                      <span className="text-ink/40 text-[10px]">
                        {rw.pinyin}
                      </span>
                      <span className="text-ink/60 text-[10px] hidden sm:inline">
                        - {rw.mongolian}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-bg-soft border-t border-border-sub flex items-center justify-between shrink-0">
          <span className="text-xs text-ink/50 font-medium">
            Хятад үсгийн уран бичлэг ба зуралтын стандарт дараалал
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-ink text-white rounded-2xl font-bold text-xs hover:bg-ink/90 transition-all"
          >
            Хаах
          </button>
        </div>
      </motion.div>
    </div>
  );
}
