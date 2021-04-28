# Pirple Node.js Master class - Homework Assignment #2 - Pizza Delivery API

## Requirements

1. Create, update and delete users.
2. Users can log in and log out by creating or destroying a token.
3. When a user is logged in, they should be able to GET all the possible menu items.
4. A logged-in user should be able to fill a shopping cart with menu items.
5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment.
6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com.

## How to run

1. Go to `lib/config.js` and set up the mailgun configs to your own credentials. For stripe I'm using a test secret, you can change as well.
2. On the root run `node index.js`

## API
API domain `http://localhost:3000`

### USERS

**Create new user**
```curl
POST /users
```
Payload
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "123456",
  "address": "Av. Street, 34"
}
```

**Update user**
```curl
PUT /users
```
Payload
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "123456",
  "address": "Av. Street, 34"
}
```

**Get user**
```curl
GET /users?email={email}
```
Response
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "address": "Av. Street, 34"
}
```
**Delete user**
```curl
DELETE /users?email={email}
```

### TOKENS

**Create new token**
```curl
POST /tokens
```
Payload
```json
{
  "email": "john@gmail.com",
  "password": "123456"
}
```

**Delete token**
```curl
POST /tokens?id={id}
```

### MENU ITEMS
Retrieves all menu items.
Requires `token` to be passed in `header`
```curl
POST /items?email={email}
```
Response
```json
[
  {
    "name": "Margherita",
    "price": "38"
  },
  {
    "name": "Pepperoni",
    "price": "39"
  },
  {
    "name": "BBQ Chicken",
    "price": "39"
  }
]
```

### CARTS
A user can add items to a cart.
Requires `token` to be passed in `header`

**Create new cart**
```curl
POST /carts
```
Payload
```json
{
  "items": [
   {
     "name": "Margherita",
     "price": 38,
     "quantity": 1
   },
   {
     "name": "Pepperoni",
     "price": 39,
     "quantity": 1
   }
 ]
}
```
Response
```json
{
  "id": "xlccpbla3e3zdogcjhzf",
  "total": 77,
  "email": "john@gmail.com",
  "items": [
    {
      "name": "Margherita",
      "price": 38,
      "quantity": 1
    },
    {
      "name": "Pepperoni",
      "price": 39,
      "quantity": 1
    }
  ]
}
```

**Update cart**
```curl
PUT /carts
```
Payload
```json
{
  "id": "xlccpbla3e3zdogcjhzf",
  "items": [
   {
     "name": "Margherita",
     "price": 38,
     "quantity": 2
   },
   {
     "name": "Pepperoni",
     "price": 39,
     "quantity": 2
   }
 ]
}
```
Response
```json
{
  "id": "xlccpbla3e3zdogcjhzf",
  "total": 154,
  "email": "mane@gmail.com",
  "items": [
    {
      "name": "Margherita",
      "price": 38,
      "quantity": 2
    },
    {
      "name": "Pepperoni",
      "price": 39,
      "quantity": 2
    }
  ]
}
```

**Get cart**
```curl
GET /carts?id={id}
```

Response
```json
{
  "id": "xlccpbla3e3zdogcjhzf",
  "total": 154,
  "email": "mane@gmail.com",
  "items": [
    {
      "name": "Margherita",
      "price": 38,
      "quantity": 2
    },
    {
      "name": "Pepperoni",
      "price": 39,
      "quantity": 2
    }
  ]
}
```

### ORDERS
Users can create orders. 
Requires `token` to be passed in `header`

**Create new order**
```curl
POST /orders
```
Payload
```json
{
	"cartId": "xlccpbla3e3zdogcjhzf",
  "cardName": "JOHN DOE",
  "cardNumber": "4242424242424242",
  "cardExpirationMonth": "12",
  "cardExpirationYear": "2022",
  "cardCvc": "567"
}
```
Response
```json
{}
```
