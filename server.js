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
  ref.on("value", function(snapshot) {
    res.json(snapshot.val())
  }, function (errorObject) {
    res.status(500).send()
  });
  
})

app.post('/activities', (req, res) => {
    const activityRef = db.ref("activities")
    // const activityRef = ref.child("activities")
    activityRef.push().set(req.body)
    
    // res.json(books.find(book => book.id === req.params.id))
})

// app.put('/books/:id', (req, res) => {
//   const updateIndex = books.findIndex(book => book.id === req.params.id)
//   res.json(Object.assign(books[updateIndex], req.body))
// })

// app.delete('/books/:id', (req, res) => {
//   const deletedIndex = books.findIndex(book => book.id === req.params.id)
//   books.splice(deletedIndex, 1)
//   res.status(204).send()
// })

app.listen(3000, () => {
  console.log('Start server at port 3000.')
})