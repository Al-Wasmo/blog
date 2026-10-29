const base = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/presentations/pwn-workshop-1/`
class WorkshopSlides extends HTMLElement {
  static observedAttributes = ["data-expanded"]
  private page = 0
  private transcript = false
  private slides: { image: string; text: string; script?: string }[] = []
  private events?: AbortController

  attributeChangedCallback() {
    this.updateFullscreen()
  }

  async connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" })
    const root = this.shadowRoot!
    root.innerHTML = `<style>
      :host { --surface:var(--background,#111); --ink:var(--foreground,#eee); --line:var(--border,#333); --muted:var(--muted-foreground,#aaa); display:block; color:var(--ink); font-family:var(--font-sans,system-ui); }
      * { box-sizing:border-box; } [hidden] { display:none!important; }
      .viewer { display:flex; width:100%; background:#101010; border:1px solid var(--line); border-radius:12px; overflow:hidden; }
      .presentation { display:flex; flex-direction:column; flex:1; min-width:0; }
      .screen { aspect-ratio:16/9; min-height:0; position:relative; }
      img { display:block; width:100%; height:100%; object-fit:contain; }
      nav { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:12px 16px; background:#191919; color:#eee; border-top:1px solid #303030; }
      .navigation,.tools { display:flex; align-items:center; gap:6px; }
      button { display:inline-flex; align-items:center; justify-content:center; min-height:38px; padding:8px 12px; border:1px solid transparent; border-radius:7px; background:transparent; color:inherit; font:inherit; font-size:14px; cursor:pointer; }
      button:hover { background:#303030; } button:disabled { opacity:.3; cursor:default; }
      button:focus-visible { outline:2px solid currentColor; outline-offset:2px; }
      button[aria-expanded=true] { border-color:#666; background:#303030; }
      .download { display:inline-flex; align-items:center; padding:8px 12px; border:1px solid #444; border-radius:7px; color:#eee; text-decoration:none; font-size:14px; }
      .download:hover { background:#303030; }
      .counter { font:13px var(--font-mono,monospace); min-width:74px; text-align:center; color:#ccc; }
      .progress { height:3px; background:#303030; } .progress span { display:block; height:100%; width:0; background:#ddd; transition:width .2s; }
      aside { --notes-bg:#171b19; --notes-panel:#202722; --notes-border:#303c33; --notes-ink:#e1e8e2; --notes-muted:#a3b0a6; --notes-accent:#b4d68a; display:flex; flex-direction:column; flex:0 0 clamp(320px,33%,470px); max-height:650px; background:var(--notes-bg); color:var(--notes-ink); border-left:1px solid var(--notes-border); min-width:0; color-scheme:dark; font-family:"IBM Plex Sans",var(--font-sans,system-ui); }
      .notes-header { display:flex; align-items:center; justify-content:space-between; padding:14px 22px; border-bottom:1px solid var(--notes-border); background:linear-gradient(135deg,var(--notes-panel),var(--notes-bg)); }
      .eyebrow { display:flex; align-items:center; gap:8px; margin:0 0 8px; color:var(--notes-accent); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.16em; }
      .eyebrow::before { content:""; width:6px; height:6px; border-radius:50%; background:var(--notes-accent); }
      h3 { margin:0; font-size:20px; line-height:1.2; font-weight:500; letter-spacing:-.04em; }
      .close { color:var(--notes-muted); font-size:24px; padding:0 10px; border:1px solid var(--notes-border); }
      .close:hover { background:var(--notes-panel); color:var(--notes-ink); }
      .notes-body { padding:26px; overflow:auto; flex:1; scrollbar-width:thin; scrollbar-color:var(--notes-border) transparent; }
      .notes-kind { display:inline-block; padding:5px 9px; border:1px solid var(--notes-border); background:var(--notes-panel); border-radius:20px; font-size:10px; letter-spacing:.04em; color:var(--notes-muted); margin-bottom:24px; }
      .text { font-size:18px; font-weight:400; line-height:1.85; letter-spacing:.005em; overflow-wrap:anywhere; }
      .text p { margin:0 0 1.35em; }
      .text > p:first-child { color:#f1f5f0; font-size:19px; }
      .text strong { color:var(--notes-accent); font-weight:600; }
      .text h4 { color:var(--notes-ink); font-size:20px; font-weight:500; line-height:1.4; margin:1.6em 0 .8em; padding-top:18px; border-top:1px solid var(--notes-border); }
      .text h4:first-child { margin-top:0; padding-top:0; border:0; }
      .text ul,.text ol { padding-left:1.3em; margin:0 0 1.3em; }
      .text li { padding-left:5px; margin:.65em 0; }
      .text li::marker { color:var(--notes-accent); }
      .text pre { padding:16px; background:#111612; border:1px solid var(--notes-border); border-radius:8px; overflow:auto; color:#cfdfc4; font:13px/1.7 var(--font-mono,monospace); white-space:pre; }
      .text code { font-family:var(--font-mono,monospace); font-size:.85em; }
      .text :not(pre) > code { color:var(--notes-accent); background:var(--notes-panel); padding:2px 5px; border-radius:4px; }
      .text .cue { padding:14px 16px; border:1px solid var(--notes-border); border-left:3px solid var(--notes-accent); background:var(--notes-panel); border-radius:0 8px 8px 0; color:var(--notes-muted); font-size:14px; line-height:1.6; }
      .text .cue::before { content:"PRESENTER CUE"; display:block; margin-bottom:6px; color:var(--notes-accent); font-size:9px; letter-spacing:.14em; font-weight:600; }
      :host(:fullscreen),:host([data-expanded]) { position:fixed; inset:0; z-index:2147483647; width:100%; height:100%; background:#111; margin:0; }
      :host(:is(:fullscreen,[data-expanded])) .viewer { height:100dvh; border:0; border-radius:0; }
      :host(:is(:fullscreen,[data-expanded])) .screen { flex:1; aspect-ratio:auto; }
      :host(:is(:fullscreen,[data-expanded])) aside { max-height:100dvh; }
      :host(:is(:fullscreen,[data-expanded])) nav { padding:14px 22px; }
      @media(width < 700px) { .viewer { flex-direction:column; } aside { flex-basis:auto; max-height:40vh; border-left:0; border-top:1px solid var(--line); } :host(:is(:fullscreen,[data-expanded])) .presentation { min-height:55vh; } :host(:is(:fullscreen,[data-expanded])) aside { max-height:40vh; } nav { gap:4px; padding:8px; } button { padding:8px; } }
      @media(prefers-reduced-motion:reduce) { .progress span { transition:none; } }
    </style><div class="viewer"><div class="presentation"><div class="screen"><img alt="Workshop slide"></div><div class="progress" aria-hidden="true"><span></span></div><nav aria-label="Slide navigation"><div class="navigation"><button data-direction="-1" aria-label="Previous slide" title="Previous slide (←)">←</button><span class="counter" role="status" aria-live="polite"></span><button data-direction="1" aria-label="Next slide" title="Next slide (→)">→</button></div><div class="tools"><button data-action="transcript" aria-expanded="false" aria-controls="transcript">Transcript</button><button data-action="fullscreen">Fullscreen</button><a class="download" href="${base}../pwn-workshop-1.pdf" download="PWN Workshop 1.pdf">Download PDF</a></div></nav></div><aside id="transcript" hidden><div class="notes-header"><div><h3 class="slide-title">Slide 1</h3></div><button class="close" data-action="close-transcript" aria-label="Close transcript">×</button></div><div class="notes-body"><span class="notes-kind"></span><div class="text"></div></div></aside></div>`
    this.events?.abort()
    this.events = new AbortController()
    const { signal } = this.events
    root.addEventListener(
      "click",
      (event) => {
        const button = (event.target as Element).closest<HTMLButtonElement>(
          "button",
        )
        if (!button) return
        if (button.dataset.direction)
          this.show(this.page + Number(button.dataset.direction))
        if (
          ["transcript", "close-transcript"].includes(
            button.dataset.action ?? "",
          )
        ) {
          this.transcript =
            button.dataset.action === "close-transcript"
              ? false
              : !this.transcript
          root.querySelector<HTMLElement>("aside")!.hidden = !this.transcript
          root
            .querySelector("[data-action=transcript]")!
            .setAttribute("aria-expanded", String(this.transcript))
        }
        if (button.dataset.action === "fullscreen") void this.toggleFullscreen()
      },
      { signal },
    )
    this.tabIndex = 0
    this.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault()
          this.show(this.page + (event.key === "ArrowRight" ? 1 : -1))
        }
      },
      { signal },
    )
    document.addEventListener(
      "fullscreenchange",
      () => this.updateFullscreen(),
      { signal },
    )
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && this.hasAttribute("data-expanded"))
          this.removeAttribute("data-expanded")
      },
      { signal },
    )
    const url = new URL(location.href)
    const [anchor, hashQuery = ""] = url.hash.slice(1).split("?")
    if (
      ["workshop-slides", "workshop-presentation"].includes(anchor) &&
      (url.searchParams.get("full") === "true" ||
        new URLSearchParams(hashQuery).get("full") === "true")
    ) {
      this.setAttribute("data-expanded", "")
    }
    this.updateFullscreen()
    try {
      const response = await fetch(`${base}slides.json`, { signal })
      if (!response.ok) throw new Error("Slides unavailable")
      this.slides = await response.json()
      this.show(this.page)
    } catch {
      if (!signal.aborted) {
        root.querySelector<HTMLElement>("aside")!.hidden = false
        root.querySelector(".text")!.textContent =
          "Could not load slides. Refresh to try again."
      }
    }
  }

  disconnectedCallback() {
    this.events?.abort()
  }

  private show(page: number) {
    if (!this.slides.length) return
    this.page = Math.max(0, Math.min(this.slides.length - 1, page))
    const root = this.shadowRoot!
    const slide = this.slides[this.page]
    const img = root.querySelector("img")!
    img.src = base + slide.image
    img.alt = `Slide ${this.page + 1}`
    root.querySelector("[role=status]")!.textContent =
      `${this.page + 1} / ${this.slides.length}`
    this.renderTranscript(slide.script || slide.text)
    root.querySelector(".slide-title")!.textContent = `Slide ${this.page + 1}`
    root.querySelector(".notes-kind")!.textContent = slide.script
      ? "Speaker script"
      : "Slide text"
    root.querySelector<HTMLElement>(".progress span")!.style.width =
      `${((this.page + 1) / this.slides.length) * 100}%`
    root.querySelector(".notes-body")!.scrollTop = 0
    root.querySelector<HTMLButtonElement>('[data-direction="-1"]')!.disabled =
      this.page === 0
    root.querySelector<HTMLButtonElement>('[data-direction="1"]')!.disabled =
      this.page === this.slides.length - 1
  }

  private renderTranscript(text: string) {
    const container = this.shadowRoot!.querySelector(".text")!
    container.replaceChildren()
    const lines = text.replace(/\r/g, "").split("\n")
    let paragraph: string[] = []
    let code: string[] | null = null
    let list: HTMLUListElement | HTMLOListElement | null = null
    const inline = (element: HTMLElement, value: string) => {
      for (const part of value.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)) {
        if (part.startsWith("**") && part.endsWith("**")) {
          const strong = document.createElement("strong")
          strong.textContent = part.slice(2, -2)
          element.append(strong)
        } else if (part.startsWith("`") && part.endsWith("`")) {
          const code = document.createElement("code")
          code.textContent = part.slice(1, -1)
          element.append(code)
        } else element.append(document.createTextNode(part))
      }
    }
    const flush = () => {
      if (!paragraph.length) return
      const p = document.createElement("p")
      inline(p, paragraph.join(" "))
      container.append(p)
      paragraph = []
    }
    for (const line of lines) {
      if (line.trim().startsWith("```")) {
        flush()
        list = null
        if (code) {
          const pre = document.createElement("pre")
          pre.textContent = code.join("\n")
          container.append(pre)
          code = null
        } else code = []
        continue
      }
      if (code) {
        code.push(line)
        continue
      }
      const value = line.trim()
      if (!value) {
        flush()
        list = null
        continue
      }
      if (/^<<.*>>$/.test(value) || /^\[[^\]]+\]$/.test(value)) {
        flush()
        list = null
        const cue = document.createElement("p")
        cue.className = "cue"
        cue.textContent = value.startsWith("<<")
          ? value.slice(2, -2).trim()
          : value.slice(1, -1).trim()
        container.append(cue)
        continue
      }
      if (/^#{1,6}\s/.test(value) || /^\*\*[^*]+\*\*$/.test(value)) {
        flush()
        list = null
        const h = document.createElement("h4")
        inline(h, value.replace(/^#{1,6}\s+/, ""))
        container.append(h)
        continue
      }
      const item = /^(?:[-*] |(\d+)\. )(.*)$/.exec(value)
      if (item) {
        flush()
        const tag = item[1] ? "ol" : "ul"
        if (!list || list.tagName.toLowerCase() !== tag) {
          list = document.createElement(tag)
          container.append(list)
        }
        const li = document.createElement("li")
        inline(li, item[2])
        list.append(li)
        continue
      }
      list = null
      paragraph.push(value)
    }
    flush()
    if (code) {
      const pre = document.createElement("pre")
      pre.textContent = code.join("\n")
      container.append(pre)
    }
  }

  private async toggleFullscreen() {
    if (document.fullscreenElement === this) await document.exitFullscreen()
    else if (this.hasAttribute("data-expanded"))
      this.removeAttribute("data-expanded")
    else {
      try {
        await this.requestFullscreen()
      } catch {
        this.setAttribute("data-expanded", "")
      }
    }
    this.updateFullscreen()
  }

  private updateFullscreen() {
    const button = this.shadowRoot?.querySelector<HTMLButtonElement>(
      '[data-action="fullscreen"]',
    )
    if (!button) return
    const expanded =
      document.fullscreenElement === this || this.hasAttribute("data-expanded")
    button.textContent = expanded ? "Exit fullscreen" : "Fullscreen"
    button.setAttribute("aria-pressed", String(expanded))
  }
}
if (!customElements.get("workshop-slides"))
  customElements.define("workshop-slides", WorkshopSlides)
