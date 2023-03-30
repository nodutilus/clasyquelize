import { existsSync, readFileSync } from 'fs'
import { Clasyquelize, ClasyModel, DataTypes } from '@nodutilus/clasyquelize'

const env = {
  DATABASE: 'sqlite:database.sqlite'
}
const envPath = '.env.json'

if (existsSync(envPath)) {
  Object.assign(env, JSON.parse(readFileSync(envPath, 'utf-8')))
} else {
  console.error(new Error(`Not found ${envPath}`))
  process.exit(0)
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


sequelize.attachModel(User)
sequelize.sync({ force: true }).then(async () => {
  const usr = await User.create({ id: 1, uuid: 'uuid4', username: 'name' })

  console.log(usr.toJSON())

  await sequelize.close()
}).catch(console.error)
