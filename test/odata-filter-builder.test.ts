import { BoolArg, BuilderFunc } from './../src/odata-filter-builder'
import { ODataFilterBuilder } from '../src/odata-filter-builder'
import {} from 'jest'

interface IEntity {
  id: number
}

interface IProduct extends IEntity {
  name: string
  description: string
  price: number
}

interface IOrderItem extends IEntity {
  product: IProduct
  quantity: number
  price: number
  parentOrder: IOrder
}

interface IOrder extends IEntity {
  customer: ICustomer
  status: 'CREATED' | 'PAID' | 'CANCELLED'
  createdDate: Date
  orderItems: IOrderItem[]
}

interface ICustomer extends IEntity {
  name: string
}

type FilterTest<T> = { filter: BuilderFunc<T>; expectedResult: string }

describe('ODataFilterBuilder general test', () => {
  it('renders empty filter', () => {
    expect(ODataFilterBuilder.build(null).getString()).toEqual('')
  })
})

describe('ODataFilterBuilder binary operators test', () => {
  it('Renders binary operators', () => {
    const filters: FilterTest<IProduct>[] = [
      {
        filter: ({ eq }, p) => eq(p.name, 'IPhone'),
        expectedResult: `name eq 'IPhone'`
      },
      {
        filter: ({ ne }, p) => ne(p.name, 'IPhone'),
        expectedResult: `name ne 'IPhone'`
      },
      {
        filter: ({ lt }, p) => lt(p.price, 999.95),
        expectedResult: `price lt 999.95`
      },
      {
        filter: ({ gt }, p) => gt(p.price, 999.95),
        expectedResult: `price gt 999.95`
      },
      {
        filter: ({ le }, p) => le(p.price, 999.95),
        expectedResult: `price le 999.95`
      },
      {
        filter: ({ ge }, p) => ge(p.price, 999.95),
        expectedResult: `price ge 999.95`
      }
    ]

    filters.forEach(f => {
      expect(ODataFilterBuilder.build(f.filter).getString()).toEqual(
        f.expectedResult
      )
    })
  })
})

describe('ODataFilterBuilder logical operators test', () => {
  it('Renders logical operators', () => {
    const filters: FilterTest<IProduct>[] = [
      {
        filter: ({ eq, and }, p) => and(eq(p.name, 'IPhone'), true),
        expectedResult: `(name eq 'IPhone' and true)`
      },
      {
        filter: ({ eq, or }, p) => or(true, eq(p.name, 'IPhone')),
        expectedResult: `(true or name eq 'IPhone')`
      },
      {
        filter: ({ eq, not }, p) => not(eq(p.name, 'IPhone')),
        expectedResult: `not(name eq 'IPhone')`
      },
      {
        filter: ({ and }, p) => and(),
        expectedResult: `true`
      }
    ]

    filters.forEach(f => {
      expect(ODataFilterBuilder.build(f.filter).getString()).toEqual(
        f.expectedResult
      )
    })
  })
})

describe('ODataFilterBuilder string functions test', () => {
  it('Renders string functions', () => {
    const filters: FilterTest<IProduct>[] = [
      {
        filter: ({ endswith }, p) => endswith(p.name, 'IPhone'),
        expectedResult: `endswith(name, 'IPhone')`
      },
      {
        filter: ({ startswith }, p) => startswith(p.name, 'IPhone'),
        expectedResult: `startswith(name, 'IPhone')`
      },
      {
        filter: ({ substringof }, p) => substringof(p.name, 'IPhone'),
        expectedResult: `substringof(name, 'IPhone')`
      },
      {
        filter: ({ gt, length }, p) => gt(length(p.name), 0),
        expectedResult: `length(name) gt 0`
      },
      {
        filter: ({ gt, indexof }, p) => gt(indexof(p.name, 'test'), 0),
        expectedResult: `indexof(name, 'test') gt 0`
      },
      {
        filter: ({ eq, replace }, p) => eq(replace(p.name, 'test', 'x'), 'xx'),
        expectedResult: `replace(name, 'test', 'x') eq 'xx'`
      },
      {
        filter: ({ eq, substring }, p) => eq(substring(p.name, 1), 'Phone'),
        expectedResult: `substring(name, 1) eq 'Phone'`
      },
      {
        filter: ({ eq, tolower }, p) => eq(tolower(p.name), 'iphone'),
        expectedResult: `tolower(name) eq 'iphone'`
      },
      {
        filter: ({ eq, toupper }, p) => eq(toupper(p.name), 'IPHONE'),
        expectedResult: `toupper(name) eq 'IPHONE'`
      },
      {
        filter: ({ eq, trim }, p) => eq(trim(p.name), 'IPhone'),
        expectedResult: `trim(name) eq 'IPhone'`
      },
      {
        filter: ({ eq, concat }, p) => eq(concat(p.name, 'X'), 'IPhoneX'),
        expectedResult: `concat(name, 'X') eq 'IPhoneX'`
      },
      {
        filter: ({ contains }, p) => contains(p.name, 'X'),
        expectedResult: `contains(name, 'X')`
      }
    ]

    filters.forEach(f => {
      expect(ODataFilterBuilder.build(f.filter).getString()).toEqual(
        f.expectedResult
      )
    })
  })

  it('Escapes quotes', () => {
    const f: FilterTest<IProduct> = {
      filter: ({ endswith }, p) => endswith(p.name, `IPhone 'X' `),
      expectedResult: `endswith(name, 'IPhone ''X'' ')`
    }

    expect(ODataFilterBuilder.build(f.filter).getString()).toEqual(
      f.expectedResult
    )
  })
})

describe('ODataFilterBuilder date functions test', () => {
  it('Renders date functions', () => {
    const filters: FilterTest<IOrder>[] = [
      {
        filter: ({ eq, day }, p) => eq(day(p.createdDate), 0),
        expectedResult: `day(createdDate) eq 0`
      },
      {
        filter: ({ eq, month }, p) => eq(month(p.createdDate), 0),
        expectedResult: `month(createdDate) eq 0`
      },
      {
        filter: ({ eq, year }, p) => eq(year(p.createdDate), 2000),
        expectedResult: `year(createdDate) eq 2000`
      },
      {
        filter: ({ eq, hour }, p) => eq(hour(p.createdDate), 0),
        expectedResult: `hour(createdDate) eq 0`
      },
      {
        filter: ({ eq, minute }, p) => eq(minute(p.createdDate), 0),
        expectedResult: `minute(createdDate) eq 0`
      },
      {
        filter: ({ eq, second }, p) => eq(second(p.createdDate), 0),
        expectedResult: `second(createdDate) eq 0`
      },
      {
        filter: ({ eq, date }, p) =>
          eq(date(p.createdDate), new Date('2000-01-01')),
        expectedResult: `date(createdDate) eq 2000-01-01T00:00:00.000Z`
      },
      {
        filter: ({ eq, time }, p) =>
          eq(time(p.createdDate), new Date('2000-01-01')),
        expectedResult: `time(createdDate) eq 2000-01-01T00:00:00.000Z`
      },
      {
        filter: ({ eq, totaloffsetminutes }, p) =>
          eq(totaloffsetminutes(p.createdDate), 0),
        expectedResult: `totaloffsetminutes(createdDate) eq 0`
      },
      {
        filter: ({ eq, now }, p) => eq(p.createdDate, now()),
        expectedResult: `createdDate eq now()`
      }
    ]

    filters.forEach(f => {
      expect(ODataFilterBuilder.build(f.filter).getString()).toEqual(
        f.expectedResult
      )
    })
  })
})

describe('ODataFilterBuilder number functions test', () => {
  it('Renders number functions', () => {
    const filters: FilterTest<IOrderItem>[] = [
      {
        filter: ({ eq, round }, p) => eq(round(p.price), 1000),
        expectedResult: `round(price) eq 1000`
      },
      {
        filter: ({ eq, floor }, p) => eq(floor(p.price), 999),
        expectedResult: `floor(price) eq 999`
      },
      {
        filter: ({ eq, ceiling }, p) => eq(ceiling(p.price), 1000),
        expectedResult: `ceiling(price) eq 1000`
      }
    ]

    filters.forEach(f => {
      expect(ODataFilterBuilder.build(f.filter).getString()).toEqual(
        f.expectedResult
      )
    })
  })
})

describe('ODataFilterBuilder collections test', () => {
  it('Renders collections filters', () => {
    const filters: FilterTest<IOrder>[] = [
      {
        filter: (b, p) =>
          b.collection(p.orderItems, 'i').any(i => i.lt(i.prop.price, 100)),
        expectedResult: `orderItems/any(i: i/price lt 100)`
      },
      {
        filter: (b, p) =>
          b.collection(p.orderItems, 'i').all(i => i.lt(i.prop.price, 100)),
        expectedResult: `orderItems/all(i: i/price lt 100)`
      },
      {
        filter: (b, p) => b.eq(b.collection(p.orderItems, 'i').count, 5),
        expectedResult: `orderItems/$count eq 5`
      },
      {
        filter: (b, p) => b.collection(p.orderItems).any(),
        expectedResult: `orderItems/any()`
      }
    ]

    filters.forEach(f => {
      expect(ODataFilterBuilder.build(f.filter).getString()).toEqual(
        f.expectedResult
      )
    })
  })
})

describe('ODataFilterBuilder nested test', () => {
  it('Allows to reuse filters via nested()', () => {
    const orderFilter: BuilderFunc<IOrder> = (b, p) =>
      b.contains(p.customer.name, 'John')

    const orderTest: FilterTest<IOrder> = {
      filter: orderFilter,
      expectedResult: `contains(customer/name, 'John')`
    }
    const orderItemTest: FilterTest<IOrderItem> = {
      filter: (b, p) => b.nested(p.parentOrder, orderFilter),
      expectedResult: `contains(parentOrder/customer/name, 'John')`
    }

    expect(ODataFilterBuilder.build(orderTest.filter).getString()).toEqual(
      orderTest.expectedResult
    )
    expect(ODataFilterBuilder.build(orderItemTest.filter).getString()).toEqual(
      orderItemTest.expectedResult
    )
  })
})

describe('ODataFilterBuilder custom functions test', () => {
  it('Renders custom functions', () => {
    const orderFilter: BuilderFunc<IOrder> = (b, p) =>
      b.function('myCustomFunc', p.customer.name, 'John')

    const orderTest: FilterTest<IOrder> = {
      filter: orderFilter,
      expectedResult: `myCustomFunc(customer/name, 'John')`
    }

    expect(ODataFilterBuilder.build(orderTest.filter).getString()).toEqual(
      orderTest.expectedResult
    )
  })
})
