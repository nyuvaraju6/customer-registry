# Database Design

## Database

MongoDB Atlas

---

# Collections

## Users

| Field | Type |
|------|------|
| _id | ObjectId |
| name | String |
| email | String |
| password | String |
| role | String |
| createdAt | Date |

---

## Customers

| Field | Type |
|------|------|
| _id | ObjectId |
| customerName | String |
| email | String |
| phone | String |
| address | String |
| status | String |
| createdAt | Date |

---

## Complaints

| Field | Type |
|------|------|
| _id | ObjectId |
| customerId | ObjectId |
| complaint | String |
| priority | String |
| status | String |
| createdAt | Date |

---

# Relationships

Users

↓

Customers

↓

Complaints