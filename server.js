const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercisetrack' )

const User = require('./models/user')
const Exercise = require('./models/exercise')

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/exercise/log', (req, res) => {
  const userId = req.query.userId;
  const from = req.query.from;
  const to = req.query.to;
  const limit = Number(req.query.limit) || 10;

  const fromDate = from ? new Date(from) : new Date('1970-01-01');
  const toDate = to ? new Date(to) : Date.now();

  if (!userId) {
    return res.send({ message: 'userId is required' });
  }

  Exercise
    .find({ user: userId, date: { $lt: toDate, $gt: fromDate } })
    .limit(limit)
    .select({ description: 1, duration: 1, date: 1, _id: 0 })
    .exec((err, docs) => {
      if (err) {
        res.send(err);
      } else if (docs.length > 0) {
        const data = {
          _id: userId,
          username: docs[0].username,
          count: docs.length,
          log: docs,
        }

        res.send(data);
      } else {
        res.send(docs);
      }
    });
});

app.post('/api/exercise/new-user', (req, res) => {
  const { username } = req.body;

  const newUser = new User;
  newUser.username = username;

  newUser.save((err, user) => {
    if (err) {
      res.send(err);
    } else {
      res.send({ userId: user._id });
    }
  });
});

app.post('/api/exercise/add', (req, res) => {
  const {
    userId,
    description,
    duration,
    date,
  } = req.body;

  const newExercise = new Exercise;
  newExercise.user = userId;
  newExercise.description = description;
  newExercise.duration = duration;
  newExercise.date = new Date(date);

  newExercise.save((err, exercise) => {
    if (err) {
      res.send(err);
    } else {
      res.send(exercise);
    }
  })
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
