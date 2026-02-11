import StockAudit from '../models/StockAudit.js';
import Vehicle from '../models/Vehicle.js';

// @desc    Get audit stats for user's yard
// @route   GET /api/audit/stats
// @access  Private
export const getAuditStats = async (req, res) => {
    try {
        const userYardId = req.user.branchId;

        // Get total vehicles in yard
        const totalVehicles = await Vehicle.countDocuments({ 
            yardId: userYardId,
            status: { $in: ['IN_YARD', 'PENDING_RELEASE'] }
        });

        // Get latest audit
        const latestAudit = await StockAudit.findOne({ yardId: userYardId })
            .sort({ createdAt: -1 })
            .populate('conductedBy', 'name');

        if (!latestAudit) {
            return res.json({
                totalVehicles,
                verifiedCount: 0,
                pendingCount: totalVehicles,
                completionPercentage: 0,
                lastAudit: null
            });
        }

        const completionPercentage = totalVehicles > 0 
            ? Math.round((latestAudit.verifiedCount / totalVehicles) * 100) 
            : 0;

        res.json({
            totalVehicles,
            verifiedCount: latestAudit.verifiedCount,
            pendingCount: latestAudit.pendingCount,
            completionPercentage,
            lastAudit: {
                date: latestAudit.auditDate,
                conductedBy: latestAudit.conductedBy?.name,
                status: latestAudit.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new audit
// @route   POST /api/audit
// @access  Private
export const createAudit = async (req, res) => {
    try {
        const userYardId = req.user.branchId;
        const userId = req.user._id;

        // Count total vehicles in yard
        const totalVehicles = await Vehicle.countDocuments({ 
            yardId: userYardId,
            status: { $in: ['IN_YARD', 'PENDING_RELEASE'] }
        });

        const newAudit = await StockAudit.create({
            yardId: userYardId,
            conductedBy: userId,
            totalVehicles,
            verifiedCount: 0,
            pendingCount: totalVehicles,
            status: 'IN_PROGRESS'
        });

        await newAudit.populate('conductedBy', 'name');

        res.status(201).json(newAudit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get audit history
// @route   GET /api/audit/history
// @access  Private
export const getAuditHistory = async (req, res) => {
    try {
        const userYardId = req.user.branchId;
        const limit = parseInt(req.query.limit) || 10;

        const audits = await StockAudit.find({ yardId: userYardId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('conductedBy', 'name');

        res.json(audits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
