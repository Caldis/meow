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

// Anchor
export const getAnchor = (index: number, time?: Time) => `${index}`

// Clamp
export const clamp = (target: number, limit: number) => Math.min(Math.max(target, -limit), limit)
