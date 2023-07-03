from dotenv import load_dotenv,find_dotenv
from pymongo import MongoClient
import os 

load_dotenv(find_dotenv())

connectDB = "mongodb://localhost:27017"
client = MongoClient(connectDB)

db = client.chat

def insert(collection,data):
	collection = db[collection]
	if "_id" in data:
		collection.insert_one(data)
	else:
		print("Must contain identifier")


def find(collection,id):
	collection = db[collection]
	document = collection.find_one({"_id": id})
	return document

def update(collection,id,to_update,data):
	collection = db[collection]
	collection.update_one({"_id" : id} , {"$set" : { to_update:data} })

def delete(collection,id,to_delete):
	collection = db[collection]
	collection.update_one({"_id" : id} , {"$unset" : { to_delete: ""} })


def append_to_array(collection,id,array,data):
	collection = db[collection]
	collection.update_one({"_id" : id}, {"$push" : { array : data}})

def remove_from_array(collection,id,array,data):
	collection = db[collection]
	collection.update_one({"_id": id}, {"$pull": {array: data}})


