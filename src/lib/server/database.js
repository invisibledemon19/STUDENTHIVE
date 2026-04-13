import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSeedState } from './seed-data';

const DATABASE_PATH = path.join(process.cwd(), 'database', 'data.json');

let writeQueue = Promise.resolve();

async function ensureDatabaseFile() {
  await fs.mkdir(path.dirname(DATABASE_PATH), { recursive: true });

  try {
    await fs.access(DATABASE_PATH);
  } catch {
    const seed = createSeedState();
    await fs.writeFile(DATABASE_PATH, JSON.stringify(seed, null, 2), 'utf8');
  }
}

async function readRawDatabase() {
  await ensureDatabaseFile();
  const raw = await fs.readFile(DATABASE_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeRawDatabase(nextState) {
  const tempPath = `${DATABASE_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(nextState, null, 2), 'utf8');
  await fs.rename(tempPath, DATABASE_PATH);
}

export async function readDatabase() {
  return readRawDatabase();
}

export function updateDatabase(mutator) {
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      const state = await readRawDatabase();
      const draft = structuredClone(state);
      const maybeState = await mutator(draft);
      const nextState = maybeState ?? draft;
      await writeRawDatabase(nextState);
      return nextState;
    });

  return writeQueue;
}
