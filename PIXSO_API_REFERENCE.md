# Pixso Plugin API Reference

Полная документация по Pixso Plugin API для разработки плагина ManyPaster.

---

## Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Структура проекта](#структура-проекта)
3. [Глобальный объект pixso](#глобальный-объект-pixso)
4. [TextNode API](#textnode-api)
5. [Selection API](#selection-api)
6. [UI и коммуникация](#ui-и-коммуникация)
7. [Client Storage](#client-storage)
8. [Утилиты и хелперы](#утилиты-и-хелперы)
9. [Примеры кода](#примеры-кода)

---

## Быстрый старт

### Создание проекта

```bash
npm init @pixso/plugin my-plugin
cd my-plugin
npm install
npm run dev
```

### Зависимости

```bash
npm install @pixso/plugin-typings -D
npm install @pixso/plugin-cli -D
```

### Структура команд

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер с hot reload |
| `npm run build` | Production сборка |

---

## Структура проекта

### Типичная структура

```
my-plugin/
├── manifest.json          # Манифест плагина
├── plugin.config.ts       # Конфиг сборки (опционально)
├── src/
│   ├── main.ts           # Основная логика (sandbox Pixso)
│   ├── ui.html           # HTML интерфейса
│   ├── ui.ts             # Логика UI
│   └── ui.css            # Стили UI
├── dist/                  # Собранные файлы
│   ├── code.js
│   └── ui.html
└── package.json
```

### manifest.json

```json
{
  "name": "ManyPaster",
  "id": "many-paster-unique-id",
  "version": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html",
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": []
  },
  "description": "Bulk text paste into multiple text layers",
  "author": "Your Name"
}
```

### plugin.config.ts

```typescript
import { defineConfig } from "@pixso/plugin-cli";

export default defineConfig({
  ui: "./src/ui.ts",
  main: "./src/main.ts",
  // host: "./src/host.ts"  // Опционально, для host scripts
});
```

---

## Глобальный объект pixso

### Основные свойства

```typescript
// Текущая страница
pixso.currentPage: PageNode

// Выделенные элементы
pixso.currentPage.selection: SceneNode[]

// Viewport (область просмотра)
pixso.viewport.center: { x: number, y: number }
pixso.viewport.zoom: number

// UI управление
pixso.showUI(html: string, options?: ShowUIOptions): void
pixso.closePlugin(message?: string): void

// Создание нод
pixso.createText(): TextNode
pixso.createFrame(): FrameNode
pixso.createRectangle(): RectangleNode
// ... и другие

// Загрузка шрифтов
pixso.loadFontAsync(fontName: FontName): Promise<void>
```

### ShowUIOptions

```typescript
interface ShowUIOptions {
  visible?: boolean;
  width?: number;
  height?: number;
  // ... другие опции
}
```

### Типы нод (SceneNode)

```typescript
type SceneNode =
  | BooleanOperationNode
  | ComponentNode
  | ComponentSetNode
  | EllipseNode
  | FrameNode
  | GroupNode
  | InstanceNode
  | LineNode
  | PolygonNode
  | PageNode
  | RectangleNode
  | SectionNode
  | SliceNode
  | StarNode
  | TextNode
  | VectorNode;
```

---

## TextNode API

### Основные свойства

| Свойство | Тип | Описание |
|----------|-----|----------|
| `type` | `"TEXT"` (readonly) | Тип ноды |
| `characters` | `string` | Текстовое содержимое |
| `fontName` | `FontName \| pixso.mixed` | Шрифт |
| `fontSize` | `number \| pixso.mixed` | Размер шрифта |
| `hasMissingFont` | `boolean` (readonly) | Отсутствующий шрифт |

### FontName

```typescript
interface FontName {
  family: string;  // например "Inter"
  style: string;   // например "Regular", "Bold"
}
```

### Выравнивание текста

```typescript
// Горизонтальное
textNode.textAlignHorizontal: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED"

// Вертикальное
textNode.textAlignVertical: "TOP" | "CENTER" | "BOTTOM"

// Авторесайз
textNode.textAutoResize: "NONE" | "WIDTH_AND_HEIGHT" | "HEIGHT" | "TRUNCATE"
```

### Методы работы с текстом

```typescript
// Вставка символов
textNode.insertCharacters(
  start: number,
  characters: string,
  useStyle?: "BEFORE" | "AFTER"
): void

// Удаление символов
textNode.deleteCharacters(start: number, end: number): void

// Клонирование
textNode.clone(): TextNode
```

### Range-методы (работа с диапазонами)

Все range-методы работают с индексами: `start` (inclusive) до `end` (exclusive).

```typescript
// Шрифт
textNode.getRangeFontName(start, end): FontName | pixso.mixed
textNode.setRangeFontName(start, end, value: FontName): void
textNode.getRangeAllFontNames(start, end): FontName[]

// Размер шрифта
textNode.getRangeFontSize(start, end): number | pixso.mixed
textNode.setRangeFontSize(start, end, value: number): void

// Заливка
textNode.getRangeFills(start, end): Paint[] | pixso.mixed
textNode.setRangeFills(start, end, value: Paint[]): void

// Стили текста
textNode.getRangeTextStyleId(start, end): string | pixso.mixed
textNode.setRangeTextStyleId(start, end, value: string): void

// Декорация (подчёркивание, зачёркивание)
textNode.getRangeTextDecoration(start, end): TextDecoration | pixso.mixed
textNode.setRangeTextDecoration(start, end, value: TextDecoration): void

// TextDecoration: "NONE" | "UNDERLINE" | "STRIKETHROUGH"

// Регистр
textNode.getRangeTextCase(start, end): TextCase | pixso.mixed
textNode.setRangeTextCase(start, end, value: TextCase): void

// TextCase: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE"

// Межбуквенное расстояние
textNode.getRangeLetterSpacing(start, end): LetterSpacing | pixso.mixed
textNode.setRangeLetterSpacing(start, end, value: LetterSpacing): void

// Высота строки
textNode.getRangeLineHeight(start, end): LineHeight | pixso.mixed
textNode.setRangeLineHeight(start, end, value: LineHeight): void
```

### pixso.mixed

Специальное значение, означающее что в диапазоне смешанные стили:

```typescript
const fontName = textNode.getRangeFontName(0, 10);
if (fontName === pixso.mixed) {
  // Разные шрифты в диапазоне
  const allFonts = textNode.getRangeAllFontNames(0, 10);
  console.log('Fonts:', allFonts);
} else {
  // Единый шрифт
  console.log('Font:', fontName);
}
```

---

## Selection API

### Получение выделения

```typescript
// Массив выделенных нод
const selection: SceneNode[] = pixso.currentPage.selection;

// Проверка на пустое выделение
if (selection.length === 0) {
  console.log("Nothing selected");
}
```

### Фильтрация текстовых нод

```typescript
// Получить только TextNode из выделения
const textNodes = pixso.currentPage.selection.filter(
  (node): node is TextNode => node.type === "TEXT"
);
```

### Позиционирование нод

```typescript
// Свойства позиции
node.x: number           // X координата
node.y: number           // Y координата
node.width: number       // Ширина (readonly)
node.height: number      // Высота (readonly)

// Через relativeTransform
const x = node.relativeTransform[0][2];
const y = node.relativeTransform[1][2];

// Абсолютная позиция
node.absoluteTransform: Transform  // readonly
node.absoluteBoundingBox: Rect     // readonly
```

### Сортировка нод по позиции

```typescript
// Сортировка: сверху вниз, слева направо
function sortNodesByPosition(nodes: SceneNode[]): SceneNode[] {
  return [...nodes].sort((a, b) => {
    // Сначала по Y (сверху вниз)
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    // При равном Y — по X (слева направо)
    return a.x - b.x;
  });
}
```

---

## UI и коммуникация

### Показ UI

```typescript
// main.ts
pixso.showUI(__html__);

// С опциями
pixso.showUI(__html__, {
  width: 300,
  height: 400,
  visible: true
});
```

### Двусторонняя коммуникация

#### Main → UI

```typescript
// main.ts
pixso.ui.postMessage({ type: 'DATA', payload: data });

// ui.ts
window.onmessage = (event) => {
  const message = event.data.pluginMessage;
  if (message.type === 'DATA') {
    // Обработка данных
  }
};
```

#### UI → Main

```typescript
// ui.ts
parent.postMessage({ pluginMessage: { type: 'PASTE', text: 'Hello' } }, '*');

// main.ts
pixso.ui.onmessage = (msg) => {
  if (msg.type === 'PASTE') {
    // Обработка
  }
};
```

### Полный пример коммуникации

```typescript
// ===== main.ts =====
pixso.showUI(__html__);

pixso.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'PASTE_TEXT':
      await pasteTextToSelection(msg.lines);
      pixso.ui.postMessage({ type: 'PASTE_DONE', count: msg.lines.length });
      break;
      
    case 'COPY_SELECTED':
      const texts = getSelectedTexts();
      pixso.ui.postMessage({ type: 'TEXTS_COPIED', texts });
      break;
      
    case 'CLOSE':
      pixso.closePlugin();
      break;
  }
};

// ===== ui.ts =====
const textarea = document.getElementById('textarea') as HTMLTextAreaElement;
const pasteBtn = document.getElementById('paste-btn');

pasteBtn.addEventListener('click', () => {
  const lines = textarea.value.split('\n');
  parent.postMessage({ 
    pluginMessage: { type: 'PASTE_TEXT', lines } 
  }, '*');
});

window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  
  switch (msg.type) {
    case 'TEXTS_COPIED':
      textarea.value = msg.texts.join('\n');
      break;
      
    case 'PASTE_DONE':
      console.log(`Pasted ${msg.count} items`);
      break;
  }
};
```

---

## Client Storage

Локальное хранилище для сохранения настроек плагина.

### Методы

```typescript
// Получить значение
const value = await pixso.clientStorage.getAsync(key: string): Promise<any | undefined>

// Сохранить значение
await pixso.clientStorage.setAsync(key: string, value: any): Promise<void>

// Удалить значение
await pixso.clientStorage.deleteAsync(key: string): Promise<void>

// Получить все ключи
const keys = await pixso.clientStorage.keysAsync(): Promise<string[]>
```

### Поддерживаемые типы данных

- `string`
- `number`
- `boolean`
- `null`
- `undefined`
- `object` (сериализуемые)
- `array`
- `Uint8Array`

### Пример использования

```typescript
// Сохранение настроек
interface Settings {
  loopPaste: boolean;
  reversePaste: boolean;
  ignoreSymbols: string;
}

async function saveSettings(settings: Settings): Promise<void> {
  await pixso.clientStorage.setAsync('settings', settings);
}

async function loadSettings(): Promise<Settings> {
  const settings = await pixso.clientStorage.getAsync('settings');
  return settings ?? {
    loopPaste: false,
    reversePaste: false,
    ignoreSymbols: ''
  };
}
```

### Важные замечания

- Данные хранятся локально на устройстве пользователя
- НЕ синхронизируются между пользователями
- Могут быть очищены при очистке кэша браузера
- Изолированы по ID плагина

---

## Утилиты и хелперы

### Загрузка шрифтов

**ВАЖНО:** Перед изменением `characters` или других текстовых свойств необходимо загрузить шрифт!

```typescript
// Загрузка одного шрифта
await pixso.loadFontAsync({ family: "Inter", style: "Regular" });

// Загрузка нескольких шрифтов
await Promise.all([
  pixso.loadFontAsync({ family: "Inter", style: "Regular" }),
  pixso.loadFontAsync({ family: "Inter", style: "Bold" })
]);

// Загрузка всех шрифтов из TextNode
async function loadFontsForTextNode(textNode: TextNode): Promise<void> {
  const fonts = textNode.getRangeAllFontNames(0, textNode.characters.length);
  await Promise.all(fonts.map(font => pixso.loadFontAsync(font)));
}
```

### Проверка типа ноды

```typescript
function isTextNode(node: SceneNode): node is TextNode {
  return node.type === "TEXT";
}

// Использование
const textNodes = selection.filter(isTextNode);
```

### Закрытие плагина

```typescript
// Без сообщения
pixso.closePlugin();

// С сообщением (показывается как toast)
pixso.closePlugin("Done! Pasted 5 items.");
```

### Plugin Data

Хранение данных на конкретной ноде:

```typescript
// Сохранить
node.setPluginData('key', JSON.stringify(data));

// Получить
const data = JSON.parse(node.getPluginData('key') || '{}');

// Получить все ключи
const keys = node.getPluginDataKeys();
```

### Shared Plugin Data

Данные, доступные другим плагинам:

```typescript
// namespace должен быть уникальным (минимум 3 символа)
const NAMESPACE = 'many-paster';

node.setSharedPluginData(NAMESPACE, 'key', 'value');
const value = node.getSharedPluginData(NAMESPACE, 'key');
```

---

## Примеры кода

### Пример 1: Получение текста из выделенных слоёв

```typescript
function getSelectedTexts(): string[] {
  const selection = pixso.currentPage.selection;
  
  // Фильтруем только TextNode
  const textNodes = selection.filter(
    (node): node is TextNode => node.type === "TEXT"
  );
  
  // Сортируем по позиции (сверху вниз, слева направо)
  const sorted = textNodes.sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
  
  // Извлекаем текст
  return sorted.map(node => node.characters);
}
```

### Пример 2: Вставка текста в выделенные слои

```typescript
interface PasteOptions {
  loop: boolean;
  reverse: boolean;
  ignoreSymbols: string[];
}

async function pasteTexts(
  lines: string[], 
  options: PasteOptions
): Promise<number> {
  const selection = pixso.currentPage.selection;
  
  // Фильтруем TextNode
  let textNodes = selection.filter(
    (node): node is TextNode => node.type === "TEXT"
  );
  
  if (textNodes.length === 0) {
    pixso.closePlugin("No text layers selected");
    return 0;
  }
  
  // Сортируем по позиции
  textNodes = textNodes.sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
  
  // Обрабатываем текст
  let processedLines = lines.map(line => {
    let result = line;
    for (const symbol of options.ignoreSymbols) {
      result = result.split(symbol).join('');
    }
    return result;
  });
  
  // Reverse если нужно
  if (options.reverse) {
    processedLines = processedLines.reverse();
  }
  
  // Вставляем
  let pastedCount = 0;
  
  for (let i = 0; i < textNodes.length; i++) {
    let lineIndex = i;
    
    if (options.loop) {
      lineIndex = i % processedLines.length;
    } else if (i >= processedLines.length) {
      break;
    }
    
    const textNode = textNodes[i];
    const newText = processedLines[lineIndex];
    
    // Загружаем шрифты
    const fonts = textNode.getRangeAllFontNames(0, textNode.characters.length);
    await Promise.all(fonts.map(font => pixso.loadFontAsync(font)));
    
    // Вставляем текст
    textNode.characters = newText;
    pastedCount++;
  }
  
  return pastedCount;
}
```

### Пример 3: Полный main.ts

```typescript
// main.ts
pixso.showUI(__html__, { width: 320, height: 480 });

// Загрузка сохранённых настроек при старте
async function init() {
  const settings = await pixso.clientStorage.getAsync('settings');
  pixso.ui.postMessage({ type: 'INIT', settings: settings ?? {} });
}

init();

// Обработка сообщений от UI
pixso.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'PASTE': {
      const count = await pasteTexts(msg.lines, msg.options);
      pixso.ui.postMessage({ type: 'PASTE_RESULT', count });
      break;
    }
    
    case 'COPY_SELECTED': {
      const texts = getSelectedTexts();
      pixso.ui.postMessage({ type: 'COPY_RESULT', texts });
      break;
    }
    
    case 'SAVE_SETTINGS': {
      await pixso.clientStorage.setAsync('settings', msg.settings);
      break;
    }
    
    case 'CLOSE': {
      pixso.closePlugin();
      break;
    }
  }
};

function getSelectedTexts(): string[] {
  return pixso.currentPage.selection
    .filter((node): node is TextNode => node.type === "TEXT")
    .sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x)
    .map(node => node.characters);
}

async function pasteTexts(lines: string[], options: any): Promise<number> {
  let textNodes = pixso.currentPage.selection
    .filter((node): node is TextNode => node.type === "TEXT")
    .sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
  
  if (textNodes.length === 0) return 0;
  
  let processedLines = [...lines];
  
  // Ignore symbols
  if (options.ignoreEnabled && options.ignoreSymbols) {
    const symbols = options.ignoreSymbols.split(',').map((s: string) => s.trim());
    processedLines = processedLines.map(line => {
      let result = line;
      symbols.forEach((sym: string) => {
        result = result.split(sym).join('');
      });
      return result;
    });
  }
  
  // Reverse
  if (options.reverse) {
    processedLines.reverse();
  }
  
  let count = 0;
  for (let i = 0; i < textNodes.length; i++) {
    const lineIdx = options.loop 
      ? i % processedLines.length 
      : i;
    
    if (!options.loop && lineIdx >= processedLines.length) break;
    
    const node = textNodes[i];
    const fonts = node.getRangeAllFontNames(0, node.characters.length);
    await Promise.all(fonts.map(f => pixso.loadFontAsync(f)));
    
    node.characters = processedLines[lineIdx];
    count++;
  }
  
  return count;
}
```

---

## Совместимость с Figma

Pixso Plugin API очень похож на Figma Plugin API. Для проверки среды:

```typescript
// В main thread
if (typeof pixso !== 'undefined') {
  // Pixso
} else if (typeof figma !== 'undefined') {
  // Figma
}

// В UI
if (window.location.origin.includes('pixso')) {
  // Pixso
} else {
  // Figma
}
```

---

## Ссылки

- Официальная документация: https://pixso.cn/developer/en/plugin-api/README.html
- TextNode API: https://pixso.cn/developer/en/plugin-api/node/TextNode.html
- NPM пакеты:
  - `@pixso/plugin-typings` — TypeScript типы
  - `@pixso/plugin-cli` — CLI для сборки
  - `@pixso/create-plugin` — Генератор проекта

---

*Документ создан: 2025-01-27*
*Версия API: актуальная на момент создания*
