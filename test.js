import { existsSync, readFileSync } from 'fs'
import { Clasyquelize, ClasyModel, DataTypes } from '@nodutilus/clasyquelize'

const env = {
  DATABASE: 'sqlite:database.sqlite'
}
const envPath = '.env.json'

if (existsSync(envPath)) {
  Object.assign(env, JSON.parse(readFileSync(envPath, 'utf-8')))
}

const sequelize = new Clasyquelize(env.DATABASE)


class Entity extends ClasyModel {

  static id = this.attribute({ type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true })
  static uuid = this.attribute({ type: DataTypes.STRING, allowNull: false }).index({ unique: true })

  static async findByUUID(uuid, options = {}) {
    const entity = await this.findOne(Object.assign(options, { where: { uuid } }))

    return entity
  }

}


class User extends Entity {

  static username = DataTypes.STRING
  static iUsername = this.index({ fields: ['username'] })

}


class Company extends Entity {

  static companyname = DataTypes.STRING
  static iCompanyname = this.index({ fields: ['companyname'] })

}


class Book extends Entity {

  static title = DataTypes.STRING
  static author = User
  static chiefEditor = User
  static publisher = Company

}

(async () => {
  sequelize.attachModel(User, Company, Book)
  await sequelize.sync({ force: true })

  const book1 = await Book.create({
    uuid: 'uuid4_book_1',
    title: 'title',
    author: { uuid: 'uuid4_author_1', username: 'username' },
    chiefEditor: { uuid: 'uuid4_chief_1', username: 'username' },
    publisher: { uuid: 'uuid4_company_1', companyname: 'companyname' }
  }, {
    include: [Book.author, Book.chiefEditor, Book.publisher]
  })
  const book1Read = await Book.findByUUID('uuid4_book_1', { include: [Book.author, Book.chiefEditor, Book.publisher] })
  const author1Read = await User.findByUUID('uuid4_chief_1', { include: [User.as(Book.author), User.as(Book.chiefEditor)] })

  console.log('Book.create', book1.toJSON())
  console.log('Book.findByUUID', book1Read.toJSON())
  console.log('User.findByUUID', author1Read.toJSON())

  await sequelize.close()
})()
