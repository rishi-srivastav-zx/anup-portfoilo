import * as enquiryRepository from "../repositories/enquiry.repository.js";

export const handleCreateEnquiry = async (req, res, next) => {
    try {
        const { name, phone, message, email, project_type, source } = req.body;

        const enquiry = await enquiryRepository.createEnquiry({
            name,
            phone,
            message: message || "",
            email: email || null,
            project_type: project_type || null,
            source: source || "Portfolio Contact Form",
        });

        return res.status(201).json({
            success: true,
            message: "Thank you. Your message has been received. Anup Rawat will reach out promptly.",
            data: enquiry,
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetEnquiries = async (req, res, next) => {
    try {
        const { limit, offset, status, search } = req.query;
        const enquiries = await enquiryRepository.getEnquiries({
            limit: limit ? parseInt(limit, 10) : 100,
            offset: offset ? parseInt(offset, 10) : 0,
            status,
            search,
        });

        return res.json({
            success: true,
            data: enquiries,
        });
    } catch (error) {
        next(error);
    }
};

export const handleUpdateEnquiryStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await enquiryRepository.updateEnquiryStatus(id, status);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Lead not found.",
            });
        }

        return res.json({
            success: true,
            message: `Lead status updated to ${status}.`,
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

export const handleDeleteEnquiry = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleted = await enquiryRepository.deleteEnquiry(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Lead not found.",
            });
        }

        return res.json({
            success: true,
            message: "Lead deleted successfully.",
            data: deleted,
        });
    } catch (error) {
        next(error);
    }
};
