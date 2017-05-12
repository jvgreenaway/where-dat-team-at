const express = require('express')
const cors = require('cors')
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')

const port = process.env.PORT || 3000

const slapp = Slapp({
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: Context()
})


const locations = {}

slapp.command('/location', '(.*)', (msg, text, location) => {
  locations[msg.body.user_id] = location
  msg.respond(`Your location has been set as _${location}_`)
})


// construct server

const app = slapp.attachToExpress(express())

app.use(cors())


// public api

app.get('/', (req, res) => {
  res.send('Hello world.')
})

app.get('/locations', (req, res) => {
  res.send(locations)
})


// start server

app.listen(port, (err) => {
  if (err) return console.error(err)
  console.log(`Listening on port ${port}`)
})
