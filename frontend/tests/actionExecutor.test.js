/**
 * Frontend Action Executor Unit Tests (Step 8)
 * Verifies DOM section scrolling, Next.js routing, modal toggles, case studies,
 * allowlists, duplicate suppression, and security guards.
 */

import test, { describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  executeAction,
  validateAction,
  resetActionCache,
  ACTION_TYPES,
  ALLOWED_SECTIONS,
  ALLOWED_ROUTES,
} from '../src/components/chat-assistant/actionExecutor/actionExecutor.js';

describe('Frontend Action Executor Unit Tests (Step 8)', () => {
  let mockWindow;
  let mockDocument;
  let elementRegistry;

  beforeEach(() => {
    resetActionCache();
    elementRegistry = new Map();

    // Setup mock elements for all allowed sections
    ALLOWED_SECTIONS.forEach((sec) => {
      const id = sec.replace('#', '');
      elementRegistry.set(id, {
        id,
        scrollIntoView: () => {},
      });
    });

    mockDocument = {
      getElementById: (id) => elementRegistry.get(id) || null,
    };

    mockWindow = {
      location: { pathname: '/', href: '/' },
      history: { replaceState: () => {} },
      scrollTo: () => {},
      lenis: {
        scrollTo: () => {},
      },
      dispatchEvent: () => {},
      stepOutToCaseStudy: () => {},
    };

    globalThis.window = mockWindow;
    globalThis.document = mockDocument;
  });

  // -----------------------------------------------------------------
  // 1. Navigation to Each Existing Section
  // -----------------------------------------------------------------
  test('1. NAVIGATE_TO_SECTION: Smoothly scrolls to existing section (#work, #about, #visuals, #contact)', async () => {
    let scrolledTarget = null;
    mockWindow.lenis.scrollTo = (target) => {
      scrolledTarget = target;
    };

    for (const section of ['#work', '#about', '#visuals', '#contact']) {
      const action = {
        type: ACTION_TYPES.NAVIGATE_TO_SECTION,
        target: section,
        label: `Go to ${section}`,
      };

      const result = await executeAction(action, { skipDuplicateCheck: true });
      assert.equal(result.success, true);
      assert.equal(scrolledTarget?.id, section.replace('#', ''));
    }
  });

  // -----------------------------------------------------------------
  // 2. Navigation to Existing Routes
  // -----------------------------------------------------------------
  test('2. NAVIGATE_TO_ROUTE: Uses router.push for internal routes (/blog, /)', async () => {
    let pushedRoute = null;
    const routerPush = (route) => {
      pushedRoute = route;
    };

    const action = {
      type: ACTION_TYPES.NAVIGATE_TO_ROUTE,
      target: '/blog',
      label: 'Read Journal Articles',
    };

    const result = await executeAction(action, { routerPush, skipDuplicateCheck: true });
    assert.equal(result.success, true);
    assert.equal(pushedRoute, '/blog');
  });

  // -----------------------------------------------------------------
  // 3. Contact Modal Opening
  // -----------------------------------------------------------------
  test('3. OPEN_CONTACT_MODAL: Calls modal trigger callback with inquiry payload', async () => {
    let modalOpenedWith = null;
    const onOpenContactModal = (payload) => {
      modalOpenedWith = payload;
    };

    const action = {
      type: ACTION_TYPES.OPEN_CONTACT_MODAL,
      target: '#contact',
      label: 'Submit Project Inquiry',
      payload: { projectType: 'commercial', location: 'Delhi' },
    };

    const result = await executeAction(action, { onOpenContactModal, skipDuplicateCheck: true });
    assert.equal(result.success, true);
    assert.deepEqual(modalOpenedWith, { projectType: 'commercial', location: 'Delhi' });
  });

  // -----------------------------------------------------------------
  // 4. Project Navigation
  // -----------------------------------------------------------------
  test('4. OPEN_PROJECT: Scrolls to #work and calls window.stepOutToCaseStudy', async () => {
    let invokedStationIndex = null;
    mockWindow.stepOutToCaseStudy = (event, stationIdx) => {
      invokedStationIndex = stationIdx;
    };

    const action = {
      type: ACTION_TYPES.OPEN_PROJECT,
      target: '#work',
      label: 'Open Case Study: Krishna Shukla',
      payload: { projectName: 'Krishna Shukla', stationIndex: 1 },
    };

    const result = await executeAction(action, { skipDuplicateCheck: true });
    assert.equal(result.success, true);

    // Give the setTimeout callback 500ms to fire
    await new Promise((r) => setTimeout(r, 520));
    assert.equal(invokedStationIndex, 1);
  });

  // -----------------------------------------------------------------
  // 5. Showreel Action
  // -----------------------------------------------------------------
  test('5. PLAY_SHOWREEL: Scrolls to #work and clicks #metro-enter-btn if present', async () => {
    let enterBtnClicked = false;
    elementRegistry.set('metro-enter-btn', {
      click: () => {
        enterBtnClicked = true;
      },
    });

    const action = {
      type: ACTION_TYPES.PLAY_SHOWREEL,
      target: '#work',
      label: 'Watch Cinematography Showreel',
      payload: { stationIndex: 0 },
    };

    const result = await executeAction(action, { skipDuplicateCheck: true });
    assert.equal(result.success, true);
    assert.equal(enterBtnClicked, true);
  });

  // -----------------------------------------------------------------
  // 6. Invalid Action Rejection
  // -----------------------------------------------------------------
  test('6. Invalid Action: Rejects unsupported action types and malformed action payloads', async () => {
    const invalidType = {
      type: 'LAUNCH_MISSILE',
      target: '#work',
      label: 'Bad Action',
    };
    const res1 = await executeAction(invalidType);
    assert.equal(res1.success, false);
    assert.equal(res1.reason, 'VALIDATION_FAILED');

    const malformed = null;
    const res2 = await executeAction(malformed);
    assert.equal(res2.success, false);
    assert.equal(res2.reason, 'VALIDATION_FAILED');
  });

  // -----------------------------------------------------------------
  // 7. Unknown Section Handling
  // -----------------------------------------------------------------
  test('7. Unknown Section: Handles unavailable section gracefully without crashing', async () => {
    // Delete the element from DOM to simulate nonexistent section
    elementRegistry.delete('work');

    const action = {
      type: ACTION_TYPES.NAVIGATE_TO_SECTION,
      target: '#work',
      label: 'Go to Work',
    };

    const result = await executeAction(action, { skipDuplicateCheck: true });
    assert.equal(result.success, false);
    assert.equal(result.reason, 'SECTION_NOT_FOUND');
    assert.ok(result.message.includes('was not found'));
  });

  // -----------------------------------------------------------------
  // 8. Duplicate Action Prevention
  // -----------------------------------------------------------------
  test('8. Duplicate Prevention: Ignores rapid sequential duplicate executions within cooldown window', async () => {
    const action = {
      type: ACTION_TYPES.NAVIGATE_TO_SECTION,
      target: '#about',
      label: 'About Anup',
    };

    const first = await executeAction(action, { skipDuplicateCheck: false });
    assert.equal(first.success, true);

    const second = await executeAction(action, { skipDuplicateCheck: false });
    assert.equal(second.success, false);
    assert.equal(second.reason, 'DUPLICATE_ACTION_IGNORED');
  });

  // -----------------------------------------------------------------
  // 9. Security: External Redirect & JavaScript Protocol Rejection
  // -----------------------------------------------------------------
  test('9. Security Guard: Strictly blocks javascript: protocols and arbitrary external URLs', async () => {
    const jsInjection = {
      type: ACTION_TYPES.NAVIGATE_TO_ROUTE,
      target: 'javascript:window.alert("hacked")',
      label: 'Exploit Link',
    };
    const res1 = await executeAction(jsInjection);
    assert.equal(res1.success, false);
    assert.equal(res1.reason, 'VALIDATION_FAILED');

    const extRedirect = {
      type: ACTION_TYPES.NAVIGATE_TO_ROUTE,
      target: 'https://attacker.com/malicious',
      label: 'External Link',
    };
    const res2 = await executeAction(extRedirect);
    assert.equal(res2.success, false);
    assert.equal(res2.reason, 'VALIDATION_FAILED');
  });
});

