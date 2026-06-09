import re, random

PATH = r'C:\Users\lakha\EchoChain\src\engine\levels.ts'
src = open(PATH, encoding='utf-8').read()

KEYS = ['R','B','G','Y','O','P','T','K','N','W']

def snake(n):
    p=[]
    for r in range(n):
        cols = range(n) if r%2==0 else range(n-1,-1,-1)
        for c in cols: p.append((r,c))
    return p

def neighbors(cell,n):
    r,c=cell
    for dr,dc in ((-1,0),(1,0),(0,-1),(0,1)):
        nr,nc=r+dr,c+dc
        if 0<=nr<n and 0<=nc<n: yield (nr,nc)

def backbite(path,n,iters):
    pos={cell:i for i,cell in enumerate(path)}
    for _ in range(iters):
        # operate on a random end
        if random.random()<0.5:
            path.reverse()
            pos={cell:i for i,cell in enumerate(path)}
        head=path[-1]
        cand=[nb for nb in neighbors(head,n) if pos[nb]<len(path)-1 and pos[nb]!=len(path)-2]
        if not cand: continue
        nb=random.choice(cand)
        i=pos[nb]
        # reverse the segment after nb
        path[i+1:]=path[i+1:][::-1]
        for j in range(i+1,len(path)): pos[path[j]]=j
    return path

def gen(n,k,seed):
    random.seed(seed)
    best=None
    for attempt in range(40):
        p=snake(n)
        backbite(p,n,iters=n*n*6)
        # cut into k contiguous segments, each length>=1, prefer balanced
        total=len(p)
        # random cut points
        cuts=sorted(random.sample(range(1,total),k-1))
        bounds=[0]+cuts+[total]
        segs=[p[bounds[i]:bounds[i+1]] for i in range(k)]
        if all(len(s)>=2 for s in segs[:-1]) and len(segs[-1])>=1:
            best=segs; break
    if best is None:
        # fallback: even split of snake
        p=snake(n); total=len(p); step=total//k
        best=[p[i*step:(i+1)*step] for i in range(k-1)]+[p[(k-1)*step:]]
    return best

def emit(level_id,title,difficulty,n,k,seed):
    segs=gen(n,k,seed)
    grid=[['' for _ in range(n)] for _ in range(n)]
    dots=[]
    for i,seg in enumerate(segs):
        key=KEYS[i]
        for (r,c) in seg: grid[r][c]=key
        frm=seg[0]; to=seg[-1]
        dots.append((key,frm,to))
    # build TS
    dl='\n'.join(
        f"      {{key:'{k_}', from:[{f[0]},{f[1]}], to:[{t[0]},{t[1]}]}}," for k_,f,t in dots)
    rows='\n'.join("      ["+','.join(f"'{grid[r][c]}'" for c in range(n))+"]," for r in range(n))
    block=(f"  {{\n    id: {level_id}, title: '{title}', difficulty: '{difficulty}', gridSize: {n},\n"
           f"    dots: [\n{dl}\n    ],\n    solution: [\n{rows}\n    ],\n  }},")
    return block

# Parse target levels' meta from current file
def meta(level_id):
    m=re.search(r"\{\s*id:\s*"+str(level_id)+r",\s*title:\s*'([^']+)',\s*difficulty:\s*'([^']+)',\s*gridSize:\s*(\d+),(.*?)\n\s*\},", src, re.S)
    title,diff,n,body=m.group(1),m.group(2),int(m.group(3)),m.group(4)
    k=len(re.findall(r"\{key:", body))
    return title,diff,n,k

targets=[15,17,18,19,20]
new_src=src
for lid in targets:
    title,diff,n,k=meta(lid)
    block=emit(lid,title,diff,n,k,seed=1000+lid)
    pat=re.compile(r"  \{\s*\n\s*id:\s*"+str(lid)+r",.*?\n  \},", re.S)
    new_src,cnt=pat.subn(lambda _:block, new_src, count=1)
    print(f'L{lid} {title} {n}x{n} k={k} replaced={cnt}')

open(PATH,'w',encoding='utf-8').write(new_src)
print('written')
