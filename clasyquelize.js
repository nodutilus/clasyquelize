import { Sequelize, Model } from 'sequelize'

const serialize = Symbol('serialize')

class Clasyquelize extends Sequelize {

  /**
   * @param  {... typeof ClasyModel} models
   */
  attachModel(...models) {
    for (const model of models) {
      model.init({}, { sequelize: this })
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
    if (this.#indexes) {
      for (const index of this.#indexes) {
        if (!('fields' in index)) {
          index.fields = [name]
        }
      }
    }

    return { options: this.#options, indexes: this.#indexes }
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
   * @param {string} name
   * @returns {{options:import('sequelize').ModelIndexesOptions}}
   */
  [serialize](name) {
    if (!('name' in this.#options)) {
      this.#options.name = name
    }

    return { options: this.#options }
  }

}


class ClasyModel extends Model {

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
   * @param {import('sequelize').ModelAttributes} attrs
   * @param {import('sequelize').InitOptions} options
   * @returns {import('sequelize').ModelStatic<ClasyModel>}
   */
  static init(attrs, options) {
    const { attributes, indexes } = serializeClasyModel(this)

    Object.assign(attributes, attrs)

    if (options instanceof Sequelize) {
      options = { sequelize: options, indexes }
    } else {
      options.indexes = 'indexes' in options ? indexes.concat(options.indexes) : indexes
    }

    return super.init(attributes, options)
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
