import {
  StepWalkthrough,
  controls,
  header,
} from "./StepWalkthrough"

const stages = [
  { mark: "?", title: "Unknown file", tool: "Target" },
  { mark: "ELF", title: "File type", tool: "file" },
  { mark: "Aa", title: "Readable strings", tool: "strings" },
  { mark: "asm", title: "Assembly", tool: "objdump" },
  { mark: "G", title: "Ghidra view", tool: "Ghidra" },
]

const styles = /* css */ `
  .scene { display: flex; flex-direction: column; justify-content: center; gap: 26px; }
  .artifact { display: flex; align-items: center; gap: 10px; width: fit-content; margin-inline: auto; padding: 8px 14px; border: 1px solid var(--line); border-radius: 999px; color: var(--secondary); font: 13px var(--mono); }
  .artifact::before { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); content: ""; }
  .flow-scroll { overflow-x: auto; }
  .flow { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
  .node { position: relative; display: grid; justify-items: center; align-content: center; gap: 10px; min-height: 150px; padding: 14px 8px; border: 1px solid var(--line); border-radius: 9px; background: var(--panel); opacity: .48; transform: scale(.97); transition: opacity 300ms ease, transform 350ms cubic-bezier(.2,.8,.2,1), border-color 300ms ease, background 300ms ease; }
  .node:not(:last-child)::after { position: absolute; z-index: 1; top: 50%; left: calc(100% + 1px); width: 10px; color: var(--secondary); content: "→"; font: 20px var(--mono); transform: translateY(-50%); }
  .node[data-done] { opacity: .82; transform: none; }
  .node[data-active] { border-color: var(--accent); background: var(--accent-fill); opacity: 1; transform: translateY(-4px); }
  .mark { display: grid; place-items: center; width: 64px; height: 64px; border: 1px solid var(--line); border-radius: 13px; background: var(--surface); color: var(--accent); font: 700 21px var(--mono); }
  .node[data-active] .mark { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-fill); }
  .node-title { text-align: center; font-size: 14px; font-weight: 650; }
  .tool { color: var(--secondary); font: 11px var(--mono); }
  .caption { min-height: 24px; color: var(--secondary); text-align: center; font-size: 15px; }
  .comparison { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; animation: arrive 400ms ease both; }
  .method { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 10px 16px; padding: 20px; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); }
  .method[data-kind=dynamic] { border-color: color-mix(in oklab, var(--accent) 60%, var(--line)); }
  .method-mark { display: grid; grid-row: span 2; place-items: center; width: 62px; height: 62px; border-radius: 50%; background: var(--accent-fill); color: var(--accent); font: 700 19px var(--mono); }
  .method h4 { margin: 0; font-size: 19px; }
  .method p { margin: 3px 0 0; color: var(--secondary); font-size: 14px; }
  .method-path { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 9px; padding-top: 12px; border-top: 1px solid var(--line); color: var(--ink); font: 13px var(--mono); }
  .method-path span { padding: 7px 9px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); }
  .method-path b { color: var(--accent); font-weight: 500; }
  [hidden] { display: none !important; }
  @keyframes arrive { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  :host(:is(:fullscreen, [data-expanded])) .flow { gap: 24px; }
  :host(:is(:fullscreen, [data-expanded])) .node { min-height: 190px; }
  :host(:is(:fullscreen, [data-expanded])) .mark { width: 78px; height: 78px; font-size: 26px; }
  :host(:is(:fullscreen, [data-expanded])) .node-title { font-size: 20px; }
  :host(:is(:fullscreen, [data-expanded])) .tool { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .caption { font-size: 20px; }
  :host(:is(:fullscreen, [data-expanded])) .method { padding: 28px; }
  :host(:is(:fullscreen, [data-expanded])) .method h4 { font-size: 26px; }
  :host(:is(:fullscreen, [data-expanded])) .method p { font-size: 18px; }
  :host(:is(:fullscreen, [data-expanded])) .method-path { gap: 12px; font-size: 18px; }
  :host(:is(:fullscreen, [data-expanded])) .method-path span { padding: 10px 13px; }
  @media (width < 700px) {
    .flow { min-width: 620px; }
    .comparison { grid-template-columns: 1fr; gap: 10px; }
    .method { padding: 12px; }
    .method-path { gap: 5px; font-size: 11px; }
  }
`

class ReverseEngineeringProcess extends StepWalkthrough {
  protected readonly stepCount = 6

  protected template() {
    return `
      <figure aria-label="Reverse engineering workflow from unknown file to Ghidra">
        ${header("Reverse Engineering Process")}
        <div class="scene">
          <div class="artifact">same target · vault</div>
          <div class="flow-scroll" role="region" tabindex="0" aria-label="Reverse engineering stages"><div class="flow" role="list" aria-label="Analysis stages">${stages
            .map(
              (stage, index) => `
                <div class="node" data-stage="${index}" role="listitem">
                  <span class="mark">${stage.mark}</span>
                  <span class="node-title">${stage.title}</span>
                  <span class="tool">${stage.tool}</span>
                </div>`,
            )
            .join("")}</div></div>
          <p class="caption" data-caption></p>
          <div class="comparison" data-comparison hidden>
            <section class="method" data-kind="static">
              <span class="method-mark">01</span>
              <div><h4>Static</h4><p>Inspect the file without running it.</p></div>
              <div class="method-path"><span>Strings</span><b>→</b><span>Assembly</span><b>→</b><span>Ghidra</span></div>
            </section>
            <section class="method" data-kind="dynamic">
              <span class="method-mark">02</span>
              <div><h4>Dynamic</h4><p>Run it and inspect its behavior.</p></div>
              <div class="method-path"><span>Run target</span><b>→</b><span>GDB</span><b>→</b><span>Inspect</span></div>
            </section>
          </div>
          <p class="step-status" aria-live="polite"></p>
        </div>
        ${controls(6, "Reverse engineering process")}
      </figure>`
  }

  protected styles() {
    return styles
  }

  protected renderStep() {
    const root = this.shadowRoot!
    root.querySelectorAll<HTMLElement>("[data-stage]").forEach((node, index) => {
      node.toggleAttribute("data-active", index === Math.min(this.step, 4))
      node.toggleAttribute("data-done", index < Math.min(this.step, 4))
    })
    const caption = root.querySelector<HTMLElement>("[data-caption]")!
    const comparison = root.querySelector<HTMLElement>("[data-comparison]")!
    const captions = [
      "Start with a program we know nothing about.",
      "Identify its file format.",
      "Look for readable content.",
      "Decode machine instructions into assembly.",
      "Explore the program in Ghidra.",
    ]
    comparison.hidden = this.step !== 5
    caption.hidden = this.step === 5
    caption.textContent = captions[Math.min(this.step, 4)]!
    const status = root.querySelector<HTMLElement>(".step-status")!
    status.textContent =
      this.step === 5
        ? "Compare static analysis with dynamic analysis in GDB."
        : captions[this.step]!
    root
      .querySelector<HTMLElement>(".progress")
      ?.setAttribute("aria-valuenow", String(this.step + 1))
  }
}

if (!customElements.get("reverse-engineering-process"))
  customElements.define("reverse-engineering-process", ReverseEngineeringProcess)
