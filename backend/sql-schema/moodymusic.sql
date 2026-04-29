CREATE schema moodymusic;

USE moodymusic;


CREATE TABLE users(
	uid INT AUTO_INCREMENT,
    name VARCHAR(30),
    email VARCHAR(20),
    password VARCHAR(30),
    PRIMARY KEY (uid)
);

CREATE TABLE songs(
	sid INT AUTO_INCREMENT,
    song_name VARCHAR(25),
    emotion VARCHAR(20),
    file_path VARCHAR(35),
    PRIMARY KEY (sid)
);

CREATE TABLE upload(
	uid INT,
    sid INT,
    PRIMARY KEY (uid,sid),
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (sid) REFERENCES songs(sid) ON DELETE CASCADE
);