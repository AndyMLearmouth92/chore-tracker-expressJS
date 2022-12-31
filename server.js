const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/',async (request, response)=>{
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    const itemsLeftMonday = await db.collection('todos').countDocuments({day: 'monday', completed: false})
    const itemsLeftTuesday = await db.collection('todos').countDocuments({day: 'tuesday', completed: false})
    const itemsLeftWednesday = await db.collection('todos').countDocuments({day: 'wednesday', completed: false})
    const itemsLeftThursday = await db.collection('todos').countDocuments({day: 'thursday', completed: false})
    const itemsLeftFriday = await db.collection('todos').countDocuments({day: 'friday', completed: false})
    response.render('index.ejs', { items: todoItems, left: itemsLeft, leftMon: itemsLeftMonday, leftTues: itemsLeftTuesday, leftWed: itemsLeftWednesday, leftThurs: itemsLeftThursday, leftFri: itemsLeftFriday})
})

app.post('/addTodo', (request, response) => {
    db.collection('todos').insertOne({chore: request.body.todoItem, completed: false, day: request.body.day})
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({chore: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({chore: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))
})

app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({chore: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})