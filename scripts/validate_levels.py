import re, sys

src = open(r'C:\Users\lakha\EchoChain\src\engine\levels.ts', encoding='utf-8').read()

# Split into level blocks by "id:"
blocks = re.split(r'\n\s*\{\s*\n?\s*id:', src)
levels = []
for b in blocks[1:]:
    b = 'id:' + b
    mid = re.search(r'id:\s*(\d+)', b)
    mtitle = re.search(r"title:\s*'([^']+)'", b)
    mgrid = re.search(r'gridSize:\s*(\d+)', b)
    if not (mid and mgrid): continue
    lid = int(mid.group(1)); n = int(mgrid.group(1)); title = mtitle.group(1) if mtitle else '?'
    dots = []
    for dm in re.finditer(r"\{key:\s*'([^']+)',\s*from:\s*\[(\d+),\s*(\d+)\],\s*to:\s*\[(\d+),\s*(\d+)\]\}", b):
        dots.append((dm.group(1), (int(dm.group(2)),int(dm.group(3))), (int(dm.group(4)),int(dm.group(5)))))
    # solution grid: capture rows of ['X','Y',...]
    sol_block = re.search(r'solution:\s*\[(.*?)\]\s*,?\s*\}', b, re.S)
    grid = []
    if sol_block:
        for row in re.finditer(r"\[([^\[\]]*)\]", sol_block.group(1)):
            cells = re.findall(r"'([^']+)'", row.group(1))
            if cells: grid.append(cells)
    levels.append((lid,title,n,dots,grid))

def ham_exists(cells, start, goal):
    cellset = set(cells); total=len(cellset); visited=set();
    sys.setrecursionlimit(10000)
    def dfs(r,c):
        visited.add((r,c))
        if (r,c)==goal:
            if len(visited)==total: return True
        else:
            for dr,dc in ((-1,0),(1,0),(0,-1),(0,1)):
                nr,nc=r+dr,c+dc
                if (nr,nc) in cellset and (nr,nc) not in visited:
                    if dfs(nr,nc): return True
        visited.discard((r,c))
        return False
    return dfs(start[0],start[1])

bad=[]
for lid,title,n,dots,grid in levels:
    issues=[]
    if len(grid)!=n or any(len(r)!=n for r in grid):
        issues.append(f'grid not {n}x{n} (got {len(grid)} rows)')
    else:
        # coverage: every cell belongs to some color, each color region matches a dot
        for key,frm,to in dots:
            cells=[(r,c) for r in range(n) for c in range(n) if grid[r][c]==key]
            if not cells: issues.append(f'{key}: no cells'); continue
            if grid[frm[0]][frm[1]]!=key or grid[to[0]][to[1]]!=key:
                issues.append(f'{key}: endpoint not on its color')
            if not ham_exists(cells, frm, to):
                issues.append(f'{key}: NO Hamiltonian path {frm}->{to} over {len(cells)} cells')
        # any cell color without a dot?
        colors_in_grid={grid[r][c] for r in range(n) for c in range(n)}
        dot_keys={d[0] for d in dots}
        extra=colors_in_grid-dot_keys
        if extra: issues.append(f'colors without dots: {extra}')
    if issues:
        bad.append((lid,title,issues))

print(f'Checked {len(levels)} levels')
if not bad:
    print('ALL SOLVABLE ✓')
else:
    for lid,title,iss in bad:
        print(f'L{lid} "{title}": ' + ' | '.join(iss))
