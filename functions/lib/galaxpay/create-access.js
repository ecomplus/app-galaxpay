const createAxios = require('./create-axios')
const auth = require('./create-authorization')

module.exports = function (galaxpayId, galaxpayHash, isSandbox, firestoreColl = 'galaxpay_tokens') {
  const self = this

  let documentRef

  const hashLogin = Buffer.from(`${galaxpayId}:${galaxpayHash}`).toString('base64')

  let firestorePartner = 'galaxpay_partners'
  let docPartner = require('firebase-admin').firestore().doc(`${firestorePartner}/ecomplus`)
  let hashPartner

  if (firestoreColl) {
    documentRef = require('firebase-admin')
      .firestore()
      .doc(`${firestoreColl}/${hashLogin}`)
  }

  if (docPartner) {
    docPartner.get()
      .then((documentSnapshot) => {
        return new Promise((resolve, reject) => {
          const idGalaxpayPartner = documentSnapshot.data().galaxpayId
          const hashGalaxpayPartner = documentSnapshot.data().galaxpayHash
          if (documentSnapshot.exists && idGalaxpayPartner && hashGalaxpayPartner) {
            resolve({ idGalaxpayPartner, hashGalaxpayPartner })
          } else {
            reject(new Error())
          }
        })
      })
      .then(({ idGalaxpayPartner, hashGalaxpayPartner }) => {
        hashPartner = Buffer.from(`${idGalaxpayPartner}:${hashGalaxpayPartner}`).toString('base64')
      })
  }

  this.preparing = new Promise((resolve, reject) => {
    const authenticate = (accessToken, isSandbox) => {
      self.axios = createAxios(accessToken, isSandbox)
      console.log('> accessToken: ', { accessToken })
      resolve(self)
    }

    const handleAuth = (isSandbox) => {
      console.log('> Galaxpay Auth02')
      auth(hashLogin, isSandbox, hashPartner)
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
