export function isObjectBody(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function requireObjectBody(request, response, next) {
  if (['POST', 'PUT', 'PATCH'].includes(request.method) && !isObjectBody(request.body)) {
    return response.status(400).json({ error: 'Request body must be a JSON object' })
  }
  next()
}
