from Database.MongoData import reviewCollection


def insertReviewToDb(review: dict):
    return reviewCollection.insert_one(review)

def getReviewsFromDb(query: dict):
    return reviewCollection.find(query, {"_id": 0})

def getReviewFromDb(query: dict):
    return reviewCollection.find_one(query, {"_id": 0})

def updateReviewInDb(query: dict, updateData: dict):
    return reviewCollection.update_one(query, {"$set": updateData})

def deleteReviewFromDb(query: dict, updateData: dict):
    return reviewCollection.update_one(query, {"$set": updateData})
