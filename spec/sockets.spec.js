const io = require('socket.io-client')


describe("Sockets Suite", () => {
  // Setup
  let socket = null
  let user = {email: 'cseslam@gmail.com', password: '123456'}
  require('../server')

  beforeEach((done) => {
    socket = io.connect('http://localhost:3000')
    setTimeout(() => {
      done()
    }, 1500)
  })

  
  it('should receive message', () => {
    expect(socket).toBeTruthy()
    socket.on('connection', () => {
      expect(socket.id).toBeTruthy()
      socket.once('message', (message) => {
        console.log(message)
        expect(message).toEqual('Hello World')
        done()
      })
    })

    socket.on('message', (message) => {
      console.log(message)
      expect(message.text).toEqual('Hello World')
      done()
    })

    socket = io.connect('http://localhost:3000')
  })

  afterEach((done) => {
    socket.disconnect()
    done()
  })
})