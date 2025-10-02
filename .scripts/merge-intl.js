/* eslint-disable no-console */
// Merge newly extracted messages (.i18n/extracted/messages.json) into i18n/{en,fr}.json
// Keeps shape [{ id, defaultMessage, message }] used by existing code and extractor.
const fs = require('fs');
const path = require('path');

const EXTRACTED = path.resolve(__dirname, '../.i18n/extracted/messages.json');
const LOCALES_DIR = path.resolve(__dirname, '../i18n');
const LOCALES = ['en', 'fr'];

function readJSON(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

function main() {
  if (!fs.existsSync(EXTRACTED)) {
    console.error('No extracted messages found at', EXTRACTED);
    process.exit(1);
  }
  const extractedRaw = readJSON(EXTRACTED, []);
  // Support either array of descriptors or object map { id: defaultMessage }
  let extractedArray = [];
  if (Array.isArray(extractedRaw)) {
    extractedArray = extractedRaw;
  } else if (extractedRaw && typeof extractedRaw === 'object') {
    extractedArray = Object.keys(extractedRaw).map((id) => ({ id, defaultMessage: extractedRaw[id] || '' }));
  }
  const extractedMap = {}; // id -> {id, defaultMessage}
  for (const m of extractedArray) {
    if (!m || !m.id) continue;
    extractedMap[m.id] = { id: m.id, defaultMessage: m.defaultMessage || '' };
  }

  if (!fs.existsSync(LOCALES_DIR)) fs.mkdirSync(LOCALES_DIR, { recursive: true });

  for (const locale of LOCALES) {
    const localeFile = path.join(LOCALES_DIR, `${locale}.json`);
    const existing = readJSON(localeFile, []);
    const existingMap = new Map(existing.map((m) => [m.id, m]));

    const merged = Object.keys(extractedMap)
      .sort((a, b) => a.localeCompare(b))
      .map((id) => {
        const base = extractedMap[id];
        const prev = existingMap.get(id);
        return {
          id,
          defaultMessage: base.defaultMessage || (prev && prev.defaultMessage) || '',
          message: prev && typeof prev.message === 'string' ? prev.message : '',
        };
      });

    fs.writeFileSync(localeFile, JSON.stringify(merged, null, 2) + '\n', 'utf8');
    console.log('Updated', localeFile);
  }
}

main();
