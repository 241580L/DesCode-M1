import re
# run in pycharm
# TODO: delete on 30 July 2025

def ReadFile(path,rls=False,addname=True):
    global REPL, LEN1
    try:
        with open(path,"r",encoding="utf-8") as F:
            z = F.read()
            LEN1 += len(z)
            if rls:
                for k in REPL:
                    z = re.sub(k,REPL[k],z)
            print(f"Length of {path}: {len(z)}")
    except IOError:
        print(f"Path {path} does not exist.")
        z = ""
    return f"{f'// {path}\n' if addname else ''}{z}"

def ReturnRels(RELS,file=False,lBYl=False):
    global LEN1
    w = [ReadFile(ROOT+rel,True) for rel in RELS]
    print("-= START FEED =-")
    if lBYl:
        for e in w:
            print(e)
    w = "\n\n".join(w)
    if not lBYl:
        print(w)
    if file:
        with open("Paste2Perplexity.txt","w",encoding="utf-8") as f:
            f.write(f"{w}")
    print("-= END FEED =-\n\n")
    try:
        p = len(w)/LEN1
        print(f"Original Length: {LEN1}\nMinified length: {len(w)}\n{100*p:.2f}% of original size\n{40000/p:.0f}")
    except ZeroDivisionError:
        print("Totally empty.")
    

if __name__=="__main__":
    CS = "client/src/"
    S = "server/"
    LEN1 = 0
    ROOT = "./"
    #Change if necessary
    REPL = {r"\n\s+": "\n",
            r"\s*\/\/(?!\s*(client\/|server\/)).*": "",
            # ^Remove comments except those that state the directories
            # r":[\n\s]": ":",
            # r";[\n\s]": ";",
            r",[\n\s]": ",",
            r"\s*([<=>?:;&|{}()]+?)\s*": r"\1",
            r"[\n\s]/>": "/>",
            # r",}": "}",
            r"{\/\*.*\*\/}": ""}
    ALL = [e.strip() for e in f'''{CS}pages/Home.jsx
{CS}pages/Register.jsx
{CS}pages/Login.jsx
{CS}pages/Reviews.jsx
{CS}pages/Review.jsx
{CS}pages/EditReview.jsx
{CS}pages/AddReview.jsx
{CS}pages/Admin.jsx
{CS}components/AdminNavbar.jsx
{CS}components/StarRating.jsx
{CS}components/ConfirmModal.jsx
{CS}pages/EditProfile.jsx
{CS}pages/ManageUsers.jsx
{CS}App.jsx
{CS}http.js
{S}models/Reviews.js
{S}models/ReviewReply.js
{S}models/User.js
{S}models/ReviewVote.js
{S}models/ReplyVote.js
{S}routes/reviews.js
{S}routes/user.js
{S}routes/file.js
{S}index.js'''.split("\n")]
    REV = [e.strip() for e in f'''{CS}pages/Home.jsx
{CS}pages/Reviews.jsx
{CS}pages/Review.jsx
{CS}pages/Admin.jsx
{CS}components/AdminNavbar.jsx
{CS}components/StarRating.jsx
{CS}App.jsx
{CS}http.js
{S}models/Reviews.js
{S}models/ReviewReply.js
{S}models/User.js
{S}models/ReviewVote.js
{S}models/ReplyVote.js
{S}routes/reviews.js
{S}routes/user.js
{S}index.js'''.split("\n")]
    EPR = [e.strip() for e in f'''{CS}pages/Home.jsx
{CS}pages/Register.jsx
{CS}pages/Login.jsx
{CS}pages/Admin.jsx
{CS}components/AdminNavbar.jsx
{CS}components/StarRating.jsx
{CS}components/ConfirmModal.jsx
{CS}pages/EditProfile.jsx
{CS}App.jsx
{CS}http.js
{S}models/Reviews.js
{S}models/ReviewReply.js
{S}models/User.js
{S}models/ReviewVote.js
{S}models/ReplyVote.js
{S}routes/reviews.js
{S}routes/user.js
{S}routes/file.js
{S}index.js'''.split("\n")]
    '''
    w = "\n\n".join(ReadFile(ROOT+rel,True) for rel in RELS)
    p = len(w)/LEN1
    print(w)
    print(f"Original Length: {LEN1}\nMinified length: {len(w)}\n{100*p:.2f}% of original size\n{40000/p:.0f}")
    '''
    ReturnRels(REV,True)
