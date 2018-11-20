function getOperation (el, obj) {
  if (operations[el]) {
    return operations[el]
  }

  for (var key in operations) {
    if (obj[key]) {
      return operations[key]
    }
  }

  return eq
}

function gt (q, table, el, obj, op) {
  return q[op](table[el].gt(obj['$gt']))
}

function gte (q, table, el, obj, op) {
  return q[op](table[el].gt(obj['$gte']))
}

function lt (q, table, el, obj, op) {
  return q[op](table[el].lt(obj['$lt']))
}

function lte (q, table, el, obj, op) {
  return q[op](table[el].lte(obj['$lte']))
}

function eq (q, table, el, obj, op, type) {
  if (type.complexType) {
    for (var prop in type.complexType) {
      if (obj[prop]) {
        q = getOperation(el, type.complexType[prop])(q, table, el + '_' + prop, obj[prop], 'where', type.complexType[prop])
      }
    }
    return q
  }

  if (type.isPrimitive) {
    return q[op](table[el].equals(obj))
  } else {
    return q[op](table[el].like('%' + obj + '%'))
  }
}

function and (q, table, elG, obj, op, type) {
  for (var i = 0; i < obj.length; i++) {
    var filter = obj[i]

    for (var el in filter) {
      if (filter[el]) {
        q = getOperation(el, filter[el])(q, table, el, filter[el], 'and', type[el] || type)
      }
    }
  }

  return q
}

function or (q, table, elG, obj, op, type) {
  for (var i = 0; i < obj.length; i++) {
    var filter = obj[i]

    for (var el in filter) {
      if (filter[el]) {
        q = getOperation(el, filter[el])(q, table, el, filter[el], 'or', type[el] || type)
      }
    }
  }

  return q
}

function inFn (q, table, el, obj, op) {
  return q[op](table[el].in(obj['$in']))
}

module.exports = function doFilter (query, table, filter, entityType) {
  for (var el in filter) {
    if (filter[el]) {
      query = getOperation(el, filter[el])(query, table, el, filter[el], 'where', entityType[el] || entityType)
    }
  }

  return query
}

var operations = {
  $gt: gt,
  $gte: gte,
  $lt: lt,
  $lte: lte,
  $and: and,
  $or: or,
  $in: inFn
}

