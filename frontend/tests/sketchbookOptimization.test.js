import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const BASE_DIR = path.resolve(process.cwd());
const MENG_DIR = path.join(BASE_DIR, "public", "landing-pages", "meng-to-sketchbook");
const HTML_FILE = path.join(BASE_DIR, "public", "landing-pages", "meng-to-sketchbook.html");
const PROVIDER_FILE = path.join(BASE_DIR, "src", "components", "my-images-section", "provider", "SketchbookProvider.tsx");
const LANDING_PAGES_FILE = path.join(BASE_DIR, "src", "components", "my-images-section", "shaders", "landing-pages", "LandingPages.tsx");
const INDEX_FILE = path.join(BASE_DIR, "src", "components", "my-images-section", "index.tsx");

test("Sketchbook Optimization & Health Suite", async (t) => {
    await t.test("1. Global State Isolation: No document background mutation in SketchbookProvider", () => {
        const providerCode = fs.readFileSync(PROVIDER_FILE, "utf-8");
        assert.doesNotMatch(
            providerCode,
            /document\.documentElement\.style\.backgroundColor/,
            "Should not mutate documentElement background color"
        );
        assert.doesNotMatch(
            providerCode,
            /document\.body\.style\.backgroundColor/,
            "Should not mutate body background color"
        );
    });

    await t.test("2. Unused Network Fetch Removed: No fetchTemplate in SketchbookProvider", () => {
        const providerCode = fs.readFileSync(PROVIDER_FILE, "utf-8");
        assert.doesNotMatch(
            providerCode,
            /fetchTemplate/,
            "Unused fetchTemplate function must be removed"
        );
        assert.doesNotMatch(
            providerCode,
            /meng-to-sketchbook\.html\?t=/,
            "Should not perform un-cached HTML template fetches"
        );
    });

    await t.test("3. Deterministic Hydration: Default states initialized without direct localStorage call", () => {
        const providerCode = fs.readFileSync(PROVIDER_FILE, "utf-8");
        assert.match(
            providerCode,
            /const \[pages, setPages\] = useState<SketchbookPage\[\]>\(INITIAL_SKETCHBOOK_PAGES\);/,
            "pages state should initialize deterministically with INITIAL_SKETCHBOOK_PAGES"
        );
        assert.match(
            providerCode,
            /isHydrated/,
            "isHydrated guard must be present for localStorage sync"
        );
    });

    await t.test("4. Asset Preservation & Optimization: All 15 plates preserved in originals/ and optimized", () => {
        const origDir = path.join(MENG_DIR, "originals");
        const mobileDir = path.join(MENG_DIR, "mobile");

        assert.ok(fs.existsSync(origDir), "originals/ directory must exist");
        assert.ok(fs.existsSync(mobileDir), "mobile/ directory must exist");

        const origFiles = fs.readdirSync(origDir).filter((f) => f.endsWith(".webp"));
        assert.equal(origFiles.length, 15, "All 15 original plates must be safely preserved");

        let totalOrigBytes = 0;
        let totalDesktopBytes = 0;
        let totalMobileBytes = 0;

        for (const f of origFiles) {
            const origStat = fs.statSync(path.join(origDir, f));
            const deskStat = fs.statSync(path.join(MENG_DIR, f));
            const mobStat = fs.statSync(path.join(mobileDir, f));

            totalOrigBytes += origStat.size;
            totalDesktopBytes += deskStat.size;
            totalMobileBytes += mobStat.size;

            assert.ok(
                deskStat.size <= origStat.size,
                `Desktop ${f} (${deskStat.size}) should be smaller or equal to original (${origStat.size})`
            );
            assert.ok(
                mobStat.size <= deskStat.size,
                `Mobile ${f} (${mobStat.size}) should be smaller or equal to desktop (${deskStat.size})`
            );
        }

        // Validate overall reduction
        assert.ok(
            totalDesktopBytes < 3.5 * 1024 * 1024,
            `Total desktop payload (${(totalDesktopBytes / 1024 / 1024).toFixed(2)} MB) should be under 3.5 MB`
        );
        assert.ok(
            totalMobileBytes < 1.2 * 1024 * 1024,
            `Total mobile payload (${(totalMobileBytes / 1024 / 1024).toFixed(2)} MB) should be under 1.2 MB`
        );
    });

    await t.test("5. Branding & Accessibility: Iframe title and metadata updated to Anup Rawat", () => {
        const landingCode = fs.readFileSync(LANDING_PAGES_FILE, "utf-8");
        assert.match(
            landingCode,
            /title="Anup Rawat — Visual Chronicles"/,
            "MengToSketchbookLandingPage should have proper Anup Rawat title"
        );

        const htmlContent = fs.readFileSync(HTML_FILE, "utf-8");
        assert.match(
            htmlContent,
            /<title>Visual Chronicles — Anup Rawat<\/title>/,
            "HTML document title must represent Visual Chronicles — Anup Rawat"
        );
        assert.doesNotMatch(
            htmlContent,
            /<title>Meng To<\/title>/,
            "Third-party Meng To title must be removed"
        );
    });

    await t.test("6. Responsive & Semantic Architecture: Semantic heading and 100dvh viewport in index.tsx", () => {
        const indexCode = fs.readFileSync(INDEX_FILE, "utf-8");
        assert.match(
            indexCode,
            /<h2 className="sr-only">Visual Chronicles/,
            "Semantic h2 for screen readers and SEO must be present"
        );
        assert.match(
            indexCode,
            /h-\[100dvh\]/,
            "Modern dynamic viewport height (100dvh) must be specified"
        );
    });
});

