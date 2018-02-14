const fs = require('fs')
const { PNG } = require('pngjs')
const pixelmatch = require('pixelmatch')

const cleanUp = list => {
  Object.values(list).map(path => {
    const exist = fs.existsSync(path)
    if (exist) fs.unlinkSync(path)
  })
}

const compare = (oldSnap, newSnap) => {
  const newPNG = PNG.sync.read(newSnap)
  const oldPNG = PNG.sync.read(oldSnap)

  const { width, height } = newPNG

  const diff = new PNG({ width, height })
  const result = pixelmatch(newPNG.data, oldPNG.data, diff.data, width, height)

  return { result, diff }
}

const success = (path, newSnap) => {
  cleanUp(path)
  fs.writeFileSync(path.old, newSnap)
  return {
    message: 'Snapshot match',
    pass: true,
  }
}

const error = (path, newSnap, diff) => {
  fs.writeFileSync(path.new, newSnap)
  diff.pack().pipe(fs.createWriteStream(path.diff))
  return {
    message: () => 'Snapshot mismatch',
    pass: false,
  }
}

module.exports = {
  cleanUp,
  compare,
  success,
  error,
}
