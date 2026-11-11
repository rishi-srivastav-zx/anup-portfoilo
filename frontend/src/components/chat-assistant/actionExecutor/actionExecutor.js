/**
 * Frontend Action Executor for Anup Rawat Cinematographer Portfolio Assistant
 * Step 8: Section Navigation & Interactive Actions Engine
 * 
 * Reusable, security-hardened React action executor. Validates action types and
 * targets strictly against the actual website DOM sections and Next.js routes.
 * Never executes arbitrary JavaScript, external URLs, or unsafe redirects.
 */

export const ACTION_TYPES = Object.freeze({
  NAVIGATE_TO_SECTION: 'NAVIGATE_TO_SECTION',
  NAVIGATE_TO_ROUTE: 'NAVIGATE_TO_ROUTE',
  OPEN_PROJECT: 'OPEN_PROJECT',
  OPEN_CONTACT_MODAL: 'OPEN_CONTACT_MODAL',
  SCROLL_TO_TOP: 'SCROLL_TO_TOP',
  PLAY_SHOWREEL: 'PLAY_SHOWREEL',
  SUBMIT_LEAD: 'SUBMIT_LEAD',
  EDIT_LEAD: 'EDIT_LEAD',
  CANCEL_LEAD: 'CANCEL_LEAD',
  SKIP_LEAD_FIELD: 'SKIP_LEAD_FIELD',
});

// Explicit allowlist of on-page DOM section IDs on the homepage
export const ALLOWED_SECTIONS = Object.freeze([
  '#home',
  '#about',
  '#visuals',
  '#work',
  '#contact',
]);

// Explicit allowlist of Next.js internal routes
export const ALLOWED_ROUTES = Object.freeze([
  '/',
  '/blog',
  '/dashboard',
  '/login',
]);

// Cooldown window (in ms) to prevent duplicate action execution
const DUPLICATE_COOLDOWN_MS = 1500;
const executedActionCache = new Map();

/**
 * Validates an action payload against the strict security allowlist.
 * @param {object} action
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAction(action) {
  if (!action || typeof action !== 'object') {
    return { valid: false, error: 'MALFORMED_ACTION: Action must be a valid object.' };
  }

  const { type, target } = action;

  if (!type || !Object.values(ACTION_TYPES).includes(type)) {
    return {
      valid: false,
      error: `UNSUPPORTED_ACTION_TYPE: Action type "${type}" is not supported.`,
    };
  }

  // Lead flow conversational actions don't require DOM targets
  const isLeadAction = [
    ACTION_TYPES.SUBMIT_LEAD,
    ACTION_TYPES.EDIT_LEAD,
    ACTION_TYPES.CANCEL_LEAD,
    ACTION_TYPES.SKIP_LEAD_FIELD,
  ].includes(type);
  if (isLeadAction) {
    return { valid: true };
  }

  if (!target || typeof target !== 'string') {
    return {
      valid: false,
      error: 'INVALID_TARGET: Target must be a non-empty string.',
    };
  }

  const cleanTarget = target.trim();

  // Strict check: Reject dangerous protocols or absolute external URLs
  if (
    /^(javascript:|data:|vbscript:|file:|https?:|\/\/|\.\.)/i.test(cleanTarget)
  ) {
    return {
      valid: false,
      error: 'SECURITY_VIOLATION: External URLs or script execution are strictly prohibited.',
    };
  }

  // Section targets check
  if (
    type === ACTION_TYPES.NAVIGATE_TO_SECTION ||
    type === ACTION_TYPES.OPEN_PROJECT ||
    type === ACTION_TYPES.PLAY_SHOWREEL
  ) {
    const formattedSection = cleanTarget.startsWith('#')
      ? cleanTarget
      : `#${cleanTarget}`;
    if (!ALLOWED_SECTIONS.includes(formattedSection)) {
      return {
        valid: false,
        error: `UNKNOWN_SECTION: Section "${cleanTarget}" does not exist in website structure.`,
      };
    }
  }

  // Route targets check
  if (type === ACTION_TYPES.NAVIGATE_TO_ROUTE) {
    const isAllowedRoute = ALLOWED_ROUTES.some(
      (r) => cleanTarget === r || cleanTarget.startsWith(`${r}/`)
    );
    if (!isAllowedRoute) {
      return {
        valid: false,
        error: `UNKNOWN_ROUTE: Route "${cleanTarget}" is not an allowed site route.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Generates an idempotent deduplication fingerprint for an action.
 * @param {object} action
 * @returns {string}
 */
function getActionFingerprint(action) {
  const { type, target, payload } = action;
  const payloadStr = payload ? JSON.stringify(payload) : '';
  return `${type}:${target}:${payloadStr}`;
}

/**
 * Checks if an action is a duplicate within the cooldown window.
 * @param {object} action
 * @returns {boolean}
 */
export function isDuplicateAction(action) {
  const fp = getActionFingerprint(action);
  const lastTime = executedActionCache.get(fp);
  const now = Date.now();

  if (lastTime && now - lastTime < DUPLICATE_COOLDOWN_MS) {
    return true;
  }

  executedActionCache.set(fp, now);
  // Keep cache bounded
  if (executedActionCache.size > 50) {
    const oldestKey = executedActionCache.keys().next().value;
    executedActionCache.delete(oldestKey);
  }

  return false;
}

/**
 * Resets the duplicate action cache (primarily for unit tests).
 */
export function resetActionCache() {
  executedActionCache.clear();
}

/**
 * Executes a verified action safely on the frontend.
 * @param {object} action - The action object from the assistant response.
 * @param {object} [options] - Execution options and hooks.
 * @param {Function} [options.routerPush] - Next.js router.push instance.
 * @param {Function} [options.onOpenContactModal] - Callback to toggle contact modal.
 * @param {boolean} [options.skipDuplicateCheck=false] - Skip cooldown (e.g. on direct button click).
 * @returns {Promise<{ success: boolean, reason?: string, message?: string }>}
 */
export async function executeAction(action, options = {}) {
  const { routerPush, onOpenContactModal, skipDuplicateCheck = false } = options;

  // 1. Validation against strict allowlist
  const validation = validateAction(action);
  if (!validation.valid) {
    return {
      success: false,
      reason: 'VALIDATION_FAILED',
      message: validation.error,
    };
  }

  // 2. Duplicate prevention
  if (!skipDuplicateCheck && isDuplicateAction(action)) {
    return {
      success: false,
      reason: 'DUPLICATE_ACTION_IGNORED',
      message: 'Action was recently executed; skipping duplicate invocation.',
    };
  }

  const { type, target, payload } = action;
  const currentPath =
    typeof window !== 'undefined' ? window.location.pathname : '/';

  try {
    switch (type) {
      // -------------------------------------------------------------
      // Action: SCROLL_TO_TOP
      // -------------------------------------------------------------
      case ACTION_TYPES.SCROLL_TO_TOP: {
        if (typeof window === 'undefined') return { success: true };

        if (currentPath !== '/') {
          if (routerPush) {
            routerPush('/#home');
          } else {
            window.location.href = '/#home';
          }
          return { success: true };
        }

        if (window.lenis) {
          window.lenis.scrollTo(0, {
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return { success: true };
      }

      // -------------------------------------------------------------
      // Action: NAVIGATE_TO_ROUTE
      // -------------------------------------------------------------
      case ACTION_TYPES.NAVIGATE_TO_ROUTE: {
        if (typeof window === 'undefined') return { success: true };

        if (currentPath === target) {
          // Already on the route, smoothly scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return { success: true };
        }

        if (routerPush) {
          routerPush(target);
        } else {
          window.location.href = target;
        }
        return { success: true };
      }

      // -------------------------------------------------------------
      // Action: NAVIGATE_TO_SECTION
      // -------------------------------------------------------------
      case ACTION_TYPES.NAVIGATE_TO_SECTION: {
        if (typeof window === 'undefined') return { success: true };

        const targetId = target.replace(/^#/, '');

        // If currently on /blog or another subpage, navigate back to homepage with hash
        if (currentPath !== '/') {
          const targetUrl = `/#${targetId}`;
          if (routerPush) {
            routerPush(targetUrl);
          } else {
            window.location.href = targetUrl;
          }
          return { success: true };
        }

        // On homepage: smooth scroll to section
        const element = document.getElementById(targetId);
        if (!element) {
          return {
            success: false,
            reason: 'SECTION_NOT_FOUND',
            message: `Section "#${targetId}" was not found on this page.`,
          };
        }

        if (window.lenis) {
          window.lenis.scrollTo(element, {
            duration: 1.4,
            offset: -20,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        } else {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        try {
          window.history.replaceState(null, '', `#${targetId}`);
        } catch {
          // Ignore iframe history restrictions
        }

        return { success: true };
      }

      // -------------------------------------------------------------
      // Action: OPEN_CONTACT_MODAL
      // -------------------------------------------------------------
      case ACTION_TYPES.OPEN_CONTACT_MODAL: {
        if (typeof window === 'undefined') return { success: true };

        // 1. If callback provided, trigger dedicated inquiry modal
        if (typeof onOpenContactModal === 'function') {
          onOpenContactModal(payload || {});
          return { success: true };
        }

        // 2. Dispatch custom DOM event for listening components
        window.dispatchEvent(
          new CustomEvent('open-contact-modal', { detail: payload || {} })
        );

        // 3. Fallback: smoothly scroll to the contact form section (#contact)
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          if (window.lenis) {
            window.lenis.scrollTo(contactSection, { duration: 1.2 });
          } else {
            contactSection.scrollIntoView({ behavior: 'smooth' });
          }
        }

        return { success: true };
      }

      // -------------------------------------------------------------
      // Action: OPEN_PROJECT
      // -------------------------------------------------------------
      case ACTION_TYPES.OPEN_PROJECT: {
        if (typeof window === 'undefined') return { success: true };

        const stationIndex =
          typeof payload?.stationIndex === 'number'
            ? payload.stationIndex
            : null;

        // Ensure we navigate to the #work section first
        const workElement = document.getElementById('work');
        if (workElement) {
          if (window.lenis) {
            window.lenis.scrollTo(workElement, { duration: 1.2 });
          } else {
            workElement.scrollIntoView({ behavior: 'smooth' });
          }
        }

        // If the Best Work Metro System exposes window.stepOutToCaseStudy, invoke it
        if (
          stationIndex !== null &&
          typeof window.stepOutToCaseStudy === 'function'
        ) {
          // Delay briefly to allow scroll to settle
          setTimeout(() => {
            try {
              window.stepOutToCaseStudy(null, stationIndex);
            } catch (err) {
              console.warn('[ActionExecutor] stepOutToCaseStudy error:', err);
            }
          }, 450);
        }

        return { success: true };
      }

      // -------------------------------------------------------------
      // Action: PLAY_SHOWREEL
      // -------------------------------------------------------------
      case ACTION_TYPES.PLAY_SHOWREEL: {
        if (typeof window === 'undefined') return { success: true };

        const workElement = document.getElementById('work');
        if (workElement) {
          if (window.lenis) {
            window.lenis.scrollTo(workElement, { duration: 1.2 });
          } else {
            workElement.scrollIntoView({ behavior: 'smooth' });
          }
        }

        // Best Work originStation 0 is the SHOWREEL
        const metroEnterBtn = document.getElementById('metro-enter-btn');
        if (metroEnterBtn) {
          metroEnterBtn.click();
        }

        return { success: true };
      }

      // -------------------------------------------------------------
      // Actions: SUBMIT_LEAD, EDIT_LEAD, CANCEL_LEAD, SKIP_LEAD_FIELD
      // -------------------------------------------------------------
      case ACTION_TYPES.SUBMIT_LEAD: {
        if (typeof options.onSendMessage === 'function') {
          options.onSendMessage('Confirm & Submit', {
            action: ACTION_TYPES.SUBMIT_LEAD,
            type: ACTION_TYPES.SUBMIT_LEAD,
            confirmed: true,
          });
        }
        return { success: true };
      }

      case ACTION_TYPES.EDIT_LEAD: {
        if (typeof options.onSendMessage === 'function') {
          options.onSendMessage('Edit Details', {
            action: ACTION_TYPES.EDIT_LEAD,
            type: ACTION_TYPES.EDIT_LEAD,
            edit: true,
          });
        }
        return { success: true };
      }

      case ACTION_TYPES.CANCEL_LEAD: {
        if (typeof options.onSendMessage === 'function') {
          options.onSendMessage('Cancel', {
            action: ACTION_TYPES.CANCEL_LEAD,
            type: ACTION_TYPES.CANCEL_LEAD,
            cancel: true,
          });
        }
        return { success: true };
      }

      case ACTION_TYPES.SKIP_LEAD_FIELD: {
        if (typeof options.onSendMessage === 'function') {
          options.onSendMessage('Skip', {
            action: ACTION_TYPES.SKIP_LEAD_FIELD,
            type: ACTION_TYPES.SKIP_LEAD_FIELD,
            skip: true,
            field: action?.payload?.field || null,
          });
        }
        return { success: true };
      }

      default:
        return {
          success: false,
          reason: 'UNHANDLED_ACTION',
          message: `Action type "${type}" has no execution handler.`,
        };
    }
  } catch (error) {
    return {
      success: false,
      reason: 'EXECUTION_EXCEPTION',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

