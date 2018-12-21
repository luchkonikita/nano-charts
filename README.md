# Nano charts

A zero-dependency goodness for visualizing your data.
Currently only implements the [Line Chart](https://en.wikipedia.org/wiki/Line_chart).

![](https://cdn-std.dprcdn.net/files/acc_99774/0MOtQ4)

## Why another charts library?

- No external dependencies.
- No complicated features with complicated APIs.
- Focus on usage simplicity and small bundle size.

## Example

The next will provide you with a working chart:

```javascript
import Chart from 'nano-charts'

new Chart(document.getElementById('chart'), {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  samples: {
    Apples: [10, 50, 80, 40, 20, 0, 50, 60, 50, 20, 30, 10],
    Oranges: [0, 70, 85, 30, 20, 30, 70, 30, 30, 25, 25, 30]
  },
  options: {
    Apples: {
      color: '#f44336'
    },
    Oranges: {
      color: '#673ab7'
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

