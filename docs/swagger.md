openapi: 3.0.0

info:
  title: ContactSphere API
  version: 1.0.0

paths:
  /LAMPAPI/Register.php:
    post:
      summary: Register a new user

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
                  example: John
                lastName:
                  type: string
                  example: Doe
                login:
                  type: string
                  example: jdoe
                password:
                  type: string
                  example: johndoe123

      responses:
        '200':
          description: Registration result
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 5
                  error:
                    type: string
                    example: ""

  /LAMPAPI/Login.php:
    post:
      summary: Log in an existing user

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
                  example: jdoe
                password:
                  type: string
                  example: johndoe123

      responses:
        '200':
          description: Login result
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 5
                  firstName:
                    type: string
                    example: John
                  lastName:
                    type: string
                    example: Doe
                  error:
                    type: string
                    example: ""