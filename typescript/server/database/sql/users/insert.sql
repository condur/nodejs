INSERT INTO users(user_name, password)
VALUES(${username}, ${password})
RETURNING user_name
