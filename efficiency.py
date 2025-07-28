import re
# run in pycharm
# TODO: delete on 30 July 2025

def ReadFile(path,rls=False):
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
    return z

def ReturnRels(RELS,file=False,lBYl=False):
    w = [ReadFile(ROOT+rel,True) for rel in RELS]
    print("-= START FEED =-")
    if lBYl:
        for e in w:
            print(e)
    w = "\n\n".join(w)
    if not lBYl:
        print(w)
    if file:
        with open("Paste2Perplexity.txt","w") as f:
            f.write(f"{w}")
    print("-= END FEED =-\n\n")
    p = len(w)/LEN1
    print(f"Original Length: {LEN1}\nMinified length: {len(w)}\n{100*p:.2f}% of original size\n{40000/p:.0f}")

if __name__=="__main__":
    LEN1 = 0
    ROOT = "./"
    #Change if necessary
    REPL = {r"\n\s+": "\n",
            r"\s*\/\/(?!\s*(client\/|server\/)).*": "",
            # ^Remove comments except those that state the directories
            # r":[\n\s]": ":",
            # r";[\n\s]": ";",
            r",[\n\s]": ",",
            r"\s*([<=>?:;&|{}()\"']+?)\s*": r"\1",
            r"[\n\s]/>": "/>",
            r",}": "}",
            r"{\/\*.*\*\/}": ""}
    ALL = [e.strip() for e in '''
client/src/pages/Home.jsx
client/src/pages/Register.jsx
client/src/pages/Login.jsx
client/src/pages/Reviews.jsx
client/src/App.jsx
server/models/Admin.js
server/models/Reviews.js
server/models/ReviewReply.js
server/models/User.js
server/models/ReviewVote.js
server/models/ReplyVote.js
server/routes/reviews.js
server/routes/user.js
server/routes/file.js
server/index.js'''.split("\n")]
    REV = [e.strip() for e in '''
client/src/pages/Reviews.jsx
client/src/App.jsx
server/models/Admin.js
server/models/Reviews.js
server/models/ReviewReply.js
server/models/User.js
server/models/ReviewVote.js
server/models/ReplyVote.js
server/routes/reviews.js
server/routes/user.js
server/tests/reviewVote.test.js
server/index.js
server/package.json'''.split("\n")]
    '''
    w = "\n\n".join(ReadFile(ROOT+rel,True) for rel in RELS)
    p = len(w)/LEN1
    print(w)
    print(f"Original Length: {LEN1}\nMinified length: {len(w)}\n{100*p:.2f}% of original size\n{40000/p:.0f}")
    '''
    ReturnRels(REV,True)
