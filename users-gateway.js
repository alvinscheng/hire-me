const usersGateway = (db) => {

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
      .from('users')
    if (where) {
      query.where(where)
    }
    return query
  }

  function create(newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(saved => saved[0])
  }

  function updateById(id, updates) {
    return db
      .table('users')
      .where('id', id)
      .update(updates)
      .returning('*')
      .then(updated => updated[0])
  }

  function deleteById(id) {
    return db
      .from('users')
      .where('id', id)
      .delete()
  }

  function findById(id) {
    return db
      .select('*')
      .from('users')
      .where('id', id)
      .first()
  }
}

module.exports = usersGateway
