// Shared sizing for projected illustrations and full=true student links.
// Put this last in each component's shadow stylesheet.
export const PRESENTATION_STYLES = /* css */ `
  h3 { font-size: 20px; }
  :is(header, .heading, .controls, .focus) button { min-height: 40px; font-size: 14px; }
  :is(header, .heading, .controls) button svg { width: 16px; height: 16px; }
  label { font-size: 14px; }
  select, input { min-height: 38px; font-size: 14px; }
  pre code { font-size: 16px; }
  :is(.range, .stack-address, .address) { font-size: 12px; }
  :is(.count, .position) { font-size: 13px; }

  :host(:fullscreen), :host([data-expanded]) {
    padding: 16px;
    --row-height: clamp(42px, 4.8vh, 52px);
    --slot-height: clamp(54px, 5.6vh, 64px);
  }
  :host(:is(:fullscreen, [data-expanded])) figure { max-width: 1500px; }
  :host(:is(:fullscreen, [data-expanded])) h3 { font-size: 26px; }
  :host(:is(:fullscreen, [data-expanded])) :is(h4, .section-label) { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) :is(header, .heading, .controls, .focus) button { min-height: 44px; padding: 8px 14px; font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) :is(label, select, input) { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) :is(select, input) { min-height: 42px; }
  :host(:is(:fullscreen, [data-expanded])) input { width: 190px; }
  :host(:is(:fullscreen, [data-expanded])) :is(pre code, .source-line, .instruction) { font-size: clamp(18px, 1.5vw, 22px); }
  :host(:is(:fullscreen, [data-expanded])) :is(.byte, .unit) { min-height: 54px; font-size: 20px; }
  :host(:is(:fullscreen, [data-expanded])) :is(.stack-value, .stack-filler, .stack-element, .slot .unit) { font-size: 22px; }
  :host(:is(:fullscreen, [data-expanded])) :is(.stack-row, .slot:not([data-depth])) { min-height: 64px; }
  :host(:is(:fullscreen, [data-expanded])) .slot .value { font-size: 22px; }
  :host(:is(:fullscreen, [data-expanded])) .slot[data-kind=return] .value { font-size: 15px; }
  :host(:is(:fullscreen, [data-expanded])) .slot:not([data-used]) .value { font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) :is(.range, .stack-address, .address, .slot .address) { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) :is(.ascii, .input-line) { font-size: 18px; }
  :host(:is(:fullscreen, [data-expanded])) :is(.register, .register output, .parameters, .function-name, .block-label, .rsp, .slot .label) { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .memory { min-width: 0; }
  :host(:is(:fullscreen, [data-expanded])) .memory table { min-width: 740px; }
  :host(:is(:fullscreen, [data-expanded])) .memory th:first-child { width: 165px; }
  :host(:is(:fullscreen, [data-expanded])) .memory th:last-child { width: 125px; }
  :host(:is(:fullscreen, [data-expanded])) .memory thead th { font-size: 13px; }
  :host(:is(:fullscreen, [data-expanded])) :is(.status, .status p, .status code) { font-size: 17px; }
  :host(:is(:fullscreen, [data-expanded])) del { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) :is(.count, .position) { font-size: 14px; }
  :host(:is(:fullscreen, [data-expanded])) .map { max-height: 65vh; }
  :host(:is(:fullscreen, [data-expanded])) .map table { min-width: 1280px; font-size: 16px; }
  :host(:is(:fullscreen, [data-expanded])) .explanation { min-height: 0; }
  :host(:is(:fullscreen, [data-expanded])) :is(.explanation strong, .explanation p) { font-size: 18px; }

  @media (width < 600px) {
    :host(:fullscreen), :host([data-expanded]) { padding: 10px; }
  }
`
