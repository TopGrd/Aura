var _ = {
  // 异步方法
  asyncFn(fn, beforeFn) {
    setTimeout(function() {
      if (beforeFn) {
        beforeFn()
      }
      fn()
    }, 0)
  },

  // 函数组合
  compose() {
    var list = Array.prototype.slice.apply(arguments)
    return function composed(result) {
      while (list.length > 0) {
        result = list.pop()(result)
      }
      return result
    }
  },

  isObject(value) {
    var type = typeof value
    return value != null && (type === 'object' || type === 'function')
  },

  isFunction(value) {
    return typeof value === 'function' || false
  },

  isString(value) {
    return toString.call(value) === '[object String]'
  },
}
