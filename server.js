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

// const ref = db.ref("server/saving-data/fireblog")
// const usersRef = ref.child("users")
// usersRef.set({
//   alanisawesome: {
//     date_of_birth: "June 23, 1912",
//     full_name: "Alan Turing"
//   },
//   gracehop: {
//     date_of_birth: "December 9, 1906",
//     full_name: "Grace Hopper"
//   }
// })

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/books/:id', (req, res) => {
  res.json(books.find(book => book.id === req.params.id))
})

app.put('/books/:id', (req, res) => {
  const updateIndex = books.findIndex(book => book.id === req.params.id)
  res.json(Object.assign(books[updateIndex], req.body))
})

app.delete('/books/:id', (req, res) => {
  const deletedIndex = books.findIndex(book => book.id === req.params.id)
  books.splice(deletedIndex, 1)
  res.status(204).send()
})

app.listen(3000, () => {
  console.log('Start server at port 3000.')
})