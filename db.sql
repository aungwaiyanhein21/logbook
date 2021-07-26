/* Delete the tables if they already exist */
drop table if exists Flight;
drop table if exists IATACode;
drop table if exists Type;
drop table if exists Journey;
drop table if exists User;
drop table if exists FlightJourney;
drop table if exists UserFlight;


/* Create the schema for Flight tables */
create table Flight(
	id INT PRIMARY KEY,
	flight_date DATE,
	flight_type_id INT,
	markings TEXT,
	captain_rank VARCHAR(10),
	captain_name TEXT,
	holders_operating_capacity TEXT
);

create table IATACode(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title VARCHAR(10) UNIQUE
);

create table FlightType(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title VARCHAR(50) UNIQUE
);

create table Journey(
	id INT PRIMARY KEY,
	flight_from_id INT,
	flight_to_id INT,
	departure VARCHAR(10),
	arrival VARCHAR(10),
	day_in_charge VARCHAR(10),
	day_second VARCHAR(10),
	night_in_charge VARCHAR(10),
	night_second VARCHAR(10),
	remarks TEXT
);

create table User(
	id INT PRIMARY KEY,
	username TEXT UNIQUE,
	email TEXT UNIQUE,
	user_password TEXT
);

/* relationship tables: one-to-many */
create table FlightJourney(
	flight_id INT,
	journey_id INT
);

create table UserFlight(
	logbook_user_id INT,
	flight_id INT
);


/* populating sample data for flight type */
INSERT INTO FlightType(title) VALUES('ATR 72 600');
INSERT INTO FlightType(title) VALUES('ATR 72 500');
INSERT INTO FlightType(title) VALUES('ATR 42');

/* populating sample data for IATA code */
INSERT INTO IATACode(title) VALUES('HYD');
INSERT INTO IATACode(title) VALUES('DEL');