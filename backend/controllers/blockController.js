const Block = require('../models/Block');

exports.createBlock = async (req, res) => {
  try {
    const { name, department, programme, description } = req.body;

    const blockData = {
      name: name ? name.trim() : '',
      description,
    };
    if (department) blockData.department = department;
    if (programme) blockData.programme = programme;

    const block = new Block(blockData);

    await block.save();
    res.status(201).json({ message: 'Block created successfully', block });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create block', error: error.message });
  }
};

exports.getBlocks = async (req, res) => {
  try {
    const { departmentId, programmeId } = req.query;
    const query = { isActive: true };
    if (departmentId) query.department = departmentId;
    if (programmeId) query.programme = programmeId;

    const blocks = await Block.find(query).populate('department').populate('programme');
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blocks', error: error.message });
  }
};

exports.getBlockById = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id).populate('department').populate('programme');
    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }
    res.json(block);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch block', error: error.message });
  }
};

exports.updateBlock = async (req, res) => {
  try {
    const { name, department, programme, description } = req.body;
    const updateData = {
      name: name ? name.trim() : undefined,
      description,
    };
    if (department !== undefined) updateData.department = department || null;
    if (programme !== undefined) updateData.programme = programme || null;

    const block = await Block.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }
    res.json({ message: 'Block updated successfully', block });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update block', error: error.message });
  }
};

exports.deleteBlock = async (req, res) => {
  try {
    const block = await Block.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }
    res.json({ message: 'Block deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete block', error: error.message });
  }
};
