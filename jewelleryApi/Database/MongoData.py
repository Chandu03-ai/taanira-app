from pymongo import MongoClient
from constants import mongoUrl,mongoDatabase,mongoProductCollection,mongoCategoryCollection,mongoCartCollection,mongoReviewCollection,mongoWishlistCollection,mongoShippingCollection,mongoAddressesCollection,mongoEmailVerifyCollection

client = MongoClient(mongoUrl)
db = client[mongoDatabase]
productsCollection = db[mongoProductCollection]
categoriesCollection = db[mongoCategoryCollection]
cartCollection = db[mongoCartCollection]
wishlistCollection = db[mongoWishlistCollection]
shippingCollection = db[mongoShippingCollection]
addressesCollection = db[mongoAddressesCollection]
emailVerifyCollection = db[mongoEmailVerifyCollection]
reviewCollection = db[mongoReviewCollection]




