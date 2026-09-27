# Small Project (ContactSphere) - Developer & Contributor Guide (`README_DEV.md`)

This guide provides complete step-by-step instructions for team members working on the **Small Project Personal Contact Manager** (`small-project`). It details team onboarding, local MySQL database setup, connecting to the DigitalOcean server via SSH (`ssh root@talavital.com`), deployment, API endpoint verification, and testing.

---

## 📋 Table of Contents

1. [Step 1: Team Access & GitHub Invites](#step-1-team-access--github-invites)
2. [Step 2: Terminal Setup & Repository Cloning](#step-2-terminal-setup--repository-cloning)
3. [Step 3: Environment Credentials Setup (`.env`)](#step-3-environment-credentials-setup-env)
4. [Step 4: Local MySQL Database Initialization](#step-4-local-mysql-database-initialization)
5. [Step 5: Remote Server SSH Access & Deployment (`ssh root@talavital.com`)](#step-5-remote-server-ssh-access--deployment-ssh-roottalavitalcom)
6. [Step 6: Local & Live Testing & Verification](#step-6-local--live-testing--verification)
7. [Step 7: Role Responsibilities & Workflows](#step-7-role-responsibilities--workflows)
8. [Step 8: Git Branching & Pull Requests](#step-8-git-branching--pull-requests)

---

## Step 1: Team Access & GitHub Invites

1. Send your **GitHub username** to your Project Manager.
2. Accept the repository invitation at [github.com/notifications](https://github.com/notifications).
3. Configure your local Git identity:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

---

## Step 2: Terminal Setup & Repository Cloning

1. Open your terminal:
   - **Windows**: Open **PowerShell** or **Git Bash**.
   - **Mac**: Open **Terminal**.
2. Clone the repository:
   ```bash
   cd ~/Documents
   git clone <REPOSITORY_URL>
   cd "LAMP Stack"
   ```

---

## Step 3: Environment Credentials Setup (`.env`)

Create your local `.env` configuration file in the project root:
- **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```
- **Mac/Linux**:
  ```bash
  cp .env.example .env
  ```

Ensure `.env` matches your local database settings:
```env
DB_HOST=localhost
DB_USER=TheBeast
DB_PASSWORD=WeLoveCOP4331
DB_NAME=COP4331
```

---

## Step 4: Local MySQL Database Initialization

### A. Start MySQL Service
- **Windows (XAMPP)**: Start Apache and MySQL from XAMPP Control Panel.
- **Mac/Linux**: Run `sudo service mysql start` or `brew services start mysql`.

### B. Execute Database Setup Script
Log into MySQL terminal shell:
```bash
mysql -u root -p
```

Inside the MySQL prompt (`mysql>`), copy and run:

```sql
-- 1. Create Database
CREATE DATABASE IF NOT EXISTS COP4331;
USE COP4331;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS Users (
  ID INT NOT NULL AUTO_INCREMENT,
  FirstName VARCHAR(50) NOT NULL DEFAULT '',
  LastName VARCHAR(50) NOT NULL DEFAULT '',
  Login VARCHAR(50) NOT NULL DEFAULT '',
  Password VARCHAR(50) NOT NULL DEFAULT '',
  PRIMARY KEY (ID)
) ENGINE = InnoDB;

-- 3. Create Contacts Table
CREATE TABLE IF NOT EXISTS Contacts (
  ID INT NOT NULL AUTO_INCREMENT,
  FirstName VARCHAR(50) NOT NULL DEFAULT '',
  LastName VARCHAR(50) NOT NULL DEFAULT '',
  Phone VARCHAR(50) NOT NULL DEFAULT '',
  Email VARCHAR(50) NOT NULL DEFAULT '',
  UserID INT NOT NULL DEFAULT '0',
  PRIMARY KEY (ID)
) ENGINE = InnoDB;

-- 4. Create User & Grant Privileges
CREATE USER IF NOT EXISTS 'TheBeast'@'localhost' IDENTIFIED BY 'WeLoveCOP4331';
GRANT ALL PRIVILEGES ON COP4331.* TO 'TheBeast'@'localhost';
FLUSH PRIVILEGES;

-- 5. Seed Test Data
INSERT INTO Users (FirstName, LastName, Login, Password) VALUES ('Alex', 'Smith', 'alexsmith', 'pass123');
INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) 
VALUES ('John', 'Doe', '555-123-4567', 'john@example.com', 1),
       ('Sarah', 'Conner', '555-987-6543', 'sarah@example.com', 1);

EXIT;
```

---

## Step 5: Remote Server SSH Access & Deployment (`ssh root@talavital.com`)

WARNING: This is a **PRODUCTION SERVER**. Do not make any changes to the files on this server that are not tested and approved by the team. If you want to test changes, proceed to Step 6.

To access the live DigitalOcean droplet and deploy your changes to `talavital.com`:

### 1. SSH into the Live Remote Server
Open your terminal (PowerShell, Git Bash, or macOS Terminal) and connect:
```bash
ssh root@talavital.com
```
*(Or use `ssh root@YOUR_SERVER_IP` if testing via direct IP address).*

### 2. Navigate to Apache Web Root Directory
Once logged into the server shell prompt (`root@ubuntu:~#`), go to Apache's root web folder:
```bash
cd /var/www/html
```

### 3. Pull Latest Code Updates from GitHub
Pull the latest pushed commits from the `main` branch:
```bash
git pull origin main
```

### 5. Restart Apache Service (Optional)
If PHP configuration changes were made:
```bash
sudo systemctl restart apache2
```

---

## Step 6: Local & Live Testing & Verification

### A. Start Local Web Server (PHP Built-In Server)
Open terminal inside the `LAMP Stack` repository folder and run:
```bash
php -S localhost:8000
```
Keep this terminal window open while testing.

---

### B. Front-End Testing
1. Access the application in your browser:
   - **Local Browser**: `http://localhost:8000/COP4331C/small-project/index.html`
   - **Live Domain**: `https://talavital.com/COP4331C/small-project/index.html`
2. Test User Workflows:
   - **Registration**: Switch tab to **Register**, create a new account, verify redirect to Sign In.
   - **Login**: Log in with `alexsmith` / `pass123`. Verify session cookie creation and transition to Contact Dashboard.
   - **Live Search**: Type `Sarah` in the search bar. Verify server-side filtering results.
   - **Contact Management**: Click **Add New Contact**, populate modal, save, edit details, and test deletion.

### B. API Endpoint Verification (cURL Examples)
Test API responses in your shell terminal:

```bash
# 1. Test Local Login Endpoint
curl -X POST http://localhost/COP4331C/small-project/LAMPAPI/Login.php \
  -H "Content-Type: application/json" \
  -d "{\"login\":\"alexsmith\",\"password\":\"pass123\"}"

# 2. Test Live Server Login Endpoint
curl -X POST https://talavital.com/COP4331C/small-project/LAMPAPI/Login.php \
  -H "Content-Type: application/json" \
  -d "{\"login\":\"alexsmith\",\"password\":\"pass123\"}"
```

---

## Step 7: Role Responsibilities & Workflows

Per the course progress guide:
1. **Database Role**: Ensures table structures (`Users`, `Contacts`) are implemented cleanly with primary keys and indexed relationships.
2. **API Backend Role**: Maintains PHP endpoints in `LAMPAPI/` (`Register`, `Login`, `AddContact`, `SearchContacts`, `EditContact`, `DeleteContact`), ensuring strict JSON input/output format and SQL injection prevention via prepared statements.
3. **Front-End Role**: Enhances UI/UX in `index.html`, `css/styles.css`, and `js/code.js`, maintaining smooth AJAX communications, modals, and error toasts.
4. **Project Manager**: Coordinates integration, monitors git pull requests, and maintains project documentation.

---

## Step 8: Git Branching & Pull Requests

Follow this git workflow for all feature developments and bug fixes:

1. **Update main branch**:
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create feature branch**:
   ```bash
   git checkout -b feature/add-contact-validation
   ```
3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat(small-project): added phone number format validation"
   ```
4. **Push branch to GitHub**:
   ```bash
   git push -u origin feature/add-contact-validation
   ```
5. **Submit Pull Request**: Open PR on GitHub, assign a teammate for code review, and merge after approval!
