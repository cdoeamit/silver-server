const RegularJamaKharchSilver = require('../models/RegularJamaKharchSilver');
const RegularJamaKharchCash = require('../models/RegularJamaKharchCash');

// Silver Transactions
exports.createSilverTransaction = async (req, res) => {
  try {
    const transaction = await RegularJamaKharchSilver.create({
      ...req.body,
      createdBy: req.user?.id || 1
    });

    res.json({
      status: 'success',
      message: 'Silver transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error creating silver transaction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create transaction',
      error: error.message
    });
  }
};

exports.getSilverTransactions = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    const where = {};
    if (type) where.type = type;
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const transactions = await RegularJamaKharchSilver.findAll({
      where,
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching silver transactions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transactions'
    });
  }
};

exports.deleteSilverTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    await RegularJamaKharchSilver.destroy({ where: { id } });

    res.json({
      status: 'success',
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete transaction'
    });
  }
};

// Cash Transactions
exports.createCashTransaction = async (req, res) => {
  try {
    const transaction = await RegularJamaKharchCash.create({
      ...req.body,
      createdBy: req.user?.id || 1
    });

    res.json({
      status: 'success',
      message: 'Cash transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error creating cash transaction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create transaction',
      error: error.message
    });
  }
};

exports.getCashTransactions = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    const where = {};
    if (type) where.type = type;
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const transactions = await RegularJamaKharchCash.findAll({
      where,
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching cash transactions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transactions'
    });
  }
};

exports.deleteCashTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    await RegularJamaKharchCash.destroy({ where: { id } });

    res.json({
      status: 'success',
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete transaction'
    });
  }
};
