#!/usr/bin/env python3
# ============================================================
#  JCRGM — Welcome Ministry pocket cards builder
#  Generates:
#    JCRGM_Welcome_Cards_ALL.pdf      (cover + 8 cards, A4, cut lines)
#    JCRGM_Welcome_Card_1..8_*.pdf    (one A4 sheet per card, 2 copies)
#    welcome-cards-print.html         (browser-printable sheet + downloads)
#  Re-run after editing CARDS below:  python3 build_welcome_cards.py
# ============================================================
import html as _html
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase.pdfmetrics import stringWidth

MM = 2.834645669
NAVY = HexColor("#0b1533")
NAVY2 = HexColor("#101d44")
GOLD = HexColor("#d9ab21")
GOLD_TXT = HexColor("#ffe9a8")
INK = HexColor("#1e2a3a")
LABEL = HexColor("#8a6d1d")
GREY = HexColor("#6b7a90")
LINE = HexColor("#b9b9b9")

# ------------------------------------------------------------------
#  CARD CONTENT  (single source of truth for PDF + HTML sheet)
#  block types: ('h', label, text) | ('q', label, [quotes]) |
#               ('n', label, [numbered]) | ('lines', label, [lines])
# ------------------------------------------------------------------
CARDS = [
 dict(no=1, file="JCRGM_Welcome_Card_1_Greeter.pdf",
      title="Greeter's Pocket Card", sub="Door team - every service",
      blocks=[
        ('h', "THE 8-SECOND RULE", "Smile - Eye contact - Welcome - Offer help, within 8 seconds of eye contact."),
        ('q', "SAY", [
            '"You are welcome! Good morning."',
            '"Is this your first time with us?"',
            '"May I know your name?"',
            '"Let me walk with you to the welcome desk."',
            '"Please have a seat - I will get someone to sit with you."']),
        ('h', "IF IT IS A FIRST-TIMER", "Greet -> escort -> introduce to the desk -> get the name -> find a host -> tell the Captain."),
        ('h', "NEVER ON POST", "Point instead of walking - eat or chew gum - ask about money, marriage or tribe - leave a door unmanned - embarrass a visitor."),
        ('h', "AT THE END OF SERVICE", "Reach every visitor within 60 seconds. Thank them by name. Invite them back next Sunday."),
      ]),

 dict(no=2, file="JCRGM_Welcome_Card_2_FollowUpCall.pdf",
      title="48-Hour Follow-Up Call Card", sub="Follow-up team - call every visitor",
      blocks=[
        ('h', "OPENING", '"Good morning, may I speak to [Name]? ... Hello [Name], this is [Your name] from JCRGM. We worshipped together on Sunday - I am calling to thank you personally for coming, and to see how you are."'),
        ('h', "ASK", "Did you travel safely? - How did you find the service? - Was anything a blessing to you? - May we pray about anything with you?"),
        ('h', "INVITE", "Join us Sunday: Morning Worship 09:00-12:30 and Counselling & Prophetic Service 14:00-18:30. If you need transport, tell me and we will arrange."),
        ('h', "NEVER", "Preach at them - ask for money - promise anything - discuss other members - call after 19:00."),
        ('h', "LOG WITHIN 10 MINUTES", "Date - reached / not reached (why) - duration - needs shared - next action - next contact date - your initials."),
        ('h', "3 ATTEMPTS RULE", "Call, then WhatsApp the same day; again next day; again on day 4. After 3 attempts mark 'unreachable - member to assist', never 'failed'."),
      ]),

 dict(no=3, file="JCRGM_Welcome_Card_3_Pathway.pdf",
      title="First-Timer Pathway Card", sub="Give this to every first-time visitor",
      blocks=[
        ('h', "WELCOME TO JCRGM!", "You are our honoured guest, and we are glad you came. Here is what happens next:"),
        ('n', "", [
            "TODAY: Sign the welcome card and collect your gift at the welcome desk.",
            "THIS WEEK: We will call you within 48 hours; save our WhatsApp line.",
            "NEXT SUNDAY: Morning Worship 09:00-12:30 - Counselling & Prophetic Service 14:00-18:30.",
            "WITHIN 2 WEEKS: Join a home cell near you and the New Believers' / Foundation Class.",
            "WITHIN 3 MONTHS: Membership class, water baptism, and a place to serve."]),
        ('h', "TALK TO US", "Phone / WhatsApp: 0979554970  -  Ask at the welcome desk for the map link and any help you need."),
        ('h', "OUR PROMISE", "You will be seen, safe, served, prayed for, followed up and discipled. You are always welcome in this house."),
      ]),

 dict(no=4, file="JCRGM_Welcome_Card_4_Usher.pdf",
      title="Usher's Seating Card", sub="Ushering team - order, comfort, watchfulness",
      blocks=[
        ('h', "SEAT FIRST", "The elderly - mothers with babies - visitors - people with a disability - then fill front-to-back in neat blocks."),
        ('h', "NEVER FOR FIRST-TIMERS", "The back row, or behind a pillar. Reserve front-middle seats for visitors who came with children (quick exit)."),
        ('h', "DURING THE SERVICE", "Stand at the back, silent, watching. No walking up and down, no chatting, no phone light."),
        ('h', "ALERT FOR", "Anyone weeping, unwell or fainting - wandering children - an empty visitor seat - any disturbance - anyone slipping out early (empty seat rule)."),
        ('h', "AT THE END", "Open the aisle for the altar call, guide responders forward, escort visitors to the welcome desk, and apply the 60-second rule."),
      ]),

 dict(no=5, file="JCRGM_Welcome_Card_5_Incident.pdf",
      title="Incident Mini-Card", sub="Write it, sign it, hand it to the Pastor the same day",
      blocks=[
        ('h', "1. WHAT HAPPENED (facts only, no blame)", ""),
        ('lines', "", ["", ""]),
        ('h', "2. WHO WAS PRESENT (names, roles, witnesses, children)", ""),
        ('lines', "", ["", ""]),
        ('h', "3. WHAT I DID AND WHAT MUST HAPPEN NOW", ""),
        ('lines', "", ["", ""]),
        ('h', "TIME / PLACE / REPORTED TO", "Time: __________   Place: __________   Reported to: __________   At: ______   Signature: __________"),
        ('h', "ESCALATE IMMEDIATELY TO THE PASTOR", "Child at risk - abuse disclosure - suicide talk - violence or a weapon - medical emergency - fire - police or media - death - missing child."),
      ]),

 dict(no=6, file="JCRGM_Welcome_Card_6_TeamMemory.pdf",
      title="Team Memory Card", sub="Carry it every Sunday",
      blocks=[
        ('h', "REPORTING TIMES", "Morning service T-90 (07:30)  -  Afternoon service 13:15  -  Midweek, all-night & special services T-60."),
        ('h', "MY POST TODAY / MY FLOATER", "Post: ______________________     Floater: ______________________"),
        ('h', "THE FOUR RULES", "8 seconds to greet  -  60 seconds to reach every visitor at the end  -  48 hours to make the call  -  90 days to belonging."),
        ('h', "VERSE OF THE DOORKEEPER", 'Hebrews 13:2 - "Be not forgetful to entertain strangers: for thereby some have entertained angels unawares."'),
        ('h', "THE TWO COMMANDS", "Do not serve without praying. Do not leave a post unmanned."),
      ]),

 dict(no=7, file="JCRGM_Welcome_Card_7_WelcomeDesk.pdf",
      title="Welcome Desk Card", sub="Reception & registration team",
      blocks=[
        ('h', "SET UP BEFORE DOORS OPEN", "Table + cloth - visitor cards + 6 pens - register book - QR stand - welcome packs - water - tissue - first-aid box - children's tags - referral slips."),
        ('h', "STAFF AT PEAK", "1 greeter (front) - 1 writer (cards) - 1 gifter (packs) - 1 floater to escort visitors and fetch what is needed."),
        ('h', "ASK FOR", "Name - phone / WhatsApp - area - first time here? - who invited you - children - prayer request - consent to contact."),
        ('h', "THE TWO-MINUTE RULE", "Never keep a visitor standing for more than two minutes. If the queue is long, seat them and take the card to them."),
        ('h', "PROTECT THE DATA", "All cards go to the Data Officer the same day. Never read a number aloud, never share details, and mark DO NOT CONTACT when asked."),
        ('h', "NEVER", "Force a card - ask about money, marriage or tribe - promise money, jobs or prophecy - leave the desk unattended."),
      ]),

 dict(no=8, file="JCRGM_Welcome_Card_8_HomeVisit.pdf",
      title="Home Visit Card", sub="Visitation team - 7-day follow-up",
      blocks=[
        ('h', "BEFORE YOU GO", "Confirm by phone - send TWO people (same gender where possible) - tell the Coordinator who, where and when - carry a small gift, a Bible and a contact card - pray together as a team."),
        ('h', "DURING THE VISIT (30-40 MINUTES)", "Greet the whole household - one Scripture, one testimony, one prayer - answer their questions - invite them to the cell and to Sunday - note real needs."),
        ('h', "NEVER", "Interrogate - inspect their lifestyle - borrow anything - counsel an abuse or crisis case alone - arrive unannounced - stay too long."),
        ('h', "AFTER THE VISIT", "Write and hand in the visit report the same day - log any referral - arrange the cell introduction - confirm their second Sunday."),
      ]),
]

# ------------------------------------------------------------------
#  PDF drawing
# ------------------------------------------------------------------
def wrap(text, font, size, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if stringWidth(t, font, size) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def measure(card, bw, size):
    lead = size * 1.34
    h = 0
    for b in card["blocks"]:
        kind, label, body = b[0], b[1], b[2]
        if label:
            h += size * 1.55
        if kind in ("h", "q", "n", "lines"):
            items = body if isinstance(body, list) else [body]
            if kind == "lines":
                h += lead * max(1, len(items))
            else:
                for it in items:
                    pre = "- " if kind in ("q", "n") else ""
                    lines = wrap(pre + it, "Helvetica", size, bw - (10 if kind == "n" else 0))
                    h += lead * len(lines)
        h += size * 0.62
    return h

def draw_card(c, x, y, w, h, card, size):
    """Draw one card with top-left corner at (x, y+h). Returns nothing."""
    head = 15.5 * MM
    # outer frame + cut line
    c.setStrokeColor(HexColor("#9aa3b2")); c.setLineWidth(0.7)
    c.setDash(3, 3); c.rect(x, y, w, h, stroke=1, fill=0); c.setDash()
    # header band
    c.setFillColor(NAVY); c.setStrokeColor(NAVY); c.setLineWidth(0)
    c.roundRect(x, y + h - head, w, head, 3 * MM, stroke=0, fill=1)
    c.setFillColor(GOLD_TXT); c.setFont("Helvetica-Bold", 13.2)
    c.drawString(x + 5 * MM, y + h - head + 7.2 * MM, "CARD %d  -  %s" % (card["no"], card["title"].upper()))
    c.setFillColor(HexColor("#cdd8f5")); c.setFont("Helvetica-Oblique", 8)
    c.drawString(x + 5 * MM, y + h - head + 3.0 * MM, card["sub"])
    c.setFillColor(GOLD); c.rect(x, y + h - head - 1.1 * MM, w, 1.1 * MM, stroke=0, fill=1)

    # body
    bw = w - 12 * MM
    size_l = size
    lead = size_l * 1.34
    cx = x + 6 * MM
    cy = y + h - head - 1.1 * MM - (size_l * 1.55)
    for b in card["blocks"]:
        kind, label, body = b[0], b[1], b[2]
        if label:
            c.setFillColor(LABEL); c.setFont("Helvetica-Bold", size_l * 0.97)
            c.drawString(cx, cy, label.upper())
            cy -= size_l * 1.55
        c.setFillColor(INK)
        if kind == "h":
            c.setFont("Helvetica", size_l)
            for ln in wrap(body, "Helvetica", size_l, bw):
                c.drawString(cx, cy, ln); cy -= lead
        elif kind == "q":
            c.setFont("Helvetica-Oblique", size_l)
            for it in body:
                for i, ln in enumerate(wrap(it, "Helvetica-Oblique", size_l, bw - 8)):
                    c.drawString(cx + (8 if i else 0), cy, ("-  " if i == 0 else "   ") + ln if i == 0 else ln)
                    cy -= lead
        elif kind == "n":
            for idx, it in enumerate(body, 1):
                c.setFont("Helvetica", size_l)
                first, *rest = wrap(it, "Helvetica", size_l, bw - 14)
                c.setFillColor(HexColor("#1f3c88")); c.setFont("Helvetica-Bold", size_l)
                c.drawString(cx, cy, "%d." % idx)
                c.setFillColor(INK); c.setFont("Helvetica", size_l)
                c.drawString(cx + 14, cy, first); cy -= lead
                for ln in rest:
                    c.drawString(cx + 14, cy, ln); cy -= lead
        elif kind == "lines":
            c.setStrokeColor(HexColor("#c3cad8")); c.setLineWidth(0.6)
            for _ in body:
                c.line(cx, cy - 1.2, cx + bw, cy - 1.2); cy -= lead
            c.setStrokeColor(INK)
        cy -= size_l * 0.62

    # footer
    c.setFillColor(GREY); c.setFont("Helvetica", 6.2)
    c.drawString(x + 6 * MM, y + 2.4 * MM,
                 "Jesus Christ Redeems Global Ministries  -  Visitors & Welcome Ministry  -  card %d of %d  -  print, cut, laminate" % (card["no"], len(CARDS)))

HEAD = 15.5 * MM + 1.1 * MM
PAD_B = 8 * MM          # space above the footer line
AV = 273 * MM           # usable height on A4 (297 - 12 top - 12 bottom)
GAP = 8 * MM

def card_height(card, w, size):
    """Height of a card sized to its content."""
    return HEAD + measure(card, w - 12 * MM, size) + PAD_B

def best_fit(cards, w, gap=GAP):
    """Largest font size at which the given cards fit one A4 sheet, stacked.
    Returns (size, total_height, fits)."""
    last = None
    for s in (10.0, 9.6, 9.2, 8.8, 8.4, 8.0, 7.6, 7.2, 6.8, 6.4, 6.0):
        total = sum(card_height(c, w, s) for c in cards) + gap * (len(cards) - 1)
        last = (s, total)
        if total <= AV - 6 * MM:
            return s, total, True
    return last[0], last[1], False

# ---- all-cards booklet -------------------------------------------------
CW = 190 * MM
c = rl_canvas.Canvas("JCRGM_Welcome_Cards_ALL.pdf", pagesize=A4)
c.setTitle("JCRGM Welcome Ministry - Pocket Cards")
c.setAuthor("Jesus Christ Redeems Global Ministries")

# cover page
W, H = A4
c.setFillColor(NAVY); c.rect(0, 0, W, H, stroke=0, fill=1)
c.setFillColor(GOLD); c.rect(0, H - 8 * MM, W, 4 * MM, stroke=0, fill=1)
c.setFillColor(GOLD_TXT); c.setFont("Helvetica-Bold", 24)
c.drawCentredString(W / 2, H - 46 * MM, "VISITORS & WELCOME MINISTRY")
c.setFillColor(white); c.setFont("Helvetica-Bold", 15)
c.drawCentredString(W / 2, H - 57 * MM, "Pocket Cards & Printables")
c.setFillColor(HexColor("#cdd8f5")); c.setFont("Helvetica-Oblique", 10.5)
c.drawCentredString(W / 2, H - 66 * MM, '"Be not forgetful to entertain strangers." - Hebrews 13:2')
c.setFillColor(white); c.setFont("Helvetica", 10)
y = H - 88 * MM
for line in [
    "This pack holds 8 cards - print them for every welcome worker:",
    "",
] + ["     Card %d   %s" % (k["no"], k["title"]) for k in CARDS] + [
    "",
    "HOW TO PRINT",
    "  1. Print this file on A4 paper - each sheet holds two or three cards.",
    "  2. Cut along the dashed lines.",
    "  3. Laminate the cards, or print on card stock (160-200 gsm).",
    "  4. Pin Card 5 (Incident) and Card 7 (Welcome Desk) inside the desk drawer.",
    "  5. Give Card 3 (First-Timer Pathway) to every first-time visitor.",
    "",
    "Single-card sheets (two identical copies per A4 page) are saved separately:",
    "  JCRGM_Welcome_Card_1_Greeter.pdf  ...  JCRGM_Welcome_Card_8_HomeVisit.pdf",
    "",
    "Full manual: visitors-welcome.html   |   Phone: 0979554970   |   Lusaka, Zambia",
]:
    c.setFont("Helvetica-Bold" if line in ("HOW TO PRINT",) or line.startswith("This pack") else "Helvetica", 10)
    c.setFillColor(GOLD_TXT if line.startswith("Card ") else white)
    c.drawString(24 * MM, y, line); y -= 6.4 * MM
c.showPage()

# card pages: 2 cards per A4
i, page = 0, 2
while i < len(CARDS):
    group, sz, total = None, None, None
    for take in (3, 2, 1):                       # prefer 3 cards per sheet
        g = CARDS[i:i + take]
        sz, total, ok = best_fit(g, CW)
        if ok and sz >= 7.2:
            group = g; break
    if group is None:
        group = [CARDS[i]]; sz, total, _ = best_fit(group, CW)
    y = 297 * MM - 12 * MM - max(0, (AV - 6 * MM - total) / 2)   # centre on the sheet
    for card in group:
        h = card_height(card, CW, sz)
        draw_card(c, 10 * MM, y - h, CW, h, card, sz)
        y -= h + GAP
    print("  page %d: %d cards at %.1f pt (%s)" % (page, len(group), sz, " + ".join(k["title"][:26] for k in group)))
    c.setFillColor(GREY); c.setFont("Helvetica", 6.5)
    c.drawCentredString(W / 2, 5 * MM, "Print on A4 - cut along the dashed lines - laminate - JCRGM Welcome Ministry")
    c.showPage()
    i += len(group); page += 1
c.save()
print("wrote JCRGM_Welcome_Cards_ALL.pdf")

# ---- single-card sheets (2 copies per page) ---------------------------
for card in CARDS:
    c = rl_canvas.Canvas(card["file"], pagesize=A4)
    c.setTitle("JCRGM - %s" % card["title"])
    W, H = A4
    s, _, _ = best_fit([card], CW, gap=0)
    h = card_height(card, CW, s)
    total = h * 2 + GAP
    top = H - 12 * MM - max(0, (AV - total) / 2)   # centre the two copies
    for y in (top - h, top - h - GAP - h):
        draw_card(c, 10 * MM, y, CW, h, card, s)
    c.setFillColor(GREY); c.setFont("Helvetica", 7)
    c.drawCentredString(W / 2, 5 * MM,
        "A4 sheet: two identical cards - cut along the dashed lines. Full pack: JCRGM_Welcome_Cards_ALL.pdf")
    c.save()
    print("  wrote", card["file"], "at", s, "pt")
print("done.")

# ------------------------------------------------------------------
#  Browser-printable sheet: welcome-cards-print.html
# ------------------------------------------------------------------
def esc(s):
    return _html.escape(s, quote=False)

def blocks_html(card):
    out = []
    for b in card["blocks"]:
        kind, label, body = b[0], b[1], b[2]
        if label:
            out.append('<div class="lbl">%s</div>' % esc(label))
        if kind == "h":
            out.append('<p>%s</p>' % esc(body))
        elif kind == "q":
            out.append('<ul class="q">' + "".join('<li>%s</li>' % esc(i) for i in body) + '</ul>')
        elif kind == "n":
            out.append('<ol>' + "".join('<li>%s</li>' % esc(i) for i in body) + '</ol>')
        elif kind == "lines":
            out.append('<ul class="q">' + "".join('<li class="blank">%s</li>' % esc(i.replace("_", "")) for i in body) + '</ul>')
    return "\n".join(out)

sheets = []
for i in range(0, len(CARDS), 2):
    inner = ""
    for card in CARDS[i:i + 2]:
        inner += """
  <section class="pc" id="card%d">
    <div class="pchead"><b>CARD %d &mdash; %s</b><span>%s</span></div>
    <div class="pcbody">
%s
    </div>
    <div class="pcfoot">Jesus Christ Redeems Global Ministries &middot; Visitors &amp; Welcome Ministry &middot; card %d of %d &middot; print, cut, laminate</div>
    <div class="pcbtns noprint">
      <button type="button" onclick="printOne('card%d')">&#128424; Print this card only</button>
      <a class="btn" href="%s" download>&#11015; Download this card (PDF)</a>
    </div>
  </section>""" % (card["no"], card["no"], esc(card["title"].upper()), esc(card["sub"]),
                    blocks_html(card), card["no"], len(CARDS), card["no"], card["file"])
    sheets.append(inner)

page = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>JCRGM Welcome Ministry - Printable Pocket Cards</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  :root{--navy:#0b1533;--gold:#d9ab21;--gtx:#ffe9a8;--ink:#1e2a3a;--lbl:#8a6d1d;--grey:#6b7a90;}
  *{box-sizing:border-box}
  body{margin:0;font-family:"Segoe UI",Arial,sans-serif;color:var(--ink);background:#e9edf4;}
  .bar{position:sticky;top:0;z-index:5;background:rgba(11,21,51,.96);color:#fff;padding:10px 14px;
       display:flex;gap:10px;flex-wrap:wrap;align-items:center;border-bottom:1px solid rgba(255,215,0,.3)}
  .bar b{font-size:13.5px;letter-spacing:.4px}
  .bar .sp{flex:1}
  button,a.btn{font:inherit;font-size:12px;font-weight:700;border-radius:999px;padding:7px 13px;cursor:pointer;
    border:1px solid rgba(255,215,0,.45);background:rgba(255,215,0,.12);color:#ffe9a8;text-decoration:none}
  button:hover,a.btn:hover{background:rgba(255,215,0,.24);color:#fff}
  button.solid{background:linear-gradient(135deg,#ffd700,#d9ab21);color:#3a2a00;border-color:transparent}
  .hint{max-width:1100px;margin:16px auto 0;padding:12px 16px;background:#fff8e4;border-left:4px solid var(--gold);
        border-radius:10px;font-size:13.5px}
  .wrap{max-width:1100px;margin:0 auto;padding:14px 10px 40px}
  .pc{width:190mm;min-height:134mm;background:#fff;margin:14px auto;padding:0 0 6mm;
      border:1.5px dashed #9aa3b2;border-radius:8px;overflow:hidden;display:flex;flex-direction:column}
  .pchead{background:var(--navy);color:var(--gtx);padding:6mm 6mm 4mm;border-bottom:3px solid var(--gold)}
  .pchead b{display:block;font-size:15px;letter-spacing:.6px}
  .pchead span{display:block;font-size:10.5px;color:#cdd8f5;font-style:italic;margin-top:2px}
  .pcbody{padding:4mm 6mm 0;flex:1}
  .lbl{font-size:10.5px;font-weight:800;letter-spacing:1.1px;color:var(--lbl);text-transform:uppercase;margin:9px 0 2px}
  .pcbody p{margin:0 0 2px;font-size:11.3px;line-height:1.42}
  .pcbody ul,.pcbody ol{margin:0;padding-left:20px}
  .pcbody li{font-size:11.3px;line-height:1.42;margin:1px 0}
  .pcbody ul.q{list-style:none;padding-left:2px}
  .pcbody ul.q li::before{content:"\\2013";color:var(--gold);font-weight:800;margin-right:6px}
  .pcbody li.blank{border-bottom:1px solid #cbd2de;min-height:16px;margin:7px 0}
  .pcfoot{font-size:7.5px;color:var(--grey);padding:3mm 6mm 0}
  .pcbtns{padding:3mm 6mm 0;display:flex;gap:8px;flex-wrap:wrap}
  .pcbtns button{border-color:#cbd6ea;background:#f4f7fd;color:#243a6b}
  .pcbtns button:hover{background:#e7eefc;color:#12244d}
  @media print{
    .noprint,.bar,.hint{display:none !important}
    body{background:#fff}
    .wrap{padding:0;max-width:none}
    @page{size:A4;margin:8mm}
    .pc{border:1px dashed #999;margin:0 0 6mm;break-inside:avoid;page-break-inside:avoid;box-shadow:none}
    .pc:last-child{margin-bottom:0}
    .pcbody p,.pcbody li{font-size:10.8px}
    html.printone .pc{display:none}
    html.printone .pc.target{display:flex}
  }
</style>
</head>
<body>
<div class="bar noprint">
  <b>&#128424; JCRGM Pocket Cards &mdash; printable sheet</b>
  <span class="sp"></span>
  <button class="solid" type="button" onclick="window.print()">&#128424; Print all cards</button>
  <a class="btn" href="JCRGM_Welcome_Cards_ALL.pdf">&#11015; Download all cards (PDF)</a>
  <a class="btn" href="visitors-welcome.html#printables">&#8592; Back to Welcome Ministry hub</a>
</div>

<div class="hint noprint">
  <b>How to use:</b> press <b>Print all cards</b> (or Ctrl+P / Cmd+P) &mdash; two cards print per A4 sheet; cut along the dashed
  lines and laminate. Prefer a finished file? Download the PDF pack above. Each card also has its own
  <b>Print this card only</b> and <b>Save this card as a file</b> buttons underneath it.
</div>

<div class="wrap">%s
</div>

<script>
function printOne(id){
  document.querySelectorAll('.pc').forEach(function(p){ p.classList.remove('target'); });
  document.getElementById(id).classList.add('target');
  document.documentElement.classList.add('printone');
  window.print();
  setTimeout(function(){
    document.documentElement.classList.remove('printone');
    document.querySelectorAll('.pc').forEach(function(p){ p.classList.remove('target'); });
  }, 1200);
}
</script>
</body>
</html>
""" % ("\n".join(sheets))

open("welcome-cards-print.html", "w", encoding="utf-8").write(page)
print("wrote welcome-cards-print.html")


# ------------------------------------------------------------------
#  EMBED the PDFs into the HTML pages as data URIs, so every
#  Download button works offline (preview, phone, no server needed).
# ------------------------------------------------------------------
import base64, re, os

def data_uri(path):
    with open(path, "rb") as f:
        return "data:application/pdf;base64," + base64.b64encode(f.read()).decode("ascii")

def embed(page, names):
    if not os.path.exists(page):
        print("  (skip, not found)", page); return
    src = open(page, encoding="utf-8").read()
    # refresh any previously embedded data URIs for the same filenames
    kept = {}
    for m in re.finditer(r'href="data:application/pdf;base64,[^"]+" download="([^"]+)"', src):
        kept[m.group(1)] = m.group(0)
    for name in names:
        if name in kept:
            src = src.replace(kept[name], '<a href="%s" download="%s">' % (data_uri(name), name))
    # wrap plain relative links
    for name in names:
        pattern = re.compile(r'<a((?:(?!>).)*?)href="%s"' % re.escape(name))
        src = pattern.sub(lambda m: '<a%s href="%s" download="%s">' % (m.group(1), data_uri(name), name), src)
        src = src.replace('href="%s" download="%s"' % (data_uri(name), name),
                          'href="%s" download="%s"' % (data_uri(name), name))
    open(page, "w", encoding="utf-8").write(src)
    print("  embedded %d PDFs into %s (%.0f KB)" % (len(names), page, len(src) / 1024))

pdf_names = [k["file"] for k in CARDS] + ["JCRGM_Welcome_Cards_ALL.pdf"]
embed("visitors-welcome.html", pdf_names)
embed("welcome-cards-print.html", pdf_names)
