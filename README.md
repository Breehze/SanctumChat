<p align="center">
  <img src="static/xddSmol.png" />
</p>

# Sanctum Chat

Discord-like chat app made with FastAPI, MongoDB, tailwind and Vanilla JS. 
For fun project to mainly develop my back-end skills.

#### Features

* JWT authentication
* WebSockets
  * Real-time messaging
  * User info
* Basic CRUD operations
  * Updating and deleting messages
  * Pfps

#### Future updates

* Refactor spaghetti JS code / Vue maybe
* Sending files in chat
* FastAPI routers
* Learn Mongo properly / whole db.py refactor

## Security
Passwords are stored as salted bcrypt hashes.
```Python
userWithHashedPW.update({'_id' : user_id,'password' : bcrypt.hashpw(password, bcrypt.gensalt())})
```
For JWTs i went with HS256.
```Python
SECRET_KEY = "00e8811e86e78cff2c3ab2a4a1a74718562fd9c00bfc64433ed173f4b4daf6ba"
```
If this project ever sees light of the internet ***THIS IS GOING TO BE CHANGED !***


## Run Locally



Install dependencies

```bash
  npm install
```

```bash
  pip install -r requirements.txt
```

Start the server

```bash
  uvicorn main:app
```

