/*eslint no-extend-native: ["error", { "exceptions": ["Array"] }]*/
// Array prototype enhancement
Object.defineProperty(Array.prototype, 'first', {
  get: function () {
    return this[0]
  }
})
Object.defineProperty(Array.prototype, 'last', {
  get: function () {
    return this[this.length - 1]
  }
})

// Load Assets
export const loadAllFrom = (r: __WebpackModuleApi.RequireContext) => r.keys().map(r)

// Clamp
export const clamp = (target: number, limit: number) => Math.min(Math.max(target, -limit), limit)

// Range
export const range = (min: number, max: number) => Math.random() * (max - min) + min;
