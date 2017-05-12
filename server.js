const express = require('express')
const cors = require('cors')
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')
const slack = require('slack')

const port = process.env.PORT || 3000
const token = process.env.SLACK_TOKEN

const memberNames = {
  U1CTUKMT9: 'Zoé',
  U40MZ9EL9: 'Tugba',
  U0BU8V7N0: 'Trev',
  U2NC0H2BS: 'Temi',
  U0BUEB5BK: 'Paolo',
  U0BU8SV4K: 'Michele',
  U1KU01R4K: 'Kristina',
  U162CB0LC: 'James',
  U0C160N8N: 'Christean',
  U0BUPA30R: 'Chris',
  U1CU5P4H0: 'Anna',
}

const members = Object.keys(memberNames)



slack.users.list({ token }, (err, data) => {
  if (err) throw new Error(err)
  console.log('users')
  console.log(data)
})





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
