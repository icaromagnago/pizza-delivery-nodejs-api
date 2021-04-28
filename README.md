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
Result
```
{}
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
Result
```
{}
```
**Get user**
```curl
GET /users?email=john@gmail.com
```
Result
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "address": "Av. Street, 34"
}
```
**Delete user**
```curl
DELETE /users?email=john@gmail.com
```

