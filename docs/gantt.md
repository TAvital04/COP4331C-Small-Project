# ContactSphere Gantt Chart

Built from the GitHub commit history (Sep 16–27, 2026).

```mermaid
gantt
    title ContactSphere Development Timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Tal
    Repo init / structure           :done, 2026-09-16, 1d
    init.sql, db.php, merge         :done, 2026-09-23, 1d
    Local PHP verify                :done, 2026-09-25, 1d
    Portal, README, deploy          :done, 2026-09-27, 1d

    section Michael
    Schema + ERD                    :done, 2026-09-16, 1d
    Use cases + Login.php           :done, 2026-09-23, 1d
    SearchContacts.php              :done, 2026-09-25, 1d
    Activity / sequence diagrams    :done, 2026-09-26, 1d

    section Andres
    Auth JS tabs / cookies / AJAX   :done, 2026-09-24, 1d
    Toast sanitize + mobile CSS     :done, 2026-09-27, 1d

    section An
    Register.php + Swagger          :done, 2026-09-23, 1d
    Add / Edit / Delete API         :done, 2026-09-25, 1d
    Live search + CRUD JS           :done, 2026-09-27, 1d

    section Torricelli
    index.html + styles.css         :done, 2026-09-24, 1d
    Contact cards / modals CSS      :done, 2026-09-27, 1d
