# DesCode

## How to Download (You should do this only once)
1. Open an empty folder in VSC (File > Open Folder > 
2. `git clone https://github.com/241580L/DesCode/`
3. `git remote add origin https://github.com/241580L/DesCode/`

## How to Load Changes
1. `git fetch`
2. On left tab, go to Source Control (below the Search button, or press Ctrl+Shift+G)
3. Click on "Sync Changes" (The blue button with the arrows)

## How to Save Changes (Commit)
**NOTE:** `git remote -v` to view remote connection (no response means you have no connection)

1. `git push origin main`

## Basic Commands
```
SCENARIO                                      COMMAND
Create a new local git repository:            git init
View git status                               git status
Add file to git staging                       git add <filename>
Save changes to local repo (commit)           git commit -m "Your message"
View changes to the file                      git diff <filename>
Add remote connection                         git remote add origin <REMOTE_URL>
Pull in changes                               git pull origin main
Push file to GitHub	                          git push origin main
Clone repo to local computer                  git clone <REMOTE_URL>
Fetch changes from remote repo                git fetch origin
Show all versions of the repo (log)           git log
```
┌─┐─│
│working  staging
│directory area
└┘
-commit→
