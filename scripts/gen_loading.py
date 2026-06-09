import json, os

W = H = 200
FR = 30
OP = 36  # 1.2s loop
CY = 110
COLORS = [[0.357,0.788,0.655],[0.357,0.663,0.941],[0.608,0.482,0.910]]
GAP = 46
START_X = W/2 - GAP

def circle_layer(ind, cx, color, phase):
    # bounce: y dips then up, staggered by phase frames
    p0 = phase
    p1 = (phase + 8) % OP
    p2 = (phase + 16) % OP
    keys = sorted([(0,CY),(p0,CY),( (p0+6)%OP, CY-34),((p0+12)%OP,CY),(OP,CY)], key=lambda k:k[0])
    # build monotonic keyframes
    kf = []
    seen=set()
    for t,y in keys:
        if t in seen: continue
        seen.add(t)
        kf.append({"t":t,"s":[cx,y]})
    kf = sorted(kf,key=lambda k:k["t"])
    return {
        "ddd":0,"ind":ind,"ty":4,"nm":f"d{ind}",
        "ks":{
            "o":{"a":0,"k":100},"r":{"a":0,"k":0},
            "p":{"a":1,"k":kf},
            "a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},
        },
        "shapes":[{
            "ty":"gr","it":[
                {"ty":"el","p":{"a":0,"k":[0,0]},"s":{"a":0,"k":[26,26]}},
                {"ty":"fl","c":{"a":0,"k":color+[1]},"o":{"a":0,"k":100}},
                {"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}},
            ]
        }],
        "ip":0,"op":OP,"st":0,"bm":0,
    }

layers = [circle_layer(i+1, START_X+i*GAP, COLORS[i], i*8) for i in range(3)]
doc = {"v":"5.7.0","fr":FR,"ip":0,"op":OP,"w":W,"h":H,"nm":"loading","ddd":0,"assets":[],"layers":layers}
out = os.path.join(os.path.dirname(__file__),'..','src','assets')
os.makedirs(out, exist_ok=True)
with open(os.path.join(out,'loading.json'),'w') as f:
    json.dump(doc,f)
print('wrote loading.json')
