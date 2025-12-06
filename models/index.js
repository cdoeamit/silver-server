const { sequelize } = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Customer = require('./Customer');
const SilverRate = require('./SilverRate');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Transaction = require('./Transaction');

// Regular Billing Models
const RegularCustomer = require('./RegularCustomer');
const RegularSale = require('./RegularSale');
const RegularSaleItem = require('./RegularSaleItem');
const RegularTransaction = require('./RegularTransaction');

// Category <-> Product
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products'
});
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

// Wholesale System Relationships
Customer.hasMany(Sale, {
  foreignKey: 'customerId',
  as: 'sales'
});
Sale.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});
Sale.hasMany(SaleItem, {
  foreignKey: 'saleId',
  as: 'items',
  onDelete: 'CASCADE'
});
SaleItem.belongsTo(Sale, {
  foreignKey: 'saleId',
  as: 'sale'
});
Product.hasMany(SaleItem, {
  foreignKey: 'productId',
  as: 'saleItems'
});
SaleItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});
Customer.hasMany(Transaction, {
  foreignKey: 'customerId',
  as: 'transactions'
});
Transaction.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});
Sale.hasMany(Transaction, {
  foreignKey: 'saleId',
  as: 'transactions'
});
Transaction.belongsTo(Sale, {
  foreignKey: 'saleId',
  as: 'sale'
});
User.hasMany(Sale, {
  foreignKey: 'createdBy',
  as: 'salesCreated'
});
Sale.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});
User.hasMany(Transaction, {
  foreignKey: 'createdBy',
  as: 'transactionsCreated'
});
Transaction.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// === REGULAR BILLING SYSTEM (WITH CUSTOMER) ==== //
RegularCustomer.hasMany(RegularSale, { foreignKey: 'regularCustomerId', as: 'sales' });
RegularSale.belongsTo(RegularCustomer, { foreignKey: 'regularCustomerId', as: 'customer' });

RegularSale.hasMany(RegularSaleItem, {
  foreignKey: 'regularSaleId',
  as: 'items',
  onDelete: 'CASCADE'
});
RegularSaleItem.belongsTo(RegularSale, {
  foreignKey: 'regularSaleId',
  as: 'sale'
});
Product.hasMany(RegularSaleItem, {
  foreignKey: 'productId',
  as: 'regularSaleItems'
});
RegularSaleItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});
RegularSale.hasMany(RegularTransaction, {
  foreignKey: 'regularSaleId',
  as: 'transactions'
});
RegularTransaction.belongsTo(RegularSale, {
  foreignKey: 'regularSaleId',
  as: 'sale'
});

// You may leave other associations for RegularTransaction as before if they exist

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Customer,
  SilverRate,
  Sale,
  SaleItem,
  Transaction,

  // Regular billing
  RegularCustomer,
  RegularSale,
  RegularSaleItem,
  RegularTransaction
};
