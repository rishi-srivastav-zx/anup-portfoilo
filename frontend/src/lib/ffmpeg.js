/**
 * Centralized Cross-Platform FFmpeg Utility
 * Dynamically resolves, validates, and manages execution permissions for FFmpeg
 * across Windows x64 (local dev), Linux x64 (Vercel/Production), and macOS.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');

/**
 * Returns platform and architecture identifier string (e.g. 'win32-x64', 'linux-x64')
 */
function getPlatformKey() {
  return `${os.platform()}-${os.arch()}`;
}

/**
 * Normalizes binary name based on OS
 */
function getBinaryName(platform = os.platform()) {
  return platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
}

/**
 * Attempts to ensure executable permissions on POSIX systems (Linux/macOS)
 */
function ensureExecutablePermissions(filePath) {
  if (os.platform() === 'win32') return true;
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    try {
      fs.chmodSync(filePath, 0o755);
      return true;
    } catch (err) {
      console.warn(`[ffmpeg] Warning: unable to chmod 755 "${filePath}":`, err.message);
      return false;
    }
  }
}

/**
 * Searches common node_modules roots for platform-specific binary
 */
function searchPlatformNodeModules(platformKey, binaryName) {
  const possibleRoots = [
    path.resolve(__dirname, '..', '..', 'node_modules', '@ffmpeg-installer', platformKey, binaryName),
    path.resolve(process.cwd(), 'node_modules', '@ffmpeg-installer', platformKey, binaryName),
    path.resolve(process.cwd(), 'frontend', 'node_modules', '@ffmpeg-installer', platformKey, binaryName),
  ];

  for (const candidate of possibleRoots) {
    if (fs.existsSync(candidate)) {
      ensureExecutablePermissions(candidate);
      return candidate;
    }
  }

  // Attempt require.resolve if available
  try {
    const pkgPath = require.resolve(`@ffmpeg-installer/${platformKey}/package.json`);
    const candidate = path.join(path.dirname(pkgPath), binaryName);
    if (fs.existsSync(candidate)) {
      ensureExecutablePermissions(candidate);
      return candidate;
    }
  } catch {
    // Package not installed for this platform
  }

  return null;
}

/**
 * Searches system PATH for ffmpeg
 */
function searchSystemPath() {
  const platform = os.platform();
  const cmd = platform === 'win32' ? 'where.exe ffmpeg' : 'which ffmpeg';

  try {
    const stdout = cp.execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8' });
    const firstLine = stdout.trim().split(/\r?\n/)[0]?.trim();
    if (firstLine && fs.existsSync(firstLine)) {
      ensureExecutablePermissions(firstLine);
      return firstLine;
    }
  } catch {
    // Not found in system PATH
  }

  return null;
}

/**
 * Main resolution function: returns absolute path to valid ffmpeg executable
 */
function getFFmpegPath() {
  const platform = os.platform();
  const arch = os.arch();
  const platformKey = getPlatformKey();
  const binaryName = getBinaryName(platform);

  // 1. Explicit environment variable override
  if (process.env.FFMPEG_PATH) {
    const envPath = path.resolve(process.env.FFMPEG_PATH);
    if (fs.existsSync(envPath)) {
      ensureExecutablePermissions(envPath);
      return envPath;
    }
  }

  // 2. Try the @ffmpeg-installer/ffmpeg wrapper
  try {
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    if (ffmpegInstaller && ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
      ensureExecutablePermissions(ffmpegInstaller.path);
      return ffmpegInstaller.path;
    }
  } catch {
    // Fall through to manual platform search
  }

  // 3. Search platform-specific installer package directly
  const platformPkgBinary = searchPlatformNodeModules(platformKey, binaryName);
  if (platformPkgBinary) {
    return platformPkgBinary;
  }

  // 4. Search system PATH as fallback
  const sysBinary = searchSystemPath();
  if (sysBinary) {
    return sysBinary;
  }

  // 5. Throw detailed error
  throw new Error(
    `[FFmpeg Resolution Error] Could not locate executable ffmpeg binary for platform "${platformKey}".\n` +
    `  - OS: ${platform} (${arch})\n` +
    `  - Expected binary name: ${binaryName}\n` +
    `  - Resolution steps attempted:\n` +
    `      1. process.env.FFMPEG_PATH\n` +
    `      2. @ffmpeg-installer/ffmpeg module\n` +
    `      3. @ffmpeg-installer/${platformKey} package in node_modules\n` +
    `      4. System PATH (${platform === 'win32' ? 'where.exe' : 'which'} ffmpeg)\n` +
    `  - Remediation:\n` +
    `      Ensure optionalDependencies are enabled during install, or install ffmpeg system-wide,\n` +
    `      or set the FFMPEG_PATH environment variable.`
  );
}

/**
 * Checks whether FFmpeg is available and executable
 */
function isFFmpegAvailable() {
  try {
    const binPath = getFFmpegPath();
    return Boolean(binPath && fs.existsSync(binPath));
  } catch {
    return false;
  }
}

/**
 * Returns detailed metadata about the current FFmpeg environment
 */
function getFFmpegInfo() {
  const platformKey = getPlatformKey();
  let binPath = null;
  let available = false;
  let version = 'unknown';
  let error = null;

  try {
    binPath = getFFmpegPath();
    available = true;
    const proc = cp.spawnSync(binPath, ['-version'], { encoding: 'utf8' });
    if (proc.status === 0 && proc.stdout) {
      const match = proc.stdout.match(/ffmpeg version\s+([^\s]+)/i);
      if (match) {
        version = match[1];
      }
    }
  } catch (err) {
    error = err.message;
  }

  return {
    platform: os.platform(),
    arch: os.arch(),
    platformKey,
    path: binPath,
    available,
    version,
    error,
  };
}

/**
 * Synchronously executes an FFmpeg command using the resolved binary
 */
function execFFmpeg(args = [], options = {}) {
  const binPath = getFFmpegPath();
  return cp.spawnSync(binPath, args, {
    stdio: 'inherit',
    ...options,
  });
}

module.exports = {
  getFFmpegPath,
  isFFmpegAvailable,
  getFFmpegInfo,
  execFFmpeg,
  getPlatformKey,
  getBinaryName,
  ensureExecutablePermissions,
};

