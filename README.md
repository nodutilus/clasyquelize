# clasyquelize

Classifying wrapper for [Sequelize ORM](https://sequelize.org/)

#### Example

```js
import { Clasyquelize, ClasyModel, DataTypes } from '@nodutilus/clasyquelize'

const sequelize = new Clasyquelize('sqlite:database.sqlite')


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

  const user1 = await User.create({ uuid: 'uuid4_user_1', username: 'username' })
  const user2 = await User.create({ uuid: 'uuid4_user_2', username: 'username' })
  const compan = await Company.create({ uuid: 'uuid4_company_1', companyname: 'companyname' })
  const book1 = await Book.create({
    uuid: 'uuid4_book_1',
    title: 'title',
    author: user1.id,
    chiefEditor: user1.id,
    publisher: compan.id
  })
  const book2 = await Book.create({
    uuid: 'uuid4_book_2',
    title: 'title',
    author: user1.id,
    chiefEditor: user2.id,
    publisher: compan.id
  })
  const book1Read = await Book.findByUUID('uuid4_book_1', {
    include: [Book.author, Book.chiefEditor, Book.publisher]
  })
  const author1Read = await User.findByUUID('uuid4_user_1', {
    include: [User.as(Book.author), User.as(Book.chiefEditor)]
  })

  console.log('Book1.create:', book1.toJSON())
  console.log('Book2.create:', book2.toJSON())
  console.log('Book1.findByUUID:', book1Read.toJSON())
  console.log('User1.findByUUID:', author1Read.toJSON())

  await sequelize.close()
})()
```

Output:

```js
Book1.create: {
  id: 1,
  uuid: 'uuid4_book_1',
  title: 'title',
  author: 1,
  chiefEditor: 1,
  publisher: 1,
  updatedAt: 2023-07-13T17:38:30.858Z,
  createdAt: 2023-07-13T17:38:30.858Z
}
Book2.create: {
  id: 2,
  uuid: 'uuid4_book_2',
  title: 'title',
  author: 1,
  chiefEditor: 2,
  publisher: 1,
  updatedAt: 2023-07-13T17:38:30.892Z,
  createdAt: 2023-07-13T17:38:30.892Z
}
Book1.findByUUID: {
  id: 1,
  uuid: 'uuid4_book_1',
  title: 'title',
  createdAt: 2023-07-13T17:38:30.858Z,
  updatedAt: 2023-07-13T17:38:30.858Z,
  author: 1,
  chiefEditor: 1,
  publisher: 1,
  '$author': {
    id: 1,
    uuid: 'uuid4_user_1',
    username: 'username',
    createdAt: 2023-07-13T17:38:30.769Z,
    updatedAt: 2023-07-13T17:38:30.769Z
  },
  '$chiefEditor': {
    id: 1,
    uuid: 'uuid4_user_1',
    username: 'username',
    createdAt: 2023-07-13T17:38:30.769Z,
    updatedAt: 2023-07-13T17:38:30.769Z
  },
  '$publisher': {
    id: 1,
    uuid: 'uuid4_company_1',
    companyname: 'companyname',
    createdAt: 2023-07-13T17:38:30.832Z,
    updatedAt: 2023-07-13T17:38:30.832Z
  }
}
User1.findByUUID: {
  id: 1,
  uuid: 'uuid4_user_1',
  username: 'username',
  createdAt: 2023-07-13T17:38:30.769Z,
  updatedAt: 2023-07-13T17:38:30.769Z,
  '$author': [
    {
      id: 1,
      uuid: 'uuid4_book_1',
      title: 'title',
      createdAt: 2023-07-13T17:38:30.858Z,
      updatedAt: 2023-07-13T17:38:30.858Z,
      author: 1,
      chiefEditor: 1,
      publisher: 1
    },
    {
      id: 2,
      uuid: 'uuid4_book_2',
      title: 'title',
      createdAt: 2023-07-13T17:38:30.892Z,
      updatedAt: 2023-07-13T17:38:30.892Z,
      author: 1,
      chiefEditor: 2,
      publisher: 1
    }
  ],
  '$chiefEditor': [
    {
      id: 1,
      uuid: 'uuid4_book_1',
      title: 'title',
      createdAt: 2023-07-13T17:38:30.858Z,
      updatedAt: 2023-07-13T17:38:30.858Z,
      author: 1,
      chiefEditor: 1,
      publisher: 1
    }
  ]
}
```
