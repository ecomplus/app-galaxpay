const GalaxpayAxios = require('../../../lib/galaxpay/create-access')
const errorHandling = require('../../../lib/store-api/error-handling')
const { parseId, parseStatus, parsePeriodicityGalaxPay } = require('../../../lib/galaxpay/parse-to-ecom')
const { handlePlanTransction } = require('../../../lib/payments/handle-plans')
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
  const galaxpayAxios = new GalaxpayAxios(appData.galaxpay_id, appData.galaxpay_hash, appData.galaxpay_sandbox, storeId)

  const orderId = params.order_id
  const orderNumber = params.order_number
  const { amount, buyer, payer, to, items, type } = params
  console.log('> Transaction #', orderId, ' store: ', storeId)

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
    tagValue: orderNumber
  }]

  const galaxpayCustomer = {
    myId: buyer.customer_id,
    name: buyer.fullname,
    document: buyer.doc_number,
    emails: [buyer.email],
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

  const finalAmount = transaction.amount

  const methodConfigName = params.payment_method.code === 'credit_card' ? appData.credit_card.label : appData.banking_billet.label

  let labelPaymentGateway = params.payment_method.name.replace('- GalaxPay', '')
  labelPaymentGateway = labelPaymentGateway.replace(methodConfigName, '')

  let plan = handlePlanTransction(labelPaymentGateway, appData)

  const fristPayment = new Date()

  const quantity = plan.quantity || 0
  const galaxpaySubscriptions = {
    myId: `${orderId}`, // requered
    value: Math.floor(finalAmount * 100),
    quantity: storeId === 1173 || storeId === 1011 ? quantity : 0, //  recorrence quantity, non-zero case, test in stores 1173 and 1011
    periodicity: parsePeriodicityGalaxPay(plan.periodicity),
    // additionalInfo: '', // optional
    ExtraFields: extraFields
  }

  if (!plan && !appData.plan_recurrence && appData.plans) {
    plan = appData.plans[0]
  }

  if (params.payment_method.code === 'credit_card') {
    const card = {
      hash: params.credit_card.hash
    }

    const PaymentMethodCreditCard = {
      Card: card,
      preAuthorize: false
    }

    galaxpaySubscriptions.mainPaymentMethodId = 'creditcard'
    galaxpaySubscriptions.PaymentMethodCreditCard = PaymentMethodCreditCard
    galaxpaySubscriptions.Customer = galaxpayCustomer
    galaxpaySubscriptions.firstPayDayDate = fristPayment.toISOString().split('T')[0]// requered
  } else if (params.payment_method.code === 'banking_billet') {
    if (to) {
      galaxpayCustomer.Address = parseAddress(to)
    } else if (params.billing_address) {
      galaxpayCustomer.Address = parseAddress(params.billing_address)
    }

    fristPayment.setDate(fristPayment.getDate() + (appData.banking_billet.add_days || 0))

    galaxpaySubscriptions.mainPaymentMethodId = 'boleto'
    galaxpaySubscriptions.Customer = galaxpayCustomer
    galaxpaySubscriptions.firstPayDayDate = fristPayment.toISOString().split('T')[0] // requered
  } else if (params.payment_method.code === 'account_deposit') {
    // other  is PIX
    if (to) {
      galaxpayCustomer.Address = parseAddress(to)
    } else if (params.billing_address) {
      galaxpayCustomer.Address = parseAddress(params.billing_address)
    }

    const PaymentMethodPix = {
      instructions: appData.pix.instructions || 'Pix'
    }

    fristPayment.setDate(fristPayment.getDate() + (appData.pix.add_days || 0))

    galaxpaySubscriptions.mainPaymentMethodId = 'pix'
    galaxpaySubscriptions.Customer = galaxpayCustomer
    galaxpaySubscriptions.firstPayDayDate = fristPayment.toISOString().split('T')[0] // requered
    galaxpaySubscriptions.PaymentMethodPix = PaymentMethodPix
  }

  galaxpayAxios.preparing
    .then(() => {
      if (type === 'recurrence') {
        galaxpayAxios.axios.post('/subscriptions', galaxpaySubscriptions)
          .then((data) => {
            return data.data.Subscription
          })
          .then((data) => {
            console.log('> New Subscription')

            if (data.mainPaymentMethodId === 'boleto' || data.mainPaymentMethodId === 'pix') {
              transaction.payment_link = data.paymentLink
            }

            const transactionGalaxPay = data.Transactions[0]

            const installment = transactionGalaxPay.installment

            transaction.status = {
              updated_at: data.datetimeLastSentToOperator || new Date().toISOString(),
              current: parseStatus(transactionGalaxPay.status)
            }

            transaction.intermediator = {
              transaction_id: transactionGalaxPay.tid,
              transaction_code: transactionGalaxPay.authorizationCode
            }

            res.send({
              redirect_to_payment: redirectToPayment,
              transaction
            })

            admin.firestore().collection('subscriptions').doc(orderId)
              .set({
                subscriptionLabel: appData.galaxpay_subscription_label,
                storeId,
                status: 'open',
                orderNumber: params.order_number,
                transactionId: transactionGalaxPay.galaxPayId
              })
              .catch(console.error)
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
