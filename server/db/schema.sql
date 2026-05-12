/*
  Whisk-It — run in SQL Server Management Studio against WhiskitDB
  Instance: DESKTOP-0P2GD71\MSSQLSERVER01 (set DB_SERVER / DB_INSTANCE in server/.env)
*/
SET NOCOUNT ON;
GO

IF DB_NAME() IS NULL OR DB_NAME() = N'master'
BEGIN
  RAISERROR(N'Select database WhiskitDB (or create it) before running this script.', 16, 1);
  RETURN;
END
GO

IF OBJECT_ID(N'dbo.OrderItems', N'U') IS NOT NULL DROP TABLE dbo.OrderItems;
IF OBJECT_ID(N'dbo.Orders', N'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID(N'dbo.Items', N'U') IS NOT NULL DROP TABLE dbo.Items;
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  username NVARCHAR(100) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  role NVARCHAR(50) NOT NULL,
  is_admin BIT NOT NULL CONSTRAINT DF_Users_is_admin DEFAULT 0
);

CREATE TABLE dbo.Items (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  name NVARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category NVARCHAR(100) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  active BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.Orders (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  total_amount DECIMAL(10,2) NOT NULL,
  status NVARCHAR(50) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.OrderItems (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES dbo.Orders(id),
  item_id INT NOT NULL REFERENCES dbo.Items(id),
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
GO

/* Default passwords: admin / admin123  |  kitchen / kitchen123 */
INSERT INTO dbo.Users (username, password_hash, role, is_admin) VALUES
(N'admin', N'$2b$10$DVyu6hj.KWIDxeoZE.6wmeVa/jt.bar31kLpT2SxZQ/YO/ujFEPYS', N'admin', 1),
(N'kitchen', N'$2b$10$IHnzXXPdYAivUXjdcWCfGeTKJu9563Sed3VYUfsi.X2A4CYPUKXA2', N'staff', 0);

INSERT INTO dbo.Items (name, price, category, stock_quantity, active) VALUES
(N'Sourdough Loaf', 42.00, N'Breads', 20, 1),
(N'Ciabatta', 38.00, N'Breads', 15, 1),
(N'Butter Croissant', 28.00, N'Pastries', 30, 1),
(N'Pain au Chocolat', 32.00, N'Pastries', 25, 1),
(N'Almond Danish', 35.00, N'Pastries', 18, 1),
(N'Americano', 22.00, N'Coffee', 100, 1),
(N'Cappuccino', 32.00, N'Coffee', 100, 1),
(N'Flat White', 34.00, N'Coffee', 100, 1);
GO

PRINT N'Whisk-It schema and seed data applied.';
GO
