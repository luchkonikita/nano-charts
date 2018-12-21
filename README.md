# Nano charts

A zero-dependency goodness for visualizing your data.
Currently only implements the [Line Chart](https://en.wikipedia.org/wiki/Line_chart).

## Why another charts library?

- No external dependencies.
- No complicated features with complicated APIs.
- Focus on usage simplicity and small bundle size.

## Example

The next will provide you with a working chart:

```javascript
import Chart from 'nano-charts'

const chart = new Chart(document.getElementById('chart'))

chart.setData({
  labels: ['January', 'February', 'March'],
  samples: {
    'Apples': [10, 50, 80],
    'Oranges': [0, 70, 85]
  },
  options: {
    Apples: {
      color: 'blueviolet'
    },
    Oranges: {
      color: 'cornflowerblue'
    }
  }
})
```

## TODOs list:

- [ ] Generate colors automatically when needed.
- [ ] Write missing tests.
- [ ] See how this can be minimized more.
- [ ] Write a proper README.md.
- [ ] Figure-out about needed polyfills (if any).
- [ ] Provide a shorthand for constructor so it can use the data right away.
- [ ] Think about filling the chart rectangles with some nice semi-transparent colors.

