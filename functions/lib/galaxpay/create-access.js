const createAxios = require('./create-axios')
const auth = require('./create-authorization')
const { galaxypayConfig } = require('../../__env')

module.exports = function (galaxpayId, galaxpayHash, storeId, isSandbox = false, firestoreColl = 'galaxpay_tokens') {
  const self = this

  let documentRef
  const hashLogin = Buffer.from(`${galaxpayId}:${galaxpayHash}`).toString('base64')

  if (firestoreColl) {
    documentRef = require('firebase-admin')
      .firestore()
      .doc(`${firestoreColl}/${storeId}-${hashLogin}`)
  }

  const hashPartner = Buffer.from(`${galaxypayConfig.id_partner}:${galaxypayConfig.hash_partner}`).toString('base64')

  this.preparing = new Promise((resolve, reject) => {
    const authenticate = (accessToken, isSandbox) => {
      self.axios = createAxios(accessToken, isSandbox)
      resolve(self)
    }

    const handleAuth = (isSandbox) => {
      console.log('> Galaxpay Auth02 ', storeId)
      auth(hashLogin, isSandbox, hashPartner, storeId)
        .then((accessToken) => {
          console.log(`> Galaxy token: ${storeId}-${hashLogin}`)
          authenticate(accessToken, isSandbox)
          if (documentRef) {
            documentRef.set({ accessToken }).catch(console.error)
          }
        })
        .catch(reject)
    }

    if (documentRef) {
      documentRef.get()
        .then((documentSnapshot) => {
          if (documentSnapshot.exists &&
            Date.now() - documentSnapshot.updateTime.toDate().getTime() <= 9 * 60 * 1000 // access token expires in 10 minutes
          ) {
            authenticate(documentSnapshot.get('accessToken'), isSandbox)
          } else {
            handleAuth(isSandbox)
          }
        })
        .catch(console.error)
    } else {
      handleAuth(isSandbox)
    }
  })
}
