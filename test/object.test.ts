import jsonToTsDeclare from '../src'
import { describe, it, expect } from 'vitest'

describe('object to declare', () => {
  it('should return two interface when target is complex object', () => {
    const target = {
      mysql: {
        type: 'mysql',
        database: 'pic',
        username: 'root',
        password: '123456',
        host: 'localhost',
        logging: true,
        port: 3306,
      },
    }
    expect(jsonToTsDeclare(target)).toEqual(
      `interface IRootName {
  mysql: mysql
}
interface mysql {
  type: string
  database: string
  username: string
  password: string
  host: string
  logging: boolean
  port: number
}`
    )
  })
})
