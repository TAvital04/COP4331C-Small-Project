# ContactSphere schema

```mermaid
erDiagram
    USERS ||--o{ CONTACTS : has
    USERS {
        int ID PK
        varchar FirstName
        varchar LastName
        varchar Login
        varchar Password
    }
    CONTACTS {
        int ID PK
        varchar FirstName
        varchar LastName
        varchar Phone
        varchar Email
        int UserID FK
    }
