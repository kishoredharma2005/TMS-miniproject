const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide block name'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: false,
    },
    programme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Programme',
      required: false,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

blockSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Block', blockSchema);
