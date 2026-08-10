# Running this repo — laptop, shared with others, or on a tablet

This repo has two parts: the **curriculum** (markdown labs in `labs/`) and a
**learning app** (`webapp/`) that presents it with navigation and progress tracking.
Here's how to run it in every situation.

---

## A. On your own computer (Mac / Linux / Windows)

You need a browser and either Python or Node (for the tiny local web server).

```bash
# clone it
git clone <your-repo-url> devops && cd devops

# launch the app
cd webapp
./start.sh            # macOS / Linux / WSL / Codespaces
# start.command       # macOS double-click alternative
# start.bat           # Windows (double-click)
```

Then open `http://localhost:8778`. That's just the reader — you run the actual
lab commands in your terminal (Docker + LocalStack + AWS CLI, per `SETUP.md`).

No Python/Node? Any static server works, e.g. `npx serve webapp`.

---

## B. Share it so anyone can use it (GitHub Pages — free hosting)

Because the app is 100% static, GitHub Pages can host it with no build step.
Anyone then just opens a URL — no clone, no server.

1. Push this repo to GitHub (public).
2. Make sure `webapp/content.js` is committed (it is — it's the bundled lessons).
3. Repo **Settings → Pages** → Source: "Deploy from a branch" → branch `main`,
   folder `/ (root)`.
4. Wait ~1 minute. Your app is live at:
   `https://<your-username>.github.io/<repo-name>/webapp/`
5. Share that link. Each visitor gets their own progress (saved in their browser).

Updating content later: edit a lab, run `node webapp/build-content.js` to
regenerate `content.js`, commit, push. Pages redeploys automatically.

> Note: the app loads its markdown renderer and syntax highlighter from a CDN, so
> the hosted version needs internet (any normal browser has it). For a fully
> offline build, ask and I'll vendor those two files into the repo.

---

## C. On an Android tablet (or iPad)

A tablet can't run Docker/LocalStack locally, so split it in two: **read in the
browser, run the labs in a cloud environment that also runs in the browser.**

### Read the app on the tablet
Use the GitHub Pages link from section B, opened in Chrome. The app is now
responsive — the sidebar collapses into a ☰ menu, and it reads well on a tablet
in portrait or landscape. Progress saves in the tablet's browser.

### Do the labs on the tablet — GitHub Codespaces (recommended)
Codespaces gives you a full Linux machine with Docker, running inside your
browser. Free tier: 60 hours/month. It works on a tablet.

1. On GitHub, open your repo → green **Code** button → **Codespaces** tab →
   **Create codespace on main**.
2. It reads `.devcontainer/devcontainer.json` in this repo and automatically
   installs Docker, AWS CLI, Terraform, Node, Python, and kubectl.
3. When it opens (VS Code in the browser), use the built-in terminal to run the
   lab commands. LocalStack works here:
   ```bash
   docker run -d -p 4566:4566 localstack/localstack
   awslocal s3 mb s3://test         # (awslocal is preinstalled by the devcontainer)
   ```
4. You can even run the learning app *inside* Codespaces: `cd webapp && ./start.sh`,
   then open the forwarded port 8778 — so reading and doing happen in one browser,
   on the tablet.

### Alternative: SSH into a cloud VM
Install an SSH app (e.g. Termius) on the tablet and connect to a small cloud
Linux box (a free-tier EC2 instance, or any VPS). Do the labs there. The tablet
is just the keyboard and screen.

### What does NOT work on the tablet
Running Docker or LocalStack directly on Android/iPadOS. That's why we push the
heavy lifting to Codespaces or a VM. Everything else — reading, editing, git,
even the AWS CLI via a cloud shell — is fine.

---

## Quick decision guide

| You are… | Read the lessons | Run the labs |
|---|---|---|
| On your laptop | `webapp/start.sh` locally | Your own terminal (Docker + LocalStack) |
| Sharing with a class | Host on GitHub Pages | Each learner: laptop or Codespaces |
| On an Android tablet | GitHub Pages link in Chrome | GitHub Codespaces (browser) or SSH to a VM |
| Offline | needs the offline build (ask) | local Docker only |
