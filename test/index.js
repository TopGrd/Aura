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

class Processor {
  constructor({ method, parser, beforeSend, sendSuccess, server }) {
    this.$method = method
    this.$parser = _.isFunction(parser) ? parser : false
    this.$beforeSend = _.isFunction(beforeSend) ? beforeSend : false
    this.$sendSuccess = _.isFunction(sendSuccess) ? sendSuccess : false
    this.$server = server
    this.xhr = this.createXhr(this.$sendSuccess)
  }

  createXhr(afterSend) {
    var xhr = null
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest()
    } else {
      xhr = new ActiveXObject('Microsoft.XMLHTTP')
    }

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        afterSend()
      }
    }

    return xhr
  }

  processStack(error) {
    var url = error.stack.match('https?://[^\n]+')
    url = url ? url[0] : ''
    var rowCols = url.match(':(\\d+):(\\d+)')
    if (!rowCols) {
      rowCols = [0, 0, 0]
    }

    var stack = error.stack
      .replace(/\n/gi, '')
      .split(/\bat\b/)
      .slice(0, 9)
      .join('@')
      .replace(/\?[^:]+/gi, '')
    var msg = error.toString()
    if (stack.indexOf(msg) < 0) {
      stack = msg + '@' + stack
    }

    return {
      msg: stack,
      rowNum: rowCols[1],
      colNum: rowCols[2],
      target: url.replace(rowCols[0], ''),
      _orgMsg: error.toString(),
    }
  }

  getUserAgent(data) {
    data.ua = navigator.userAgent
    return data
  }

  parser(data) {
    if (this.$parser) {
      this.$parser(data)
    }
    return data
  }

  report(errMsg) {
    if (!_.isString(errMsg)) {
      errMsg = JSON.stringify(errMsg)
    }

    if (this.$method === 'GET' ) {
      this.$server = `${this.$server}?err=${errMsg}`
    }

    this.xhr.open(this.$method, this.$server)

    if (this.$method === 'GET') {
      this.xhr.send();
    } else {
      this.xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      this.xhr.send(errMsg);
    }
  }

  process() {
    return _.compose(
      this.report.bind(this),
      this.parser.bind(this),
      this.getUserAgent.bind(this),
      this.processStack.bind(this)
    )
  }
}

class Aura extends Processor {
  constructor(options) {
    const { method, server, parser, beforeSend, sendSuccess, offLine } = options

    super({ method, parser, beforeSend, sendSuccess, server })

    this.offLine = !!offLine
    this.init()
  }

  init() {
    window.onerror = (msg, url, line, col, error) => {
      this.error = error
      const str = msg.toLowerCase()
      if (str.indexOf('script error') > -1) {
        return false
      }

      _.asyncFn(() => {
        if (!!error && !!error.stack) {
          this.process()(error)
        } else if (
          !!error &&
          error.name &&
          error.message &&
          error.description
        ) {
          this.report(JSON.stringify(error))
        } else if (msg) {
          this.report(msg)
        } else if (!!arguments.callee) {
          var ext = []
          var f = arguments.callee.caller
          var c = 3
          while (f && --c > 0) {
            ext.push(f.toString())
            if (f === f.caller) {
              break
            }
            f = f.caller
          }
          ext = ext.join(',')
          this.report(ext)
        }
      }, this.$beforeSend)
    }
  }
}

const aura = new Aura({
  server: 'http://localhost:3000',
  method: 'GET',
  parser: function parser(data) {
    data.sign = 'xx'
  },

  beforeSend: function beforeSend() {
    console.log('sendBefore')
  },

  sendSuccess: function afterSend() {
    console.log('success')
  },
})

console.log(aura)

function cer() {
  return a
}

cer()
