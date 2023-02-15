const { parseStatus, parsePeriodicity, setId } = require('../galaxpay/parse-to-ecom')
const { checkAmountItemsOrder } = require('../galaxpay/update-subscription')

const isStatusPaidAuthorized = (status) => {
  const parsedStatus = parseStatus(status)
  if (parsedStatus === 'paid' || parsedStatus === 'authorized') {
    return true
  }
  return false
}

const findOrderById = async (appSdk, storeId, auth, orderId) => {
  return new Promise((resolve, reject) => {
    appSdk.apiRequest(storeId, `/orders/${orderId}.json?fields=transactions,financial_status`, 'GET', null, auth)
      .then(({ response }) => {
        const { data } = response
        resolve(data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const findOrderByTid = async (appSdk, storeId, auth, tid) => {
  return new Promise((resolve, reject) => {
    appSdk.apiRequest(storeId, `/orders.json?transactions.intermediator.transaction_id=${tid}&fields=transactions`, 'GET', null, auth)
      .then(({ response }) => {
        const { result } = response.data
        // console.log('>> ', result)
        resolve(result[0])
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const createNewOrder = async (appSdk, storeId, auth, originalOrder, galaxPayTransaction, galaxPaySubscription, subscriptionDoc) => {
  console.log('> Create new Order ')
  return new Promise((resolve, reject) => {
    const { plan, subscriptionLabel } = subscriptionDoc
    const { installment } = galaxPayTransaction
    const {
      domain,
      amount,
      buyers,
      items
    } = originalOrder
    const channelType = originalOrder.channel_type
    const shippingLines = originalOrder.shipping_lines
    const shippingMethodLabel = originalOrder.shipping_method_label
    const paymentMethodLabel = originalOrder.payment_method_label
    const originalTransaction = originalOrder.transactions[0]
    const periodicity = parsePeriodicity(galaxPaySubscription.periodicity)
    const dateUpdate = galaxPayTransaction.datetimeLastSentToOperator
      ? new Date(galaxPayTransaction.datetimeLastSentToOperator).toISOString()
      : new Date().toISOString()

    // remove items free in new orders subscription
    checkAmountItemsOrder(amount, items, plan)
    if (amount.balance) {
      delete amount.balance
    }

    const transactions = [
      {
        _id: setId(Date.now()),
        amount: originalTransaction.amount,
        status: {
          updated_at: dateUpdate,
          current: parseStatus(galaxPayTransaction.status)
        },
        intermediator: {
          transaction_id: `${galaxPayTransaction.tid || ''}`,
          transaction_code: `${galaxPayTransaction.authorizationCode || ''}`,
          transaction_reference: `${galaxPayTransaction.galaxPayId || ''}`
        },
        payment_method: originalTransaction.payment_method,
        app: originalTransaction.app,
        notes: `Parcela #${installment} referente à ${subscriptionLabel || ''} ${periodicity}`,
        custom_fields: originalTransaction.custom_fields,
        payment_link: galaxPaySubscription.paymentLink
      }
    ]

    const body = {
      opened_at: new Date().toISOString(),
      items,
      shipping_lines: shippingLines,
      buyers,
      channel_type: channelType,
      domain,
      amount,
      shipping_method_label: shippingMethodLabel,
      payment_method_label: paymentMethodLabel,
      transactions,
      subscription_order: {
        _id: originalOrder._id,
        number: originalOrder.number
      },
      notes: `Pedido #${installment} referente à ${subscriptionLabel} ${periodicity}`,
      staff_notes: `Valor cobrado no GalaxPay R$${(galaxPayTransaction.value / 100)}`
    }

    appSdk.apiRequest(storeId, 'orders.json', 'POST', body, auth)
      .then(() => {
        resolve(true)
      })
      .catch(err => {
        reject(err)
      })
  })
}

module.exports = {
  findOrderByTid,
  findOrderById,
  isStatusPaidAuthorized,
  createNewOrder
}
