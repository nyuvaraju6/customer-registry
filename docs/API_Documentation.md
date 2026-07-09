# API Documentation

## Overview

The Customer Registry Portal provides RESTful APIs for user authentication, customer management, complaints, and dashboard analytics.

---

## Base URL

```
http://localhost:5000/api
```

---

# Authentication APIs

## Register User

**POST**

```
/auth/register
```

### Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "message": "User Registered Successfully"
}
```

---

## Login

**POST**

```
/auth/login
```

### Request

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "token": "JWT_TOKEN"
}
```

---

# Customer APIs

## Get All Customers

GET

```
/customers
```

---

## Add Customer

POST

```
/customers
```

---

## Update Customer

PUT

```
/customers/:id
```

---

## Delete Customer

DELETE

```
/customers/:id
```

---

# Complaint APIs

## Get Complaints

GET

```
/complaints
```

---

## Add Complaint

POST

```
/complaints
```

---

## Dashboard

GET

```
/dashboard
```

Returns customer statistics and complaint analytics.