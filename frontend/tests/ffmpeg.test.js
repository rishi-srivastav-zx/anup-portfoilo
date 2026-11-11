/**
 * Unit & Integration Tests for Centralized Cross-Platform FFmpeg Utility
 * Verifies OS & CPU architecture detection, binary resolution, version inspection,
 * executable permissions handler, and command execution.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {
  getFFmpegPath,
  isFFmpegAvailable,
  getFFmpegInfo,
  execFFmpeg,
  getPlatformKey,
  getBinaryName,
  ensureExecutablePermissions,
} = require('../src/lib/ffmpeg');

test.describe('Cross-Platform FFmpeg Centralized Module Suite', () => {

  test.it('1. Platform & Binary Detection: Correctly derives platform keys and binary names', () => {
    // Current host
    const currentKey = getPlatformKey();
    assert.match(currentKey, /^(win32|linux|darwin)-(x64|arm64|ia32|arm)$/);

    // Simulated Windows x64
    assert.strictEqual(getBinaryName('win32'), 'ffmpeg.exe');

    // Simulated Linux x64
    assert.strictEqual(getBinaryName('linux'), 'ffmpeg');

    // Simulated macOS
    assert.strictEqual(getBinaryName('darwin'), 'ffmpeg');
  });

  test.it('2. Binary Path Resolution: Returns an existing and accessible ffmpeg binary on the host', () => {
    const binPath = getFFmpegPath();
    assert.ok(binPath, 'FFmpeg binary path must be non-empty');
    assert.ok(fs.existsSync(binPath), `FFmpeg binary must exist at path: ${binPath}`);

    if (os.platform() === 'win32') {
      assert.ok(binPath.toLowerCase().endsWith('ffmpeg.exe'), 'Windows path must end with ffmpeg.exe');
    } else {
      assert.ok(binPath.endsWith('ffmpeg'), 'Unix/Linux path must end with ffmpeg');
    }
  });

  test.it('3. Availability Check: isFFmpegAvailable() reports true on supported installed platform', () => {
    const available = isFFmpegAvailable();
    assert.strictEqual(available, true, 'FFmpeg should be available in current environment');
  });

  test.it('4. Version & Info Inspection: Returns valid platform, arch, and version metadata', () => {
    const info = getFFmpegInfo();
    assert.strictEqual(info.platform, os.platform());
    assert.strictEqual(info.arch, os.arch());
    assert.strictEqual(info.available, true);
    assert.ok(info.version && info.version !== 'unknown', `Version should be detected, got: ${info.version}`);
    assert.strictEqual(info.error, null);
  });

  test.it('5. Binary Execution: Executes ffmpeg -version and exits cleanly with code 0', () => {
    const res = execFFmpeg(['-version'], { stdio: 'pipe' });
    assert.strictEqual(res.status, 0, 'FFmpeg version check must exit with code 0');
    assert.ok(res.stdout && res.stdout.toString().includes('ffmpeg version'), 'Output must contain "ffmpeg version"');
  });

  test.it('6. Permissions Handler: ensureExecutablePermissions handles paths safely', () => {
    const binPath = getFFmpegPath();
    const result = ensureExecutablePermissions(binPath);
    assert.strictEqual(result, true, 'Executable permission check should return true');
  });

  test.it('7. Linux x64 Simulation: Validates Linux x64 dependency mapping and binary structure', () => {
    const linuxKey = 'linux-x64';
    const linuxBinary = getBinaryName('linux');
    assert.strictEqual(linuxBinary, 'ffmpeg');
    assert.strictEqual(`@ffmpeg-installer/${linuxKey}`, '@ffmpeg-installer/linux-x64');

    // Verify package.json contains @ffmpeg-installer/linux-x64 in optionalDependencies
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
    assert.ok(pkg.optionalDependencies['@ffmpeg-installer/linux-x64'], 'package.json must contain linux-x64 in optionalDependencies');
    assert.ok(pkg.optionalDependencies['@ffmpeg-installer/win32-x64'], 'package.json must contain win32-x64 in optionalDependencies');

    // Verify neither is in mandatory dependencies
    assert.strictEqual(pkg.dependencies['@ffmpeg-installer/linux-x64'], undefined);
    assert.strictEqual(pkg.dependencies['@ffmpeg-installer/win32-x64'], undefined);
  });
});

