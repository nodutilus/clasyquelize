import { Sequelize, Model } from 'sequelize'

const serialize = Symbol('serialize')


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
  indexe(options = {}) {
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
      for (const indexe of this.#indexes) {
        if (!('fields' in indexe)) {
          indexe.fields = [name]
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
  static indexe(options) {
    return new ClasyIndex(options)
  }

  /**
   * @param {import('sequelize').Sequelize | import('sequelize').InitOptions} options
   * @returns {import('sequelize').ModelStatic<ClasyModel>}
   */
  static init(options = {}) {
    const { attributes, indexes } = serializeClasyModel(this)

    if (options instanceof Sequelize) {
      options = { sequelize: options, indexes }
    } else if ('indexes' in options) {
      options.indexes = indexes.concat(options.indexes)
    } else {
      options.indexes = indexes
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


export { ClasyModel }
