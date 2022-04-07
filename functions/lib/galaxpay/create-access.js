const createAxios = require('./create-axios')
const auth = require('./create-authorization')
const { ID_GALAXPAY_PARTNER, HASH_GALAXPAY_PARTNER } = process.env

module.exports = function (galaxpayId, galaxpayHash, isSandbox, storeId, firestoreColl = 'galaxpay_tokens') {
  const self = this

  let documentRef
  const hashLogin = Buffer.from(`${galaxpayId}:${galaxpayHash}`).toString('base64')

  if (firestoreColl) {
    documentRef = require('firebase-admin')
      .firestore()
      .doc(`${firestoreColl}/${storeId}-${hashLogin}`)
  }

  this.preparing = new Promise((resolve, reject) => {
    const authenticate = (accessToken, isSandbox) => {
      self.axios = createAxios(accessToken, isSandbox)
      console.log('> accessToken: ', { accessToken })
      resolve(self)
    }

    const handleAuth = (isSandbox) => {
      console.log('> Galaxpay Auth02')
      auth(hashLogin, isSandbox)
        .then((accessToken) => {
          console.log(`> Galaxy token: ${hashLogin}`)
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
