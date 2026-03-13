import { homedir } from 'os';

// --- Types ---

interface StatusInput {
  workspace?: { current_dir?: string; project_dir?: string };
  cwd?: string;
  model?: string | { id?: string; display_name?: string };
  context_window?: {
    total_input_tokens?: number;
    total_output_tokens?: number;
    used_percentage?: number;
    remaining_percentage?: number;
  };
}

// --- ANSI Colors ---

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

// --- Formatting Functions ---

export function formatNumber(n: number | undefined | null): string {
  const num = n ?? 0;
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return val % 1 === 0 ? `${val}M` : `${val.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1000) {
    const val = num / 1000;
    return val % 1 === 0 ? `${val}K` : `${val.toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(num);
}

export function formatPath(path: string | undefined, home: string): string {
  if (!path) return '';
  let display = path;
  if (home && display.startsWith(home)) {
    display = '~' + display.slice(home.length);
  }
  const segments = display.split('/').filter(Boolean);
  if (display.startsWith('~')) {
    const depthAfterHome = segments.length - 1;
    if (depthAfterHome > 3) {
      return '\u2026/' + segments.slice(-2).join('/');
    }
  } else {
    if (segments.length > 3) {
      return '\u2026/' + segments.slice(-2).join('/');
    }
  }
  return display;
}

export function buildProgressBar(percentage: number | null | undefined): string {
  if (percentage == null) return '';
  const p = Math.max(0, Math.min(100, percentage));
  const filled = Math.round(p / 10);
  const empty = 10 - filled;
  const color = p <= 50 ? GREEN : p <= 75 ? YELLOW : RED;
  const filledStr = '\u2588'.repeat(filled);
  const emptyStr = '\u2591'.repeat(empty);
  return `${color}${filledStr}${RESET}${DIM}${emptyStr}${RESET} ${color}${Math.round(p)}%${RESET}`;
}

export function getModelName(model: string | { id?: string; display_name?: string } | undefined): string {
  if (!model) return '';
  if (typeof model === 'string') return model;
  return model.display_name || model.id || '';
}

export function buildStatusLine(input: StatusInput, home: string): string {
  const segments: string[] = [];

  const dir = input.workspace?.current_dir || input.cwd;
  const path = formatPath(dir, home);
  if (path) segments.push(`\uD83D\uDCC1 ${path}`);

  const model = getModelName(input.model);
  if (model) segments.push(`\uD83E\uDD16 ${model}`);

  const ctx = input.context_window;
  if (ctx?.total_input_tokens != null || ctx?.total_output_tokens != null) {
    const inp = formatNumber(ctx.total_input_tokens);
    const out = formatNumber(ctx.total_output_tokens);
    segments.push(`\uD83D\uDCCA \u2191${inp} \u2193${out}`);
  }

  if (ctx?.used_percentage != null) {
    segments.push(buildProgressBar(ctx.used_percentage));
  }

  const remaining = ctx?.remaining_percentage ?? (ctx?.used_percentage != null ? 100 - ctx.used_percentage : null);
  if (remaining != null) {
    segments.push(`\uD83D\uDD0B ${Math.round(remaining)}%`);
  }

  return segments.join('  ');
}

// --- Stdin Reader ---

async function readStdin(timeoutMs: number): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    const timer = setTimeout(() => resolve(''), timeoutMs);

    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      clearTimeout(timer);
      resolve(data);
    });
    process.stdin.on('error', () => {
      clearTimeout(timer);
      resolve('');
    });
  });
}

// --- Main ---

async function main(): Promise<void> {
  try {
    const raw = await readStdin(5000);
    if (!raw.trim()) {
      process.exit(0);
    }
    const input: StatusInput = JSON.parse(raw);
    const output = buildStatusLine(input, homedir());
    if (output) process.stdout.write(output + '\n');
  } catch {
    // JSON parse error or any other error — silent exit
  }
  process.exit(0);
}

main();
