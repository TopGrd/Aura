class Aura extends Processor {
  constructor(options) {
    const { server, parser, beforeSend, sendSuccess, offLine } = options

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
      })
    }
  }
}

