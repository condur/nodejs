-- Roles
-- All roles creation are done in '00-create-roles' script

-- ----------------------------------------------------------------------------------
-- Users Database
-- ----------------------------------------------------------------------------------

-- Add the 'uuid-ossp' module that implement standard algorithms for generating UUIDs.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables
CREATE TABLE IF NOT EXISTS users (
  user_id UUID DEFAULT uuid_generate_v1mc(),
  user_name VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS index_user_name ON users( user_name );

-- Table Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO nodejs_app;
