openapi: 3.0.0
info:
  title: ContactSphere API
  description: Complete OpenAPI 3.0.0 specification for ContactSphere Personal Contact Directory backend REST services built with PHP and MySQL.
  version: 1.0.0
servers:
  - url: https://talavital.com/small-project
    description: Production DigitalOcean Droplet Server
  - url: http://localhost:8000
    description: Local PHP Built-in Server
  - url: http://localhost/small-project
    description: Local Apache LAMP Server

paths:
  /LAMPAPI/Register.php:
    post:
      summary: Register a new user
      description: Creates a new user record in the Users database table. Requires unique username (`login`), password, first name, and last name.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - firstName
                - lastName
                - login
                - password
              properties:
                firstName:
                  type: string
                  example: Jane
                  description: User's first name
                lastName:
                  type: string
                  example: Doe
                  description: User's last name
                login:
                  type: string
                  example: janedoe
                  description: Unique account username
                password:
                  type: string
                  example: SecurePassword123!
                  description: Account password
      responses:
        '200':
          description: Registration result response payload
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 42
                    description: Newly created user ID, or -1 on error
                  error:
                    type: string
                    example: ""
                    description: Error message string if registration fails, or empty string on success
              examples:
                Success:
                  summary: Successful user registration
                  value:
                    id: 42
                    error: ""
                DuplicateUsername:
                  summary: Username already taken
                  value:
                    id: -1
                    error: "Username already taken"
                MissingFields:
                  summary: Required fields missing
                  value:
                    id: -1
                    error: "Login and password are required"
        '500':
          description: Database connection failure or server execution error
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: -1
                  error:
                    type: string
                    example: "Database error"

  /LAMPAPI/Login.php:
    post:
      summary: Log in an existing user
      description: Authenticates user credentials against the Users database table and returns account details upon success.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - login
                - password
              properties:
                login:
                  type: string
                  example: janedoe
                  description: Account username
                password:
                  type: string
                  example: SecurePassword123!
                  description: Account password
      responses:
        '200':
          description: Authentication result payload
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 42
                    description: Authenticated user ID (0 if authentication failed)
                  firstName:
                    type: string
                    example: Jane
                    description: User's first name
                  lastName:
                    type: string
                    example: Doe
                    description: User's last name
                  error:
                    type: string
                    example: ""
                    description: Error message string if login fails, or empty string on success
              examples:
                Success:
                  summary: Successful login
                  value:
                    id: 42
                    firstName: "Jane"
                    lastName: "Doe"
                    error: ""
                InvalidCredentials:
                  summary: Invalid username or password
                  value:
                    id: 0
                    firstName: ""
                    lastName: ""
                    error: "No Records Found"

  /LAMPAPI/AddContact.php:
    post:
      summary: Add a new contact
      description: Inserts a new contact record into the Contacts table linked to the specified user ID.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - userId
              properties:
                userId:
                  type: integer
                  example: 42
                  description: ID of the owning user
                firstName:
                  type: string
                  example: John
                  description: Contact's first name
                lastName:
                  type: string
                  example: Smith
                  description: Contact's last name
                phone:
                  type: string
                  example: "555-123-4567"
                  description: Contact's phone number
                email:
                  type: string
                  example: "john.smith@example.com"
                  description: Contact's email address
      responses:
        '200':
          description: Add contact response payload
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: ""
                    description: Error message string or empty string on success
              examples:
                Success:
                  summary: Contact added successfully
                  value:
                    error: ""
                InvalidUserId:
                  summary: Invalid user ID provided
                  value:
                    error: "Invalid user ID"
                MissingName:
                  summary: Neither first nor last name provided
                  value:
                    error: "First name or last name is required"
        '500':
          description: Database connection error or SQL exception
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "Database error"

  /LAMPAPI/SearchContacts.php:
    post:
      summary: Search contacts for a user
      description: Performs a case-insensitive substring search across FirstName, LastName, Phone, and Email fields for contacts owned by userId.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - userId
              properties:
                userId:
                  type: integer
                  example: 42
                  description: ID of the owning user
                search:
                  type: string
                  example: John
                  description: Search query substring
      responses:
        '200':
          description: Search results payload containing array of matching contacts
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/Contact'
                  error:
                    type: string
                    example: ""
              examples:
                SearchResultsFound:
                  summary: Matching contacts found
                  value:
                    results:
                      - ID: 15
                        FirstName: "John"
                        LastName: "Smith"
                        Phone: "555-123-4567"
                        Email: "john.smith@example.com"
                    error: ""
                NoResultsFound:
                  summary: No matching contacts found
                  value:
                    results: []
                    error: ""
                InvalidUserId:
                  summary: Invalid user ID provided
                  value:
                    results: []
                    error: "Invalid user ID"

  /LAMPAPI/EditContact.php:
    post:
      summary: Update an existing contact
      description: Updates the contact details for a contact ID owned by userId.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - contactId
                - userId
              properties:
                contactId:
                  type: integer
                  example: 15
                  description: Primary key ID of the target contact
                userId:
                  type: integer
                  example: 42
                  description: ID of the owning user
                firstName:
                  type: string
                  example: John
                  description: Updated first name
                lastName:
                  type: string
                  example: Smith
                  description: Updated last name
                phone:
                  type: string
                  example: "555-999-0000"
                  description: Updated phone number
                email:
                  type: string
                  example: "john.updated@example.com"
                  description: Updated email address
      responses:
        '200':
          description: Edit contact response payload
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: ""
              examples:
                Success:
                  summary: Contact updated successfully
                  value:
                    error: ""
                InvalidParameters:
                  summary: Missing or invalid contactId or userId
                  value:
                    error: "Invalid contact ID or user ID"
        '500':
          description: Database error
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "Database error"

  /LAMPAPI/DeleteContact.php:
    post:
      summary: Delete a contact record
      description: Removes a contact record with ID contactId belonging to user userId.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - contactId
                - userId
              properties:
                contactId:
                  type: integer
                  example: 15
                  description: ID of the contact to delete
                userId:
                  type: integer
                  example: 42
                  description: ID of the owning user
      responses:
        '200':
          description: Delete contact response payload
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: ""
              examples:
                Success:
                  summary: Contact deleted successfully
                  value:
                    error: ""
        '500':
          description: Database connection error or SQL exception
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "Database error"

components:
  schemas:
    Contact:
      type: object
      properties:
        ID:
          type: integer
          example: 15
          description: Primary key contact ID
        FirstName:
          type: string
          example: John
          description: Contact's first name
        LastName:
          type: string
          example: Smith
          description: Contact's last name
        Phone:
          type: string
          example: "555-123-4567"
          description: Contact's phone number
        Email:
          type: string
          example: "john.smith@example.com"
          description: Contact's email address