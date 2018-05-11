const express = require('express')
const app = express()
const admin = require('firebase-admin');
const bodyParser = require('body-parser')
const path = require('path')

/* middleware 
  - serveing static files
  - parse body that send with content-type is json
  - parse body that send with content-type is x-form
*/
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true }))

const serviceAccount = require('./secret/smnodame-7750c-firebase-adminsdk-57quw-aa8f6e7d5d.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://smnodame-7750c.firebaseio.com/'
})

// Use the shorthand notation to retrieve the default app's services
const auth = admin.auth()
const db = admin.database()



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/activities', (req, res) => {
  const ref = db.ref("activities")
  ref.once("value", function(snapshot) {
    res.json(snapshot.val())
  }, function (errorObject) {
    res.status(500).send()
  });
  
})

app.get('/activities/:id', (req, res) => {
  const ref = db.ref("activities")
  const activityRef = ref.child(req.params.id)
  activityRef.once("value", function(snapshot) {
    res.json(snapshot.val())
  }, function (errorObject) {
    res.status(500).send()
  });
})

app.get('/staff', (req, res) => {
  const ref = db.ref("staff")
  ref.once("value", function(snapshot) {
    res.json(snapshot.val())
  }, function (errorObject) {
    res.status(500).send()
  });
  
})

app.delete('/activities/:id', (req, res) => {
    const ref = db.ref("activities")
    const activityRef = ref.child(req.params.id)
    activityRef.remove()
    res.json(res.body)
    // console.log(req.params.id)
})

app.put('/activities/:id', (req, res) => {
  const ref = db.ref("activities")
  const activityRef = ref.child(req.params.id)
  activityRef.update(req.body)
  res.json(res.body)
})

app.post('/activities', (req, res) => {
  const activityRef = db.ref("activities")
  // const activityRef = ref.child("activities")
  activityRef.push().set(req.body)
  res.json(res.body)
})

app.post('/activities/:id', (req, res) => {
  const ref = db.ref("activities/"+ req.params.id)
  const activityRef = ref.child("activities")
  activityRef.push().set(req.body)
  ref.update({
    disburse: req.body.sum_price
  })
  res.json(res.body)
})

app.post('/staff', (req, res) => {
  const staffRef = db.ref("staff")
  staffRef.push().set(req.body)
  res.json(res.body)
})

app.put('/staff/:id', (req, res) => {
  const ref = db.ref("staff")
  const staffRef = ref.child(req.params.id)
  staffRef.update(req.body)
  res.json(res.body)
})

app.delete('/staff/:id', (req, res) => {
  const ref = db.ref("staff")
  const staffRef = ref.child(req.params.id)
  staffRef.remove()
  res.json(res.body)
})

app.delete('/activities/:id/:key', (req, res) => {
  const ref = db.ref("activities/"+req.params.id+"/activities")
  const activityRef = ref.child(req.params.key)
  activityRef.remove()
  res.json(res.body)
})

app.get('/info', (req, res) => {
  const ref = db.ref("info")
  ref.once("value", function(snapshot) {
    res.json(snapshot.val())
  }, function (errorObject) {
    res.status(500).send()
  });
})

app.put('/info', (req, res) => {
  const infoRef = db.ref("info")
  infoRef.update(req.body)
  res.json(res.body)
})

app.listen(3000, () => {
  console.log('Start server at port 3000.')
})