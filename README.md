# DesCode

## How to Save Changes (Commit)

1. Go to Source Control
2. Go to CHANGES > Changes > (file you want to commit)
3. Click on + icon that says "Stage Changes"
4. Click on dropdown menu (v) next to "✓ Commit" button
5. Click on "Commit & Push"
6. Type a commit message
7. Click on ✓ that says "Accept Commit Message" (on top right)

## Basic Commands
```
Scenario	                                    Command
Create a new local git repository:              git init
View git status	                                git status
Add file to git staging	                        git add <filename>
Save changes to local repo (commit)	            git commit -m "Your message"
View changes to the file                      	git diff <filename>
Add remote connection	                        git remote add origin <REMOTE_URL>
Pull in changes	                                git pull origin main
Push file to GitHub	                            git push origin main
Clone repo to local computer                  	git clone <REMOTE_URL>
Fetch changes from remote repo	                git fetch origin
Show all versions of the repo (log)	            git log
```

## Erreurs
`ConnectionRefusedError:` run in VSC