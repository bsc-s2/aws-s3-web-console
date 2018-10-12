const keyFilter = (key, prefix) => key.slice(prefix.length)

const convertPrefix2Router = (prefix) => {
  if (prefix) {
    let prefixArray = prefix.split('/')
    let routeArray = []

    prefixArray.pop()
    _.each(prefixArray, (item, index) => {
      let copyArray = _.clone(prefixArray)
      copyArray.length = index + 1
      routeArray.push({
        text: item,
        prefix: copyArray.join('/') + '/',
      })
    })
    return routeArray
  } else {
    return []
  }
}

const bytes = (bytes, digit = 1) => {
  if (bytes === undefined) return '-'
  let bytesArray = bytesSpliteUnits(bytes, digit)

  return bytesArray[0] + ' ' + bytesArray[1]
}

const bytesSpliteUnits = (bt, digit = 1) => {
  let bytes = bt
  if (typeof bytes !== 'number') {
    bytes = parseFloat(bytes)
  }

  if (bytes < 1) {
    return '0 B'
  } else if (isNaN(bytes) || !isFinite(bytes)) {
    return '-'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )
  const number = (bytes / Math.pow(1024, Math.floor(exponent))).toFixed(digit)

  return [number, units[exponent]]
}

const isImage = (file) => !!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.Key)

export { keyFilter, convertPrefix2Router, bytes, bytesSpliteUnits, isImage }
