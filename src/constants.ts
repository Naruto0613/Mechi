import { HSKLevel, VocabWord, Lesson, DailyTip } from './types';

export const HSK1_VOCAB: VocabWord[] = [
  { id: '1', character: '我', pinyin: 'wǒ', translation: 'Би', level: HSKLevel.L1 },
  { id: '2', character: '你', pinyin: 'nǐ', translation: 'Чи', level: HSKLevel.L1 },
  { id: '3', character: '他', pinyin: 'tā', translation: 'Тэр (эр)', level: HSKLevel.L1 },
  { id: '4', character: '她', pinyin: 'tā', translation: 'Тэр (эм)', level: HSKLevel.L1 },
  { id: '5', character: '我们', pinyin: 'wǒmen', translation: 'Бид', level: HSKLevel.L1 },
  { id: '6', character: '你们', pinyin: 'nǐmen', translation: 'Та нар', level: HSKLevel.L1 },
  { id: '7', character: '他们', pinyin: 'tāmen', translation: 'Тэд', level: HSKLevel.L1 },
  { id: '8', character: '是', pinyin: 'shì', translation: 'Мөн, байх', level: HSKLevel.L1 },
  { id: '9', character: '不', pinyin: 'bù', translation: 'Биш, үгүй', level: HSKLevel.L1 },
  { id: '10', character: '好', pinyin: 'hǎo', translation: 'Сайн, сайхан', level: HSKLevel.L1 },
  { id: '11', character: '谢谢', pinyin: 'xièxiè', translation: 'Баярлалаа', level: HSKLevel.L1 },
  { id: '12', character: '老师', pinyin: 'lǎoshī', translation: 'Багш', level: HSKLevel.L1 },
  { id: '13', character: '学生', pinyin: 'xuésheng', translation: 'Оюутан, сурагч', level: HSKLevel.L1 },
  { id: '14', character: '北京', pinyin: 'běijīng', translation: 'Бээжин', level: HSKLevel.L1 },
  { id: '15', character: '中国', pinyin: 'zhōngguó', translation: 'Хятад', level: HSKLevel.L1 },
];

export const SAMPLE_LESSONS: Lesson[] = [
  {
    id: 'l1-grammar-1',
    level: HSKLevel.L1,
    title: 'Төлөөний нэр ба "Мөн" (是) үйл үг',
    content: `
Хятад хэлэнд өгүүлбэрийн үндсэн бүтэц нь **Эзэн бие + Үйл үг + Тусагдахуун** юм.

### 1. Төлөөний нэрс
- 我 (wǒ) - Би
- 你 (nǐ) - Чи
- 他 (tā) - Тэр (эрэгтэй)
- 她 (tā) - Тэр (эмэгтэй)

### 2. "是" (shì) үйл үг
"Мөн" эсвэл "байх" гэсэн утгатай.
Англи хэлний "to be" үйл үгтэй төстэй.

Жишээ:
- 我是学生 (wǒ shì xuésheng) - Би бол оюутан.
- 他是老师 (tā shì lǎoshī) - Тэр бол багш.
`,
    quiz: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: '"Би бол оюутан" гэж хэрхэн хэлэх вэ?',
        options: ['我是老师', '我是学生', '你是学生', '他是学生'],
        correctIndex: 1
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: '"老师" (lǎoshī) гэдэг нь ямар утгатай вэ?',
        options: ['Оюутан', 'Сургууль', 'Багш', 'Ном'],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'l2-grammar-1',
    level: HSKLevel.L2,
    title: 'Үйлдлийн төлөв байдал ба "了" (le)',
    content: `
HSK 2 түвшинд үйлдлийн төлөв байдал, өнгөрсөн цаг ба өөрчлөлтийг илэрхийлэх "了" (le)-г үзнэ.

### 1. Үйлдэл дуусахыг заах
Үйл үгийн ард "了" орвол тухайн үйлдэл дууссаныг илэрхийлнэ.
- 我买了书 (wǒ mǎi le shū) - Би ном худалдаж авсан.

### 2. Байдал өөрчлөгдөхийг заах
Өгүүлбэрийн төгсгөлд "了" орвол шинэ нөхцөл байдал үүссэнийг илэрхийлнэ.
- 下雨了 (xià yǔ le) - Бороо орчихлоо (бороо ороогүй байсан, одоо орж байна).

### 3. "比" (bǐ) харьцуулалт
A + 比 + B + Тэмдэг нэр
- 哥哥比我高 (gēge bǐ wǒ gāo) - Ах надаас өндөр.
`,
    quiz: [
      {
        id: 'l2-q1',
        type: 'multiple-choice',
        question: '"Би ном худалдаж авсан" гэж аль нь вэ?',
        options: ['我买书', '我买了书', '我书买', '书买了我'],
        correctIndex: 1
      },
      {
        id: 'l2-q2',
        type: 'multiple-choice',
        question: 'Харьцуулалт хийхэд аль үгийг ашигладаг вэ?',
        options: ['是', '不', '比', '和'],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'l3-grammar-1',
    level: HSKLevel.L3,
    title: '"把" (bǎ) бүтэц ба идэвхгүй хэв',
    content: `
HSK 3 түвшинд "把" бүтэц ба "被" (bèi) идэвхгүй хэвийг голлон үзнэ.

### 1. "把" (bǎ) бүтэц
Тусагдахууныг онцлон, түүнд ямар нэг нөлөө үзүүлснийг илэрхийлнэ.
**Эзэн бие + 把 + Тусагдахуун + Үйл үг + Бусад**

- 我把作业写完了 (wǒ bǎ zuòyè xiě wán le) - Би гэрийн даалгавраа бичиж дуусгасан.

### 2. "被" (bèi) идэвхгүй хэв
Үйлдэл тусагдагч дээр ирж байгааг илэрхийлнэ.
- 苹果被我吃了 (píngguǒ bèi wǒ chī le) - Алим надад идэгдсэн (Би алимыг идчихсэн).
`,
    quiz: [
      {
        id: 'l3-q1',
        type: 'multiple-choice',
        question: '"把" (bǎ) бүтцийн дарааллыг сонгоно уу.',
        options: ['Эзэн + Үйл үг + 把', 'Эзэн + 把 + Тусагдахуун + Үйл үг', '把 + Эзэн + Тусагдахуун', 'Тусагдахуун + 把 + Эзэн'],
        correctIndex: 1
      }
    ]
  },
  {
    id: 'l4-grammar-1',
    level: HSKLevel.L4,
    title: 'Нийлмэл өгүүлбэр ба холбоос үгс',
    content: `
HSK 4 түвшинд өгүүлбэрүүд уртсаж, логик холбоос үгс ихээр ашиглагдана.

### 1. "虽然...但是..." (suīrán...dànshì...)
"Хэдийгээр... боловч..." гэсэн утгатай.
- 虽然天气很冷，但是他出去了 (suīrán tiānqì hěn lěng, dànshì tā chūqù le) - Хэдийгээр цаг агаар хүйтэн ч тэр гадагшаа гарсан.

### 2. "不但...而且..." (búdàn...érqiě...)
"Зөвхөн... зогсохгүй, бас..."
- 他不但会说汉语，而且说得很好 - Тэр зөвхөн хятадаар ярьж чаддаг төдийгүй, маш сайн ярьдаг.
`,
    quiz: [
      {
        id: 'l4-q1',
        type: 'multiple-choice',
        question: '"Хэдийгээр... боловч" гэсэн утгатай холбоос аль нь вэ?',
        options: ['因为...所以', '虽然...但是', '不但...而且', '如果...就'],
        correctIndex: 1
      }
    ]
  },
  {
    id: 'l5-grammar-1',
    level: HSKLevel.L5,
    title: 'Албан ёсны хэллэг ба чиглэлийн дагавар',
    content: `
HSK 5 түвшинд илүү албан ёсны, бичгийн хэлний хэллэгүүдийг сурна.

### 1. "由此可见" (yóu cǐ kě jiàn)
"Үүнээс харахад..." гэсэн утгатай албан ёсны хэллэг.

### 2. Нарийн чиглэлийн дагавар
Үйл үг + 起来 (qǐlái), 出来 (chūlái), 下去 (xiàqù) зэрэг нь зөвхөн чиглэл биш, шилжсэн утгаар хэрэглэгдэнэ.
- 说起来 (shuō qǐlái) - Ярих тухайд бол...
- 做下去 (zuò xiàqù) - Үргэлжлүүлэн хийх.
`,
    quiz: [
      {
        id: 'l5-q1',
        type: 'multiple-choice',
        question: '"Үргэлжлүүлэн хийх" гэсэн утгыг аль нь илэрхийлэх вэ?',
        options: ['做起来', '做下去', '做出来', '做过来'],
        correctIndex: 1
      }
    ]
  },
  {
    id: 'l6-grammar-1',
    level: HSKLevel.L6,
    title: 'Сонгодог утга ба Ченъю (成语)',
    content: `
HSK 6 түвшинд Хятадын соёл, түүхтэй холбоотой 4 үсэгт хэлц үг буюу Ченъю (成语)-г гүнзгийрүүлэн үзнэ.

### 1. 成语 (Chéngyǔ) - Хэлц үгс
Нэг хэлц үгээр бүтэн өгүүлбэр, түүхэн үйл явдлыг илэрхийлдэг.
- 半途而废 (bàn tú ér fèi) - Замаасаа няцах, дундаас нь орхих.

### 2. Бичгийн хэлний "之" (zhī)
Орчин үеийн хэлний "的" (de)-тэй утга дүйх боловч бичгийн хэлэнд өргөн хэрэглэгдэнэ.
- 总归之 (zǒngguī zhī) - Ерөнхийдөө бол...
`,
    quiz: [
      {
        id: 'l6-q1',
        type: 'multiple-choice',
        question: '"Дундаас нь орхих" гэсэн утгатай хэлц үгийг сонгоно уу.',
        options: ['一心一意', '半途而废', '自相矛盾', '名列前茅'],
        correctIndex: 1
      }
    ]
  }
];

export const HSK_TIPS: DailyTip[] = [
  // HSK 1
  {
    level: HSKLevel.L1,
    title: 'Мэндчилгээ ба Үндсэн ханз',
    characters: [
      {
        hanzi: '好',
        pinyin: 'hǎo',
        meanings: ['сайн', 'сайхан', 'зүгээр'],
        etymology: 'Зүүн тал нь "эмэгтэй" (女), баруун тал нь "хүүхэд" (子). Эртний Хятадад эх хүн хүүхэдтэй байх нь хамгийн "сайн" зүйл гэж үздэг байв.',
        examples: [
          { ch: '你好', mn: 'Сайн уу?' },
          { ch: '好老师', mn: 'Сайн багш' }
        ]
      },
      {
        hanzi: '学',
        pinyin: 'xué',
        meanings: ['сурах', 'судлах', 'эрдэм'],
        etymology: 'Дээд хэсэг нь хоёр гар, доод хэсэг нь хүүхэд (子). Хүүхэд гараараа юмыг барьж сурч байгааг дүрсэлжээ.',
        examples: [
          { ch: '学生', mn: 'Оюутан' },
          { ch: '学习', mn: 'Сурах' }
        ]
      }
    ]
  },
  {
    level: HSKLevel.L1,
    title: 'Тоо ба Хэмжээ',
    characters: [
      {
        hanzi: '个',
        pinyin: 'gè',
        meanings: ['ширхэг (ерөнхий хэмжүүр)', 'хувь хүн'],
        etymology: 'Анх хулсны навчийг дүрсэлж байсан боловч одоо хамгийн түгээмэл хэрэглэгддэг хэмжүүр үг болсон.',
        examples: [
          { ch: '一个人', mn: 'Нэг хүн' },
          { ch: '三个苹果', mn: 'Гурван алим' }
        ]
      },
      {
        hanzi: '人',
        pinyin: 'rén',
        meanings: ['хүн', 'ард түмэн'],
        etymology: 'Хоёр хөл дээрээ зогсож буй хүнийг хажуунаас нь харж буй дүрслэл.',
        examples: [
          { ch: '中国人', mn: 'Хятад хүн' },
          { ch: '大人', mn: 'Том хүн' }
        ]
      }
    ]
  },
  // HSK 2
  {
    level: HSKLevel.L2,
    title: 'Цаг хугацаа ба Үйлдлийн төлөв',
    characters: [
      {
        hanzi: '了',
        pinyin: 'le / liǎo',
        meanings: ['дууссан (дагавар)', 'мэдэх', 'чадах'],
        etymology: 'Гаргүй хүүхдийн дүрс. Энэ нь үйлдэл дууссан эсвэл байдал өөрчлөгдсөнийг заагч сул үг болж хувирсан.',
        examples: [
          { ch: '我吃饱了', mn: 'Би цадчихлаа.' },
          { ch: '你了解吗？', mn: 'Чи ойлгож (мэдэж) байна уу?' }
        ]
      },
      {
        hanzi: '过',
        pinyin: 'guò',
        meanings: ['өнгөрөх', 'туулах', 'туршлага заах'],
        examples: [
          { ch: '过去', mn: 'Өнгөрсөн' },
          { ch: '我去过中国', mn: 'Би Хятад явж байсан.' }
        ]
      }
    ]
  },
  {
    level: HSKLevel.L2,
    title: 'Чадвар ба Боломж',
    characters: [
      {
        hanzi: '会',
        pinyin: 'huì',
        meanings: ['чадах (сурснаар)', 'уулзалт', 'болзох'],
        etymology: 'Дээд тал нь "олон/цуглах", доод тал нь "сав". Олон зүйл нэг дор цуглахыг илэрхийлдэг.',
        examples: [
          { ch: '我会说汉语', mn: 'Би хятадаар ярьж чадна (сурснаар).' },
          { ch: '开会', mn: 'Хуралдах' }
        ]
      },
      {
        hanzi: '能',
        pinyin: 'néng',
        meanings: ['чадах (бие махбодь/нөхцөл)', 'энерги', 'боломж'],
        examples: [
          { ch: '你能来吗？', mn: 'Чи ирж чадах уу?' },
          { ch: '能力', mn: 'Чадвар' }
        ]
      }
    ]
  },
  // HSK 3
  {
    level: HSKLevel.L3,
    title: 'Байршил ба Чиглэл',
    characters: [
      {
        hanzi: '把',
        pinyin: 'bǎ',
        meanings: ['барих', 'шүүрэх', 'багц'],
        etymology: 'Зүүн тал нь "гар" (扌), баруун тал нь "найдах/авирах" (巴). Гараараа ямар нэг зүйлийг барьж байгааг илэрхийлнэ.',
        examples: [
          { ch: '一把伞', mn: 'Нэг шүхэр' },
          { ch: '把他带走', mn: 'Түүнийг аваад яв.' }
        ]
      },
      {
        hanzi: '面',
        pinyin: 'miàn',
        meanings: ['нүүр', 'тал', 'гоймон'],
        examples: [
          { ch: '后面', mn: 'Ар тал' },
          { ch: '吃面', mn: 'Гоймон идэх' }
        ]
      }
    ]
  }
];

export const COLORS = {
  primary: '#FF8A00',
  secondary: '#2ECC71',
  accent: '#3498DB',
  bg: '#FDFCFB',
  ink: '#2D3436',
  muted: '#7F8C8D',
  border: '#EBE5DA',
};
