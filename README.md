#Aura
前端错误日志上报  
```js
const aura = new Aura({
  server: 'http://localhost:3000',
  // 对错误进行再加工
  parser: function parser(data) {
    data.sign = 'xx'
  },
  //发送日志前
  beforeSend: function beforeSend() {
    console.log('sendBefore')
  },
  //发送成功
  sendSuccess: function afterSend() {
    console.log('success')
  },
})
```
