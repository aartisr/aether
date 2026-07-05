#!/usr/bin/env node

function parseList(value) {
  return String(value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function hasStrongSecret(value) {
  return typeof value === 'string' && value.trim().length >= 24;
}

function printError(message) {
  console.error(`[rbac-validate] ERROR: ${message}`);
}

function printWarn(message) {
  console.warn(`[rbac-validate] WARN: ${message}`);
}

function printInfo(message) {
  console.log(`[rbac-validate] ${message}`);
}

const ownerKeys = parseList(process.env.AETHER_ADMIN_OWNER_KEYS);
const operatorKeys = parseList(process.env.AETHER_ADMIN_OPERATOR_KEYS);
const reviewerKeys = parseList(process.env.AETHER_ADMIN_REVIEWER_KEYS);
const legacyOwnerKeys = [
  String(process.env.AETHER_ADMIN_ACCESS_KEY ?? '').trim(),
  ...parseList(process.env.AETHER_ADMIN_ACCESS_KEYS),
].filter((entry) => entry.length > 0);

let failed = false;

if (process.env.AETHER_ENABLE_ADMIN_PAGE !== 'true') {
  printError('AETHER_ENABLE_ADMIN_PAGE must be set to true.');
  failed = true;
}

const sessionSecret = process.env.AETHER_ADMIN_SESSION_SECRET;
if (!hasStrongSecret(sessionSecret)) {
  printError('AETHER_ADMIN_SESSION_SECRET must be set and at least 24 characters.');
  failed = true;
}

if (ownerKeys.length + legacyOwnerKeys.length === 0) {
  printError('At least one owner key must be configured via AETHER_ADMIN_OWNER_KEYS or legacy owner key variables.');
  failed = true;
}

if (operatorKeys.length === 0) {
  printError('At least one operator key must be configured via AETHER_ADMIN_OPERATOR_KEYS.');
  failed = true;
}

if (reviewerKeys.length === 0) {
  printError('At least one reviewer key must be configured via AETHER_ADMIN_REVIEWER_KEYS.');
  failed = true;
}

const allKeys = [
  ...ownerKeys,
  ...legacyOwnerKeys,
  ...operatorKeys,
  ...reviewerKeys,
];
const uniqueKeyCount = new Set(allKeys).size;
if (uniqueKeyCount !== allKeys.length) {
  printWarn('Duplicate admin keys detected across roles. Use unique keys per role to reduce blast radius.');
}

const ttlMinutes = Number(process.env.AETHER_ADMIN_SESSION_TTL_MINUTES ?? '480');
if (!Number.isFinite(ttlMinutes) || ttlMinutes < 5 || ttlMinutes > 1440) {
  printWarn('AETHER_ADMIN_SESSION_TTL_MINUTES is outside recommended bounds (5-1440).');
}

if (failed) {
  process.exitCode = 1;
} else {
  printInfo('RBAC environment validation passed.');
  printInfo(`Configured role keys: owner=${ownerKeys.length + legacyOwnerKeys.length}, operator=${operatorKeys.length}, reviewer=${reviewerKeys.length}`);
}
