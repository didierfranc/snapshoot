const fs = require('fs')

const { cleanUp, compare, success, error } = require('./helpers')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000

expect.extend({
  toMatchSnap(newSnap) {
    const {
      snapshotState: { _updateSnapshot, _snapshotPath },
      currentTestName,
    } = this

    const update = _updateSnapshot === 'all'

    const root = _snapshotPath.replace(/\/[\w.]*$/, '')
    const testName = currentTestName.match(/\w+/)[0]

    const exist = fs.existsSync(root)
    if (!exist) fs.mkdir(root)

    const path = {
      old: `${root}/${testName}_snapshot.png`,
      new: `${root}/${testName}_snapshot_new.png`,
      diff: `${root}/${testName}_snapshot_diff.png`,
    }

    const snap = fs.existsSync(path.old)

    if (!snap || update) return success(path, newSnap)

    const oldSnap = fs.readFileSync(path.old)
    const { result, diff } = compare(oldSnap, newSnap)

    return result < 1 ? success(path, newSnap) : error(path, newSnap, diff)
  },
})
