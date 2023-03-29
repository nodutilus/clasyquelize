import { Clasyquelize, ClasyModel, DataTypes } from '@nodutilus/clasyquelize'

const sequelize = new Clasyquelize('sqlite:database.sqlite')


class Entity extends ClasyModel {

  static id = this.attribute({ type: DataTypes.BIGINT, primaryKey: true, allowNull: false })
  static uuid = this.attribute({ type: DataTypes.STRING, allowNull: false }).index()

}

class User extends Entity {

  static username = this.attribute({ type: DataTypes.STRING })

}


sequelize.attachModel(User);

(async () => {
  const usr = await User.create({ id: 1, username: 1 })

  console.log(usr)
})()
