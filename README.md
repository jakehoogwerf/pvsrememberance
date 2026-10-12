# Remembrance Day 2026 — Teacher Hub

A single-page website for staff: lesson plans with built-in slides, quick low-prep lessons, a teacher briefing, activity ideas and child-friendly links. The assembly section is password-protected for staff.

## Put it online with GitHub Pages

1. Create a new repository on GitHub (it can be public).
2. Upload or push everything in this folder. The `private` folder is listed in `.gitignore`, so Git will skip it — keep it on your own computer.
3. In the repository, go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute or two your site appears at `https://<your-username>.github.io/<repository-name>/`.

If you upload through the GitHub website instead of using Git, **don't drag the `private` folder in** — the website upload does not read `.gitignore`.

## How the staff password works

The assembly slideshow, run sheet and checklist are encrypted inside `index.html` (AES-256 with a key made from the password). Without the password, the content can't be read, even from the page source. Once unlocked, it stays open until the browser tab is closed or someone presses **Lock again**.

Anyone who knows the password can open it, so treat it like any other staff password.

## Change the password or edit the assembly

You need [Node.js](https://nodejs.org) 18 or newer.

1. Edit `private/assembly.mjs` (for example, replace `[School name]` near the top).
2. From this folder, run:

   ```
   node tools/protect.mjs "YourNewPassword"
   ```

3. Commit and push the new `index.html`.

## Edit everything else

All other content is in `tools/index.template.html`. After changing it, run the same `protect.mjs` command to rebuild `index.html`. Don't edit `index.html` directly, as the next build overwrites it.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The built website — this is what GitHub Pages serves |
| `tools/index.template.html` | The page source, without the assembly content |
| `tools/protect.mjs` | Encrypts the assembly content and builds `index.html` |
| `private/assembly.mjs` | Staff-only assembly content (not uploaded to GitHub) |
