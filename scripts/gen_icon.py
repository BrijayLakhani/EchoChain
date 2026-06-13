from PIL import Image, ImageDraw, ImageFilter
import os, math

OUT = r'C:\Users\lakha\EchoChain\docs\store'
os.makedirs(OUT, exist_ok=True)

# Brand palette
CORAL=(255,123,107); SKY=(91,169,240); MINT=(92,201,167); SUN=(255,194,75)
BG_TOP=(255,247,240); BG_BOT=(245,231,219)

def rounded(size, radius, fill):
    im = Image.new('RGBA',(size,size),(0,0,0,0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0,0,size-1,size-1], radius=radius, fill=fill)
    return im

def make(size):
    S = size
    # vertical gradient background
    bg = Image.new('RGB',(S,S),BG_TOP)
    top,bot = BG_TOP,BG_BOT
    for y in range(S):
        t=y/S
        r=int(top[0]+(bot[0]-top[0])*t); g=int(top[1]+(bot[1]-top[1])*t); b=int(top[2]+(bot[2]-top[2])*t)
        for x in range(S): pass
        ImageDraw.Draw(bg).line([(0,y),(S,y)], fill=(r,g,b))
    bg = bg.convert('RGBA')

    # 4 dots grid, centered
    dot = int(S*0.28)
    gap = int(S*0.06)
    block = dot*2+gap
    ox = (S-block)//2; oy=(S-block)//2
    coords = [(ox,oy,CORAL),(ox+dot+gap,oy,SKY),(ox,oy+dot+gap,MINT),(ox+dot+gap,oy+dot+gap,SUN)]

    # soft shadow layer
    sh = Image.new('RGBA',(S,S),(0,0,0,0))
    sd = ImageDraw.Draw(sh)
    for (x,y,_) in coords:
        sd.ellipse([x,y+int(S*0.012),x+dot,y+dot+int(S*0.012)], fill=(46,42,58,70))
    sh = sh.filter(ImageFilter.GaussianBlur(int(S*0.02)))
    bg.alpha_composite(sh)

    d = ImageDraw.Draw(bg)
    for (x,y,c) in coords:
        d.ellipse([x,y,x+dot,y+dot], fill=c)
        # subtle top highlight
        hl = Image.new('RGBA',(S,S),(0,0,0,0))
        ImageDraw.Draw(hl).ellipse([x+int(dot*0.18),y+int(dot*0.12),x+int(dot*0.7),y+int(dot*0.45)], fill=(255,255,255,55))
        bg.alpha_composite(hl)

    return bg.convert('RGB')

# 512 store icon
make(512).save(os.path.join(OUT,'icon-512.png'))
# 1024 (iOS / hi-res)
make(1024).save(os.path.join(OUT,'icon-1024.png'))
# 192 launcher preview
make(192).save(os.path.join(OUT,'icon-192.png'))
print('icons written to', OUT)
