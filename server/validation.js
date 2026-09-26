const GAME_STATS = new Set(['points', 'rebounds', 'assists', 'steals', 'blocks'])

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

function cleanRoster(value, label, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`)
    return []
  }
  const roster = value.map((name) => typeof name === 'string' ? name.trim() : '')
  if (roster.length < 1 || roster.length > 15) errors.push(`${label} must contain 1 to 15 players`)
  if (roster.some((name) => !name || name.length > 80)) errors.push(`${label} player names must be 1 to 80 characters`)
  return roster
}

export function parseId(value, label = 'id') {
  const text = String(value ?? '')
  if (!/^[1-9]\d*$/.test(text)) return { error: `${label} must be a positive integer` }
  return { value: text }
}

export function validateGame(input = {}) {
  const errors = []
  const date = typeof input.date === 'string' ? input.date.trim() : ''
  const venue = typeof input.venue === 'string' ? input.venue.trim() : ''
  const homeName = typeof input.homeName === 'string' ? input.homeName.trim() : ''
  const awayName = typeof input.awayName === 'string' ? input.awayName.trim() : ''
  const homePlayers = cleanRoster(input.homePlayers, 'homePlayers', errors)
  const awayPlayers = cleanRoster(input.awayPlayers, 'awayPlayers', errors)

  if (!validDate(date)) errors.push('date must be a real date in YYYY-MM-DD format')
  if (!venue || venue.length > 120) errors.push('venue must be 1 to 120 characters')
  if (!homeName || homeName.length > 80) errors.push('homeName must be 1 to 80 characters')
  if (!awayName || awayName.length > 80) errors.push('awayName must be 1 to 80 characters')
  if (homeName && awayName && homeName.toLowerCase() === awayName.toLowerCase()) errors.push('homeName and awayName must be different')

  return { errors, value: { date, venue, homeName, awayName, homePlayers, awayPlayers } }
}

export function validatePlay(input = {}) {
  const errors = []
  const teamSide = input.teamSide
  const playerId = parseId(input.playerId, 'playerId')
  const stat = input.stat
  const amount = Number(input.amount)

  if (!['home', 'away'].includes(teamSide)) errors.push('teamSide must be home or away')
  if (playerId.error) errors.push(playerId.error)
  if (!GAME_STATS.has(stat)) errors.push('stat must be points, rebounds, assists, steals, or blocks')
  if (!Number.isInteger(amount) || amount < 1 || amount > 3) errors.push('amount must be a whole number from 1 to 3')
  if (stat !== 'points' && amount !== 1) errors.push('non-scoring stats must have an amount of 1')

  return { errors, value: { teamSide, playerId: playerId.value, stat, amount } }
}
