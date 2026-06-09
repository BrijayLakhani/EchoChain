import json, math, os, random

W = H = 400
CX = CY = 200
FR = 30
OP = 48  # ~1.6s
N = 26

COLORS = [
    [0.357,0.788,0.655],[0.357,0.663,0.941],[1.0,0.482,0.420],
    [1.0,0.761,0.294],[0.608,0.482,0.910],[1.0,0.561,0.784],[0.184,0.769,0.788],
]

def kf(frames):
    return {"a":1,"k":frames}

layers = []
random.seed(7)
for i in range(N):
    ang = (2*math.pi*i/N) + random.uniform(-0.2,0.2)
    rad = random.uniform(110,175)
    ex = CX + math.cos(ang)*rad
    ey = CY + math.sin(ang)*rad
    delay = random.randint(0,5)
    life = random.randint(26,38)
    end = min(OP, delay+life)
    col = random.choice(COLORS)
    size = random.uniform(14,26)
    rounded = random.random() > 0.5
    # position keyframes: burst out with slight gravity
    pos = kf([
        {"t":delay,"s":[CX,CY],"i":{"x":[0.2],"y":[1]},"o":{"x":[0.4],"y":[0]}},
        {"t":end,"s":[ex,ey+30]},
    ])
    opa = kf([
        {"t":delay,"s":[0]},
        {"t":delay+3,"s":[100]},
        {"t":end,"s":[0]},
    ])
    scl = kf([
        {"t":delay,"s":[40,40]},
        {"t":delay+5,"s":[100,100]},
        {"t":end,"s":[70,70]},
    ])
    rot = kf([
        {"t":delay,"s":[0]},
        {"t":end,"s":[random.choice([-1,1])*random.randint(180,540)]},
    ])
    shape = {
        "ty":"rc" if not rounded else "el",
        "p":{"a":0,"k":[0,0]},
        "s":{"a":0,"k":[size,size]},
        "r":{"a":0,"k":4} if not rounded else None,
    }
    if shape["r"] is None: del shape["r"]
    grp = {
        "ty":"gr","it":[
            shape,
            {"ty":"fl","c":{"a":0,"k":col+[1]},"o":{"a":0,"k":100}},
            {"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},
             "s":scl,"r":rot,"o":{"a":0,"k":100}},
        ]
    }
    layers.append({
        "ddd":0,"ind":i+1,"ty":4,"nm":f"p{i}",
        "ks":{"o":opa,"r":{"a":0,"k":0},"p":pos,
              "a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]}},
        "shapes":[grp],"ip":0,"op":OP,"st":0,"bm":0,
    })

doc = {"v":"5.7.0","fr":FR,"ip":0,"op":OP,"w":W,"h":H,"nm":"win","ddd":0,
       "assets":[],"layers":layers}

out = os.path.join(os.path.dirname(__file__),'..','src','assets')
os.makedirs(out, exist_ok=True)
with open(os.path.join(out,'win.json'),'w') as f:
    json.dump(doc,f)
print('wrote win.json', len(layers), 'layers')
