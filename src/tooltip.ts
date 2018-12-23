import DEFAULTS from './defaults'
import { TooltipRenderer, TooltipRendererSample } from './types'
import { createElement } from './utils'

export function defaultTooltipRenderer(label: string, samples: TooltipRendererSample[]): string {
  const { cssClassName } = DEFAULTS
  let content = `<header class="${cssClassName}-title">${label}</header>`
  samples.forEach(({color, key, value}) => {
    content += `
      <p class="${cssClassName}-item">
        <span class="${cssClassName}-badge" style="background-color: ${color};"></span>
        ${key} - ${value}
      </p>
    `
  })
  return content
}

export default class Tooltip {
  public el: HTMLDivElement

  constructor(private renderer: TooltipRenderer) {
    this.el = createElement('div', {class: DEFAULTS.cssClassName + '-tooltip'}) as HTMLDivElement
  }

  public update(label: string, samples: TooltipRendererSample[]) {
    this.el.innerHTML = this.renderer(label, samples)
  }

  public show() {
    this.el.classList.add('is-visible')
  }

  public hide() {
    this.el.classList.remove('is-visible')
  }

  // TODO: Refactor if possible to move positioning logic to the tooltip itself. Maybe a bad idea though.
  public moveTo(x: number, y: number) {
    this.el.style.transform = `translate(${x}px, ${y}px)`
  }

  public getBoundingClientRect() {
    return this.el.getBoundingClientRect()
  }
}
