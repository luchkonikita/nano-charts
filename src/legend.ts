import { Settings } from './types'
import { createElement } from './utils'

export default class Legend {
  public el: HTMLDivElement

  constructor(private settings: Settings) {
    this.el = createElement('div', {class: settings.cssClassName + '-legend'}) as HTMLDivElement
  }

  public update(datasets: Array<{key: string, color: string}>) {
    const {settings} = this
    let content = ''

    datasets.forEach(({key, color}) => {
      const badgeStyle = `background-color: ${color}; color: ${color};`
      content += `
        <span class='${settings.cssClassName + '-legend-item'}'>
          <span class='${settings.cssClassName + '-legend-item-badge'}' style='${badgeStyle}'></span>
          ${key}
        </span>
      `
    })

    this.el.innerHTML = content
  }
}
