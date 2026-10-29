import { controls, header } from "./StepWalkthrough"

export const solveStyles = /* css */ `
  .scene { display: flex; flex-direction: column; justify-content: center; gap: 14px; }
  .stage-heading { display: flex; align-items: baseline; gap: 12px; }
  .stage-heading h4 { margin: 0; font-size: 18px; font-weight: 650; }
  .solve-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: 16px; align-items: stretch; }
  .visual-panel { display: grid; align-content: center; min-height: 230px; padding: 20px; border: 1px solid var(--line); border-radius: 9px; background: var(--panel); }
  .solve-visual-content { width: 100%; animation: step-in 300ms cubic-bezier(.2,.8,.2,1) both; }
  .console { align-self: stretch; min-width: 0; overflow: hidden; border: 1px solid #343c35; border-radius: 9px; background: #111612; color: #e5eee4; }
  .console-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 12px; border-bottom: 1px solid #343c35; color: #b2c0b1; font: 11px var(--mono); }
  .console-lights { display: flex; gap: 5px; }
  .console-lights i { width: 7px; height: 7px; border-radius: 50%; background: #6aa437; }
  .console-body { min-height: 185px; padding: 14px 15px; overflow-x: auto; font: 12px/1.65 var(--mono); animation: step-in 300ms cubic-bezier(.2,.8,.2,1) both; }
  .commands { display: grid; gap: 3px; overflow-x: auto; }
  .command { color: #e5eee4; white-space: nowrap; }
  .prompt { color: #b1df43; }
  .console-output { margin: 11px 0 0; color: #bdc9bc; white-space: pre-wrap; overflow-wrap: anywhere; }
  .console-output:empty { display: none; }
  .caption { margin: 0; color: var(--secondary); text-align: center; font-size: 13px; }
  .step-status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .source { display: grid; gap: 7px; font: 14px/1.55 var(--mono); }
  .source-line { display: flex; align-items: baseline; gap: 12px; min-width: 0; }
  .line-no { flex: 0 0 2.5ch; color: var(--secondary); text-align: right; }
  .source-line code { color: var(--ink); }
  .source-line [data-highlight] { color: var(--accent); }
  .source-line [data-risk] { color: var(--danger); }
  .target-check { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; padding: 10px; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); font: 14px var(--mono); }
  .target-check strong { color: var(--accent); }
  .facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
  .fact { display: grid; align-content: center; gap: 7px; min-height: 74px; padding: 11px; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); text-align: center; }
  .fact strong { font: 650 17px var(--mono); }
  .fact span { color: var(--secondary); font-size: 11px; }
  .badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
  .badge { display: grid; justify-items: center; gap: 7px; min-width: 100px; padding: 13px 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
  .badge b { color: var(--accent); font: 700 18px var(--mono); }
  .badge span { color: var(--secondary); font-size: 11px; }
  .memory { display: grid; gap: 8px; }
  .memory-row { display: grid; grid-template-columns: minmax(110px, 1fr) minmax(0, 2.1fr) auto; align-items: center; gap: 10px; }
  .memory-name { color: var(--secondary); font: 12px var(--mono); }
  .bytes { display: grid; grid-template-columns: repeat(var(--count), minmax(30px, 1fr)); gap: 4px; }
  .byte { display: grid; place-items: center; min-height: 43px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); color: var(--secondary); font: 13px var(--mono); transition: border-color 250ms ease, color 250ms ease, background 250ms ease; }
  .byte[data-filled] { border-color: var(--accent); background: var(--accent-fill); color: var(--accent); }
  .byte[data-target] { border-color: var(--danger); background: var(--danger-fill); color: var(--danger); }
  .address { color: var(--secondary); font: 11px var(--mono); white-space: nowrap; }
  .arrow-line { display: flex; align-items: center; justify-content: center; gap: 9px; color: var(--accent); font: 14px var(--mono); }
  .payload { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px; }
  .payload span { display: grid; place-items: center; min-width: 42px; min-height: 42px; padding: 4px 6px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); color: var(--ink); font: 13px var(--mono); }
  .payload span[data-pad] { border-color: var(--accent); background: var(--accent-fill); color: var(--accent); }
  .payload span[data-dest] { border-color: var(--danger); background: var(--danger-fill); color: var(--danger); }
  .payload-label { width: 100%; color: var(--secondary); text-align: center; font-size: 12px; }
  .result { display: grid; justify-items: center; gap: 10px; text-align: center; }
  .result strong { font-size: clamp(22px, 3vw, 38px); }
  .result code { padding: 7px 11px; border: 1px solid var(--accent); border-radius: 6px; background: var(--accent-fill); color: var(--accent); font-size: 15px; }
  .route { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; }
  .route span { padding: 8px 10px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); font: 13px var(--mono); }
  .route b { color: var(--accent); font: 17px var(--mono); }
  .alignment { color: var(--secondary); text-align: center; font: 12px var(--mono); }
  @keyframes step-in { from { opacity: .45; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
  :host(:is(:fullscreen, [data-expanded])) .solve-grid { grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: 22px; }
  :host(:is(:fullscreen, [data-expanded])) .stage-heading h4 { font-size: 25px; }
  :host(:is(:fullscreen, [data-expanded])) .visual-panel { min-height: min(48vh, 420px); padding: 28px; }
  :host(:is(:fullscreen, [data-expanded])) .console-bar { font-size: 14px; padding: 12px 16px; }
  :host(:is(:fullscreen, [data-expanded])) .console-body { min-height: min(42vh, 360px); padding: 20px; font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .source { font-size: 19px; }
  :host(:is(:fullscreen, [data-expanded])) .fact { min-height: 100px; }
  :host(:is(:fullscreen, [data-expanded])) .fact strong { font-size: 23px; }
  :host(:is(:fullscreen, [data-expanded])) .fact span, :host(:is(:fullscreen, [data-expanded])) .badge span { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .badge { min-width: 140px; padding: 18px; }
  :host(:is(:fullscreen, [data-expanded])) .badge b { font-size: 23px; }
  :host(:is(:fullscreen, [data-expanded])) .memory-name, :host(:is(:fullscreen, [data-expanded])) .address { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .target-check { font-size: 20px; }
  :host(:is(:fullscreen, [data-expanded])) .byte { min-height: 58px; font-size: 19px; }
  :host(:is(:fullscreen, [data-expanded])) .payload span { min-width: 54px; min-height: 54px; font-size: 17px; }
  :host(:is(:fullscreen, [data-expanded])) .payload-label, :host(:is(:fullscreen, [data-expanded])) .caption, :host(:is(:fullscreen, [data-expanded])) .alignment { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .result strong { font-size: 42px; }
  :host(:is(:fullscreen, [data-expanded])) .route span { padding: 12px 16px; font-size: 18px; }
  @media (width < 760px) {
    .solve-grid { grid-template-columns: 1fr; }
    .visual-panel { min-height: 190px; padding: 15px; }
    .console-body { min-height: 120px; }
    .memory-row { grid-template-columns: minmax(80px, 1fr) minmax(0, 2fr); }
    .address { grid-column: 2; }
  }
  @media (prefers-reduced-motion: reduce) { .solve-visual-content, .console-body { animation: none; } }
`

export const solveTemplate = (
  title: string,
  count: number,
  label: string,
) => `
  <figure aria-label="${title} multi-step challenge solution">
    ${header(title)}
    <div class="scene">
      <div class="stage-heading"><h4 data-stage-title></h4></div>
      <div class="solve-grid">
        <section class="visual-panel" data-visual aria-label="Illustration"></section>
        <section class="console" data-console aria-label="Pwndbg output"></section>
      </div>
      <p class="caption" data-caption></p>
      <p class="step-status" aria-live="polite"></p>
    </div>
    ${controls(count, label)}
  </figure>`

const escapeHTML = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  )

export const terminal = (commands: string[], output: string) => `
  <div class="console-bar"><span>Pwndbg · GDB</span><span class="console-lights" aria-hidden="true"><i></i><i></i><i></i></span></div>
  <div class="console-body">
    <div class="commands">${commands
      .map(
        (command) => `<div class="command"><span class="prompt">pwndbg&gt; </span><code>${escapeHTML(command)}</code></div>`,
      )
      .join("")}</div>
    <pre class="console-output">${escapeHTML(output)}</pre>
  </div>`

export const setSolveStep = (
  root: ShadowRoot,
  title: string,
  visual: string,
  commands: string[],
  output: string,
  caption: string,
) => {
  root.querySelector<HTMLElement>("[data-stage-title]")!.textContent = title
  root.querySelector<HTMLElement>("[data-visual]")!.innerHTML =
    `<div class="solve-visual-content">${visual}</div>`
  root.querySelector<HTMLElement>("[data-console]")!.innerHTML = terminal(
    commands,
    output,
  )
  root.querySelector<HTMLElement>("[data-caption]")!.textContent = caption
  root.querySelector<HTMLElement>(".step-status")!.textContent = caption
}
