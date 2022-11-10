CREATE TABLE users(
	id VARCHAR(255)  PRIMARY KEY ,
	email VARCHAR NOT NULL,
	password VARCHAR NOT NULL,
	name VARCHAR NOT NULL,
	gender VARCHAR,
	phone VARCHAR,
	date_of_birth VARCHAR,
	photo VARCHAR,
    bio VARCHAR,	
	UNIQUE(email),
	created_on DATE,
	updated_on DATE);