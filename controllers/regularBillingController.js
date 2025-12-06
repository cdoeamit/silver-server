const { RegularCustomer, RegularSale, RegularSaleItem, RegularTransaction, SilverRate, sequelize } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

// Get all regular customers
exports.getAllCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await RegularCustomer.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    // Get balance for each customer
    const customersWithBalance = await Promise.all(rows.map(async (customer) => {
      const transactions = await RegularTransaction.findAll({
        where: { regularCustomerId: customer.id },
        attributes: ['amount'],
        raw: true
      });
      
      const balance = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      return {
        ...customer.toJSON(),
        balance: balance.toFixed(2)
      };
    }));

    res.json({
      success: true,
      data: customersWithBalance,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }

    // Check for duplicate customer
    const whereClause = { name: name.trim() };
    if (phone && phone.trim()) {
      whereClause.phone = phone.trim();
    }

    const existingCustomer = await RegularCustomer.findOne({ where: whereClause });
    
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Customer with this name and phone already exists',
        data: existingCustomer
      });
    }

    // Create new customer
    const customer = await RegularCustomer.create({ 
      name: name.trim(), 
      phone: phone ? phone.trim() : null, 
      address: address ? address.trim() : null 
    });
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer.toJSON()
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};


// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { name, phone, address } = req.body;

    const customer = await RegularCustomer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.update({ name, phone, address });

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await RegularCustomer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.destroy();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

// Get customer ledger
exports.getCustomerLedger = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { startDate, endDate } = req.query;

    const customer = await RegularCustomer.findByPk(customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const whereClause = { regularCustomerId: customerId };
    if (startDate && endDate) {
      whereClause.transactionDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const transactions = await RegularTransaction.findAll({
      where: whereClause,
      include: [
        {
          model: RegularSale,
          as: 'sale',
          attributes: ['voucherNumber', 'saleDate', 'totalAmount']
        }
      ],
      order: [['transactionDate', 'ASC']]
    });

    const balance = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    res.json({
      success: true,
      data: {
        customer,
        balance: balance.toFixed(2),
        transactions
      }
    });
  } catch (error) {
    console.error('Get customer ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer ledger',
      error: error.message
    });
  }
};

// Create regular sale
exports.createRegularSale = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      regularCustomerId,
      items,
      silverRate,
      paidAmount = 0,
      paidSilver = 0,
      paymentMode = 'cash',
      notes
    } = req.body;

    // Validate customer
    const customer = await RegularCustomer.findByPk(regularCustomerId);
    if (!customer) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Generate voucher number
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const lastSale = await RegularSale.findOne({
      where: {
        voucherNumber: {
          [Op.like]: `REG${dateStr}%`
        }
      },
      order: [['voucherNumber', 'DESC']],
      transaction: t
    });

    let voucherNumber;
    if (lastSale) {
      const lastNum = parseInt(lastSale.voucherNumber.slice(-4));
      voucherNumber = `REG${dateStr}${String(lastNum + 1).padStart(4, '0')}`;
    } else {
      voucherNumber = `REG${dateStr}0001`;
    }

    // Calculate totals
    let totalNetWeight = 0;
    let totalWastage = 0;
    let totalSilverWeight = 0;
    let totalLaborCharges = 0;
    let subtotal = 0;

    const itemsData = items.map(item => {
      const grossWeight = parseFloat(item.grossWeight);
      const netWeight = parseFloat(item.netWeight);
      const wastage = parseFloat(item.wastage || 0);
      const touch = parseFloat(item.touch || 0);
      const laborRatePerKg = parseFloat(item.laborRatePerKg || 0);
      
      const silverWeight = ((touch + wastage) * netWeight) / 100;
      const laborCharges = (grossWeight / 1000) * laborRatePerKg;
      const itemAmount = (silverWeight * parseFloat(silverRate)) + laborCharges;

      totalNetWeight += netWeight;
      totalWastage += wastage;
      totalSilverWeight += silverWeight;
      totalLaborCharges += laborCharges;
      subtotal += itemAmount;

      return {
        ...item,
        grossWeight,
        netWeight,
        wastage,
        touch,
        silverWeight,
        laborRatePerKg,
        laborCharges,
        itemAmount
      };
    });

    const totalAmount = subtotal;
    const paidSilverValue = parseFloat(paidSilver) * parseFloat(silverRate);
    const effectivePaidAmount = parseFloat(paidAmount) + paidSilverValue;
    const balanceAmount = totalAmount - effectivePaidAmount;

    // Get previous balance
    const previousTransactions = await RegularTransaction.findAll({
      where: { regularCustomerId },
      attributes: ['amount'],
      raw: true,
      transaction: t
    });
    const previousBalance = previousTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const closingBalance = previousBalance + balanceAmount;

    // Create sale
    const sale = await RegularSale.create({
      voucherNumber,
      regularCustomerId,
      silverRate,
      totalNetWeight,
      totalWastage,
      totalSilverWeight,
      totalLaborCharges,
      subtotal,
      totalAmount,
      paidAmount: effectivePaidAmount,
      paidSilver: parseFloat(paidSilver),
      balanceAmount,
      previousBalance,
      closingBalance,
      paymentMode,
      notes,
      status: balanceAmount === 0 ? 'paid' : (effectivePaidAmount > 0 ? 'partial' : 'pending'),
      createdBy: req.user.id || 4
    }, { transaction: t });

    // Create sale items
    const saleItems = itemsData.map(item => ({
      regularSaleId: sale.id,
      productId: item.productId || null,
      description: item.description,
      pieces: item.pieces || 1,
      grossWeight: item.grossWeight,
      stoneWeight: item.stoneWeight || 0,
      netWeight: item.netWeight,
      wastage: item.wastage,
      touch: item.touch,
      silverWeight: item.silverWeight,
      laborRatePerKg: item.laborRatePerKg,
      laborCharges: item.laborCharges,
      itemAmount: item.itemAmount
    }));

    await RegularSaleItem.bulkCreate(saleItems, { transaction: t });

    // Create sale transaction
    await RegularTransaction.create({
      regularCustomerId,
      regularSaleId: sale.id,
      type: 'sale',
      amount: totalAmount,
      balanceBefore: previousBalance,
      balanceAfter: previousBalance + totalAmount,
      createdBy: req.user.id || 4
    }, { transaction: t });

    // If payment made
    if (effectivePaidAmount > 0) {
      await RegularTransaction.create({
        regularCustomerId,
        regularSaleId: sale.id,
        type: 'payment',
        amount: -effectivePaidAmount,
        paymentMode,
        balanceBefore: previousBalance + totalAmount,
        balanceAfter: closingBalance,
        notes: paidSilver > 0 ? `Paid: ₹${paidAmount} + ${paidSilver}g silver (₹${paidSilverValue.toFixed(2)})` : null,
        createdBy: req.user?.id || sale.createdBy || null
      }, { transaction: t });
    }

    await t.commit();

    // Fetch complete sale
    const completeSale = await RegularSale.findByPk(sale.id, {
      include: [
        {
          model: RegularCustomer,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'address']
        },
        {
          model: RegularSaleItem,
          as: 'items'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: completeSale
    });

  } catch (error) {
    await t.rollback();
    console.error('Create regular sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sale',
      error: error.message
    });
  }
};

// Get all regular sales
exports.getAllRegularSales = async (req, res) => {
  try {
    const { regularCustomerId, startDate, endDate, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (regularCustomerId) whereClause.regularCustomerId = regularCustomerId;
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.saleDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await RegularSale.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: RegularCustomer,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'address']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['saleDate', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get regular sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales',
      error: error.message
    });
  }
};

// Get regular sale details
exports.getRegularSaleDetails = async (req, res) => {
  try {
    const { saleId } = req.params;

    const sale = await RegularSale.findByPk(saleId, {
      include: [
        {
          model: RegularCustomer,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'address']
        },
        {
          model: RegularSaleItem,
          as: 'items'
        },
        {
          model: RegularTransaction,
          as: 'transactions',
          order: [['transactionDate', 'ASC']]
        }
      ]
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Get sale details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sale details',
      error: error.message
    });
  }
};

// Add payment to regular sale
exports.addPayment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { saleId } = req.params;
    const { amount, paymentMode = 'cash', referenceNumber = '', notes = '' } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const sale = await RegularSale.findByPk(saleId, { transaction: t });
    if (!sale) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    const transactions = await RegularTransaction.findAll({
      where: { regularCustomerId: sale.regularCustomerId },
      attributes: ['amount'],
      raw: true,
      transaction: t
    });
    const balanceBefore = transactions.reduce((sum, txn) => sum + parseFloat(txn.amount || 0), 0);
    const balanceAfter = balanceBefore - parseFloat(amount);

    await RegularTransaction.create({
      regularCustomerId: sale.regularCustomerId,
      regularSaleId: sale.id,
      type: 'payment',
      amount: -parseFloat(amount),
      paymentMode,
      referenceNumber,
      balanceBefore,
      balanceAfter,
      notes,
      createdBy: req.user?.id || 1
    }, { transaction: t });

    const newPaidAmount = parseFloat(sale.paidAmount || 0) + parseFloat(amount);
    const newBalanceAmount = parseFloat(sale.balanceAmount || 0) - parseFloat(amount);
    
    sale.paidAmount = newPaidAmount;
    sale.balanceAmount = Math.max(0, newBalanceAmount);
    sale.closingBalance = balanceAfter;
    
    if (sale.balanceAmount <= 0) {
      sale.status = 'paid';
    } else if (parseFloat(sale.paidAmount) > 0) {
      sale.status = 'partial';
    }
    
    await sale.save({ transaction: t });
    await t.commit();

    res.json({
      success: true,
      message: 'Payment added successfully',
      data: sale
    });

  } catch (error) {
    await t.rollback();
    console.error('Add payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding payment',
      error: error.message
    });
  }
};

// Dashboard stats
exports.getRegularBillingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.saleDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const totalSales = await RegularSale.count({ where: whereClause });
    const salesSum = await RegularSale.sum('totalAmount', { where: whereClause });
    const silverSum = await RegularSale.sum('totalSilverWeight', { where: whereClause });
    const paymentsSum = await RegularSale.sum('paidAmount', { where: whereClause });
    
    const allTransactions = await RegularTransaction.findAll({
      attributes: ['regularCustomerId', 'amount'],
      raw: true
    });
    
    const customerBalances = {};
    allTransactions.forEach(t => {
      if (!customerBalances[t.regularCustomerId]) customerBalances[t.regularCustomerId] = 0;
      customerBalances[t.regularCustomerId] += parseFloat(t.amount || 0);
    });
    
    const pendingBalance = Object.values(customerBalances)
      .filter(b => b > 0)
      .reduce((sum, b) => sum + b, 0);

    const totalCustomers = await RegularCustomer.count();

    res.json({
      success: true,
      data: {
        totalSales,
        totalSalesAmount: salesSum || 0,
        totalSilverWeight: silverSum || 0,
        totalPaymentsReceived: paymentsSum || 0,
        pendingBalance: pendingBalance || 0,
        totalCustomers
      }
    });

  } catch (error) {
    console.error('Get regular billing stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
};

// Daily analysis
exports.getDailyAnalysis = async (req, res) => {
  try {
    const { date } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];

    const sales = await RegularSale.findAll({
      where: {
        saleDate: {
          [Op.gte]: `${selectedDate} 00:00:00`,
          [Op.lte]: `${selectedDate} 23:59:59`
        }
      },
      include: [{
        model: RegularCustomer,
        as: 'customer',
        attributes: ['id', 'name', 'phone', 'address']
      }],
      order: [['createdAt', 'DESC']]
    });

    const totalSales = sales.length;
    const totalSilver = sales.reduce((sum, sale) => sum + parseFloat(sale.totalSilverWeight || 0), 0);
    const totalAmount = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || 0), 0);
    const totalPaid = sales.reduce((sum, sale) => sum + parseFloat(sale.paidAmount || 0), 0);

    res.json({
      success: true,
      data: {
        date: selectedDate,
        totalSales,
        totalSilver,
        totalAmount,
        totalPaid,
        sales: sales.map(s => ({
          id: s.id,
          voucherNumber: s.voucherNumber,
          customer: s.customer,
          totalSilverWeight: s.totalSilverWeight,
          totalAmount: s.totalAmount,
          paidAmount: s.paidAmount,
          balanceAmount: s.balanceAmount
        }))
      }
    });
  } catch (error) {
    console.error('Daily analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily analysis',
      error: error.message
    });
  }
};

// Export sales to Excel
exports.exportSalesToExcel = async (req, res) => {
  try {
    const { regularCustomerId, startDate, endDate, status } = req.query;

    const whereClause = {};
    if (regularCustomerId) whereClause.regularCustomerId = regularCustomerId;
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.saleDate = { [Op.between]: [startDate, endDate] };
    }

    const sales = await RegularSale.findAll({
      where: whereClause,
      include: [{
        model: RegularCustomer,
        as: 'customer',
        attributes: ['name', 'phone']
      }],
      order: [['saleDate', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Regular Sales');

    worksheet.columns = [
      { header: 'Voucher No', key: 'voucherNumber', width: 15 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Customer', key: 'customer', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Silver Weight (g)', key: 'silverWeight', width: 18 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Paid', key: 'paid', width: 12 },
      { header: 'Paid Silver (g)', key: 'paidSilver', width: 15 },
      { header: 'Balance', key: 'balance', width: 12 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    sales.forEach(sale => {
      worksheet.addRow({
        voucherNumber: sale.voucherNumber,
        date: new Date(sale.saleDate).toLocaleDateString('en-GB'),
        customer: sale.customer.name,
        phone: sale.customer.phone,
        silverWeight: parseFloat(sale.totalSilverWeight).toFixed(3),
        totalAmount: parseFloat(sale.totalAmount).toFixed(2),
        paid: parseFloat(sale.paidAmount).toFixed(2),
        paidSilver: parseFloat(sale.paidSilver).toFixed(3),
        balance: parseFloat(sale.balanceAmount).toFixed(2),
        status: sale.status.toUpperCase()
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=regular-sales-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting sales',
      error: error.message
    });
  }
};

// Export customers to Excel
exports.exportCustomersToExcel = async (req, res) => {
  try {
    const { search } = req.query;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const customers = await RegularCustomer.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });

    const customersWithBalance = await Promise.all(customers.map(async (customer) => {
      const transactions = await RegularTransaction.findAll({
        where: { regularCustomerId: customer.id },
        attributes: ['amount'],
        raw: true
      });
      const balance = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      return { ...customer.toJSON(), balance };
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customers');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Balance', key: 'balance', width: 15 }
    ];

    customersWithBalance.forEach(customer => {
      worksheet.addRow({
        name: customer.name,
        phone: customer.phone || '-',
        address: customer.address || '-',
        balance: parseFloat(customer.balance).toFixed(2)
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=customers-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting customers',
      error: error.message
    });
  }
};

// Add silver payment
exports.addSilverPayment = async (req, res) => {
  const { id } = req.params;
  const { silverWeight, silverRate, notes } = req.body;

  try {
    const sale = await RegularSale.findByPk(id);

    if (!sale) {
      return res.status(404).json({
        status: 'error',
        message: 'Sale not found'
      });
    }

    const silverValue = parseFloat(silverWeight) * parseFloat(silverRate);
    const newPaidSilver = parseFloat(sale.paidSilver || 0) + parseFloat(silverWeight);
    const newPaidAmount = parseFloat(sale.paidAmount) + silverValue;
    const newBalanceAmount = parseFloat(sale.totalAmount) - newPaidAmount;

    let paymentStatus = 'pending';
    if (newBalanceAmount <= 0) {
      paymentStatus = 'paid';
    } else if (newPaidAmount > 0) {
      paymentStatus = 'partial';
    }

    await sale.update({
      paidSilver: newPaidSilver,
      paidAmount: newPaidAmount,
      balanceAmount: newBalanceAmount,
      status: paymentStatus
    });

    await RegularTransaction.create({
      regularCustomerId: sale.regularCustomerId,
      regularSaleId: sale.id,
      type: 'payment',
      silverWeight: parseFloat(silverWeight),
      amount: silverValue,
      paymentMode: 'silver',
      balanceBefore: parseFloat(sale.balanceAmount),
      balanceAfter: newBalanceAmount,
      notes: notes || `Silver payment: ${silverWeight}g @ ₹${silverRate}/g`,
      transactionDate: new Date(),
      createdBy: req.user?.id || sale.createdBy || 1
    });

    const updatedSale = await RegularSale.findByPk(id);

    res.json({
      status: 'success',
      message: 'Silver payment added successfully',
      data: updatedSale
    });

  } catch (error) {
    console.error('Error adding silver payment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add silver payment',
      error: error.message
    });
  }
};

module.exports = exports;
