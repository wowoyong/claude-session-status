import { describe, it, expect } from 'vitest';
import { formatNumber, formatPath, buildProgressBar, getModelName, buildStatusLine } from './index';

describe('formatNumber', () => {
  it('returns raw number for 0-999', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(523)).toBe('523');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(8500)).toBe('8.5K');
    expect(formatNumber(10000)).toBe('10K');
  });

  it('formats millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1M');
    expect(formatNumber(1200000)).toBe('1.2M');
    expect(formatNumber(2500000)).toBe('2.5M');
  });

  it('handles undefined/null gracefully', () => {
    expect(formatNumber(undefined)).toBe('0');
    expect(formatNumber(null)).toBe('0');
  });
});

describe('formatPath', () => {
  const HOME = '/Users/jojaeyong';

  it('replaces home directory with ~', () => {
    expect(formatPath('/Users/jojaeyong/projects', HOME)).toBe('~/projects');
  });

  it('keeps paths with 3 or fewer segments after ~', () => {
    expect(formatPath('/Users/jojaeyong/a/b', HOME)).toBe('~/a/b');
    expect(formatPath('/Users/jojaeyong/a/b/c', HOME)).toBe('~/a/b/c');
  });

  it('truncates paths with more than 3 segments after ~', () => {
    expect(formatPath('/Users/jojaeyong/a/b/c/d', HOME)).toBe('\u2026/c/d');
  });

  it('handles non-home paths', () => {
    expect(formatPath('/etc/nginx', HOME)).toBe('/etc/nginx');
  });

  it('handles root path', () => {
    expect(formatPath('/', HOME)).toBe('/');
  });

  it('returns empty string for undefined', () => {
    expect(formatPath(undefined, HOME)).toBe('');
  });
});

describe('buildProgressBar', () => {
  it('builds 0% bar (all empty, green)', () => {
    const bar = buildProgressBar(0);
    expect(bar).toContain('\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591');
    expect(bar).toContain('0%');
    expect(bar).toContain('\x1b[32m');
  });

  it('builds 50% bar with green color', () => {
    const bar = buildProgressBar(50);
    expect(bar).toContain('\u2588\u2588\u2588\u2588\u2588');
    expect(bar).toContain('\x1b[32m');
  });

  it('builds 62% bar with yellow color', () => {
    const bar = buildProgressBar(62);
    expect(bar).toContain('\x1b[33m');
    expect(bar).toContain('62%');
  });

  it('builds 90% bar with red color', () => {
    const bar = buildProgressBar(90);
    expect(bar).toContain('\x1b[31m');
  });

  it('builds 100% bar (all filled)', () => {
    const bar = buildProgressBar(100);
    expect(bar).toContain('\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588');
    expect(bar).toContain('100%');
  });

  it('returns empty string for null/undefined', () => {
    expect(buildProgressBar(null)).toBe('');
    expect(buildProgressBar(undefined)).toBe('');
  });
});

describe('getModelName', () => {
  it('extracts display_name from object', () => {
    expect(getModelName({ id: 'claude-opus-4-6', display_name: 'Opus 4.6' })).toBe('Opus 4.6');
  });

  it('uses string model directly', () => {
    expect(getModelName('claude-sonnet-4-6')).toBe('claude-sonnet-4-6');
  });

  it('returns empty string for undefined', () => {
    expect(getModelName(undefined)).toBe('');
  });
});

describe('buildStatusLine', () => {
  const HOME = '/Users/jojaeyong';

  it('renders full statusline with all fields', () => {
    const input = {
      workspace: { current_dir: '/Users/jojaeyong/WebstormProjects' },
      model: { display_name: 'Opus 4.6' },
      context_window: {
        total_input_tokens: 8500,
        total_output_tokens: 1200,
        used_percentage: 62,
        remaining_percentage: 38,
      },
    };
    const line = buildStatusLine(input, HOME);
    expect(line).toContain('\uD83D\uDCC1');
    expect(line).toContain('~/WebstormProjects');
    expect(line).toContain('\uD83E\uDD16');
    expect(line).toContain('Opus 4.6');
    expect(line).toContain('\uD83D\uDCCA');
    expect(line).toContain('\u21918.5K');
    expect(line).toContain('\u21931.2K');
    expect(line).toContain('62%');
    expect(line).toContain('\uD83D\uDD0B');
    expect(line).toContain('38%');
  });

  it('skips missing segments', () => {
    const input = { workspace: { current_dir: '/tmp/test' } };
    const line = buildStatusLine(input, HOME);
    expect(line).toContain('\uD83D\uDCC1');
    expect(line).toContain('/tmp/test');
    expect(line).not.toContain('\uD83E\uDD16');
    expect(line).not.toContain('\uD83D\uDCCA');
    expect(line).not.toContain('\uD83D\uDD0B');
  });

  it('computes remaining from used when remaining is missing', () => {
    const input = {
      context_window: { used_percentage: 70 },
    };
    const line = buildStatusLine(input, HOME);
    expect(line).toContain('\uD83D\uDD0B');
    expect(line).toContain('30%');
  });

  it('shows both values as-is when they do not sum to 100', () => {
    const input = {
      context_window: { used_percentage: 70, remaining_percentage: 25 },
    };
    const line = buildStatusLine(input, HOME);
    expect(line).toContain('70%');
    expect(line).toContain('25%');
  });

  it('hides progress bar and remaining when used_percentage is null', () => {
    const input = {
      context_window: { total_input_tokens: 100, used_percentage: null as any },
    };
    const line = buildStatusLine(input, HOME);
    expect(line).toContain('\uD83D\uDCCA');
    expect(line).not.toContain('\uD83D\uDD0B');
    expect(line).not.toContain('\u2588');
  });

  it('returns empty string for empty input', () => {
    expect(buildStatusLine({}, HOME)).toBe('');
  });

  it('uses cwd as fallback when workspace is missing', () => {
    const input = { cwd: '/Users/jojaeyong/projects' };
    const line = buildStatusLine(input, HOME);
    expect(line).toContain('~/projects');
  });
});
