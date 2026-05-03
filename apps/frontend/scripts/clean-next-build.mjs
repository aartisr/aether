#!/usr/bin/env node

import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, '..');
const nextOutputDir = path.join(frontendRoot, '.next');

await rm(nextOutputDir, { force: true, recursive: true });
console.log('Removed generated Next.js output at .next.');
