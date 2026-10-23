"""One-time portfolio asset builder; CI-only dependencies, no frontend bundles."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit

out = Path(__file__).resolve().parents[1] / "assets"
out.mkdir(parents=True, exist_ok=True)
W, H = 1200, 630
img = Image.new("RGB", (W, H), "#090b0f")
d = ImageDraw.Draw(img)
P = {"ivory": "#f5f5f2", "muted": "#b9c0c9", "cyan": "#81d9ff", "warm": "#ebd4b9", "border": "#363b45"}
fontroot = Path("/usr/share/fonts/truetype/dejavu")
def font(pt, bold=False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(str(fontroot/name), pt)
for y in (45, 584):
    d.line([(58,y),(1142,y)],fill=P["border"],width=1)
d.line([(58,45),(58,584)],fill=P["border"],width=1)
d.rectangle((58,45,67,584),fill=P["cyan"])
d.text((94,74),"R / P",font=font(28,True),fill=P["warm"])
d.text((94,203),"ROHIT",font=font(106,True),fill=P["ivory"])
d.text((94,326),"PANT",font=font(106,True),fill=P["ivory"])
d.text((95,483),"FRONTEND  /  UI DEVELOPER",font=font(27),fill=P["cyan"])
d.text((95,545),"REACT   /   TYPESCRIPT   /   PRODUCTION UI",font=font(17),fill=P["muted"])
for r in (105,150,201,250):
    d.ellipse((930-r,303-r,930+r,303+r),outline="#293039",width=2)
for points,color in (([(897,273),(963,333)],"#e0bf91"), ([(896,333),(961,273)],"#7dcce2")):
    d.line(points,fill=color,width=2)
d.ellipse((921,295,939,313),fill=P["cyan"])
img.save(out/"og-image.jpg",quality=74,optimize=True,subsampling=0)

pdf = out/"Rohit-Pant-Resume.pdf"
c = canvas.Canvas(str(pdf),pagesize=A4,pageCompression=1)
c.setTitle("Rohit Pant - Frontend Developer Resume")
width,height=A4
left,right,y=42,width-42,height-48
navy,teal,body,mute = [HexColor(x) for x in ("#203146","#087b82","#263545","#627082")]
def section(title):
    global y
    y-=11;c.setFillColor(teal);c.setFont("Helvetica-Bold",9.6)
    c.drawString(left,y,title.upper())
    c.setStrokeColor(HexColor("#c2d4d6"));c.setLineWidth(.5)
    c.line(left,y-4,right,y-4);y-=18
def line(text,size=8.75,leading=12,indent=0,bold=False):
    global y
    face="Helvetica-Bold" if bold else "Helvetica"
    c.setFont(face,size);c.setFillColor(body)
    for part in simpleSplit(text,face,size,right-left-indent):
        c.drawString(left+indent,y,part);y-=leading
def bullet(text):
    c.setFillColor(teal);c.circle(left+5,y+2,2,fill=1,stroke=0)
    line(text,size=8.15,leading=11.5,indent=15)

c.setFillColor(navy);c.setFont("Helvetica-Bold",21)
c.drawCentredString(width/2,y,"ROHIT PANT");y-=21
c.setFillColor(teal);c.setFont("Helvetica-Bold",10)
c.drawCentredString(width/2,y,"FRONTEND DEVELOPER  |  REACT.JS  |  TYPESCRIPT  |  JAVASCRIPT");y-=16
c.setFillColor(mute);c.setFont("Helvetica",8.5)
c.drawCentredString(width/2,y,"Uttarakhand, India (Delhi NCR / Remote)  |  +91 93892 35970  |  rohitpant090@gmail.com");y-=13
c.drawCentredString(width/2,y,"rohitpant.in  |  github.com/Rohit30418  |  linkedin.com/in/rohitpantdev");y-=4
section("Professional Summary")
line("Frontend Developer with 4+ years of experience delivering responsive client websites, event platforms and admin dashboards from requirements through release. Strong in JavaScript, API integration, performance and technical SEO, with independent React/TypeScript projects covering real-time communication, accessible UI and component testing.",size=8.6,leading=11.9)
section("Technical Skills")
for skill in (
    "Frontend: JavaScript (ES6+), TypeScript, React.js, HTML5, CSS3, Tailwind CSS, Bootstrap, Sass, jQuery",
    "React & Testing: Redux Toolkit, React Query, React Router, Vite, Vitest, React Testing Library",
    "APIs & Realtime: REST APIs, Axios, Firebase, WebRTC, PeerJS, Socket.IO, Service Workers, Web Push",
    "Practices & Tools: Accessibility, Responsive Design, Performance, Technical SEO, Git, Chrome DevTools",
):
    line(skill,size=8.2,leading=11.5)
section("Professional Experience")
line("Prometheus Solutions Pvt. Ltd.  |  Frontend Developer / Project Coordinator",size=9,leading=12,bold=True)
line("August 2022 - Present",size=8.3,leading=12)
for item in (
    "Owned frontend delivery for responsive client websites, event portals and admin dashboards using HTML, CSS, JavaScript, Bootstrap and jQuery.",
    "Built interactive forms and reusable UI components; integrated REST APIs with validation, loading/error states and cross-browser support.",
    "Improved speed through WebP assets, lazy loading and CSS cleanup; fixed production resource-loading bottlenecks.",
    "Implemented technical SEO: metadata, canonical URLs, sitemaps, robots.txt and JSON-LD; addressed spam injection and indexing issues.",
    "Coordinated with clients on releases and fixes; mentored 6-8 interns on frontend and responsive UI practices.",
):
    bullet(item)
section("Selected Projects")
line("Vaani - Real-Time Communication & AI Platform  |  vaani.rohitpant.in",size=9,leading=12,bold=True)
line("React.js, WebRTC, PeerJS, Socket.IO, React Three Fiber, Vitest",size=8.1,leading=11)
for item in (
    "Built peer-to-peer audio/video rooms, messaging, screen sharing, media device switching and live presence.",
    "Tested room creation, form validation and popup UI using Vitest and React Testing Library.",
    "Added PWA/Web Push features and 3D AI voice interactions with speech recognition and text-to-speech.",
):
    bullet(item)
y-=3
line("EventHive - Event Management Platform  |  eventhive.rohitpant.in",size=9,leading=12,bold=True)
line("React.js, TypeScript, Redux Toolkit, React Query, Firebase, Tailwind CSS",size=8.1,leading=11)
for item in (
    "Built multi-role event creation, registration and attendee workflows with protected routes and validated forms.",
    "Used Redux Toolkit and React Query for state, caching and loading/error handling; added accessibility options.",
):
    bullet(item)
section("Education")
line("B.Tech, Electronics & Communication Engineering  |  Graphic Era Hill University  |  2020",size=8.6,leading=12,bold=True)
if y < 35:
    raise ValueError("Resume has overflowed the page")
c.showPage()
c.save()
print("Generated assets:", [(p.name,p.stat().st_size) for p in (pdf,out/"og-image.jpg")])
