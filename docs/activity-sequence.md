# ContactSphere Workflow Diagrams

## Activity Diagram

Start → Login or Register → Dashboard → Search, Add, Edit, or Delete → Logout → End

```mermaid
flowchart TD
    Start([Start]) --> Auth{Logged in?}
    Auth -->|No| LoginReg[Login or Register]
    LoginReg --> Dashboard
    Auth -->|Yes| Dashboard[Dashboard]
    Dashboard --> Choice{Choose action}
    Choice --> Search[Search contacts]
    Choice --> Add[Add contact]
    Choice --> Edit[Edit contact]
    Choice --> Delete[Delete contact]
    Search --> Dashboard
    Add --> Dashboard
    Edit --> Dashboard
    Delete --> Dashboard
    Dashboard --> Logout[Logout]
    Logout --> End([End])
