import { Sequelize, Model, DataTypes } from 'sequelize'

const serialize = Symbol('serialize')
const associate = Symbol('associate')


class Clasyquelize extends Sequelize {

  /**
   * @param  {... typeof ClasyModel} models
   */
  attachModel(...models) {
    for (const model of models) {
      model.attach(this)
    }
  }

}


class ClasyAttribute {

  /** @type {import('sequelize').DataType | import('sequelize').ModelAttributeColumnOptions} */
  #options = null
  /** @type {import('sequelize').ModelIndexesOptions[]} */
  #indexes = null

  /**
   * @param {import('sequelize').DataType | import('sequelize').ModelAttributeColumnOptions} options
   */
  constructor(options) {
    this.#options = options
  }

  /**
   * @param {import('sequelize').ModelIndexesOptions} [options]
   * @returns {ClasyAttribute}
   */
  index(options = {}) {
    if (!this.#indexes) {
      this.#indexes = []
    }
    this.#indexes.push(options)

    return this
  }

  /**
   * @param {string} name
   * @returns {{options:import('sequelize').DataType | import('sequelize').ModelAttributeColumnOptions,indexes:import('sequelize').ModelIndexesOptions[]}}
   */
  [serialize](name) {
    const options = Object.assign({}, this.#options)
    let indexes = null

    if (this.#indexes) {
      indexes = []
      for (const indexRaw of this.#indexes) {
        const { options: index } = new ClasyIndex(indexRaw)[serialize]()

        if (!('fields' in index)) {
          index.fields = [name]
        }
        indexes.push(index)
      }
    }

    return { options, indexes }
  }

}


class ClasyIndex {

  /** @type {import('sequelize').ModelIndexesOptions} */
  #options = null

  /**
   * @param {import('sequelize').ModelIndexesOptions} options
   */
  constructor(options) {
    this.#options = options
  }

  /**
   * @param {string} [name]
   * @returns {{options:import('sequelize').ModelIndexesOptions}}
   */
  [serialize](name) {
    const options = Object.assign({}, this.#options)

    if (!('name' in options) && name) {
      options.name = name
    }
    if ('fields' in options) {
      options.fields = Array.from(options.fields)
    }

    return { options }
  }

}


class ClasyModel extends Model {

  /** @type {WeakMap<typeof ClasyModel, Set<()=>void>> } */
  static #associations = new WeakMap()

  /**
   * @param  {import('sequelize').DataType | import('sequelize').ModelAttributeColumnOptions} options
   * @returns {ClasyAttribute}
   */
  static attribute(options) {
    return new ClasyAttribute(options)
  }

  /**
   * @param {import('sequelize').ModelIndexesOptions} [options]
   * @returns {ClasyIndex}
   */
  static index(options) {
    return new ClasyIndex(options)
  }

  /**
   * @param {()=>void} fn
   */
  static [associate](fn) {
    if (ClasyModel.#associations.has(this)) {
      ClasyModel.#associations.get(this).add(fn)
    } else {
      ClasyModel.#associations.set(this, new Set([fn]))
    }
  }

  /**
   * @param {import('sequelize').Sequelize} sequelize
   */
  static attach(sequelize) {
    const { attributes, indexes } = serializeClasyModel(this)

    this.init(attributes, { sequelize, indexes })

    if (ClasyModel.#associations.has(this)) {
      for (const association of ClasyModel.#associations.get(this)) {
        association()
      }
    }
  }

}


function serializeClasyModel(model, options = { attributes: {}, indexes: [], allNames: new Set() }) {
  const { attributes, indexes, allNames } = options
  const keys = Object.keys(model)
  const ownAttributes = {}
  const ownIndexes = []

  for (const key of keys) {
    if (!allNames.has(key)) {
      const { value } = Reflect.getOwnPropertyDescriptor(model, key)

      if (value instanceof ClasyAttribute) {
        const { options, indexes: attrIndexes } = value[serialize](key)

        ownAttributes[key] = options
        if (attrIndexes) {
          ownIndexes.push(...attrIndexes)
        }
      } else if (value in DataTypes) {
        ownAttributes[key] = value
      } else if (Object.isPrototypeOf.call(Model, value)) {
        model[associate](() => {
          const { foreignKey } = model[key] = model.belongsTo(value, { as: key })

          value.hasMany(model, { foreignKey })
        })
      } else if (value instanceof ClasyIndex) {
        const { options } = value[serialize](key)

        ownIndexes.push(options)
      }

      allNames.add(key)
    }
  }

  const nestedModel = Reflect.getPrototypeOf(model)

  if (Object.isPrototypeOf.call(ClasyModel, nestedModel)) {
    serializeClasyModel(nestedModel, options)
  }

  Object.assign(attributes, ownAttributes)
  indexes.push(...ownIndexes)

  return { attributes, indexes }
}

export * from 'sequelize'
export { Clasyquelize, ClasyModel }
