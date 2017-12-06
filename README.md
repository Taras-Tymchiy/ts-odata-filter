# ts-odata-filter
A typescript library for buiding OData filter string

[![npm version](https://badge.fury.io/js/ts-odata-filter.svg)](https://badge.fury.io/js/ts-odata-filter)

## Install
```
npm install ts-odata-filter --save
```

## Usage

### Basic usage
```typescript
import { ODataFilterBuilder, BuilderFunc, BoolArg } from 'ts-odata-filter'

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

// build() method accepts a callback which first argument is an ODataFilterBuilder instance
// builder has members which correspond to OData operators and functions (eq, ne, contains, and, or, not, etc.)
// builder also has "prop" member which allows to use strongly typed entity property names
ODataFilterBuilder.build<IOrder>(builder => builder.eq(builder.prop.customer.id, 123)).getString(); // returns 'customer/id eq 123'

ODataFilterBuilder.build<IOrder>(
  builder => builder.eq(builder.prop.someProperty, 123)
).getString(); // compilation error (unknown property 'someProperty')

ODataFilterBuilder.build<IOrder>(
  builder => builder.eq(builder.prop.customer.id, '123')
).getString(); // compilation error (string '123' is not assignable to customer.id)


// builder.prop is also passed as the second arg of a callback 
const filter: BuilderFunc<IOrder> = (b, p) => 
  b.and(
    b.eq(p.customer.id, 123),
    b.eq(p.status, 'PAID')
  );

ODataFilterBuilder.build<IOrder>(filter).getString(); // returns '(customer/id eq 123 and status eq 'PAID')'

```

### Destructuring builder argument
```typescript

// you can use destructuring to make the code shorter or prettier 
const filter: BuilderFunc<IOrder> = ({eq, and}, p) => 
  and(
    eq(p.customer.id, 123),
    eq(p.status, 'PAID')
  );

ODataFilterBuilder.build(filter).getString(); // returns '(customer/id eq 123 and status eq 'PAID')'

```

### Working with collections
```typescript

// find all orders with iphones 
const filter: BuilderFunc<IOrder> = (b, p) =>
  b.collection(p.orderItems, 'i').any(
    i => i.contains(i.prop.product.name, 'IPhone')
  );
  
ODataFilterBuilder.build(filter).getString(); // returns 'orderItems/any(i: contains(i/product/name, 'IPhone'))'

```

### Reusing filter expressions
```typescript

// find all iphones
const filterIphones: BoolFunc<IProduct> = (b, p) => 
  b.or(
    b.contains(p.name, 'IPhone'),
    b.contains(p.description, 'IPhone')
  );
ODataFilterBuilder.build(filterIphones).getString(); // returns '(contains(name, 'IPhone') or contains(description, 'IPhone'))'

// find all iphones selled for more than $1000
const filterOrderItems: BoolFunc<IOrderItem> = (b, p) =>
  b.and(
    b.nested(p.product, filterIphones),
    b.gt(p.price, 1000)
  );

// returns '((contains(product/name, 'IPhone') or contains(product/description, 'IPhone')) and price gt 1000)'
ODataFilterBuilder.build(filterIphones).getString(); 

// find all orders with iphones for more than 1000$ where customer name is Jonh 
const filterOrders: BoolFunc<IOrder> = (b, p) =>
  b.and(
    b.collection(p.orderItems, 'i').any(filterOrderItems),
    b.contains(p.customer.name, 'John')
  );

// returns '(orderItems/any(i: ((contains(i/product/name, 'IPhone') or contains(product/description, 'IPhone')) and price gt 1000)) and contains(customer/name, 'John'))'
ODataFilterBuilder.build(filterOrders).getString(); 


```
