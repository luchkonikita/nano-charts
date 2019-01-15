import { Settings, TooltipRendererSample } from './types'
import { createElement } from './utils'

export default class Tooltip {
  public el: HTMLDivElement

  constructor(private settings: Settings) {
    this.el = createElement('div', {class: settings.cssClassName + '-tooltip'}) as HTMLDivElement
  }

  public update(label: string, samples: TooltipRendererSample[]) {
    const { cssClassName } = this.settings
    let content = `<header class="${cssClassName}-title">${label}</header>`
    samples.forEach(({color, key, value}) => {
      content += `
        <p class="${cssClassName}-item">
          <span class="${cssClassName}-badge" style="background-color: ${color};"></span>
          ${key}: ${value}
        </p>
      `
    })
    this.el.innerHTML = content
  }

  public show() {
    this.el.classList.add('is-visible')
  }

  public hide() {
    this.el.classList.remove('is-visible')
  }

  public moveTo(x: number, y: number) {
    this.el.style.transform = `translate(${x}px, ${y}px)`
  }

  public getBoundingClientRect() {
    return this.el.getBoundingClientRect()
  }
}
