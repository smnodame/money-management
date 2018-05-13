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

//  ------------- project ---------------

app.get('/projects', (req, res) => {
  const ref = db.ref("projects")
  ref.once("value", function(snapshot) {
    res.json(snapshot.val())
  }, function (errorObject) {
    res.status(500).send()
  });
})

app.post('/projects', (req, res) => {
  const projectRef = db.ref("projects")
  projectRef.push().set(req.body)
  res.json(res.body)
})

app.delete('/projects/:id', (req, res) => {
  const ref = db.ref("projects")
  const projectRef = ref.child(req.params.id)
  projectRef.remove()
  res.json(res.body)
})

app.put('/projects/:id', (req, res) => {
  const ref = db.ref("projects")
  const projectRef = ref.child(req.params.id)
  projectRef.update(req.body)
  res.json(res.body)
})

//  ------------- activities ---------------

app.get('/:key/activities', (req, res) => {
  const ref = db.ref("projects/" + req.params.key + "/activities")
  ref.once("value", function(snapshot) {
    res.json(snapshot.val())
  }, function (errorObject) {
    res.status(500).send()
  });
})

app.post('/:key/activities', (req, res) => {
  const activityRef = db.ref("projects/" + req.params.key + "/activities")
  activityRef.push().set(req.body)
  res.json(res.body)
})

app.get('/:key/activities/:id', (req, res) => {
  const ref = db.ref("projects/" + req.params.key + "/activities")
  const activityRef = ref.child(req.params.id)
  activityRef.once("value", function(snapshot) {
    res.json(snapshot.val())
  }, function (errorObject) {
    res.status(500).send()
  });
})

app.put('/:key/activities/:id', (req, res) => {
  const ref = db.ref("projects/" + req.params.key + "/activities")
  const activityRef = ref.child(req.params.id)
  activityRef.update(req.body)
  res.json(res.body)
})

app.delete('/:key/activities/:id', (req, res) => {
  const ref = db.ref("projects/" + req.params.key + "/activities")
  const activityRef = ref.child(req.params.id)
  activityRef.remove()
  res.json(res.body)
})

// --------------- sub project ---------------

app.post('/:key/activities/:id', (req, res) => {
  const ref = db.ref("projects/" + req.params.key + "/activities/"+ req.params.id)
  const activityRef = ref.child("activities")
  activityRef.push().set(req.body)
  ref.update({
    disburse: req.body.sum_price
  })
  res.json(res.body)
})

app.delete('/:key/activities/:id/:sub', (req, res) => {
  const ref = db.ref("projects/" + req.params.key + "/activities/"+req.params.id)
  const activityRef = ref.child('activities').child(req.params.sub)
  activityRef.remove()
  res.json(res.body)
})

//  ------------- staff ---------------

app.get('/:key/staff', (req, res) => {
  const ref = db.ref("projects/" + req.params.key + "/staff")
  ref.once("value", function(snapshot) {
    res.json(snapshot.val())
  }, function (errorObject) {
    res.status(500).send()
  });
})

app.post('/:key/staff', (req, res) => {
  const staffRef = db.ref("projects/" + req.params.key + "/staff")
  staffRef.push().set(req.body)
  res.json(res.body)
})

app.put('/:key/staff/:id', (req, res) => {
  const ref = db.ref("projects/" + req.params.key + "/staff")
  const staffRef = ref.child(req.params.id)
  staffRef.update(req.body)
  res.json(res.body)
})

app.delete('/:key/staff/:id', (req, res) => {
  const ref = db.ref("projects/" + req.params.key + "/staff")
  const staffRef = ref.child(req.params.id)
  staffRef.remove()
  res.json(res.body)
})

//  ------------- info ---------------

app.get('/:key/info', (req, res) => {
  const ref = db.ref("projects/" + req.params.key)
  ref.once("value", function(snapshot) {
    res.json(snapshot.val())
  }, function (errorObject) {
    res.status(500).send()
  });
})

app.put('/:key/info', (req, res) => {
  const ref = db.ref("projects/" + req.params.key)
  const infoRef = ref.child('name')
  infoRef.set(req.body['name'])
  res.json(res.body)
})

//  ------------- university ---------------

app.get('/:key/university', (req, res) => {
  const ref = db.ref("projects/" + req.params.key + "/university")
  ref.once("value", function(snapshot) {
    res.json(snapshot.val())
  }, function (errorObject) {
    res.status(500).send()
  });
})

app.put('/:key/university', (req, res) => {
  const ref = db.ref("projects/" + req.params.key)
  const uRef = ref.child('university')
  uRef.set(req.body)
  res.json(res.body)
})

app.listen(3000, () => {
  console.log('Start server at port 3000.')
})