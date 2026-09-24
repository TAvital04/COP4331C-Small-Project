# Localhost tests

# Register
curl -i -X POST http://localhost:8000/LAMPAPI/Register.php \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","login":"jdoe","password":"johndoe123"}'

# Login
curl -i -X POST http://localhost:8000/LAMPAPI/Login.php \
  -H "Content-Type: application/json" \
  -d '{"login":"jdoe","password":"johndoe123"}'


# Remote deployment tests

# Register
curl -i -X POST https://YOUR_DOMAIN/LAMPAPI/Register.php \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","login":"jdoe","password":"johndoe123"}'

# Login
curl -i -X POST https://YOUR_DOMAIN/LAMPAPI/Login.php \
  -H "Content-Type: application/json" \
  -d '{"login":"jdoe","password":"johndoe123"}'