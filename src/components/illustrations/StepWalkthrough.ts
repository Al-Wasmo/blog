import { PRESENTATION_STYLES } from "./presentation"

export const icon = (path: string) =>
  `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${path}"/></svg>`

const baseStyles = /* css */ `
  :host {
    --surface: var(--background, light-dark(#fbfcf9, #111411));
    --panel: var(--gray-2, light-dark(#f2f5ef, #1c211c));
    --ink: var(--foreground, light-dark(#20231f, #eff3eb));
    --secondary: var(--muted-foreground, light-dark(#64705f, #adb7a6));
    --line: var(--border, light-dark(#d6ddd0, #3a4436));
    --accent: light-dark(#527d18, #b1df43);
    --accent-fill: color-mix(in oklab, var(--accent) 14%, var(--surface));
    --danger: var(--destructive, light-dark(#bd343b, #ff898b));
    --danger-fill: color-mix(in oklab, var(--danger) 16%, var(--surface));
    --mono: var(--font-mono, ui-monospace, monospace);
    display: block;
    margin: 0;
    color: var(--ink);
    font: 14px/1.45 var(--font-sans, system-ui, sans-serif);
    text-align: left;
  }
  *, *::before, *::after { box-sizing: border-box; }
  [hidden] { display: none !important; }
  figure { width: 100%; margin: 0; overflow: clip; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
  :host-context(details[data-illustration]) figure { border: 0; border-radius: 0; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 22px 0; }
  h3 { margin: 0; font-size: 18px; font-weight: 650; }
  button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 36px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); font: inherit; font-size: 12px; cursor: pointer; }
  button:hover:not(:disabled) { border-color: var(--accent); background: var(--accent-fill); }
  button:disabled { opacity: .42; cursor: default; }
  button svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  .scene { min-height: 250px; padding: 24px 28px; }
  .controls { display: flex; align-items: center; gap: 8px; padding: 14px 22px; border-top: 1px solid var(--line); background: var(--panel); }
  .controls .next { border-color: var(--ink); background: var(--ink); color: var(--surface); }
  .controls .next:hover:not(:disabled) { border-color: var(--accent); background: var(--accent); color: var(--surface); }
  .counter { margin-left: auto; color: var(--secondary); font: 12px var(--mono); }
  .progress { height: 3px; overflow: hidden; background: var(--line); }
  .progress span { display: block; width: 0; height: 100%; background: var(--accent); transition: width 300ms ease; }
  .step-status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  code, output { font-family: var(--mono); }
  :host(:fullscreen), :host([data-expanded]) { display: flex; align-items: safe center; justify-content: center; width: 100%; height: 100%; margin: 0; padding: 18px; overflow: auto; overscroll-behavior: contain; background: var(--surface); }
  :host(:fullscreen) figure, :host([data-expanded]) figure { max-width: 1500px; flex-shrink: 0; }
  :host([data-expanded]) { position: fixed; inset: 0; z-index: 2147483647; }
  :host(:fullscreen) .scene, :host([data-expanded]) .scene { min-height: min(62vh, 560px); padding: 34px 42px; }
  @media (width < 620px) {
    header { padding: 14px 14px 0; }
    .scene { min-height: 220px; padding: 20px 14px; }
    .controls { padding: 12px 14px; }
    :host(:fullscreen), :host([data-expanded]) { padding: 8px; }
    :host(:fullscreen) .scene, :host([data-expanded]) .scene { padding: 24px 16px; }
  }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  ${PRESENTATION_STYLES}
`

export abstract class StepWalkthrough extends HTMLElement {
  static observedAttributes = ["data-expanded"]

  protected step = 0
  private events?: AbortController

  protected abstract readonly stepCount: number
  protected abstract template(): string
  protected abstract renderStep(): void

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" })
    const root = this.shadowRoot!
    if (!root.querySelector("figure")) {
      root.innerHTML = `<style>${baseStyles}${this.styles()}</style>${this.template()}`
    }

    this.events?.abort()
    this.events = new AbortController()
    const { signal } = this.events
    root.addEventListener(
      "click",
      (event) => {
        const button = (event.target as Element).closest<HTMLButtonElement>(
          "button[data-action]",
        )
        if (!button || button.disabled) return
        const action = button.dataset.action
        if (action === "fullscreen") {
          void this.toggleFullscreen()
          return
        }
        if (action === "reset") this.goTo(0)
        else if (action === "next") this.goTo(this.step + 1)
        else if (action === "back") this.goTo(this.step - 1)
        else this.onAction(action ?? "", button)
      },
      { signal },
    )
    document.addEventListener("fullscreenchange", () => this.updateFullscreen(), {
      signal,
    })
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Escape" || !this.hasAttribute("data-expanded")) return
        this.removeAttribute("data-expanded")
        this.updateFullscreen()
        root
          .querySelector<HTMLButtonElement>("[data-action=fullscreen]")
          ?.focus()
      },
      { signal },
    )
    this.refresh()
  }

  disconnectedCallback() {
    this.events?.abort()
  }

  attributeChangedCallback() {
    if (this.shadowRoot?.querySelector("[data-action=fullscreen]"))
      this.updateFullscreen()
  }

  protected styles() {
    return ""
  }

  protected onAction(_action: string, _button: HTMLButtonElement) {}

  protected refresh() {
    this.renderStep()
    const root = this.shadowRoot!
    const back = root.querySelector<HTMLButtonElement>("[data-action=back]")
    const next = root.querySelector<HTMLButtonElement>("[data-action=next]")
    const counter = root.querySelector<HTMLElement>(".counter")
    const progressBar = root.querySelector<HTMLElement>(".progress")
    const progress = root.querySelector<HTMLElement>(".progress span")
    if (back) back.disabled = this.step === 0
    if (next) next.disabled = this.step === this.stepCount - 1
    if (counter) counter.textContent = `${this.step + 1} / ${this.stepCount}`
    progressBar?.setAttribute("aria-valuenow", String(this.step + 1))
    if (progress)
      progress.style.width = `${((this.step + 1) / this.stepCount) * 100}%`
    this.updateFullscreen()
  }

  protected goTo(step: number) {
    this.step = Math.max(0, Math.min(this.stepCount - 1, step))
    this.refresh()
  }

  private async toggleFullscreen() {
    if (document.fullscreenElement === this) {
      await document.exitFullscreen()
    } else if (this.hasAttribute("data-expanded")) {
      this.removeAttribute("data-expanded")
    } else {
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
      "[data-action=fullscreen]",
    )
    if (!button) return
    const expanded =
      document.fullscreenElement === this || this.hasAttribute("data-expanded")
    button.innerHTML = expanded
      ? icon("M2 6h4V2M10 2v4h4M14 10h-4v4M6 14v-4H2")
      : icon("M6 2H2v4M10 2h4v4M14 10v4h-4M6 14H2v-4")
    button.setAttribute(
      "aria-label",
      expanded ? "Exit fullscreen" : "Enter fullscreen",
    )
    button.setAttribute("aria-pressed", String(expanded))
    button.title = expanded ? "Exit fullscreen (Esc)" : "Fullscreen"
  }
}

export const controls = (count: number, label: string) => `
  <div class="progress" role="progressbar" aria-label="${label}" aria-valuemin="1" aria-valuemax="${count}" aria-valuenow="1"><span></span></div>
  <div class="controls" role="group" aria-label="${label} controls">
    <button type="button" data-action="back">${icon("m10 4-4 4 4 4")} Back</button>
    <button type="button" class="next" data-action="next">Next ${icon("m6 4 4 4-4 4")}</button>
    <button type="button" data-action="reset" aria-label="Reset illustration" title="Reset">${icon("M3 6a5 5 0 1 1 0 4M3 2v4h4")} Reset</button>
    <span class="counter"></span>
  </div>`

export const header = (title: string) => `
  <header><h3>${title}</h3><button type="button" data-action="fullscreen" aria-label="Enter fullscreen" title="Fullscreen"></button></header>`
