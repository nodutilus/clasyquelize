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

  static id = this.attribute({ type: DataTypes.BIGINT, primaryKey: true, allowNull: false })
  static uuid = this.attribute({ type: DataTypes.STRING, allowNull: false }).index()

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
  static publisher = Company

}

sequelize.attachModel(User, Company, Book)
sequelize.sync({ force: true }).then(async () => {
  const usr = await User.create({ id: 1, uuid: 'uuid4', username: 'username' })
  const cmpn = await Company.create({ id: 1, uuid: 'uuid4', companyname: 'companyname' })
  const bk = await Book.create({ id: 1, uuid: 'uuid4', title: 'title', author: usr.id, publisher: cmpn.id })

  // await Book.findAll({ include: { model: User, as: 'author' } })

  console.log(usr.toJSON())
  console.log((await User.findByPk(1, { include: Book })).toJSON())
  console.log(bk.toJSON())
  console.log((await Book.findByPk(1, { include: [User, Company] })).toJSON())

  await sequelize.close()
}).catch(console.error)
