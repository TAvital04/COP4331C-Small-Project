# ContactSphere — Developer & Operations Setup Guide (Milestone 7)

Welcome to the **ContactSphere** developer guide and production operations manual. This document details server provisioning, local environment setup, CI/CD deployment routines, accessibility compliance auditing, and end-to-end acceptance testing procedures.

---

## 1. Server Provisioning & LAMP Stack Configuration (Tal)

### 1.1 Ubuntu Droplet Setup
* **Operating System**: Ubuntu 22.04 LTS / 24.04 LTS
* **Web Server**: Apache 2.4 (`apache2`)
* **Database**: MySQL Server 8.0 (`mysql-server`)
* **PHP Engine**: PHP 8.1+ (`php`, `libapache2-mod-php`, `php-mysql`)

#### Package Installation
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install apache2 php libapache2-mod-php php-mysql mysql-server git -y
```

### 1.2 Apache VirtualHost Configuration
Create `/etc/apache2/sites-available/small-project.conf`:
```apache
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot /var/www/COP4331C-Small-Project

    <Directory /var/www/COP4331C-Small-Project>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/contactsphere_error.log
    CustomLog ${APACHE_LOG_DIR}/contactsphere_access.log combined
</VirtualHost>
```

Enable site and URL rewrite module:
```bash
sudo a2ensite small-project.conf
sudo a2enmod rewrite
sudo systemctl restart apache2
```

Set file ownership and permissions for the Apache web user (`www-data`):
```bash
sudo chown -R www-data:www-data /var/www/COP4331C-Small-Project
sudo chmod -R 755 /var/www/COP4331C-Small-Project
```

### 1.3 Secure Remote Database Configuration
1. Run MySQL security hardening:
   ```bash
   sudo mysql_secure_installation
   ```
2. Create database and user restricted to local socket connections (`localhost` / `127.0.0.1`):
   ```sql
   CREATE DATABASE COP4331 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'TheBeast'@'localhost' IDENTIFIED BY 'WeLoveCOP4331';
   GRANT ALL PRIVILEGES ON COP4331.* TO 'TheBeast'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Enforce local socket binding in `/etc/mysql/mysql.conf.d/mysqld.cnf`:
   ```ini
   [mysqld]
   bind-address = 127.0.0.1
   mysqlx-bind-address = 127.0.0.1
   ```
   Restart MySQL:
   ```bash
   sudo systemctl restart mysql
   ```

---

## 2. Developer Setup Guide (Tal)

### 2.1 Repository Cloning & Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/TAvital04/COP4331C-Small-Project.git
   cd COP4331C-Small-Project
   ```
2. Copy environment file template:
   ```bash
   cp .env.example .env
   cp .env.example LAMPAPI/.env
   ```
3. Edit `.env` credentials:
   ```env
   DB_HOST=localhost
   DB_USER=TheBeast
   DB_PASSWORD=WeLoveCOP4331
   DB_NAME=COP4331
   DB_PORT=3306
   ```

### 2.2 Database Schema Migration
Import `init.sql` to initialize `Users` and `Contacts` relational schema:
```bash
mysql -u TheBeast -p COP4331 < init.sql
```

---

## 3. Development Workflow & Git Branching Standards (Tal)

### 3.1 Git Branching Strategy
* **`main`**: Production release branch. All commits must pass code review and E2E verification.
* **`feature/<feature-name>`**: Feature branches (e.g., `feature/contact-search`).
* **`fix/<bug-name>`**: Bug fix branches (e.g., `fix/cors-preflight`).

### 3.2 Commit Conventions & Pull Requests
* **Commit Message Format**:
  * `feat: ...` for new features
  * `fix: ...` for bug fixes
  * `docs: ...` for documentation updates
  * `chore: ...` for maintenance and configuration
* All Pull Requests require at least 1 peer approval before merging.

---

## 4. Live Server Deployment Operations (Tal)

### 4.1 Automated SSH Deployment Routine
```bash
# 1. Connect to production droplet
ssh user@your-droplet-ip

# 2. Navigate to project root
cd /var/www/COP4331C-Small-Project

# 3. Pull latest main release
git pull origin main

# 4. Verify web directory permissions
sudo chown -R www-data:www-data /var/www/COP4331C-Small-Project

# 5. Reload web server
sudo systemctl reload apache2
```

---

## 5. Accessibility & Performance Auditing (Andres)

### 5.1 Lighthouse Audit Results
* **Performance Score**: `100%`
* **Accessibility Score**: `100%`
* **Best Practices**: `100%`
* **SEO**: `100%`

### 5.2 Accessibility Enhancements Applied
1. **WCAG Color Contrast**: Contrast ratio between body text (`#f8fafc`), muted text (`#94a3b8`), and background (`#090d16` / `#131b2e`) exceeds `4.5:1` (AA level compliance).
2. **Semantic Landmarks**: Document uses HTML5 structural landmarks (`<header>`, `<main>`, `<form>`, `<section>`).
3. **Interactive Control Labels**:
   * Icon-only buttons feature explicit `aria-label` attributes (`aria-label="Clear Search"`, `aria-label="Sign Out"`, `aria-label="Close modal"`).
   * Dynamically generated contact card buttons include contextual ARIA labels (`aria-label="Edit contact Jane Doe"`).
   * Search input element contains `aria-label="Search contacts by name, phone, or email"`.
4. **Modal Dialog Accessibility**: Modals implement `role="dialog"` / `role="alertdialog"`, `aria-modal="true"`, and `aria-labelledby="modalTitle"`.

---

## 6. End-to-End System Verification Checklist (Tal)

| # | E2E Acceptance Test Step | Expected Behavior | Status |
|---|--------------------------|-------------------|--------|
| **1** | **User Registration** | `LAMPAPI/Register.php` inserts user into `Users` table; returns new `id`; switches tab to Sign In. | **PASSED** |
| **2** | **Authentication Loop** | `LAMPAPI/Login.php` validates credentials; saves `userId`, `firstName`, `lastName` cookies; renders dashboard. | **PASSED** |
| **3** | **Create Contacts** | `LAMPAPI/AddContact.php` inserts record into `Contacts` table linked to `UserID`; updates UI grid dynamically. | **PASSED** |
| **4** | **Debounced Search** | Search input triggers debounced (250ms) query to `LAMPAPI/SearchContacts.php`; displays exact matches. | **PASSED** |
| **5** | **Edit Contact Details** | Edit modal loads contact data; `LAMPAPI/EditContact.php` updates database record; UI refreshes without full reload. | **PASSED** |
| **6** | **Delete Contact** | Confirmation modal prompts user; `LAMPAPI/DeleteContact.php` removes database row; element removed from DOM. | **PASSED** |
| **7** | **Terminate Session** | Sign Out button invalidates cookies (`expires=Thu, 01 Jan 1970`); resets memory state; returns to login card. | **PASSED** |
