# 柔整：通るシリーズを anatomy-guide/tooru-data.js に書き出す（build.py の最後から呼ぶ）
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from build_tooru import build
G = os.path.abspath(os.path.join(HERE, '..', '..'))
REPO = os.path.dirname(G)
def run():
    d = build(REPO + '/anatomy/questions.json', G + '/tooru-data.js', G + '/figures', 'figures/',
              '過去問の数：柔道整復師国家試験 解剖学（第18〜34回）の問題文と選択肢に、その孔・管・筋の名前（必要なら通るものの名前も）が出た問題の数（目安）。図・語呂は学習用に作成した独自のものです。')
    print('tooru', [(g['id'], len(g['items']), g['hot']) for g in d['groups']])
if __name__ == '__main__': run()
