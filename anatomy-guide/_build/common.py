import re
def P(title, items, anchor, why, qs, cq, ca):
    return dict(title=title, items=items, anchor=anchor.strip(), why=why.strip(), qs=qs, check_q=cq, check_a=ca)
def T(head, rows):
    h = ''.join(f'<th>{c}</th>' for c in head)
    b = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    return f'<div class="table-wrap"><table><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table></div>'
def UL(*xs): return '<ul>' + ''.join(f'<li>{x}</li>' for x in xs) + '</ul>'
