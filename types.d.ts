declare module '@nodutilus/clasyquelize' {

  import { Sequelize, Model } from 'sequelize'
  export * from 'sequelize'

  export class Clasyquelize extends Sequelize {
    attachModel(...model: typeof ClasyModel[]): void
  }

  export class ClasyModel extends Model {
    static attribute(): any
    static attach(sequelize: Sequelize): void
  }

}
