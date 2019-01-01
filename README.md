# Nano charts 📊

[![npm version](https://badge.fury.io/js/nano-charts.svg)](https://badge.fury.io/js/nano-charts)
![](https://travis-ci.org/luchkonikita/nano-charts.svg?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A zero-dependency goodness for visualizing your data.
Currently only implements the [Line Chart](https://en.wikipedia.org/wiki/Line_chart).

![](https://cdn-std.dprcdn.net/files/acc_99774/0MOtQ4)

## Why another charts library? 🤔

- No external dependencies.
- No complicated features with complicated APIs.
- Focus on usage simplicity and small bundle size.

## Example 💡

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

## TODO

- (Feature) Generate colors automatically. Think if this is needed, though.
- (Chore) Write missing tests.
- (Refactoring) See how this can be minimized more.
- (Chore) Write a proper README.md. Provide some measurements.
- (Feature) Render the legend.
- (Feature) Animations.

