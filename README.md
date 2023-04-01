# clasyquelize

Classifying wrapper for [Sequelize ORM](https://sequelize.org/)

#### Example

```js
import { Clasyquelize, ClasyModel, DataTypes } from '@nodutilus/clasyquelize'

const sequelize = new Clasyquelize('sqlite:database.sqlite')


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
```
