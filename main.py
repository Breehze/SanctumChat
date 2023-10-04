import bcrypt
import json
import asyncio
import db
import uuid
import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Request , Depends , Response , HTTPException, status , Request , WebSocket , WebSocketDisconnect
from fastapi.responses import HTMLResponse , RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.security import OAuth2PasswordBearer , OAuth2PasswordRequestForm
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Optional , Dict
from jose import JWTError, jwt
from httponly import OAuth2PasswordBearerWithCookie , OAuth2PasswordBearerWithCookieWS
from typing import Annotated
from fastapi import FastAPI, File, UploadFile
import random


SECRET_KEY = "00e8811e86e78cff2c3ab2a4a1a74718562fd9c00bfc64433ed173f4b4daf6ba" # CHANGE THIS!!!  -testing only 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1800

oauth = OAuth2PasswordBearerWithCookie(tokenUrl = "/login")
oauthws = OAuth2PasswordBearerWithCookieWS(tokenUrl = "/login")

async def get_current_user(token: str = Depends(oauth)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = token_data.username 
    if user is None:
        raise credentials_exception
    
    return user
async def get_current_userWS(token: str = Depends(oauthws)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return JSONResponse(content={"message": "User not allowed"}, status_code=404)
        token_data = TokenData(username=username)
    except JWTError:
        return JSONResponse(content={"message": "User not allowed"}, status_code=404)
    user = token_data.username #get_user(fake_users_db, username=token_data.username)
    if user is None:
        return JSONResponse(content={"message": "User not allowed"}, status_code=404)
    
    return user

def check_pass(password1 , password2):
    hashedpw = bcrypt.hashpw(password1.encode("UTF-8"),password2 ) 
    if hashedpw == password2:
        return True  
    else:
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username : Optional[str]
    password : str
    status : Optional[str] = "Offline"
    friends : Optional[dict] = {}
    pending_friends : Optional[list] = []
    pfp : Optional[str]  = "pfps/default.jpg"
    def __getitem__(self, item):
        return getattr(self, item)
class Message(BaseModel):
    message : str

class ConnectionManager:
    def __init__(self):
        self.active_connections  = {}   # conn = {chatid : [List[WebSocket]]}
    async def connect(self,chat_id : str, websocket: WebSocket):
        await websocket.accept()
        if chat_id in self.active_connections:
            self.active_connections[chat_id].append(websocket)
        else:    
            self.active_connections.update({chat_id : [websocket]})

    def disconnect(self,chat_id : str, websocket: WebSocket):
            self.active_connections[chat_id].remove(websocket)
            if len(self.active_connections[chat_id]) == 0:
                self.active_connections.pop(chat_id)
    
    async def get_cur_chat_users(self,chat_id):
        active = []
        for i in self.active_connections[chat_id]: 
            active.append(await get_current_userWS(i.headers['cookie'].removeprefix('access_token=')))
        return active
    
    async def broadcast(self,chat_id : str, message: str):
        for connection in self.active_connections[chat_id]:
            await connection.send_text(message)
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

app = FastAPI()

app.mount("/assets", StaticFiles(directory="SanctumVUE/dist/assets"), name="static")


templates = Jinja2Templates(directory="SanctumVUE/dist")


@app.get("/", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/home", response_class = HTMLResponse)
async def home_page(request: Request):
    return templates.TemplateResponse("index.html" , {"request":request})


@app.get("/logout")
async def logout(response:Response , token : str = Depends(get_current_user)):
  response.delete_cookie(key ='access_token')
  return {"Message" : "Logged out"}


@app.get("/pfps/{image}")
async def get_pfp(image : str):
    return FileResponse(f"pfps/{image}")

@app.get("/pfps/user/{user_id}")
async def get_pfp(user_id : str):
    img_link = db.find('users',user_id)['pfp']
    header_response = {"img_link" : img_link}

    return FileResponse(f"{img_link}",headers = header_response)

@app.get("/chat_attachments/{chat_id}/{file}")
async def get_chat_attachment(chat_id : str ,file : str):
    return FileResponse(f"chat_attachments/{chat_id}/{file}")

@app.post('/register/{user_id}')
async def register(user_id : str , user : User ):
    if not db.find("users",user_id) :
        userWithHashedPW  = user.dict()
        password = userWithHashedPW ['password'].encode('UTF-8')
        userWithHashedPW.update({'_id' : user_id,'password' : bcrypt.hashpw(password, bcrypt.gensalt())})
        db.insert('users',userWithHashedPW)
        return {"Message" : "Succesfully registered"}

@app.post("/login")
async def login(response : Response , form_data : OAuth2PasswordRequestForm = Depends()):
    query = db.find("users",form_data.username)
    if not query: 
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not check_pass(form_data.password,query['password']):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )

    response.set_cookie(key = "access_token" , value = access_token , httponly = True)
    print("got here")
    return {"detail" : "Logged in"}

@app.post("/accept_friendreq/{user_id}")
async def accept_friend_request(user_id : str , user : str = Depends(get_current_user)):
    if not db.find("users",user_id):
        return {"Message" : "Oooops, you re trying to accept someone that does not exist"}
    if user_id not in db.find("users",user)["pending_friends"]:
        return {"Message" : "Not found"}
    new_chat_id = f"{user}{user_id}"
    
    db.update("users",user,f"friends.{user_id}", {"chat_id" : new_chat_id})
    
    db.update("users",user,f"friends.{user_id}.unseen_messages", 0)
    
    db.remove_from_array("users",user,"pending_friends",user_id)
    
    db.update("users",user_id,f"friends.{user}", {"chat_id" : new_chat_id})
    
    db.update("users",user_id,f"friends.{user}.unseen_messages",  0)
    
    db.insert("chats",{"_id" : new_chat_id,"members": (user_id,user), "messages" : {} })

    return {"Message" : "Yay, a new friend"}

@app.post("/send_friendreq/{user_id}")
async def send_friend_request(user_id : str , user : str = Depends(get_current_user)):
    query = db.find("users",user_id)
    if not query:
        return {"Message": "Oooops, this user does not exist"}
    if user in query["pending_friends"] or user in query['friends']:
        return {"Message" : "Friend request already sent"}
    
    db.append_to_array("users",user_id,"pending_friends",user)
    return {"Message" : "Friend request sent"}  

@app.post("/uploadfile")
async def upload_pfp(file: UploadFile , user : str = Depends(get_current_user) ):
    content_type = file.content_type
    if not "image/" in content_type:
        return {"Message" : "Invalid file type"}
    path = f"pfps/{user}{random.randint(0,100)}.{content_type.removeprefix('image/')}"
    db.update("users",user,"pfp",path)
    with open(path, "wb") as out:
        out.write(await file.read())
    await file.close()
    return {"filename": file.filename}


@app.delete("/deletemessage/{chat_room}/{message_id}")
async def delete_message(chat_room : str , message_id : str ,user : str = Depends(get_current_user)):
    query = db.find("chats",chat_room)['messages']
    if list(query[message_id].keys())[0] != user:
        return "You do not own this message"   
    db.delete("chats",chat_room, f"messages.{message_id}")
    return "Done"

@app.patch("/editmessage/{chat_room}/{message_id}")
async def edit_message(chat_room : str , message_id : str ,message : Message,user : str = Depends(get_current_user)):
    query = db.find("chats",chat_room)['messages']
    if list(query[message_id].keys())[0] != user:
        return "You do not own this message"
    db.update("chats",chat_room,f"messages.{message_id}",{user : message.message})




def get_user_status(user):
    query = db.find("users",user)
    return query['status']


@app.websocket("/userinfo")
async def everything_user_related(websocket: WebSocket, user: str = Depends(get_current_userWS)):
    await websocket.accept()
    print(user)
    try:
        while True:
          query = db.find("users",user)
          for i in query['friends']:
                query['friends'][i].update({'status' : get_user_status(i) })
          db.update("users",user,"status","Online")
          user_data = {"username": query["_id"],
                        "status" : query['status'],
                        "friends_list" : query['friends'],
                        "pending_friends" : query['pending_friends'],
                        "pfp" : query['pfp']}
          
          await websocket.send_text(json.dumps(user_data))
          await asyncio.sleep(0.5)
    
    except Exception as e:
        print(e)
        db.update("users",user,"status","Offline")
        print("Offline")




@app.websocket("/chat/{chat_id}")
async def websocket_endpoint(websocket: WebSocket,chat_id : str,user : str = Depends(get_current_userWS)):
    query = db.find("chats",chat_id)
    if user not in query["members"]:
        return {"Message" : "Forbidden"}  
    
    
    await manager.connect(chat_id,websocket)
    prev_mes = query['messages']
    query['members'].remove(user) 
    other_dude = query['members'][0]
    db.update("users",user,f"friends.{other_dude}.unseen_messages", 0)
    await websocket.send_text(json.dumps(prev_mes))
    try:
        while True:
            data_in = await websocket.receive()
            print(data_in)
            message_type = "text"
            if 'text' not in data_in : 
                mime_length = data_in['bytes'][0]
                mime_type = data_in['bytes'][2:mime_length].decode()
                file_data = data_in['bytes'][mime_length+1:]
                if chat_id not in os.listdir('chat_attachments'):
                    os.mkdir(f"chat_attachments\{chat_id}")                
                file_path = f"chat_attachments/{chat_id}/{str(uuid.uuid4())}.{mime_type[mime_type.index('/')+1:]}"
                with open(file_path,'wb') as out:
                    out.write(file_data)
                message_type = "file"
                message_content = file_path
            else:
                message_content = data_in['text']

            
            if len(message_content) > 250 or len(message_content.strip()) == 0: 
                continue
            print(chat_id)
            
            
            if message_content == ":?:message_resend_recent:?:":
                await asyncio.sleep(0.3)
                query = db.find("chats",chat_id)
                prev_mes = query['messages']
                #query['members'].remove(user)
                await manager.broadcast(chat_id,json.dumps(prev_mes))
                continue

            print(manager.active_connections)
            if other_dude not in await manager.get_cur_chat_users(chat_id):
                db.update("users",other_dude,f"friends.{user}.unseen_messages",db.find("users",other_dude)['friends'][user]['unseen_messages'] + 1) #Remake this into increment and not this mess
            
            data_formatted = { user : message_content, 
                              "message_type" : message_type, 
                              "timestamp" : int(datetime.timestamp(datetime.now())) 
                              }
            
            need_this_to_get_id = list(db.find("chats",chat_id)['messages'].keys())
            if len(need_this_to_get_id) == 0:
                message_id = 0
            else:
                message_id = int(need_this_to_get_id[len(need_this_to_get_id) - 1]) + 1
            db.update("chats",chat_id,f"messages.{str(message_id)}",data_formatted)
            await manager.broadcast(chat_id,json.dumps({ message_id :data_formatted}))
            await asyncio.sleep(0.5)
    except Exception as e:
        print(e) 
        manager.disconnect(chat_id,websocket)
        print(manager.active_connections)
 




