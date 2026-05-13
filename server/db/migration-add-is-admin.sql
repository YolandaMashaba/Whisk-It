/*
  Add is_admin to existing WhiskitDB (run once in SSMS with WhiskitDB selected).
  Does not drop tables.
*/
IF COL_LENGTH(N'dbo.Users', N'is_admin') IS NULL
BEGIN
  ALTER TABLE dbo.Users ADD is_admin BIT NOT NULL CONSTRAINT DF_Users_is_admin DEFAULT 0;
END
GO

UPDATE dbo.Users SET is_admin = 1 WHERE role = N'admin';
GO

PRINT N'Users.is_admin migration applied.';
GO
