module.exports = id => {
  const length = 24 - id.toString().length + 1
  return Array(length).join('0') + id
}
