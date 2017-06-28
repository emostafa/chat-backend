const express = require('express')
const app = express()
const fs = require('fs')
const server = require('http').Server(app);
const cors = require('cors')
const bodyParser = require('body-parser')

let f = fs.readFileSync('./users.json', 'utf8')
const users = JSON.parse(f)

app.use(cors())
app.use(bodyParser.json())

let active_users = []

/** Authentication API, made for logging users in */
app.post('/api/auth', (req, res) => {
  let matched = users.filter((u) => u.email.toLowerCase() === req.body['email'].toLowerCase())
  if (matched.length) {
    if(matched[0].password === req.body.password) {
      // create a copy of the user object in order to be able to
      // delete the password from the response without affecting the
      // original data loaded from the json file
      let user = JSON.parse(JSON.stringify(matched[0]))
      delete user['password']
      res.status(200).json({'user': user})
    } else {
      res.status(401).json({'errors': 'Failed to login, wrong password'})
    }
  } else {
    res.status(401).json({'errors': 'No users were found with this email address'})
  }
})

const io = require('socket.io')(server, { 'connect timeout': 5000 });
io.on('connect_error', (socket) => {
  console.log('error')
})
io.on('connect', (socket) => {
  io.emit('active_users', active_users)
  socket.on('message', function(msg) {
    msg.created_at = new Date()
    io.emit('message', msg)
  })
  socket.on('user_connected', function(user) {
    active_users.push(user.name)
    io.emit('user', user.name)
  })
  socket.on('user_disconnected', function(user) {
    let i = active_users.indexOf(user)
    active_users.splice(i, 1)
    io.emit('active_users', active_users)
  })
})

server.listen(3000, () => {
  console.log('Listenning on *:3000')
})