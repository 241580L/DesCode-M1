# DesCode

## How to Download into Working Directory (You should do this only once)
1. Open an empty folder in VSC (File > Open Folder > &lt;Folder Name>) **(Make sure folder is empty!)**
2. Press Ctrl+` to open terminal
3. Type `git clone https://github.com/241580L/DesCode-M1/`
4. Type `git remote add origin https://github.com/241580L/DesCode-M1/`
5. Type `cd server` to go to server directory
6. Open up a new terminal and `cd client` to go to client directory
7. Run `npm install` in both the server and client terminals to install dependencies

## How to Load Changes
1. Type `git fetch`
2. On left tab, go to Source Control (below the Search button, or press Ctrl+Shift+G)
3. Click on "Sync Changes" (The blue button with the arrows)

## How to Save Changes (Commit)

**NOTE:** Whatever you do, DO NOT commit the node_modules! Import them by typing `npm install`

<details>
  <summary>Click to expand dropdown</summary>

  Here is the content hidden inside the dropdown. It can include text, lists, links, and even code blocks.

</details>

### Using VSC:
1. On left tab, go to Source Control (below the Search button, or press Ctrl+Shift+G)
2. Go to CHANGES > Changes > (file you want to commit)
3. Click on + icon that says "Stage Changes"
4. Click on dropdown menu (v) next to "✓ Commit" button
5. Click on "Commit & Push"
6. Type a commit message
7. Click on ✓ that says "Accept Commit Message" (on top right)

**FYI:**
To view your remote connection, type `git remote -v` (no response means you have no connection)

If you pressed the "✓ Commit" button, your changes are commited to the local repository, but not on Github.
To save your changes to Github, perform **ONE** of the following steps:
* Click on "Sync Changes" (The blue button with the arrows, located in Source Control)
* OR type `git push origin main`

## Using GIT Console
1. Type `git add`
2. Type `git commit -m <message>`
3. Type `git push origin main`

## Basic Commands
```
SCENARIO                                      COMMAND
Create a new local git repository:            git init
View git status                               git status
Add file to git staging                       git add <filename>
Save changes to local repo (commit)           git commit -m "Your message"
View changes to the file                      git diff <filename>
Add remote connection                         git remote add origin <REMOTE_URL>
View remote connection                        git remote -v
Pull in changes                               git pull origin main
Push file to GitHub	                          git push origin main
Clone repo to local computer                  git clone <REMOTE_URL>
Fetch changes from remote repo                git fetch origin
Show all versions of the repo (log)           git log

┌─────────┐ ┌───────┐ ┌──────────┐ ┌────────┐
│ working │ │staging│ │  local   │ │ GitHub │
│directory│ │ area  │ │repository│ │(remote)│
└─────────┘ └───────┘ └──────────┘ └────────┘
     │----add--→|--commit-→|----push---→|

```