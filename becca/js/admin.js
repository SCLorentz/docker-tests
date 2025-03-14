export const
    test = (...f) => f.map(f => { try { return f()} catch (e) { return `\x1b[33m${f}\x1b[39m:\t\x1b[31m${e}\x1b[39m` }}),
    debug = d => d.forEach(d => console.log(d));