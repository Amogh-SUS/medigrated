// server/controllers/family/family-controller.js
const FamilyMember = require('../../models/FamilyMember');

const getFamily = async (req, res) => {
  try {
    // authMiddleware should set req.user.id
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const members = await FamilyMember.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, members });
  } catch (err) {
    console.error('getFamily error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addFamilyMember = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, relation, age, notes } = req.body;
    if (!name || !relation) return res.status(400).json({ success: false, message: 'Name and relation are required' });

    const fm = new FamilyMember({ userId, name, relation, age: age ? Number(age) : undefined, notes });
    await fm.save();
    return res.json({ success: true, member: fm });
  } catch (err) {
    console.error('addFamilyMember error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteFamilyMember = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const doc = await FamilyMember.findOneAndDelete({ _id: id, userId });
    if (!doc) return res.status(404).json({ success: false, message: 'Member not found' });
    return res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    console.error('deleteFamilyMember error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getFamily, addFamilyMember, deleteFamilyMember };
