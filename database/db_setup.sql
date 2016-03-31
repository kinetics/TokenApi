CREATE EXTENSION CHKPASS;

CREATE TABLE USERS (
	user_id SERIAL NOT NULL PRIMARY KEY,
	first_name VARCHAR(40) NOT NULL,
	last_name VARCHAR(40) NOT NULL,
	last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION create_user(
	first_name VARCHAR, last_name VARCHAR
) RETURNS void AS $$
  BEGIN
    INSERT INTO USERS (first_name, last_name)
    VALUES ($1, $2);
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION createuser_v3(
	first_name VARCHAR, last_name VARCHAR
) RETURNS users AS
	$BODY$DECLARE
		_user users;
  	BEGIN
    	INSERT INTO USERS (first_name, last_name)
    	VALUES ($1, $2) RETURNING * INTO _user;
    	RETURN _user;
	END;
$BODY$ LANGUAGE plpgsql;


CREATE TABLE Logins (
	loginID SERIAL NOT NULL PRIMARY KEY,
	user_id INT REFERENCES USERS(user_id),
	user_name VARCHAR(20) UNIQUE NOT NULL,
	email VARCHAR(40) NOT NULL,
	password CHKPASS NOT NULL,
	validated BOOLEAN DEFAULT FALSE
);


CREATE OR REPLACE FUNCTION user_login(uname TEXT, pass TEXT)
RETURNS USERS AS
$BODY$DECLARE passed BOOLEAN; user_id int; _user users;
BEGIN
        SELECT  (password = $2) INTO passed
        FROM   	logins, users
        WHERE   user_name = $1;
        IF (passed = true) THEN
			SELECT * FROM users, logins WHERE users.user_id = logins.user_id and logins.user_name = $1 INTO _user;
			RETURN _user;
		ELSE
			passed = false;
			return passed;
		END IF;
END;
$BODY$  LANGUAGE plpgsql;

CREATE FUNCTION check_email(email varchar)
RETURNS BOOLEAN AS
$BODY$DECLARE exists BOOLEAN;
BEGIN
    SELECT (email = $1) into exists
    FROM logins;
    RETURN exists;
END;
$BODY$ LANGUAGE plpgsql;