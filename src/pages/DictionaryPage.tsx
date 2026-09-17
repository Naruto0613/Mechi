import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  BookOpen, 
  Volume2, 
  PenTool, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Filter, 
  ChevronRight,
  Layers,
  Check,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getAllWords, 
  getAllCharacters, 
  searchDictionary, 
  getFavorites, 
  toggleFavorite, 
  isFavorite 
} from '../lib/dictionary';
import { DictionaryWord, DictionaryCharacter, HSKLevel } from '../types';
import StrokeOrderModal, { playChineseAudio } from '../components/character/StrokeOrderModal';

const ITEMS_PER_PAGE = 36;

export default function DictionaryPage() {
  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'words' | 'characters' | 'favorites' | 'canvas'>('words');
  const [favoritesList, setFavoritesList] = useState<string[]>([]);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);

  // Active Stroke Order Modal character/word
  const [activeStrokeHanzi, setActiveStrokeHanzi] = useState<string | null>(null);

  // Direct canvas input
  const [canvasInput, setCanvasInput] = useState('学');

  // Load favorites on mount
  useEffect(() => {
    setFavoritesList(getFavorites());
  }, []);

  // Reset pagination on filter/tab/search change
  useEffect(() => {
    setDisplayLimit(ITEMS_PER_PAGE);
  }, [query, selectedLevel, activeTab]);

  // Search execution
  const searchResults = useMemo(() => {
    return searchDictionary({
      query,
      level: selectedLevel,
      tab: activeTab === 'favorites' ? 'favorites' : undefined,
      favoriteIds: favoritesList
    });
  }, [query, selectedLevel, activeTab, favoritesList]);

  const handleFavoriteToggle = (idOrHanzi: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isNowFav = toggleFavorite(idOrHanzi);
    setFavoritesList(getFavorites());
    toast.success(isNowFav ? 'Хадгалсан жагсаалтад нэмэгдлээ ⭐' : 'Хадгалсан жагсаалтаас хасагдлаа');
  };

  const handleOpenStrokeModal = (hanzi: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveStrokeHanzi(hanzi);
  };

  const handlePlayAudio = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playChineseAudio(text);
  };

  const sampleSearchQueries = ['你好', '学习', '朋友', '时间', '中国', '喜欢', 'сурах', 'хайр'];

  const levels: Array<number | 'all'> = ['all', 1, 2, 3, 4, 5, 6];

  const totalWordsCount = getAllWords().length;
  const totalCharsCount = getAllCharacters().length;

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header Banner */}
      <section className="bg-white p-6 sm:p-10 rounded-[32px] border border-border-sub shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-50 border border-orange-100 text-primary-orange rounded-full text-xs font-black uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>HSK 1-6 Иж бүрэн толь бичиг & Ханз зуралт</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-ink tracking-tight">
            Хятад - Монгол Толь Бичиг
          </h1>

          <p className="text-ink/60 text-sm sm:text-base leading-relaxed">
            HSK 1-ээс 6 хүртэлх <strong>{totalWordsCount.toLocaleString()}</strong> үг, <strong>{totalCharsCount.toLocaleString()}</strong> ханзыг хайх, дуудлага сонсох болон зураас бүрийн дэс дарааллаар зурж дадлага хийх боломжтой.
          </p>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <div className="px-3.5 py-1.5 bg-bg-soft border border-border-sub rounded-2xl text-xs font-bold text-ink/70">
              📚 Нийт үгс: <strong className="text-ink">{totalWordsCount.toLocaleString()}</strong>
            </div>
            <div className="px-3.5 py-1.5 bg-bg-soft border border-border-sub rounded-2xl text-xs font-bold text-ink/70">
              🀄 Ханз үсэг: <strong className="text-ink">{totalCharsCount.toLocaleString()}</strong>
            </div>
            <div className="px-3.5 py-1.5 bg-bg-soft border border-border-sub rounded-2xl text-xs font-bold text-ink/70">
              ✍️ Зураасны хөдөлгөөнт анимаци & дадлага
            </div>
          </div>
        </div>
      </section>

      {/* Main Search Bar & Quick Tags */}
      <section className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-ink/40">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ханз, пиньинь эсвэл монгол орчуулгаар хайх... (жнь: 学, xue, сурах)"
            className="w-full bg-white border-2 border-border-sub focus:border-primary-orange text-ink pl-14 pr-12 py-4 sm:py-5 rounded-[28px] text-base sm:text-lg font-bold placeholder:text-ink/30 focus:outline-none shadow-sm transition-all"
            id="dictionary-search-input"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-ink/40 hover:text-ink transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-bg-soft flex items-center justify-center">
                <X className="w-4 h-4" />
              </div>
            </button>
          )}
        </div>

        {/* Quick sample chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-ink/40 font-bold uppercase tracking-wider shrink-0">Түгээмэл:</span>
          {sampleSearchQueries.map((sample) => (
            <button
              key={sample}
              onClick={() => setQuery(sample)}
              className="px-3 py-1 bg-white border border-border-sub hover:border-primary-orange hover:text-primary-orange text-ink/70 rounded-full font-bold transition-colors shrink-0"
            >
              {sample}
            </button>
          ))}
        </div>
      </section>

      {/* Navigation Controls: Tabs & Level Filters */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Mode Tabs */}
        <div className="flex p-1 bg-bg-soft rounded-2xl border border-border-sub overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('words')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === 'words'
                ? 'bg-white text-primary-orange shadow-sm font-black'
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>📚 Үгс ({searchResults.words.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('characters')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === 'characters'
                ? 'bg-white text-primary-orange shadow-sm font-black'
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>🀄 Ханз үсгүүд ({searchResults.characters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === 'favorites'
                ? 'bg-white text-primary-orange shadow-sm font-black'
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Хадгалсан ({favoritesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === 'canvas'
                ? 'bg-white text-blue-600 shadow-sm font-black'
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>✍️ Шууд зурах</span>
          </button>
        </div>

        {/* Level Filters */}
        {activeTab !== 'canvas' && (
          <div className="flex items-center gap-1 p-1 bg-bg-soft rounded-2xl border border-border-sub overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-ink/40 px-2 hidden sm:inline">
              Түвшин:
            </span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                  selectedLevel === lvl
                    ? 'bg-ink text-white shadow-sm font-black'
                    : 'text-ink/50 hover:text-ink hover:bg-white'
                }`}
              >
                {lvl === 'all' ? 'Бүгд' : `HSK ${lvl}`}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Content Area Based on Active Tab */}
      {activeTab === 'canvas' ? (
        /* Instant Direct Character Canvas */
        <div className="bg-white p-6 sm:p-10 rounded-[32px] border border-border-sub shadow-sm space-y-6">
          <div className="max-w-xl space-y-3">
            <h2 className="text-xl font-black text-ink flex items-center gap-2">
              <span>Ханз зурах талбар</span>
              <span className="text-primary-orange">✍️</span>
            </h2>
            <p className="text-sm text-ink/60 leading-relaxed">
              Та дурын хятад ханз бичиж эсвэл хуулан оруулж, уг ханзны зуралтын дараалал болон бичих хөдөлгөөнийг шууд интерактив хэлбэрээр суралцаж болно.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={canvasInput}
                onChange={(e) => setCanvasInput(e.target.value)}
                placeholder="Ханз оруулна уу (жнь: 爱, 龙, 德, 和)"
                className="flex-1 bg-bg-soft border border-border-sub px-4 py-3 rounded-2xl font-bold text-lg text-ink focus:outline-none focus:border-primary-orange"
                maxLength={10}
              />
              <button
                onClick={() => {
                  if (canvasInput.trim()) {
                    handleOpenStrokeModal(canvasInput.trim());
                  } else {
                    toast.error('Ханз оруулна уу');
                  }
                }}
                className="px-6 py-3 bg-primary-orange text-white rounded-2xl font-black text-sm hover:opacity-95 transition-all shadow-md shadow-orange-100 flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                <span>Зуралт нээх</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs text-ink/40 font-bold uppercase tracking-wider py-1">Туршиж үзэх:</span>
              {['爱', '学', '龙', '和', '中', '福', '寿', '喜'].map((sampleChar) => (
                <button
                  key={sampleChar}
                  onClick={() => {
                    setCanvasInput(sampleChar);
                    handleOpenStrokeModal(sampleChar);
                  }}
                  className="w-9 h-9 rounded-xl bg-bg-soft border border-border-sub hover:border-primary-orange font-black text-lg text-ink transition-all flex items-center justify-center hover:scale-105"
                >
                  {sampleChar}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'characters' ? (
        /* Single Characters Grid */
        <div className="space-y-6">
          {searchResults.characters.length === 0 ? (
            <div className="bg-white p-12 rounded-[32px] border border-border-sub text-center space-y-3">
              <span className="text-4xl">🔍</span>
              <h3 className="text-lg font-bold text-ink">Илэрц олдсонгүй</h3>
              <p className="text-sm text-ink/60">Та өөр түлхүүр үг эсвэл түвшин сонгож үзнэ үү.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResults.characters.slice(0, displayLimit).map((charItem) => {
                  const isFav = isFavorite(charItem.char);
                  return (
                    <motion.div
                      key={charItem.char}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-4 sm:p-5 rounded-3xl border border-border-sub hover:border-primary-orange transition-all shadow-xs hover:shadow-md flex flex-col justify-between group relative"
                    >
                      {/* Top Level Badge & Favorite */}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-orange-50 text-primary-orange text-[10px] font-black rounded-md uppercase">
                          HSK {charItem.lowestLevel}
                        </span>
                        <button
                          onClick={(e) => handleFavoriteToggle(charItem.char, e)}
                          className="text-ink/30 hover:text-primary-orange transition-colors p-1"
                        >
                          {isFav ? (
                            <BookmarkCheck className="w-4 h-4 text-primary-orange fill-primary-orange" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Character Display */}
                      <div className="text-center py-2 space-y-1">
                        <div className="text-4xl sm:text-5xl font-black text-ink group-hover:text-primary-orange transition-colors font-serif">
                          {charItem.char}
                        </div>
                        <div className="text-xs font-bold text-ink/70">
                          {charItem.pinyin}
                        </div>
                        <div className="text-[11px] text-ink/50 line-clamp-1">
                          {charItem.meaning}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-border-sub/60 flex items-center justify-between gap-1">
                        <button
                          onClick={(e) => handlePlayAudio(charItem.char, e)}
                          className="w-8 h-8 rounded-xl bg-bg-soft hover:bg-orange-100 text-ink/60 hover:text-primary-orange flex items-center justify-center transition-colors"
                          title="Дуудлага"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenStrokeModal(charItem.char)}
                          className="flex-1 py-1.5 px-2 bg-primary-orange/10 hover:bg-primary-orange text-primary-orange hover:text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                          title="Зураасны дараалал харах, зурах"
                        >
                          <PenTool className="w-3 h-3" />
                          <span>Зурах</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {searchResults.characters.length > displayLimit && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setDisplayLimit((prev) => prev + ITEMS_PER_PAGE)}
                    className="px-8 py-3.5 bg-white border border-border-sub hover:border-ink/30 text-ink font-bold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <span>Цааш үзэх (+{ITEMS_PER_PAGE} ханз)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-ink/40 mt-2 font-medium">
                    Нийт {searchResults.characters.length} ханзнаас {Math.min(displayLimit, searchResults.characters.length)} нь харагдаж байна
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Words Grid (Full Vocabulary) */
        <div className="space-y-6">
          {searchResults.words.length === 0 ? (
            <div className="bg-white p-12 rounded-[32px] border border-border-sub text-center space-y-3">
              <span className="text-4xl">🔍</span>
              <h3 className="text-lg font-bold text-ink">Илэрц олдсонгүй</h3>
              <p className="text-sm text-ink/60">Та хайх үгээ шалгана уу эсвэл шүүлтүүрээ цэвэрлэнэ үү.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.words.slice(0, displayLimit).map((word) => {
                  const isFav = isFavorite(word.hanzi) || isFavorite(word.id);
                  return (
                    <motion.div
                      key={word.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-6 rounded-[28px] border border-border-sub hover:border-primary-orange/60 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group"
                    >
                      {/* Top row: level and favorite */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-orange-50 text-primary-orange text-xs font-black rounded-lg">
                          HSK {word.level}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handlePlayAudio(word.hanzi, e)}
                            className="w-8 h-8 rounded-full hover:bg-bg-soft text-ink/50 hover:text-primary-orange flex items-center justify-center transition-colors"
                            title="Дуудлага сонсох"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleFavoriteToggle(word.hanzi, e)}
                            className="w-8 h-8 rounded-full hover:bg-bg-soft text-ink/30 hover:text-primary-orange flex items-center justify-center transition-colors"
                            title={isFav ? "Хадгалснаас хасах" : "Хадгалах"}
                          >
                            {isFav ? (
                              <BookmarkCheck className="w-4 h-4 text-primary-orange fill-primary-orange" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Main Hanzi & Pinyin */}
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="text-2xl sm:text-3xl font-black text-ink tracking-tight font-serif">
                            {word.hanzi}
                          </h3>
                          <span className="text-sm sm:text-base font-bold text-primary-orange">
                            {word.pinyin}
                          </span>
                        </div>
                        <p className="text-sm text-ink/70 font-medium line-clamp-2">
                          {word.mongolian}
                        </p>
                      </div>

                      {/* Character Breakdown Chips */}
                      {word.characters.length > 1 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-ink/40">
                            Ханзууд:
                          </span>
                          {word.characters.map((c, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => handleOpenStrokeModal(c)}
                              className="px-2 py-0.5 bg-bg-soft hover:bg-orange-100 hover:text-primary-orange text-ink/70 border border-border-sub rounded-md text-xs font-bold transition-all"
                              title={`"${c}" ханзны зуралтыг тусад нь харах`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-2 border-t border-border-sub/60">
                        <button
                          onClick={() => handleOpenStrokeModal(word.hanzi)}
                          className="w-full py-2.5 px-4 bg-bg-soft hover:bg-primary-orange text-ink hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-primary-orange group-hover:text-white"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Зурах дараалал & Дадлага</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {searchResults.words.length > displayLimit && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setDisplayLimit((prev) => prev + ITEMS_PER_PAGE)}
                    className="px-8 py-3.5 bg-white border border-border-sub hover:border-ink/30 text-ink font-bold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <span>Цааш үзэх (+{ITEMS_PER_PAGE} үг)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-ink/40 mt-2 font-medium">
                    Нийт {searchResults.words.length} үгнээс {Math.min(displayLimit, searchResults.words.length)} нь харагдаж байна
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Global Interactive Stroke Order & Drawing Modal */}
      <AnimatePresence>
        {activeStrokeHanzi && (
          <StrokeOrderModal
            initialHanzi={activeStrokeHanzi}
            onClose={() => setActiveStrokeHanzi(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
