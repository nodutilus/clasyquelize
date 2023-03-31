declare module '@nodutilus/clasyquelize' {

  import { Sequelize, Model, DataType, ModelAttributeColumnOptions, ModelIndexesOptions } from 'sequelize'
  export * from 'sequelize'

  class ClasyAttribute {
    index(options?: ModelIndexesOptions): ClasyAttribute
  }

  class ClasyIndex { }

  export class Clasyquelize extends Sequelize {
    attachModel(...model: typeof ClasyModel[]): void
  }

  export class ClasyModel extends Model {
    static attribute(options: DataType | ModelAttributeColumnOptions): ClasyAttribute
    static index(options?: ModelIndexesOptions): ClasyIndex
    static associate(fn: () => void): void
    static attach(sequelize: Sequelize): void
  }

}
