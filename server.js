const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
  	client: 'pg',
  	connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'firdaus',
    database : 'smart_brain'
  }
});

// db.select('*').from('users').then(data => {
// 	console.log(data);
// });

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/',(req,res) => {
	//res.send(database.users)
	db.select('name','email').from('users')
	.then(user =>{
		res.json(user);
	})
})

app.post('/signin', (req,res) => {
	db.select('email', 'hash').from('login')
	.where('email', '=', req.body.email)
	.then(data => {
		const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
		if(isValid){
			return db.select('*').from('users')
			.where('email', '=', req.body.email)
			.then(user => {
				res.json(user[0]);	
			})
			.catch(err => res.status(400).json('unable to get user'))
		} else{
			res.status(400).json('wrong credentials');
		}
	})
	.catch(err => res.status(400).json('wrong credentials'))
})
// bcrypt.compareSync("bacon", hash); // true
// bcrypt.compareSync("veggies", hash); // false
app.post('/register', (req,res) => {
	const { email, name, password} = req.body;
	const hash = bcrypt.hashSync(password);
		db.transaction(trx => {
			trx.insert({
				hash:hash,
				email:email
			})
			.into('login')
			.returning('email')
			.then(loginEmail => {
				return trx('users')
					.returning('*')
					.insert({
					email: loginEmail[0],
					name: name,
					joined: new Date()
				})
				 .then(user => {
				  	res.json(user[0])
				  })
			})
			.then(trx.commit)
			.catch(trx.rollback)
		})
	  	.catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req,res) => {
	const { id } = req.params;
	let found = false;
	db.select('*').from('users').where({id})
	.then(user =>{
		if(user.length){
			res.json(user[0])
		} else{
			res.status(404).json('Not found');
		}
	})
	.catch(err => res.status(400).json("Error getting user"))
})

app.put('/image', (req,res) => {
	const { id } = req.body;
	db('users').where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0])
	})
	.catch(err => res.status(400).json('unable to get entries'))
})


app.listen(3000, () => {
	console.log('App is running on port 3000');
})

/*
	/ --> res = this is working
	/signin --> POST = success/fail
	/register --> POST = user
	/profile/:userId --> GET = user
	/image --> PUT = user score
*/



// const express = ;require('express');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt-nodejs');
// const cors = require('cors');
// const knex = require('knex')

// const db = knex({
//   client: 'pg',
//   connection: {
//     host : '127.0.0.1',
//     user : 'postgres',
//     password : 'firdaus',
//     database : 'smart_brain'
//   }
// });

// db.select('*').from('users').then(data => {
// 	console.log(data);
// })

// const app = express();

// app.use(bodyParser.json());
// app.use(cors());

// const database = {
// 	users: [
// 		{
// 			id: "123",
// 			name: 'Jason',
// 			email: 'jason@gmail.com',
// 			password: 'cookies',
// 			entries: 0,
// 			joined: new Date()	
// 		},
// 		{
// 			id: "124",
// 			name: 'Martin',
// 			email: 'martin@gmail.com',
// 			password: 'candies',
// 			entries: 0,
// 			joined: new Date()	
// 		}	
// 	],
// 	login: [
// 		{
// 			id: '985',
// 			hash: '',
// 			email: 'jason@gmail.com'
// 		}
// 	]
// }

// app.get('/', (req,res) =>{
// 	res.send(JSON.stringify(database.users));
// });

// app.post('/signin', (req,res) => {
// 	// res.send('signing');
// 	// Load hash from your password DB.
// 	// bcrypt.compare("apples", '$2a$10$6pb1UkSLqlyZs3XV9kcJxOgJ3amPsazZHfcOlq/1v78daEXgViE2u', function(err, res) {
// 	//     console.log('first guess', res)
// 	// });
// 	// bcrypt.compare("veggies", '$2a$10$6pb1UkSLqlyZs3XV9kcJxOgJ3amPsazZHfcOlq/1v78daEXgViE2u', function(err, res) {
// 	//     console.log('second guess', res)
// 	// });
// 	if(req.body.email === database.users[0].email &&
// 	 req.body.password === database.users[0].password) {
// 		res.json('success');	
// 	}else{
// 		res.status(400).json('error logging in');
// 	}
	
// })

// app.post('/register', (req,res) => {
// 	const { email, name, password } = req.body;

// 	bcrypt.hash(password, null, null, function(err, hash) {
// 	    console.log(hash);
// 	});
// 	database.users.push({
// 		id: "125",
// 		name: name,
// 		email: email,
// 		entries: 0,
// 		joined: new Date()	
// 	})
// 	res.json(database.users[database.users.length - 1]);
// })

// app.get('/profile/:id', (req,res) => {
// 	const { id } = req.params;
// 	let found = false;
// 	database.users.forEach(user =>{
// 		if(user.id === id){
// 			found = true;
// 			return res.json(user);
// 		}
// 	})
// 	if(!found){
// 		res.status(404).json('no such user');
// 	}
// })


// app.put('/image', (req,res) => {
// 	const { id } = req.body;
// 	let found = false;
// 	database.users.forEach(user =>{
// 		if(user.id === id){
// 			found = true;
// 			user.entries++;
// 			return res.json(user.entries);
// 		}
// 	})
// 	if(!found){
// 		res.status(404).json('no such user');
// 	}
// })

// app.listen(3000, () => {
// 	console.log('app is running on port 3000');
// });
