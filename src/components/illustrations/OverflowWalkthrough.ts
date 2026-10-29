import { StepWalkthrough, controls, header } from "./StepWalkthrough"

const styles = /* css */ `
  .scene { display: flex; flex-direction: column; justify-content: center; gap: 28px; }
  .input { display: flex; align-items: center; gap: 14px; overflow-x: auto; color: var(--secondary); font-size: 14px; }
  .input-label { flex: 0 0 auto; color: var(--ink); font-weight: 650; }
  .incoming { display: grid; flex-shrink: 0; grid-template-columns: repeat(12, 36px); gap: 5px; }
  .incoming span { display: grid; place-items: center; min-height: 38px; border: 1px solid var(--line); border-radius: 5px; background: var(--panel); color: var(--accent); font: 17px var(--mono); opacity: .15; transform: translateY(5px); transition: opacity 260ms ease, transform 300ms ease, border-color 260ms ease; }
  .incoming span[data-present] { opacity: 1; transform: none; }
  .incoming span[data-overflow] { border-color: var(--danger); background: var(--danger-fill); color: var(--danger); }
  .memory-scroll { overflow-x: auto; padding: 4px 2px 8px; }
  .memory { min-width: 720px; }
  .group-labels { display: grid; grid-template-columns: 8fr 4fr; gap: 8px; margin-bottom: 8px; }
  .group-label { padding: 6px 9px; border-bottom: 2px solid var(--accent); color: var(--ink); font: 14px var(--mono); text-align: center; }
  .group-label.next-memory { border-color: var(--line); color: var(--secondary); }
  .cells { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 5px; }
  .cell { position: relative; display: flex; min-height: 86px; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--line); border-radius: 6px; background: var(--panel); transition: background 300ms ease, border-color 300ms ease, color 300ms ease, transform 300ms cubic-bezier(.2,.8,.2,1); }
  .cell .index { position: absolute; top: 6px; left: 7px; color: var(--secondary); font: 10px var(--mono); }
  .cell .value { color: var(--secondary); font: 20px var(--mono); }
  .cell .byte { color: var(--secondary); font: 10px var(--mono); }
  .cell[data-written] { border-color: color-mix(in oklab, var(--accent) 66%, var(--line)); background: var(--accent-fill); }
  .cell[data-written] .value, .cell[data-written] .byte { color: var(--accent); }
  .cell[data-overflow] { border: 2px solid var(--danger); background: var(--danger-fill); }
  .cell[data-boundary] { border-left: 2px dashed var(--line); }
  .cells[data-overflow] .cell[data-boundary] { border-left-color: var(--danger); }
  .cell[data-overflow] .value, .cell[data-overflow] .byte { color: var(--danger); }
  .cell[data-entering] { animation: spill-in 440ms cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--delay, 0ms); }
  .boundary-label { display: flex; justify-content: space-between; margin-top: 8px; color: var(--secondary); font: 11px var(--mono); }
  .state-label { min-height: 26px; color: var(--ink); text-align: center; font-size: 17px; font-weight: 600; }
  @keyframes spill-in { from { opacity: .25; transform: translateX(-22px) scale(.9); } to { opacity: 1; transform: translateX(0) scale(1); } }
  :host(:is(:fullscreen, [data-expanded])) .scene { gap: 36px; }
  :host(:is(:fullscreen, [data-expanded])) .input { font-size: 20px; }
  :host(:is(:fullscreen, [data-expanded])) .incoming { grid-template-columns: repeat(12, 46px); gap: 7px; }
  :host(:is(:fullscreen, [data-expanded])) .incoming span { min-height: 52px; font-size: 23px; }
  :host(:is(:fullscreen, [data-expanded])) .memory { min-width: 1050px; }
  :host(:is(:fullscreen, [data-expanded])) .group-label { padding: 9px; font-size: 19px; }
  :host(:is(:fullscreen, [data-expanded])) .cells { gap: 8px; }
  :host(:is(:fullscreen, [data-expanded])) .cell { min-height: 126px; }
  :host(:is(:fullscreen, [data-expanded])) .cell .index { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .cell .value { font-size: 30px; }
  :host(:is(:fullscreen, [data-expanded])) .cell .byte { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .boundary-label { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .state-label { font-size: 24px; }
  @media (width < 700px) {
    .scene { gap: 20px; }
    .incoming { grid-template-columns: repeat(12, 28px); gap: 3px; }
    .incoming span { min-height: 32px; }
    .input { gap: 8px; }
  }
`

class OverflowWalkthrough extends StepWalkthrough {
  protected readonly stepCount = 3

  protected template() {
    const cells = Array.from(
      { length: 12 },
      (_, index) => `
        <div class="cell" data-cell="${index}" ${index < 8 ? "" : 'data-neighbor=""'} ${index === 8 ? 'data-boundary=""' : ""}>
          <span class="index">${index < 8 ? `[${index}]` : `+${index - 7}`}</span>
          <span class="value"></span><span class="byte"></span>
        </div>`,
    ).join("")
    return `
      <figure aria-label="Eight-byte buffer filling and overflowing into surrounding memory">
        ${header("Eight-Byte Buffer")}
        <div class="scene">
          <div class="input"><span class="input-label">Input</span><div class="incoming" aria-label="Input bytes">${Array.from(
            { length: 12 },
            () => "<span>A</span>",
          ).join("")}</div></div>
          <div class="memory-scroll" role="region" tabindex="0" aria-label="Buffer and following memory cells">
            <div class="memory">
              <div class="group-labels"><div class="group-label">char buffer[8]</div><div class="group-label next-memory">next memory</div></div>
              <div class="cells">${cells}</div>
              <div class="boundary-label"><span>buffer start</span><span data-boundary-caption>capacity: 8 bytes</span><span>next region</span></div>
            </div>
          </div>
          <p class="state-label" data-state-label></p>
          <p class="step-status" aria-live="polite"></p>
        </div>
        ${controls(3, "Buffer overflow steps")}
      </figure>`
  }

  protected styles() {
    return styles
  }

  protected renderStep() {
    const root = this.shadowRoot!
    const written = [4, 8, 12][this.step]!
    const cells = root.querySelector<HTMLElement>(".cells")!
    cells.toggleAttribute("data-overflow", this.step === 2)
    root.querySelectorAll<HTMLElement>("[data-cell]").forEach((cell, index) => {
      const value = cell.querySelector<HTMLElement>(".value")!
      const byte = cell.querySelector<HTMLElement>(".byte")!
      const filled = index < written
      const overflow = filled && index >= 8
      cell.toggleAttribute("data-written", filled && !overflow)
      cell.toggleAttribute("data-overflow", overflow)
      cell.toggleAttribute("data-entering", this.step === 2 && index >= 8)
      cell.style.setProperty("--delay", `${Math.max(0, index - 8) * 70}ms`)
      value.textContent = filled ? "A" : "·"
      byte.textContent = filled ? "0x41" : ""
    })
    root.querySelectorAll<HTMLElement>(".incoming span").forEach((chip, index) => {
      chip.toggleAttribute("data-present", index < written)
      if (this.step === 2 && index >= 8) chip.setAttribute("data-overflow", "")
      else chip.removeAttribute("data-overflow")
    })
    const caption = [
      "Four bytes occupy the first four cells.",
      "All eight buffer cells are full.",
      "Four more bytes cross the buffer boundary.",
    ][this.step]!
    root.querySelector<HTMLElement>("[data-state-label]")!.textContent = caption
    root.querySelector<HTMLElement>("[data-boundary-caption]")!.textContent =
      this.step === 2 ? "4 bytes beyond capacity" : "capacity: 8 bytes"
    root.querySelector<HTMLElement>(".step-status")!.textContent = caption
    root
      .querySelector<HTMLElement>(".progress")
      ?.setAttribute("aria-valuenow", String(this.step + 1))
  }
}

if (!customElements.get("overflow-walkthrough"))
  customElements.define("overflow-walkthrough", OverflowWalkthrough)
