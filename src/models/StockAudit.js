import mongoose from 'mongoose';

const stockAuditSchema = new mongoose.Schema({
    yardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Yard',
        required: true
    },
    auditDate: {
        type: Date,
        default: Date.now
    },
    conductedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalVehicles: {
        type: Number,
        default: 0
    },
    verifiedCount: {
        type: Number,
        default: 0
    },
    pendingCount: {
        type: Number,
        default: 0
    },
    discrepancies: [
        {
            vehicleId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vehicle'
            },
            status: {
                type: String,
                enum: ['MISSING', 'WRONG_LOCATION', 'FOUND_EXTRA'],
            },
            notes: String
        }
    ],
    status: {
        type: String,
        enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'IN_PROGRESS'
    }
}, { timestamps: true });

export default mongoose.model('StockAudit', stockAuditSchema);
