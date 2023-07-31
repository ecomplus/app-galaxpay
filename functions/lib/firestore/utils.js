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

const createItemsAndAmount = (amount, items) => {
  const itemsAndAmount = {
    amount,
    items: items.reduce((items, itemOrder) => {
      const item = {
        sku: itemOrder.sku,
        final_price: itemOrder.final_price,
        price: itemOrder.price,
        quantity: itemOrder.quantity,
        product_id: itemOrder.product_id
      }

      if (itemOrder.variation_id) {
        item.variation_id = itemOrder.variation_id
      }

      items.push(item)
      return items
    }, [])
  }
  return itemsAndAmount
}

module.exports = {
  getDocSubscription,
  updateDocSubscription,
  createItemsAndAmount
}
