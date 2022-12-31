// Working with expressJS
const express = require('express')
const app = express()
// Working with MongoDB
const MongoClient = require('mongodb').MongoClient
//Port that we are using (LocalHost2121)
const PORT = 2121
//Use the dotenv file
require('dotenv').config()

// Contains the link to MongoDB credentials. This is contained in the DB_STRING
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

//Connecting to the database and logs if it has been successful
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })

//Use EJS as the template to create a HTML file.
app.set('view engine', 'ejs')
//Use static files in the public folder which conatins the CSS and client side JS.
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
// Tells express to use JSON data.
app.use(express.json())

//API listening for a Get / read request on the root route
app.get('/',async (request, response)=>{
    //Grabs all of the documents within the collection of todos and returns them all as an array.
    const todoItems = await db.collection('todos').find().toArray()
    //Counts documents which have a completed status of false.
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    const itemsLeftMonday = await db.collection('todos').countDocuments({day: 'monday', completed: false})
    const itemsLeftTuesday = await db.collection('todos').countDocuments({day: 'tuesday', completed: false})
    const itemsLeftWednesday = await db.collection('todos').countDocuments({day: 'wednesday', completed: false})
    const itemsLeftThursday = await db.collection('todos').countDocuments({day: 'thursday', completed: false})
    const itemsLeftFriday = await db.collection('todos').countDocuments({day: 'friday', completed: false})
    // Response should render HTML in the DOM using the information grabbed above.
    response.render('index.ejs', { items: todoItems, left: itemsLeft, leftMon: itemsLeftMonday, leftTues: itemsLeftTuesday, leftWed: itemsLeftWednesday, leftThurs: itemsLeftThursday, leftFri: itemsLeftFriday})
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => {
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false, day: request.body.day})
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        // Sorts to most recently added.
        sort: {_id: -1},
        // If the document does not exist that you are trying to update, it will create the document. However this function is switched off.
        upsert: false
    })
    //Server responds to the client side with JSON data and console logs to say it has been marked complete.
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    // Error notification
    .catch(error => console.error(error))

})

// API listening for a update / put request on the markUnComplete route. This is linked to the main.JS fetch
app.put('/markUnComplete', (request, response) => {
    // Goes to MongoDB collection of todos and updates a document. The request body contains the item text which will be used to match to the document in the database so that it can be updated.
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        //Changed the completed property from true to false to signal that it has been completed.
        $set: {
            completed: false
          }
    },{
        // Sorts by most recently added
        sort: {_id: -1},
        // If the document does not exist that you are trying to update, it will create the document. However this function is switched off.
        upsert: false
    })
    // Server responds to the client side with JSON data and console logs to say it has been marked complete.
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    // Error notification
    .catch(error => console.error(error))
})

// API listening for a delete request on the deleteItem route. This is an action linked to the main.JS fetch
app.delete('/deleteItem', (request, response) => {
    // Goes to MongoDB collection of todos and deletes the document. The request body contains the item text which will be used to match to the document in the database so that it can be deleted.
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    // Server responds to the client side with JSON data and console logs to say it has been deleted.
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    // Error notification
    .catch(error => console.error(error))

})

// Enables the server to listen to the PORT stated by Heroku or to use 2121. Notifies the server is running in the console.
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})