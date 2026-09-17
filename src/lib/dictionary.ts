import rawHskData from '../data/hsk.json';
import { HSKLevel, DictionaryWord, DictionaryCharacter } from '../types';

let cachedWords: DictionaryWord[] | null = null;
let cachedCharacters: DictionaryCharacter[] | null = null;
let charMap: Map<string, DictionaryCharacter> | null = null;
let wordMap: Map<string, DictionaryWord> | null = null;

// Normalize pinyin to remove tone accents and whitespace for matching (e.g. "nǐ hǎo" -> "nihao")
export function normalizePinyin(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Extract and index dictionary from data
function initDictionary() {
  if (cachedWords && cachedCharacters && charMap && wordMap) {
    return;
  }

  const words: DictionaryWord[] = [];
  const chars = new Map<string, {
    char: string;
    pinyin: string;
    firstPinyin: string;
    levels: number[];
    lowestLevel: number;
    meaning: string;
    words: { hanzi: string; pinyin: string; mongolian: string; level: number }[];
  }>();

  const wMap = new Map<string, DictionaryWord>();

  const hsk = rawHskData as Record<string, any>;

  for (let lvl = 1; lvl <= 6; lvl++) {
    const key = `HSK${lvl}`;
    const data = hsk[key];
    if (!data) continue;

    let list: Array<{ hanzi: string; pinyin?: string; mongolian?: string }> = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (typeof data === 'object') {
      Object.values(data).forEach(subList => {
        if (Array.isArray(subList)) {
          list = list.concat(subList);
        }
      });
    }

    list.forEach((item, idx) => {
      if (!item || !item.hanzi) return;
      const hanzi = item.hanzi.trim();
      const pinyin = (item.pinyin || '').trim();
      const mongolian = (item.mongolian || '').trim();

      const individualChars: string[] = [];
      for (const char of hanzi) {
        if (/[\u4e00-\u9fff]/.test(char)) {
          individualChars.push(char);

          if (!chars.has(char)) {
            chars.set(char, {
              char,
              pinyin: hanzi === char ? pinyin : '',
              firstPinyin: pinyin,
              levels: [lvl],
              lowestLevel: lvl,
              meaning: hanzi === char ? mongolian : '',
              words: [{ hanzi, pinyin, mongolian, level: lvl }]
            });
          } else {
            const charEntry = chars.get(char)!;
            if (!charEntry.levels.includes(lvl)) {
              charEntry.levels.push(lvl);
            }
            if (hanzi === char && !charEntry.pinyin) {
              charEntry.pinyin = pinyin;
              charEntry.meaning = mongolian;
            }
            if (charEntry.words.length < 10 && !charEntry.words.some(w => w.hanzi === hanzi)) {
              charEntry.words.push({ hanzi, pinyin, mongolian, level: lvl });
            }
          }
        }
      }

      const wordObj: DictionaryWord = {
        id: `hsk${lvl}-${idx}-${hanzi}`,
        hanzi,
        pinyin,
        mongolian,
        level: lvl as HSKLevel,
        characters: individualChars
      };

      words.push(wordObj);
      if (!wMap.has(hanzi)) {
        wMap.set(hanzi, wordObj);
      }
    });
  }

  // Finalize character entries
  const characterList: DictionaryCharacter[] = [];
  chars.forEach((entry) => {
    characterList.push({
      char: entry.char,
      pinyin: entry.pinyin || entry.firstPinyin,
      levels: entry.levels.sort((a, b) => a - b),
      lowestLevel: entry.lowestLevel,
      meaning: entry.meaning || (entry.words[0] ? entry.words[0].mongolian : ''),
      words: entry.words
    });
  });

  // Sort characters by lowestLevel then char
  characterList.sort((a, b) => {
    if (a.lowestLevel !== b.lowestLevel) return a.lowestLevel - b.lowestLevel;
    return a.char.localeCompare(b.char);
  });

  cachedWords = words;
  cachedCharacters = characterList;
  charMap = new Map(characterList.map(c => [c.char, c]));
  wordMap = wMap;
}

export function getAllWords(): DictionaryWord[] {
  initDictionary();
  return cachedWords || [];
}

export function getAllCharacters(): DictionaryCharacter[] {
  initDictionary();
  return cachedCharacters || [];
}

export function getWordDetail(hanzi: string): DictionaryWord | null {
  initDictionary();
  return wordMap?.get(hanzi) || null;
}

export function getCharacterDetail(char: string): DictionaryCharacter | null {
  initDictionary();
  return charMap?.get(char) || null;
}

// Search function
export function searchDictionary(options: {
  query: string;
  level?: number | 'all';
  tab?: 'words' | 'characters' | 'favorites';
  favoriteIds?: string[];
}): { words: DictionaryWord[]; characters: DictionaryCharacter[] } {
  initDictionary();

  const rawQuery = (options.query || '').trim();
  const lowerQuery = rawQuery.toLowerCase();
  const normalizedQuery = normalizePinyin(rawQuery);
  const selectedLevel = options.level && options.level !== 'all' ? Number(options.level) : null;
  const isChineseQuery = /[\u4e00-\u9fff]/.test(rawQuery);

  let filteredWords = cachedWords || [];
  let filteredChars = cachedCharacters || [];

  // Filter by level
  if (selectedLevel !== null) {
    filteredWords = filteredWords.filter(w => w.level === selectedLevel);
    filteredChars = filteredChars.filter(c => c.levels.includes(selectedLevel));
  }

  // Filter by favorites if requested
  if (options.tab === 'favorites' && options.favoriteIds) {
    const favSet = new Set(options.favoriteIds);
    filteredWords = filteredWords.filter(w => favSet.has(w.hanzi) || favSet.has(w.id));
    filteredChars = filteredChars.filter(c => favSet.has(c.char));
  }

  // If no query, return as-is
  if (!rawQuery) {
    return {
      words: filteredWords,
      characters: filteredChars
    };
  }

  // Match words with ranking score
  interface ScoredWord {
    word: DictionaryWord;
    score: number;
  }

  const scoredWords: ScoredWord[] = [];

  for (const w of filteredWords) {
    let score = 0;
    const wHanzi = w.hanzi;
    const wPinyin = w.pinyin.toLowerCase();
    const wNormalized = normalizePinyin(w.pinyin);
    const wMongolian = w.mongolian.toLowerCase();

    if (isChineseQuery) {
      if (wHanzi === rawQuery) {
        score = 100;
      } else if (wHanzi.startsWith(rawQuery)) {
        score = 80;
      } else if (wHanzi.includes(rawQuery)) {
        score = 60;
      }
    } else {
      if (wPinyin === lowerQuery || wNormalized === normalizedQuery) {
        score = 90;
      } else if (wNormalized.startsWith(normalizedQuery)) {
        score = 75;
      } else if (wNormalized.includes(normalizedQuery)) {
        score = 50;
      }

      if (wMongolian.includes(lowerQuery)) {
        score = Math.max(score, wMongolian.startsWith(lowerQuery) ? 70 : 55);
      }
    }

    if (score > 0) {
      scoredWords.push({ word: w, score });
    }
  }

  scoredWords.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.word.level !== b.word.level) return a.word.level - b.word.level;
    return a.word.hanzi.length - b.word.hanzi.length;
  });

  // Match characters with ranking score
  interface ScoredChar {
    character: DictionaryCharacter;
    score: number;
  }

  const scoredChars: ScoredChar[] = [];

  for (const c of filteredChars) {
    let score = 0;
    const cChar = c.char;
    const cPinyin = c.pinyin.toLowerCase();
    const cNormalized = normalizePinyin(c.pinyin);
    const cMeaning = c.meaning.toLowerCase();

    if (isChineseQuery) {
      if (cChar === rawQuery) {
        score = 100;
      } else if (rawQuery.includes(cChar)) {
        score = 80;
      }
    } else {
      if (cNormalized === normalizedQuery || cPinyin === lowerQuery) {
        score = 90;
      } else if (cNormalized.startsWith(normalizedQuery)) {
        score = 70;
      } else if (cNormalized.includes(normalizedQuery)) {
        score = 45;
      }

      if (cMeaning.includes(lowerQuery)) {
        score = Math.max(score, cMeaning.startsWith(lowerQuery) ? 65 : 50);
      }
    }

    if (score > 0) {
      scoredChars.push({ character: c, score });
    }
  }

  scoredChars.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.character.lowestLevel - b.character.lowestLevel;
  });

  return {
    words: scoredWords.map(s => s.word),
    characters: scoredChars.map(s => s.character)
  };
}

// Local storage helpers for favorites
const FAVORITES_KEY = 'mechi_dictionary_favorites';

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(item: string): boolean {
  try {
    const current = getFavorites();
    const index = current.indexOf(item);
    let updated: string[];
    let isFav = false;
    if (index >= 0) {
      updated = current.filter(x => x !== item);
      isFav = false;
    } else {
      updated = [...current, item];
      isFav = true;
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return isFav;
  } catch {
    return false;
  }
}

export function isFavorite(item: string): boolean {
  try {
    const current = getFavorites();
    return current.includes(item);
  } catch {
    return false;
  }
}
