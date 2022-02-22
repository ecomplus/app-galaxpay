const createAxios = require('./create-axios')
const auth = require('./create-authorization')

module.exports = function (galaxpayId, galaxpayHash, isSandbox, firestoreColl = 'galaxpay_tokens') {
  const self = this

  let documentRef
  const hashLogin = Buffer.from(`${galaxpayId}:${galaxpayHash}`).toString('base64')
  let accessToken
  if (firestoreColl) {
    documentRef = require('firebase-admin')
      .firestore()
      .doc(`${firestoreColl}/${hashLogin}`)
  }

  this.preparing = new Promise((resolve, reject) => {
    const authenticate = (accessToken, isSandbox) => {
      self.axios = createAxios(accessToken, isSandbox)
      console.log('accessToken-> ', { accessToken })
      resolve(self.accessToken)
    }

    const handleAuth = () => {
      console.log('> Galaxpay Auth02')
      auth(hashLogin, isSandbox)
        .then((accessToken, isSandbox) => {
          console.log(`> Galaxy token ${hashLogin}`)
          authenticate(accessToken, isSandbox)
          console.log({ accessToken })
          if (documentRef) {
            documentRef.set({ accessToken }).catch(console.error)
          }
        })
        .catch(reject)
    }

    if (documentRef) {
      authenticate(accessToken, isSandbox)
      documentRef.get()
        .then((documentSnapshot) => {
          if (
            documentSnapshot.exists &&
            Date.now() - documentSnapshot.updateTime.toDate().getTime() <= 9 * 60 * 1000 // access token expires in 10 minutes
          ) {
            authenticate(documentSnapshot.get('accessToken'), isSandbox)
          } else {
            handleAuth()
          }
        })
        .catch(console.error)
    } else {
      handleAuth()
    }
  })
}
