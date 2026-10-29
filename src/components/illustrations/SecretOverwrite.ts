import { StepWalkthrough, controls, header } from "./StepWalkthrough"

const styles = /* css */ `
  .scene { display: flex; flex-direction: column; justify-content: center; gap: 19px; }
  .challenge { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  .fact { display: flex; flex-direction: column; gap: 4px; padding: 11px 13px; border: 1px solid var(--line); border-radius: 7px; background: var(--panel); }
  .fact span { color: var(--secondary); font-size: 11px; }
  .fact code { font-size: 14px; }
  .layout-note { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: var(--secondary); font: 11px var(--mono); }
  .layout-note strong { color: var(--danger); font-size: 12px; letter-spacing: .06em; }
  .memory-scroll { overflow-x: auto; padding: 2px; }
  .memory { min-width: 760px; }
  .groups { display: grid; grid-template-columns: 8fr 4fr; gap: 8px; margin-bottom: 7px; }
  .group { padding: 7px 10px; border-bottom: 2px solid var(--accent); text-align: center; color: var(--ink); font: 13px var(--mono); }
  .group.secret { border-color: var(--danger); }
  .cells { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 5px; }
  .cell { display: flex; min-height: 83px; flex-direction: column; align-items: center; justify-content: center; gap: 5px; border: 1px solid var(--line); border-radius: 6px; background: var(--panel); transition: background 350ms ease, border-color 350ms ease, transform 350ms cubic-bezier(.2,.8,.2,1); }
  .cell[data-buffer] { border-color: color-mix(in oklab, var(--accent) 55%, var(--line)); }
  .cell[data-secret] { border-color: color-mix(in oklab, var(--danger) 50%, var(--line)); }
  .cell .index { color: var(--secondary); font: 10px var(--mono); }
  .cell output { color: var(--secondary); font: 17px var(--mono); }
  .cell .byte { color: var(--secondary); font: 10px var(--mono); }
  .cell[data-written][data-buffer] { background: var(--accent-fill); }
  .cell[data-written][data-buffer] output { color: var(--accent); }
  .cell[data-written][data-secret] { border-color: var(--danger); background: var(--danger-fill); }
  .cell[data-written][data-secret] output { color: var(--danger); }
  .cell[data-entering] { animation: byte-cross 420ms cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--delay, 0ms); }
  .memory-caption { display: flex; justify-content: space-between; margin-top: 7px; color: var(--secondary); font: 10px var(--mono); }
  .result { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 14px; min-height: 58px; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); transition: border-color 250ms ease, background 250ms ease; }
  .result span { color: var(--secondary); font-size: 13px; }
  .result output { color: var(--ink); font: 700 20px var(--mono); }
  .result[data-success] { border-color: var(--accent); background: var(--accent-fill); }
  .result[data-success] output { color: var(--accent); }
  .theory-note { margin: 0; color: var(--secondary); text-align: center; font-size: 12px; }
  .byte-note { color: var(--secondary); font: 11px var(--mono); }
  @keyframes byte-cross { from { opacity: .2; transform: translateX(-28px) scale(.92); } to { opacity: 1; transform: none; } }
  :host(:is(:fullscreen, [data-expanded])) .scene { gap: 24px; }
  :host(:is(:fullscreen, [data-expanded])) .fact { padding: 16px 20px; }
  :host(:is(:fullscreen, [data-expanded])) .fact span { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .fact code { font-size: 20px; }
  :host(:is(:fullscreen, [data-expanded])) .layout-note { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .layout-note strong { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .memory { min-width: 1050px; }
  :host(:is(:fullscreen, [data-expanded])) .group { font-size: 18px; }
  :host(:is(:fullscreen, [data-expanded])) .cells { gap: 8px; }
  :host(:is(:fullscreen, [data-expanded])) .cell { min-height: 116px; }
  :host(:is(:fullscreen, [data-expanded])) .cell .index { font-size: 13px; }
  :host(:is(:fullscreen, [data-expanded])) .cell output { font-size: 23px; }
  :host(:is(:fullscreen, [data-expanded])) .cell .byte { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .memory-caption, :host(:is(:fullscreen, [data-expanded])) .byte-note { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .result { min-height: 76px; padding: 16px 20px; }
  :host(:is(:fullscreen, [data-expanded])) .result span { font-size: 18px; }
  :host(:is(:fullscreen, [data-expanded])) .result output { font-size: 28px; }
  :host(:is(:fullscreen, [data-expanded])) .theory-note { font-size: 16px; }
  @media (width < 700px) {
    .scene { gap: 14px; }
    .challenge { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
    .fact { padding: 8px; }
    .fact code { font-size: 11px; }
    .layout-note { align-items: flex-start; flex-direction: column; }
  }
`

class SecretOverwrite extends StepWalkthrough {
  protected readonly stepCount = 4

  protected template() {
    const buffer = Array.from(
      { length: 8 },
      (_, index) => `<div class="cell" data-buffer data-cell="${index}"><span class="index">[${index}]</span><output>·</output><span class="byte"></span></div>`,
    ).join("")
    const secret = [0, 1, 2, 3]
      .map(
        (index) => `<div class="cell" data-secret data-cell="${index + 8}"><span class="index">byte ${index}</span><output>00</output></div>`,
      )
      .join("")
    return `
      <figure aria-label="Theoretical buffer overflow that changes a secret value">
        ${header("Overwriting a Secret")}
        <div class="scene">
          <div class="challenge">
            <div class="fact"><span>Buffer</span><code>char buffer[8]</code></div>
            <div class="fact"><span>Read limit</span><code>32 bytes</code></div>
            <div class="fact"><span>Initial value</span><code>secret = 0</code></div>
            <div class="fact"><span>Check</span><code>secret == 1234</code></div>
          </div>
          <div class="layout-note"><strong>THEORETICAL STACK LAYOUT</strong><span>one possible arrangement · no addresses shown</span></div>
          <div class="memory-scroll" role="region" tabindex="0" aria-label="Conceptual buffer and secret bytes">
            <div class="memory">
              <div class="groups"><div class="group">buffer · 8 bytes</div><div class="group secret">secret · 4-byte int</div></div>
              <div class="cells">${buffer}${secret}</div>
              <div class="memory-caption"><span>input writes →</span><span class="byte-note">1234 = 0x000004D2 · little-endian bytes: D2 04 00 00</span></div>
            </div>
          </div>
          <div class="result" data-result><span data-result-label>Challenge state</span><output data-result-value>secret = 0</output></div>
          <p class="theory-note" data-theory-note>A real build may place locals differently; confirm their addresses in GDB.</p>
          <p class="step-status" aria-live="polite"></p>
        </div>
        ${controls(4, "Secret overwrite steps")}
      </figure>`
  }

  protected styles() {
    return styles
  }

  protected renderStep() {
    const root = this.shadowRoot!
    root.querySelectorAll<HTMLElement>("[data-cell]").forEach((cell, index) => {
      const output = cell.querySelector("output")!
      if (index < 8) {
        const filled = this.step >= 1
        cell.toggleAttribute("data-written", filled)
        output.textContent = filled ? "A" : "·"
        cell.querySelector<HTMLElement>(".byte")!.textContent = filled ? "41" : ""
      } else {
        const overwritten = this.step >= 2
        cell.toggleAttribute("data-written", overwritten)
        cell.toggleAttribute("data-entering", this.step === 2)
        cell.style.setProperty("--delay", `${(index - 8) * 100}ms`)
        output.textContent = overwritten
          ? ["D2", "04", "00", "00"][index - 8]!
          : "00"
      }
    })
    const result = root.querySelector<HTMLElement>("[data-result]")!
    const resultLabel = root.querySelector<HTMLElement>("[data-result-label]")!
    const resultValue = root.querySelector<HTMLOutputElement>("[data-result-value]")!
    result.toggleAttribute("data-success", this.step === 3)
    resultLabel.textContent =
      this.step === 0
        ? "Challenge state"
        : this.step < 3
          ? "Current secret"
          : "If this layout applies"
    resultValue.textContent =
      this.step < 2
        ? "secret = 0"
        : this.step === 2
          ? "secret = 1234"
          : "Correct password!"
    const note = root.querySelector<HTMLElement>("[data-theory-note]")!
    note.textContent =
      this.step === 3
        ? "Theory example: the overflow reaches secret only in this layout. Verify real addresses in GDB."
        : "A real build may place locals differently; confirm their addresses in GDB."
    const status = [
      "The challenge reads up to 32 bytes into an eight-byte buffer; secret starts at zero.",
      "Eight A bytes fill the buffer.",
      "In this possible layout, the next four bytes set secret to 1234.",
      "The comparison succeeds only if the overflow reaches secret.",
    ][this.step]!
    root.querySelector<HTMLElement>(".step-status")!.textContent = status
    root
      .querySelector<HTMLElement>(".progress")
      ?.setAttribute("aria-valuenow", String(this.step + 1))
  }
}

if (!customElements.get("secret-overwrite"))
  customElements.define("secret-overwrite", SecretOverwrite)
