import wave, struct, math, os

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'android', 'app', 'src', 'main', 'res', 'raw')
os.makedirs(OUT, exist_ok=True)

def env(i, n, atk=0.01, rel=0.25):
    a = int(n * atk); r = int(n * rel)
    if i < a: return i / max(1, a)
    if i > n - r: return max(0.0, (n - i) / max(1, r))
    return 1.0

def tone(freqs, dur, vol=0.5, wave_kind='sine'):
    n = int(SR * dur); out = []
    for i in range(n):
        t = i / SR
        s = 0.0
        for f in freqs:
            ph = 2 * math.pi * f * t
            if wave_kind == 'square':
                s += 1.0 if math.sin(ph) >= 0 else -1.0
            else:
                s += math.sin(ph)
        s /= len(freqs)
        out.append(s * env(i, n) * vol)
    return out

def glide(f0, f1, dur, vol=0.5):
    n = int(SR * dur); out = []
    phase = 0.0
    for i in range(n):
        f = f0 + (f1 - f0) * (i / n)
        phase += 2 * math.pi * f / SR
        out.append(math.sin(phase) * env(i, n) * vol)
    return out

def seq(parts):
    out = []
    for p in parts: out.extend(p)
    return out

def save(name, samples):
    path = os.path.join(OUT, name)
    w = wave.open(path, 'w')
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    frames = b''.join(struct.pack('<h', int(max(-1, min(1, s)) * 32767)) for s in samples)
    w.writeframes(frames); w.close()
    print('wrote', name, len(samples), 'samples')

# tap — short soft blip
save('tap.wav', tone([880], 0.05, 0.35))
# connect — quick rising chirp
save('connect.wav', glide(680, 1180, 0.09, 0.4))
# coin — classic two-note ding
save('coin.wav', seq([tone([988], 0.045, 0.45), tone([1319], 0.10, 0.45)]))
# error — low buzz
save('error.wav', tone([180], 0.18, 0.4, 'square'))
# win — major arpeggio C E G C
save('win.wav', seq([
    tone([523], 0.10, 0.45), tone([659], 0.10, 0.45),
    tone([784], 0.10, 0.45), tone([1047], 0.22, 0.5),
]))
print('done')
