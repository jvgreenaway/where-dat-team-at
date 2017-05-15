const express = require('express')
const cors = require('cors')
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')
const kv = require('beepboop-persist')()
const slack = require('slack')

const port = process.env.PORT || 3100
const token = process.env.SLACK_TOKEN

const ohsTeam = {
  U1CTUKMT9: {}, // Zoé
  // U40MZ9EL9: {}, // Tugba
  U0BU8V7N0: {}, // Trev
  // U2NC0H2BS: {}, // Temi
  U0BUEB5BK: {}, // Paolo
  U0BU8SV4K: {}, // Michele
  // U1KU01R4K: {}, // Kristina
  U162CB0LC: {}, // James
  U0C160N8N: {}, // Christean
  U0BUPA30R: {}, // Chris
  U1CU5P4H0: {}, // Anna
}

const orbitTeam = {
  U2L4F0AF3: {}, // James
}

let team = ohsTeam

const slapp = Slapp({
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: Context()
})


// fetch users and store as team members

const loadTeamCache = () => new Promise((resolve) => {
  kv.get('team', (err, storedTeam) => {
    console.log('loadTeamCache done', storedTeam)

    if (err) throw err
    team = storedTeam
    resolve(storedTeam)
  })
})

const saveTeamCache = (team = team) => new Promise((resolve) => {
  kv.set('team', team, (err) => {
    console.log('set team')
    console.log(err)
    if (err) throw err
    resolve(team)
  })
})

const updateTeamCache = (members) => new Promise((resolve) => {
  members.forEach((member) => {
    if (!team[member.id]) return
    team[member.id] = Object.assign({}, team[member.id], member)
  })
  resolve(team)
})


const fetchTeam = () => new Promise((resolve) => {
  console.log('fetchTeam')

  slack.users.list({ token }, (err, data) => {
    if (err) throw err
    
    const { members } = data
    console.log(`Fetched ${members.length} users from Slack`)

    resolve(members)
  })
})


// commands

slapp.command('/location', '(.*)', (msg, text, location) => {
  if (!team[msg.body.user_id]) 
    return msg.respond(`You are not added as a team member`)

  team[msg.body.user_id].location = location

  msg.respond(`Your location has been set as _${location}_`)
})


// public api

const app = slapp.attachToExpress(express())

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello world.')
})

app.get('/team', (req, res) => {
  fetchTeam()
    .then(updateTeamCache)
    .then(saveTeamCache)
    .then((team) => res.send({ team }))
    .catch((message) => res.send({ message, team }))
})

app.get('/reset', (req, res) => {
  team = ohsTeam

  saveTeamCache(team)
    .then(() => res.send())
})



// load data and start server
loadTeamCache()
  .then(() => {
    app.listen(port, (err) => {
      if (err) return console.error(err)
      console.log(`Listening on port ${port}`)
    })
  })
