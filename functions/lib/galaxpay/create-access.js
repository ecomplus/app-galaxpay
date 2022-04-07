const createAxios = require('./create-axios')
const auth = require('./create-authorization')
let { ID_GALAXPAY_PARTNER, HASH_GALAXPAY_PARTNER } = process.env

module.exports = function (galaxpayId, galaxpayHash, isSandbox, firestoreColl = 'galaxpay_tokens') {
  const self = this

  let documentRef

  const hashLogin = Buffer.from(`${galaxpayId}:${galaxpayHash}`).toString('base64')

  const firestorePartner = 'galaxpay_partners'
  const docPartner = require('firebase-admin').firestore().doc(`${firestorePartner}/ecomplus`)
  let hashPartner

  if (firestoreColl) {
    documentRef = require('firebase-admin')
      .firestore()
      .doc(`${firestoreColl}/${hashLogin}`)
  }

  console.log('> ID ', process.env.ID_GALAXPAY_PARTNER, ' hash ', process.env.HASH_GALAXPAY_PARTNER)

  if (ID_GALAXPAY_PARTNER && HASH_GALAXPAY_PARTNER) {
    hashPartner = Buffer.from(`${ID_GALAXPAY_PARTNER}:${HASH_GALAXPAY_PARTNER}`).toString('base64')
  } else {
    if (docPartner) {
      docPartner.get()
        .then((documentSnapshot) => {
          const idGalaxpayPartner = documentSnapshot.data().galaxpayId
          const hashGalaxpayPartner = documentSnapshot.data().galaxpayHash
          if (documentSnapshot.exists && idGalaxpayPartner && hashGalaxpayPartner) {
            ID_GALAXPAY_PARTNER = process.env.ID_GALAXPAY_PARTNER = idGalaxpayPartner
            HASH_GALAXPAY_PARTNER = process.env.HASH_GALAXPAY_PARTNER = hashGalaxpayPartner

            hashPartner = Buffer.from(`${idGalaxpayPartner}:${hashGalaxpayPartner}`).toString('base64')
            console.log('> Depois ID ', ID_GALAXPAY_PARTNER, ' hash ', HASH_GALAXPAY_PARTNER)
          }
        })
    }
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
