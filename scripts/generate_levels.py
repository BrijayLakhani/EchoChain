# Flow-Free / Numberlink level generator.
#
# Approach (per thomasahle/numberlink & HoustonWeHaveABug/FlowFree):
#   1. Build a random Hamiltonian path covering the whole grid (snake + backbite
#      shuffle) — every cell visited once.
#   2. Cut it into K contiguous segments → each segment is a colour whose two
#      ends become the endpoints. This GUARANTEES the puzzle is solvable and the
#      solution tiles the whole grid.
#   3. Quality filters: endpoints not adjacent (non-trivial), sane path lengths.
#   4. Uniqueness check (small grids) via a pruned backtracking solver so the
#      puzzle has exactly one solution.
#
# Output: src/engine/levels.ts with 50 progressive levels.

import random, sys
sys.setrecursionlimit(100000)

KEYS = ['R','B','G','Y','O','P','T','K','N','W']

# ── Hamiltonian path over n×n ────────────────────────────────────
def snake(n):
    p=[]
    for r in range(n):
        cols = range(n) if r%2==0 else range(n-1,-1,-1)
        for c in cols: p.append((r,c))
    return p

def nbrs(cell,n):
    r,c=cell
    for dr,dc in ((-1,0),(1,0),(0,-1),(0,1)):
        nr,nc=r+dr,c+dc
        if 0<=nr<n and 0<=nc<n: yield (nr,nc)

def backbite(path,n,iters):
    pos={cell:i for i,cell in enumerate(path)}
    for _ in range(iters):
        if random.random()<0.5:
            path.reverse(); pos={cell:i for i,cell in enumerate(path)}
        head=path[-1]
        cand=[nb for nb in nbrs(head,n) if pos[nb]<len(path)-2]
        if not cand: continue
        nb=random.choice(cand); i=pos[nb]
        path[i+1:]=path[i+1:][::-1]
        for j in range(i+1,len(path)): pos[path[j]]=j
    return path

def ham_path(n,seed):
    random.seed(seed)
    p=snake(n)
    backbite(p,n,iters=n*n*8)
    return p

# ── cut into k contiguous segments (balanced-ish, all len>=3 where possible) ──
def segment(path,k):
    total=len(path)
    for _ in range(200):
        cuts=sorted(random.sample(range(1,total),k-1))
        bounds=[0]+cuts+[total]
        segs=[path[bounds[i]:bounds[i+1]] for i in range(k)]
        lens=[len(s) for s in segs]
        if min(lens)>=2 and sum(1 for l in lens if l<3)<=1:
            return segs
    # fallback even split
    step=total//k
    return [path[i*step:(i+1)*step] for i in range(k-1)]+[path[(k-1)*step:]]

def adjacent(a,b):
    return abs(a[0]-b[0])+abs(a[1]-b[1])==1

# ── pruned Flow solver: count solutions up to `cap` ──────────────
def count_solutions(n, dots, cap=2):
    # dots: list of (frm,to). grid[r][c] = color idx or -1.
    grid=[[-1]*n for _ in range(n)]
    ends={}
    for i,(f,t) in enumerate(dots):
        grid[f[0]][f[1]]=i; grid[t[0]][t[1]]=i
        ends[f]=i; ends[t]=i
    k=len(dots)
    goal=[t for (f,t) in dots]
    start=[f for (f,t) in dots]
    free=[ [grid[r][c]==-1 for c in range(n)] for r in range(n)]
    free_count=sum(r.count(True) for r in free)

    sols=[0]

    def stranded():
        # any free cell with no free neighbour and not adjacent to a usable head?
        for r in range(n):
            for c in range(n):
                if grid[r][c]==-1:
                    ok=False
                    for nr,nc in nbrs((r,c),n):
                        if grid[nr][nc]==-1: ok=True;break
                        # adjacent to a path head that can still grow into it
                    if not ok:
                        # could still be filled only if a neighbouring head extends here;
                        # heads are tracked separately, approximate: allow if neighbour is an active head cell
                        for nr,nc in nbrs((r,c),n):
                            if (nr,nc) in heads.values():
                                ok=True;break
                    if not ok: return True
        return False

    heads={i:start[i] for i in range(k)}
    done=[False]*k

    def dfs(ci, fc):
        if sols[0]>=cap: return
        if ci==k:
            if fc==0: sols[0]+=1
            return
        if done[ci]:
            dfs(ci+1,fc); return
        head=heads[ci]; tgt=goal[ci]
        for nr,nc in nbrs(head,n):
            if (nr,nc)==tgt:
                # connect (path may close now)
                done[ci]=True; heads[ci]=tgt
                dfs(ci+1,fc)
                done[ci]=False; heads[ci]=head
                if sols[0]>=cap: return
            elif grid[nr][nc]==-1:
                grid[nr][nc]=ci; heads[ci]=(nr,nc)
                if not _quick_dead(nr,nc):
                    dfs(ci, fc-1)
                grid[nr][nc]=-1; heads[ci]=head
                if sols[0]>=cap: return

    def _quick_dead(r,c):
        # prune: a free cell adjacent that now has all non-free neighbours and
        # isn't a target → can never be filled.
        for nr,nc in nbrs((r,c),n):
            if grid[nr][nc]==-1:
                cnt=0
                for ar,ac in nbrs((nr,nc),n):
                    if grid[ar][ac]==-1: cnt+=1
                    elif (ar,ac) in heads.values(): cnt+=1
                if cnt==0 and (nr,nc) not in goal: return True
        return False

    dfs(0, free_count)
    return sols[0]

# ── build one level ──────────────────────────────────────────────
def make_level(n, k, seed, check_unique):
    for attempt in range(60):
        p=ham_path(n, seed*1000+attempt)
        segs=segment(p,k)
        dots=[(s[0], s[-1]) for s in segs]
        # filter: endpoints not adjacent
        if any(adjacent(f,t) for f,t in dots): continue
        # build solution grid
        grid=[['']*n for _ in range(n)]
        for i,s in enumerate(segs):
            for (r,c) in s: grid[r][c]=KEYS[i]
        if check_unique:
            if count_solutions(n, dots, cap=2)!=1: continue
        return dots, grid
    # relaxed fallback (solvable, maybe trivial)
    p=ham_path(n, seed*1000+999); segs=segment(p,k)
    dots=[(s[0], s[-1]) for s in segs]
    grid=[['']*n for _ in range(n)]
    for i,s in enumerate(segs):
        for (r,c) in s: grid[r][c]=KEYS[i]
    return dots, grid

# ── progression: 50 levels ───────────────────────────────────────
TITLES = [
 'First Flow','Two Lines','Corner Turn','Crossroads','Little Loop','Side Step','Twin Paths','Zig Zag','Box In','Five Ways',
 'River Bend','Tangle','Knot','Switchback','Detour','Spiral','Weave','Lattice','Coil','Maze Start',
 'Crosswind','Braid','Snarl','Labyrinth','Long Haul','Gridlock','Tight Squeeze','Overpass','Junction','Crossover',
 'Deep Dive','Web','Mesh','Puzzle Box','Entangled','Crisscross','Convolution','The Gauntlet','Serpentine','Big Knot',
 'Floodgate','Conduit','Plexus','Quagmire','The Weaver','Gordian','Pipework','Grand Maze','Master Flow','Flow Master',
 'Fresh Start','Loop Back','Twist','Hairpin','Cross Lane','Ravel','Threadwork','Backtrack','Snake Pit','Tenfold',
 'Crossfire','Meander','Filigree','Pretzel','Long Game','Deadlock','Squeeze Play','Flyover','Interchange','Tangent',
 'Abyss','Cobweb','Network','Brainbox','Twisted','Hatchwork','Spaghetti','The Trial','Sidewinder','Hard Knot',
 'Sluice','Channel','Nexus','Mire','Loomwork','Tangle Knot','Plumbline','Great Maze','Pipe Sage','Grandmaster',
 'Final Bend','Twin Coils','Vortex','Riddle','Crosshatch','Snarl Up','Maelstrom','Endgame','The Summit','Dotwise',
]

def difficulty_for(level):
    if level<=15: return 'easy'
    if level<=40: return 'medium'
    if level<=75: return 'hard'
    return 'expert'

def grid_for(level):
    if level<=10:  return 5
    if level<=25:  return 6
    if level<=45:  return 7
    if level<=70:  return 8
    return 9

def colors_for(level, n):
    # scale colours up as you progress, capped by palette size
    base = {5:3, 6:4, 7:5, 8:6, 9:7}[n]
    bump = ((level-1) % 25) // 9   # 0..2 within each grid tier
    return min(len(KEYS), base + bump)

def emit(level):
    n=grid_for(level)
    k=colors_for(level,n)
    title=TITLES[level-1]
    diff=difficulty_for(level)
    unique = n<=6   # full uniqueness for small grids; solvable+non-trivial for big
    dots,grid=make_level(n,k,seed=level, check_unique=unique)
    dl='\n'.join(f"      {{key:'{KEYS[i]}', from:[{f[0]},{f[1]}], to:[{t[0]},{t[1]}]}}," for i,(f,t) in enumerate(dots))
    rows='\n'.join("      ["+','.join(f"'{grid[r][c]}'" for c in range(n))+"]," for r in range(n))
    return (f"  {{\n    id: {level}, title: '{title}', difficulty: '{diff}', gridSize: {n},\n"
            f"    dots: [\n{dl}\n    ],\n    solution: [\n{rows}\n    ],\n  }},")

def main():
    blocks=[emit(l) for l in range(1,101)]
    out="import {FlowLevel} from './types';\n\nexport const LEVELS: FlowLevel[] = [\n\n"+"\n\n".join(blocks)+"\n];\n"
    open(r'C:\Users\lakha\EchoChain\src\engine\levels.ts','w',encoding='utf-8').write(out)
    print(f'wrote {len(blocks)} levels')

if __name__=='__main__':
    main()
