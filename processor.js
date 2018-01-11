class Processor {
  constructor({ method, parser, beforeSend, sendSuccess, server }) {
    this.$method = method.toUpperCase()
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
