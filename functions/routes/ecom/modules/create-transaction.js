const GalaxpayAxios = require('../../../lib/galaxpay/create-access')
const errorHandling = require('../../../lib/store-api/error-handling')
exports.post = ({ appSdk, admin }, req, res) => {
  /**
   * Requests coming from Modules API have two object properties on body: `params` and `application`.
   * `application` is a copy of your app installed by the merchant,
   * including the properties `data` and `hidden_data` with admin settings configured values.
   * JSON Schema reference for the Create Transaction module objects:
   * `params`: https://apx-mods.e-com.plus/api/v1/create_transaction/schema.json?store_id=100
   * `response`: https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
   *
   * Examples in published apps:
   * https://github.com/ecomplus/app-pagarme/blob/master/functions/routes/ecom/modules/create-transaction.js
   * https://github.com/ecomplus/app-custom-payment/blob/master/functions/routes/ecom/modules/create-transaction.js
   */

  const { params, application } = req.body
  const { storeId } = req
  // merge all app options configured by merchant
  const appData = Object.assign({}, application.data, application.hidden_data)
  // setup required `transaction` response object
  const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox)

  const orderId = params.order_id
  const { amount, buyer, payer, to, items, type } = params
  console.log('> Transaction #', storeId, orderId)

  const transaction = {
    type: type,
    amount: amount.total
  }

  // indicates whether the buyer should be redirected to payment link right after checkout
  let redirectToPayment = false

  /**
   * Do the stuff here, call external web service or just fill the `transaction` object
   * according to the `appData` configured options for the chosen payment method.
   */

  // WIP:
  switch (params.payment_method.code) {
    case 'credit_card':
      // you may need to handle card hash and create transaction on gateway API
      break
    case 'banking_billet':
      // create new "Boleto bancário"
      break
    case 'online_debit':
      redirectToPayment = true
      break
    default:
      break
  }

  // https://docs.galaxpay.com.br/subscriptions/create-without-plan

  const extraFields = [{
    tagName: 'store_id',
    tagValue: storeId
  },
  {
    tagName: 'order_number',
    tagValue: params.order_number
  }]

  const galaxpayCustomer = {
    myId: buyer.customer_id,
    name: buyer.fullname,
    document: buyer.doc_number,
    email: buyer.email,
    phones: [parseInt(`${buyer.phone.number}`, 10)]
  }

  const parseAddress = to => ({
    zipCode: to.zip,
    street: to.street,
    number: String(to.number) || 's/n',
    complementary: to.complement || undefined,
    neighborhood: to.borough,
    city: to.city,
    state: to.province || to.province_code
  })

  let galaxpaySubscriptions

  const finalAmount = transaction.amount

  if (params.payment_method.code === 'credit_card') {
    console.log('> credit card ', params.credit_card)
    const card = {
      myId: params.credit_card.last_digits + params.credit_card.cvv,
      hash: params.credit_card.hash
    }

    const PaymentMethodCreditCard = {
      card: card,
      preAuthorize: false
    }

    galaxpaySubscriptions = {
      myId: `${orderId}`, // requered
      value: Math.floor(finalAmount * 100),
      quantity: appData.plan_recurrence.quantity,
      periodicity: appData.plan_recurrence.periodicity,
      firstPayDayDate: new Date().toISOString().split('T')[0], // requered
      // additionalInfo: '', // optional
      mainPaymentMethodId: 'creditcard',
      Customer: galaxpayCustomer,
      PaymentMethodCreditCard: PaymentMethodCreditCard,
      ExtraFields: extraFields
    }
  } else if (params.payment_method.code === 'banking_billet') {
    if (to) {
      galaxpayCustomer.Address = parseAddress(to)
    } else if (params.billing_address) {
      galaxpayCustomer.Address = parseAddress(params.billing_address)
    }

    galaxpaySubscriptions = {
      myId: `${orderId}`, // requered
      value: Math.floor(finalAmount * 100),
      quantity: appData.plan_recurrence.quantity,
      periodicity: appData.plan_recurrence.periodicity,
      firstPayDayDate: new Date().toISOString().split('T')[0], // requered
      // additionalInfo: '', // optional,  instructions banking billet?
      mainPaymentMethodId: 'boleto',
      Customer: galaxpayCustomer,
      ExtraFields: extraFields
    }
  }

  galaxpayAxios.preparing
    .then(() => {
      if (type === 'recurrence') {
        galaxpayAxios.axios.post('/subscriptions', galaxpaySubscriptions)
          .then((data) => {
            return data.data.Subscription
          })
          .then((data) => {
            console.log('> Subscription  ', data)

            if (data.mainPaymentMethodId === 'boleto') {
              transaction.payment_link = data.paymentLink
            } else {
              console.log('> Payment Method ', data.mainPaymentMethodId)
            }

            res.send({
              redirect_to_payment: redirectToPayment,
              transaction
            })
          })
          .catch(error => {
            console.log(error.response)
            // try to debug request error
            const errCode = 'GALAXPAY_TRANSACTION_ERR'
            let { message } = error
            const err = new Error(`${errCode} #${storeId} - ${orderId} => ${message}`)
            if (error.response) {
              const { status, data } = error.response
              if (status !== 401 && status !== 403) {
                err.payment = JSON.stringify(transaction)
                err.status = status
                if (typeof data === 'object' && data) {
                  err.response = JSON.stringify(data)
                } else {
                  err.response = data
                }
              } else if (data && Array.isArray(data.errors) && data.errors[0] && data.errors[0].message) {
                message = data.errors[0].message
              }
            }
            console.error(err)
            res.status(409)
            res.send({
              error: errCode,
              message
            })
          })
      }
    })
}
