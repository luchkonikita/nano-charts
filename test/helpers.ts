export function createMockDiv (width: number, height: number) {
  const div = document.createElement('div')
  div.getBoundingClientRect = () => ({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height
  })
  return div
}

export function resizeMockDiv(div: HTMLDivElement, width: number, height: number) {
  Object.assign(div.style, {
    width: width + 'px',
    height: height + 'px'
  })
  div.getBoundingClientRect = () => ({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height
  })
  return div
}
