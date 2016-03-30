CREATE EXTENSION CHKPASS;

CREATE TABLE USERS (
	userID SERIAL NOT NULL PRIMARY KEY,
	firstName VARCHAR(40) NOT NULL,
	lastName VARCHAR(40) NOT NULL,
	lastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION createuser(
	firstName VARCHAR, lastName VARCHAR
) RETURNS void AS $$
  BEGIN
    INSERT INTO USERS (firstname, lastName)
    VALUES ($1, $2);
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION createuser_v3(
	firstName VARCHAR, lastName VARCHAR
) RETURNS users AS
	$BODY$DECLARE
		_user users;
  	BEGIN
    	INSERT INTO USERS (firstname, lastName)
    	VALUES ($1, $2) RETURNING * INTO _user;
    	RETURN _user;
	END;
$BODY$ LANGUAGE plpgsql;


CREATE TABLE Logins (
	loginID SERIAL NOT NULL PRIMARY KEY,
	userID INT REFERENCES USERS(userID),
	userName VARCHAR(20) UNIQUE NOT NULL,
	password CHKPASS NOT NULL,
	validated BOOLEAN DEFAULT FALSE
);


CREATE FUNCTION userLogin(uname TEXT, pass TEXT)
RETURNS USERS AS
$BODY$DECLARE passed BOOLEAN; userID int; _user users;
BEGIN
        SELECT  (password = $2) INTO passed
        FROM   	logins, users
        WHERE   userName = $1;
        IF (passed = true) THEN
			SELECT * FROM users, logins WHERE users.userID = logins.userID and logins.username = $1 INTO _user;
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