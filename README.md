# A new chapter — Uncle Rohana

A personal, black-and-gold automotive greeting, built with React, TypeScript, Vite, Three.js, React Three Fiber and Drei. All visuals are original geometry/CSS; there is no third-party vehicle model, photograph, audio, external font or runtime API dependency.

## Run

Requires Node.js 22.12+ (Node 24 was used here).

```powershell
npm ci
npm run dev
```

Open the URL Vite prints, normally http://127.0.0.1:5173/. To check production: `npm run build`, then `npm run preview`.

## Personalize

- Edit `src/config.ts` for the recipient, vehicle name, message and signature.
- Add the real photograph as `public/images/uncle-rohana.jpg`. The monogram is the intentional fallback; no invented photo is included.
- Add a legally obtained, self-contained model as `public/models/vezel.glb`. It is centered/scaled automatically. Set `modelRotation` in `src/config.ts` if its orientation needs adjustment.
- Restart Vite after adding assets; rebuild/redeploy for production. No component changes are necessary. Missing assets are detected at build time, avoiding requests for nonexistent files. An invalid GLB falls back to the original crossover, and missing WebGL falls back to a CSS silhouette.
- A replacement model should be optimized for mobile (ideally below 10 MB), and any required author/licence attribution must be added visibly to the site before publication.

The preferred [Sketchfab model](https://sketchfab.com/3d-models/honda-vezel-ehev-rs-hr-v-bf835b5a5e6f4b79a134db5156992cf0) returned HTTP 403 during investigation. Its download availability and licence could not be verified. No model was downloaded or extracted. The included crossover is an illustrative original sculpture, **not an actual Honda Vezel model**. Verify the creator's licence and use the official download only if authorized.

## Checks

```powershell
npx playwright install chromium
npm test
npm run build
```

Playwright covers desktop/mobile opening and replay, rotation, horizontal overflow, missing-photo/model defaults, reduced motion and a simulated WebGL-unavailable device. It does not validate a replacement GLB or real-device GPU performance. The viewer is lazy-loaded; the Three.js bundle is substantial. DPR is capped at 1.5, idle rendering uses demand mode, and automatic rotation is opt-in. No sound is included.

## Publish to GitHub and Vercel

No repository remote existed initially. GitHub CLI and Vercel CLI were unavailable, and no Vercel authentication file was found. Public deployment requires your account sign-in.

1. Sign in to GitHub and create an empty **public** repository called `rohana-vezel-congratulations`. Leave its README/license/gitignore unchecked because this project already contains files.
2. Copy the HTTPS repository address GitHub gives you, then run:

```powershell
git remote add origin YOUR_COPIED_REPOSITORY_URL
git push -u origin main
```

Git may open your browser for authentication. Do not put tokens into these files.

3. Sign in at https://vercel.com/new, choose **Import Git Repository**, and import the new GitHub repository.
4. Select **Vite**, project root `./`, build command `npm run build`, output directory `dist`. No environment variables are needed. These settings are also in `vercel.json`.
5. Choose **Deploy**. Open the returned production URL and check the envelope/reveal on your phone before sending that URL through WhatsApp. Further pushes to `main` redeploy automatically.

For a richer WhatsApp link preview, replace `public/social-card.svg` with a 1200×630 PNG/JPG and update `og:image` in `index.html` to its absolute production URL. Add `og:url` after the deployment URL is known. SVG sharing support varies by service; no invented production URL is configured.

## Structure

`Envelope.tsx` handles the opening, `Showroom.tsx` handles model loading/controls and scene fallbacks, `Car.tsx` defines the original sculpture, `PersonalNote.tsx` handles the portrait and letter, and `App.tsx` ties together the reveal and replay. `styles.css` contains the responsive visual system and reduced-motion rules.
