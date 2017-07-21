const dbGateway = (db, table) => {

  return {
    find,
    create,
    findById,
    updateById,
    deleteById
  }

  function find(where) {
    const query = db
      .select('*')
      .from(table)
    if (where) {
      query.where(where)
    }
    return query
  }

  function create(item) {
    return db
      .insert(item)
      .into(table)
      .returning('*')
      .then(saved => saved[0])
  }

  function updateById(id, updates) {
    return db
      .table(table)
      .where('id', id)
      .update(updates)
      .returning('*')
      .then(updated => updated[0])
  }

  function deleteById(id) {
    return db
      .from(table)
      .where('id', id)
      .delete()
  }

  function findById(id) {
    return db
      .select('*')
      .from(table)
      .where('id', id)
      .first()
  }
}

module.exports = dbGateway
