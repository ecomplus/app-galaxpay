const getDocSubscription = (
  orderId,
  collectionSubscription
) => new Promise((resolve, reject) => {
  const subscription = collectionSubscription.doc(orderId)

  subscription.get()
    .then(documentSnapshot => {
      if (documentSnapshot.exists) {
        const data = documentSnapshot.data()
        if (data.storeId) {
          resolve(data)
        } else {
          reject(new Error('StoreId property not found in document'))
        }
      } else {
        reject(new Error('Document does not exist Firestore'))
      }
    }).catch(err => {
      reject(err)
    })
})

const updateDocSubscription = async (collectionSubscription, body, subscriptionId) => {
  const updatedAt = new Date().toISOString()
  body.updatedAt = updatedAt

  await collectionSubscription.doc(subscriptionId)
    .set(body, { merge: true })
    .catch(console.error)
}

module.exports = {
  getDocSubscription,
  updateDocSubscription
}
