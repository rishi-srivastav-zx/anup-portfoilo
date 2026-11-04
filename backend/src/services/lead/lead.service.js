/**
 * Lead Generation & Enquiry Management Service
 * Step 10 & Natural Conversational Refactor:
 * - Collects visitor name on first interaction, persists immediately in Neon PostgreSQL.
 * - Allows normal portfolio questions without phone interruptions.
 * - Collects and strictly validates 10-digit Indian phone on hiring intent, updates same lead record.
 * - Conversationally asks optional project questions (type, description, budget/timeline) with compact Skip buttons.
 * - Completely eliminates old confirmation summary and submit buttons; persists incrementally at every step.
 */

import crypto from "crypto";
import { chatLeadRepository } from "../../repositories/chatLead.repository.js";
import { chatRepository } from "../../repositories/chat.repository.js";
import {
    validateName,
    validatePhone,
    validateEmail,
    validateProjectType,
    validateProjectDescription,
    validateLeadPayload,
} from "./leadValidation.service.js";
import { INTENTS, INTENT_CATEGORIES } from "../../modules/intent/intent.constants.js";

/**
 * Format reference ID from lead ID
 * e.g., AR-LEAD-8A3B1F2C
 */
export function formatLeadReferenceId(id) {
    if (!id) return "AR-LEAD-UNKNOWN";
    const shortCode = String(id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
    return `AR-LEAD-${shortCode}`;
}

/**
 * Mandatory contact fields required before completing lead submission
 */
const REQUIRED_FIELDS = ["visitorName", "phone"];

/**
 * Checks if a message or intent indicates hiring/booking interest
 */
export function isLeadTriggerIntent(intentName, message = "") {
    const hiringIntents = [
        INTENTS.HIRE_INQUIRY,
        INTENTS.BOOKING_INQUIRY,
        INTENTS.COLLABORATION_INQUIRY,
        INTENTS.PRICING_INQUIRY,
    ];

    if (intentName && hiringIntents.includes(intentName)) {
        return true;
    }

    const lowMsg = message.toLowerCase();
    const hiringPhrases = [
        "hire anup",
        "hire you",
        "need a cinematographer",
        "looking for a cinematographer",
        "book a shoot",
        "booking inquiry",
        "discuss a project",
        "want to collaborate",
        "shoot availability",
        "get a quote",
        "quotation",
        "commercial project",
        "book anup",
        "hire rawat",
    ];

    return hiringPhrases.some((phrase) => lowMsg.includes(phrase));
}

/**
 * Detects if a message is an explicit cancellation
 */
export function isCancellationMessage(message = "") {
    const low = message.trim().toLowerCase();
    const cancelPatterns = [
        /^(cancel|cancel inquiry|stop|never mind|exit|abort|no thanks|nahi chahiye|don't want to hire|forget it|stop asking|that's all|enough|no more)\b/i,
        /\b(cancel this|cancel the inquiry|cancel booking|stop asking questions|that's it)\b/i,
    ];
    return cancelPatterns.some((pattern) => pattern.test(low));
}

/**
 * Detects if a message is an explicit skip request
 */
export function isSkipMessage(message = "") {
    const low = message.trim().toLowerCase();
    const skipPatterns = [
        /^(skip|pass|next|skip step|n\/?a|none|leave it|skip this|baad mein)\b/i,
    ];
    return skipPatterns.some((pattern) => pattern.test(low));
}

/**
 * Detects if a message is an explicit confirmation
 */
export function isConfirmationMessage(message = "") {
    const low = message.trim().toLowerCase();
    const confirmPatterns = [
        /^(yes|confirm|confirm enquiry|confirm & submit|submit|proceed|go ahead|send it|haan|theek hai|sure|ok|okay|looks good|yes submit|submit lead)\b/i,
        /\b(submit this|please submit|send this|confirm enquiry|confirm & submit)\b/i,
    ];
    return confirmPatterns.some((pattern) => pattern.test(low));
}

/**
 * Extract initial lead details from message and entities
 */
function extractInitialLeadData(message = "", entities = {}) {
    const data = {};
    const lowMsg = message.toLowerCase();

    // Check project type mentions
    if (entities.projectType) {
        const pt = entities.projectType;
        data.projectType = pt.charAt(0).toUpperCase() + pt.slice(1);
    } else if (lowMsg.includes("commercial")) {
        data.projectType = "Commercial";
    } else if (lowMsg.includes("music video")) {
        data.projectType = "Music Video";
    } else if (lowMsg.includes("documentary")) {
        data.projectType = "Documentary";
    } else if (lowMsg.includes("brand film")) {
        data.projectType = "Brand Film";
    } else if (lowMsg.includes("narrative") || lowMsg.includes("film") || lowMsg.includes("movie")) {
        data.projectType = "Narrative Film";
    } else if (lowMsg.includes("corporate")) {
        data.projectType = "Corporate";
    }

    // Check email
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
        data.email = emailMatch[0];
    }

    // Check phone
    const phoneMatch = message.match(/(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?[\d]{3}[-.\s]?[\d]{4}/);
    if (phoneMatch) {
        const phoneValidation = validatePhone(phoneMatch[0]);
        if (phoneValidation.isValid) {
            data.phone = phoneValidation.value;
        }
    }

    return data;
}

export const leadService = {
    /**
     * Determines whether the lead conversational flow should handle this turn
     */
    shouldHandleTurn({ state, intentResult, message = "", actionPayload = null }) {
        const leadState = state?.leadState;

        // 1. Explicit lead actions (Skip, Cancel, Submit)
        if (
            actionPayload?.action === "SKIP_LEAD_FIELD" ||
            actionPayload?.action === "CANCEL_LEAD" ||
            actionPayload?.action === "SUBMIT_LEAD" ||
            actionPayload?.type === "SKIP_LEAD_FIELD"
        ) {
            return true;
        }

        // 2. If visitor's name has not been captured yet, the first interaction asks for their name
        if (!leadState?.visitorName && !leadState?.collectedLeadData?.visitorName) {
            return true;
        }

        // 3. If currently in the middle of being asked a field (visitorName, phone, projectType, projectDescription, budgetTimeline)
        if (leadState?.currentLeadField) {
            // If on optional questions and user asks an explicit portfolio inquiry, respect their flow
            const isOptionalField = ["projectType", "projectDescription", "budgetTimeline"].includes(leadState.currentLeadField);
            if (isOptionalField && !isSkipMessage(message)) {
                const isPortfolioInquiry = [
                    INTENTS.CAMERA_INQUIRY,
                    INTENTS.LENS_INQUIRY,
                    INTENTS.EQUIPMENT_INQUIRY,
                    INTENTS.VIEW_PORTFOLIO,
                    INTENTS.FEATURED_WORK,
                    INTENTS.ABOUT_PERSON,
                    INTENTS.EXPERIENCE_INQUIRY,
                    INTENTS.GREETING,
                ].includes(intentResult?.intent);

                if (isPortfolioInquiry && intentResult?.confidence >= 0.7) {
                    return false;
                }
            }
            return true;
        }

        // 4. If visitor expresses hiring or enquiry intent
        if (isLeadTriggerIntent(intentResult?.intent, message)) {
            return true;
        }

        // 5. If lead flow is actively in progress
        if (leadState?.isLeadFlowActive) {
            return true;
        }

        // Normal portfolio question: do not force lead generation
        return false;
    },

    /**
     * Handles a single conversational turn in the natural lead collection lifecycle
     */
    async handleConversationalTurn({
        conversationId,
        message,
        state,
        intentResult,
        actionPayload = null,
    }) {
        const leadState = state?.leadState
            ? { ...state.leadState }
            : {
                  visitorName: null,
                  phone: null,
                  leadId: null,
                  referenceId: null,
                  isLeadFlowActive: false,
                  currentLeadField: null,
                  collectedLeadData: {},
                  missingRequiredFields: [...REQUIRED_FIELDS],
                  leadSubmissionStatus: "idle",
                  pendingConfirmation: false,
                  pendingHiringIntent: false,
                  pendingVisitorQuery: null,
              };

        const collectedData = { ...(leadState.collectedLeadData || {}) };
        if (leadState.visitorName && !collectedData.visitorName) {
            collectedData.visitorName = leadState.visitorName;
        }
        if (leadState.phone && !collectedData.phone) {
            collectedData.phone = leadState.phone;
        }

        const rawMsg = message ? message.trim() : "";

        // -------------------------------------------------------------
        // 1. Cancellation / Stop Asking Check
        // -------------------------------------------------------------
        if (
            isCancellationMessage(rawMsg) ||
            actionPayload?.action === "CANCEL_LEAD" ||
            actionPayload?.type === "CANCEL_LEAD" ||
            actionPayload?.cancel
        ) {
            leadState.isLeadFlowActive = false;
            leadState.currentLeadField = null;
            leadState.pendingConfirmation = false;

            // If we already have visitor's phone & name, keep them safely recorded
            if (collectedData.phone && collectedData.visitorName) {
                leadState.leadSubmissionStatus = "submitted";
                const refId = formatLeadReferenceId(leadState.leadId);
                leadState.referenceId = refId;
                return {
                    handled: true,
                    reply: `No problem at all, **${collectedData.visitorName}**! I have noted your details. Anup will reach out to you on **${collectedData.phone}**.\n\nFeel free to explore his showreel or ask anything about his cinematography work and camera packages!`,
                    actions: [
                        { label: "View Showreel", type: "PLAY_SHOWREEL", action: "PLAY_SHOWREEL", target: "#work" },
                        { label: "Explore Portfolio", type: "NAVIGATE_TO_SECTION", action: "NAVIGATE_TO_SECTION", target: "#work" },
                    ],
                    suggestions: ["View Showreel", "What cameras does Anup use?", "Show me commercial work"],
                    updatedLeadState: leadState,
                    referenceId: refId,
                };
            }

            leadState.leadSubmissionStatus = "cancelled";
            return {
                handled: true,
                reply: "No problem at all! I have cancelled the enquiry. Let me know if there's anything else about Anup's cinematography work, showreel, camera packages, or portfolio you'd like to explore.",
                actions: [
                    { label: "View Showreel", type: "PLAY_SHOWREEL", action: "PLAY_SHOWREEL", target: "#work" },
                    { label: "Explore Portfolio", type: "NAVIGATE_TO_SECTION", action: "NAVIGATE_TO_SECTION", target: "#work" },
                ],
                suggestions: ["Show me commercial work", "What cameras does Anup use?", "Explore portfolio"],
                updatedLeadState: leadState,
            };
        }

        // -------------------------------------------------------------
        // 2. NAME COLLECTION (First Interaction)
        // -------------------------------------------------------------
        if (!collectedData.visitorName) {
            // Check if currently waiting for visitorName response
            if (leadState.currentLeadField === "visitorName") {
                // If user tried to skip name
                if (isSkipMessage(rawMsg)) {
                    leadState.collectedLeadData = collectedData;
                    return {
                        handled: true,
                        reply: "Please share your name so Anup knows who he is speaking with.",
                        actions: [],
                        suggestions: [],
                        updatedLeadState: leadState,
                    };
                }

                // Validate name input
                const nameRes = validateName(rawMsg);
                if (!nameRes.isValid) {
                    leadState.collectedLeadData = collectedData;
                    return {
                        handled: true,
                        reply: `${nameRes.error} (Please enter your name with letters, e.g., 'Vikram Sharma')`,
                        actions: [],
                        suggestions: [],
                        updatedLeadState: leadState,
                    };
                }

                // Name is valid! Save immediately in Neon PostgreSQL
                collectedData.visitorName = nameRes.value;
                leadState.visitorName = nameRes.value;
                leadState.collectedLeadData = collectedData;

                const savedLead = await chatLeadRepository.upsertLeadForConversation({
                    conversationId,
                    visitorName: nameRes.value,
                    source: "AI Chat Assistant",
                });

                if (savedLead) {
                    leadState.leadId = savedLead.id;
                    leadState.referenceId = formatLeadReferenceId(savedLead.id);
                }

                // Check if hiring intent was expressed in previous message or current intent
                const isHiring =
                    leadState.pendingHiringIntent ||
                    isLeadTriggerIntent(intentResult?.intent, leadState.pendingVisitorQuery || rawMsg);

                if (isHiring) {
                    // Transition naturally to phone collection
                    leadState.currentLeadField = "phone";
                    leadState.isLeadFlowActive = true;
                    leadState.pendingHiringIntent = false;

                    return {
                        handled: true,
                        reply: `Nice to meet you, ${nameRes.value}! What's your phone number?`,
                        actions: [],
                        suggestions: [],
                        updatedLeadState: leadState,
                    };
                }

                // Normal greeting / conversation initiation
                leadState.currentLeadField = null;
                leadState.isLeadFlowActive = false;
                leadState.pendingHiringIntent = false;

                return {
                    handled: true,
                    reply: `Nice to meet you, ${nameRes.value}! Welcome to Anup Rawat's portfolio. Feel free to ask me anything about his cinematography, showreel, camera equipment, or upcoming shoot discussions.`,
                    actions: [
                        { label: "View Showreel", type: "PLAY_SHOWREEL", action: "PLAY_SHOWREEL", target: "#work" },
                    ],
                    suggestions: ["View Showreel", "What cameras does Anup use?", "Show me commercial work"],
                    updatedLeadState: leadState,
                };
            }

            // First message of conversation: prompt visitor for name
            const initialExtracted = extractInitialLeadData(rawMsg, intentResult?.entities || {});
            Object.assign(collectedData, initialExtracted);

            const isHiring = isLeadTriggerIntent(intentResult?.intent, rawMsg);
            leadState.pendingHiringIntent = isHiring;
            leadState.pendingVisitorQuery = rawMsg;
            leadState.isLeadFlowActive = true;
            leadState.currentLeadField = "visitorName";
            leadState.collectedLeadData = collectedData;

            const promptReply = isHiring
                ? "Great! What's your name?"
                : "Hello! Welcome to cinematographer Anup Rawat's portfolio assistant. What's your name?";

            return {
                handled: true,
                reply: promptReply,
                actions: [],
                suggestions: [],
                updatedLeadState: leadState,
            };
        }

        // -------------------------------------------------------------
        // 3. PHONE COLLECTION (Triggered on Hiring Intent)
        // -------------------------------------------------------------
        if (leadState.currentLeadField === "phone") {
            // If user tried to skip phone
            if (isSkipMessage(rawMsg)) {
                leadState.collectedLeadData = collectedData;
                return {
                    handled: true,
                    reply: "A valid phone or WhatsApp number is required so Anup can reach out.",
                    actions: [],
                    suggestions: [],
                    updatedLeadState: leadState,
                };
            }

            // Validate phone strictly (10-digit Indian number)
            const phoneRes = validatePhone(rawMsg);
            if (!phoneRes.isValid) {
                leadState.collectedLeadData = collectedData;
                return {
                    handled: true,
                    reply: `${phoneRes.error} (e.g. +91 98765 43210 or your 10-digit mobile number)`,
                    actions: [],
                    suggestions: [],
                    updatedLeadState: leadState,
                };
            }

            // Phone is valid! Update the SAME lead record in Neon PostgreSQL
            collectedData.phone = phoneRes.value;
            leadState.phone = phoneRes.value;
            leadState.collectedLeadData = collectedData;

            const savedLead = await chatLeadRepository.upsertLeadForConversation({
                conversationId,
                phone: phoneRes.value,
            });

            if (savedLead) {
                leadState.leadId = savedLead.id;
                leadState.referenceId = formatLeadReferenceId(savedLead.id);
            }

            // Move to first optional field: Project Type (if not already known)
            if (!collectedData.projectType) {
                leadState.currentLeadField = "projectType";
                return {
                    handled: true,
                    reply: "What type of project are you planning?",
                    actions: [
                        { label: "Skip", type: "SKIP_LEAD_FIELD", action: "SKIP_LEAD_FIELD", target: "lead", payload: { field: "projectType", skip: true } },
                    ],
                    suggestions: ["Commercial", "Music Video", "Brand Film", "Documentary", "Skip"],
                    updatedLeadState: leadState,
                };
            }

            // If projectType was already detected, move to projectDescription
            if (!collectedData.projectDescription) {
                leadState.currentLeadField = "projectDescription";
                return {
                    handled: true,
                    reply: "Could you share a few details about your project?",
                    actions: [
                        { label: "Skip", type: "SKIP_LEAD_FIELD", action: "SKIP_LEAD_FIELD", target: "lead", payload: { field: "projectDescription", skip: true } },
                    ],
                    suggestions: ["Skip"],
                    updatedLeadState: leadState,
                };
            }
        }

        // -------------------------------------------------------------
        // 4. INITIATE HIRING FLOW (If name is known, but hiring intent triggered)
        // -------------------------------------------------------------
        if (isLeadTriggerIntent(intentResult?.intent, rawMsg) && !leadState.phone) {
            const initialExtracted = extractInitialLeadData(rawMsg, intentResult?.entities || {});
            Object.assign(collectedData, initialExtracted);

            leadState.currentLeadField = "phone";
            leadState.isLeadFlowActive = true;
            leadState.collectedLeadData = collectedData;

            if (collectedData.projectType) {
                await chatLeadRepository.upsertLeadForConversation({
                    conversationId,
                    projectType: collectedData.projectType,
                }).catch(() => {});
            }

            return {
                handled: true,
                reply: `That's great, ${collectedData.visitorName}! Could you please share your 10-digit phone or WhatsApp number so Anup can get in touch with you directly regarding your project?`,
                actions: [],
                suggestions: [],
                updatedLeadState: leadState,
            };
        }

        // -------------------------------------------------------------
        // 5. OPTIONAL FIELD 1: Project Type (with Skip)
        // -------------------------------------------------------------
        if (leadState.currentLeadField === "projectType") {
            const isSkipping =
                isSkipMessage(rawMsg) ||
                actionPayload?.action === "SKIP_LEAD_FIELD" ||
                actionPayload?.type === "SKIP_LEAD_FIELD" ||
                Boolean(actionPayload?.skip);

            if (isSkipping) {
                collectedData.projectType = null;
                await chatLeadRepository.upsertLeadForConversation({
                    conversationId,
                    projectType: null,
                });
            } else {
                const ptRes = validateProjectType(rawMsg);
                if (!ptRes.isValid) {
                    leadState.collectedLeadData = collectedData;
                    return {
                        handled: true,
                        reply: `${ptRes.error}`,
                        actions: [
                            { label: "Skip", type: "SKIP_LEAD_FIELD", action: "SKIP_LEAD_FIELD", target: "lead", payload: { field: "projectType", skip: true } },
                        ],
                        suggestions: ["Commercial", "Music Video", "Brand Film", "Documentary", "Skip"],
                        updatedLeadState: leadState,
                    };
                }
                collectedData.projectType = ptRes.value;
                await chatLeadRepository.upsertLeadForConversation({
                    conversationId,
                    projectType: ptRes.value,
                });
            }

            leadState.collectedLeadData = collectedData;

            // Move to Project Description
            leadState.currentLeadField = "projectDescription";
            return {
                handled: true,
                reply: "Could you share a few details about your project?",
                actions: [
                    { label: "Skip", type: "SKIP_LEAD_FIELD", action: "SKIP_LEAD_FIELD", target: "lead", payload: { field: "projectDescription", skip: true } },
                ],
                suggestions: ["Skip"],
                updatedLeadState: leadState,
            };
        }

        // -------------------------------------------------------------
        // 6. OPTIONAL FIELD 2: Project Description (with Skip)
        // -------------------------------------------------------------
        if (leadState.currentLeadField === "projectDescription") {
            const isSkipping =
                isSkipMessage(rawMsg) ||
                actionPayload?.action === "SKIP_LEAD_FIELD" ||
                actionPayload?.type === "SKIP_LEAD_FIELD" ||
                Boolean(actionPayload?.skip);

            if (isSkipping) {
                collectedData.projectDescription = null;
                await chatLeadRepository.upsertLeadForConversation({
                    conversationId,
                    projectDescription: null,
                });
            } else {
                const pdRes = validateProjectDescription(rawMsg);
                if (!pdRes.isValid) {
                    leadState.collectedLeadData = collectedData;
                    return {
                        handled: true,
                        reply: `${pdRes.error}`,
                        actions: [
                            { label: "Skip", type: "SKIP_LEAD_FIELD", action: "SKIP_LEAD_FIELD", target: "lead", payload: { field: "projectDescription", skip: true } },
                        ],
                        suggestions: ["Skip"],
                        updatedLeadState: leadState,
                    };
                }
                collectedData.projectDescription = pdRes.value;
                await chatLeadRepository.upsertLeadForConversation({
                    conversationId,
                    projectDescription: pdRes.value,
                });
            }

            leadState.collectedLeadData = collectedData;

            // Move to optional budget & shoot dates
            leadState.currentLeadField = "budgetTimeline";
            return {
                handled: true,
                reply: "Do you have an estimated budget or preferred shoot dates in mind?",
                actions: [
                    { label: "Skip", type: "SKIP_LEAD_FIELD", action: "SKIP_LEAD_FIELD", target: "lead", payload: { field: "budgetTimeline", skip: true } },
                ],
                suggestions: ["Flexible dates", "Under ₹1 Lakh", "₹1-3 Lakhs", "Skip"],
                updatedLeadState: leadState,
            };
        }

        // -------------------------------------------------------------
        // 7. OPTIONAL FIELD 3: Budget & Timeline (with Skip)
        // -------------------------------------------------------------
        if (leadState.currentLeadField === "budgetTimeline") {
            const isSkipping =
                isSkipMessage(rawMsg) ||
                actionPayload?.action === "SKIP_LEAD_FIELD" ||
                actionPayload?.type === "SKIP_LEAD_FIELD" ||
                Boolean(actionPayload?.skip);

            if (!isSkipping && rawMsg.length > 1) {
                collectedData.budget = rawMsg;
                await chatLeadRepository.upsertLeadForConversation({
                    conversationId,
                    budget: rawMsg,
                });
            } else {
                collectedData.budget = null;
            }

            leadState.collectedLeadData = collectedData;

            // Flow complete! No confirmation summary, no submit button!
            const finalLead = await chatLeadRepository.getLeadByConversationId(conversationId);
            const refId = formatLeadReferenceId(finalLead?.id || leadState.leadId);

            leadState.isLeadFlowActive = false;
            leadState.currentLeadField = null;
            leadState.leadSubmissionStatus = "submitted";
            leadState.lastSubmittedLeadId = finalLead?.id || leadState.leadId;
            leadState.referenceId = refId;
            leadState.pendingConfirmation = false;

            const reply =
                `Thank you so much, **${collectedData.visitorName}**! Your project details have been noted directly for cinematographer Anup Rawat.\n\n` +
                `📌 **Reference ID:** \`${refId}\`\n\n` +
                `Anup will review your creative requirements and connect with you on **${collectedData.phone}** shortly.\n\n` +
                `In the meantime, feel free to explore his showreel or ask me any questions about his cinematography work and equipment!`;

            return {
                handled: true,
                reply,
                actions: [
                    { label: "View Showreel", type: "PLAY_SHOWREEL", action: "PLAY_SHOWREEL", target: "#work" },
                    { label: "Explore Portfolio", type: "NAVIGATE_TO_SECTION", action: "NAVIGATE_TO_SECTION", target: "#work" },
                ],
                suggestions: ["View Showreel", "What equipment does Anup use?", "Explore Commercial Work"],
                updatedLeadState: leadState,
                lead: finalLead,
                referenceId: refId,
            };
        }

        // -------------------------------------------------------------
        // 8. Graceful Handling for SUBMIT_LEAD / Action buttons
        // -------------------------------------------------------------
        if (
            actionPayload?.action === "SUBMIT_LEAD" ||
            actionPayload?.type === "SUBMIT_LEAD" ||
            actionPayload?.confirmed
        ) {
            const finalLead = await chatLeadRepository.getLeadByConversationId(conversationId);
            const refId = formatLeadReferenceId(finalLead?.id || leadState.leadId);

            leadState.isLeadFlowActive = false;
            leadState.currentLeadField = null;
            leadState.leadSubmissionStatus = "submitted";
            leadState.lastSubmittedLeadId = finalLead?.id || leadState.leadId;
            leadState.referenceId = refId;
            leadState.pendingConfirmation = false;

            const reply =
                `Thank you, **${collectedData.visitorName || "there"}**! Your project enquiry is registered directly with cinematographer Anup Rawat.\n\n` +
                `📌 **Reference ID:** \`${refId}\`\n\n` +
                `Anup will connect with you on **${collectedData.phone || "your phone"}** shortly.`;

            return {
                handled: true,
                reply,
                actions: [
                    { label: "View Showreel", type: "PLAY_SHOWREEL", action: "PLAY_SHOWREEL", target: "#work" },
                    { label: "Explore Portfolio", type: "NAVIGATE_TO_SECTION", action: "NAVIGATE_TO_SECTION", target: "#work" },
                ],
                suggestions: ["View Showreel", "What equipment does Anup use?", "Explore Portfolio"],
                updatedLeadState: leadState,
                lead: finalLead,
                referenceId: refId,
            };
        }

        // Fallback: If somehow reached without handled field
        return {
            handled: false,
            reply: "",
            actions: [],
            suggestions: [],
            updatedLeadState: leadState,
        };
    },

    /**
     * Direct Public Lead Submission (POST /api/chat/lead)
     */
    async submitDirectLead({ conversationId, visitorToken, payload = {} }) {
        // 1. Verify conversation
        const conversation = await chatRepository.getConversationById(conversationId);
        if (!conversation) {
            const err = new Error(`Conversation not found with ID '${conversationId}'.`);
            err.statusCode = 404;
            err.code = "CONVERSATION_NOT_FOUND";
            throw err;
        }

        // 2. Validate visitor access token
        if (conversation.session_token_hash && visitorToken) {
            const tokenHash = crypto.createHash("sha256").update(visitorToken).digest("hex");
            if (tokenHash !== conversation.session_token_hash && visitorToken !== conversation.session_token_hash) {
                const err = new Error("Invalid or mismatched visitor session token for this conversation.");
                err.statusCode = 403;
                err.code = "FORBIDDEN_CONVERSATION_ACCESS";
                throw err;
            }
        }

        // 3. Validate lead payload
        const validation = validateLeadPayload(payload);
        if (!validation.isValid) {
            const err = new Error("Validation failed for lead enquiry submission.");
            err.statusCode = 400;
            err.code = "VALIDATION_FAILED";
            err.details = validation.errors;
            throw err;
        }

        const norm = validation.normalizedData;

        // 4. Persist or update in Neon PostgreSQL
        const lead = await chatLeadRepository.upsertLeadForConversation({
            conversationId,
            visitorName: norm.visitorName,
            email: norm.email,
            phone: norm.phone,
            projectType: norm.projectType,
            projectDescription: norm.projectDescription,
            budget: norm.budget,
            preferredDate: norm.preferredDate,
            location: norm.location,
            leadStatus: "new",
            source: norm.source || "AI Chat Assistant",
        });

        const referenceId = formatLeadReferenceId(lead.id);

        // 5. Update conversation state
        const currentState = conversation.conversation_state || {};
        const updatedState = {
            ...currentState,
            leadState: {
                isLeadFlowActive: false,
                currentLeadField: null,
                visitorName: norm.visitorName,
                phone: norm.phone,
                leadId: lead.id,
                collectedLeadData: {
                    visitorName: norm.visitorName,
                    phone: norm.phone,
                    email: norm.email,
                    projectType: norm.projectType,
                    projectDescription: norm.projectDescription,
                    budget: norm.budget,
                },
                missingRequiredFields: [],
                leadSubmissionStatus: "submitted",
                lastSubmittedLeadId: lead.id,
                referenceId,
                pendingConfirmation: false,
            },
        };

        await chatRepository.updateConversationState(conversationId, updatedState).catch((e) => {
            console.warn("[LeadService] Failed to update conversation state after direct lead submit:", e.message);
        });

        return {
            success: true,
            lead,
            referenceId,
            message: `Lead enquiry successfully submitted. Reference: ${referenceId}`,
        };
    },

    /**
     * Admin: List Leads with filtering and pagination
     */
    async listLeads({
        status = null,
        projectType = null,
        search = null,
        startDate = null,
        endDate = null,
        page = 1,
        limit = 20,
    } = {}) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;

        const { leads, total } = await chatLeadRepository.listLeads({
            status,
            projectType,
            search,
            startDate,
            endDate,
            limit: limitNum,
            offset,
        });

        // Enrich with formatted reference IDs
        const enrichedLeads = leads.map((lead) => ({
            ...lead,
            referenceId: formatLeadReferenceId(lead.id),
        }));

        return {
            leads: enrichedLeads,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
        };
    },

    /**
     * Admin: Get lead aggregation metrics and pipeline counts
     */
    async getLeadStats() {
        return chatLeadRepository.getLeadStats();
    },

    /**
     * Admin: Get Lead by ID with conversation history if available
     */
    async getLeadById(id) {
        const lead = await chatLeadRepository.getLeadById(id);
        if (!lead) {
            const err = new Error(`Lead not found with ID '${id}'.`);
            err.statusCode = 404;
            err.code = "LEAD_NOT_FOUND";
            throw err;
        }

        let conversation = null;
        let recentMessages = [];

        if (lead.conversation_id) {
            conversation = await chatRepository.getConversationById(lead.conversation_id).catch(() => null);
            recentMessages = await chatRepository.getRecentMessages(lead.conversation_id, 20).catch(() => []);
        }

        return {
            ...lead,
            referenceId: formatLeadReferenceId(lead.id),
            conversation,
            recentMessages,
        };
    },

    /**
     * Admin: Update Lead Status
     */
    async updateLeadStatus(id, status) {
        const allowedStatuses = [
            "new",
            "contacted",
            "in_discussion",
            "qualified",
            "converted",
            "closed",
            "rejected",
            "spam",
        ];

        const normStatus = String(status).toLowerCase().trim();
        if (!allowedStatuses.includes(normStatus)) {
            const err = new Error(`Invalid status '${status}'. Allowed values: ${allowedStatuses.join(", ")}`);
            err.statusCode = 400;
            err.code = "INVALID_STATUS";
            throw err;
        }

        const existing = await chatLeadRepository.getLeadById(id);
        if (!existing) {
            const err = new Error(`Lead not found with ID '${id}'.`);
            err.statusCode = 404;
            err.code = "LEAD_NOT_FOUND";
            throw err;
        }

        const updated = await chatLeadRepository.updateLeadStatus(id, normStatus);
        return {
            ...updated,
            referenceId: formatLeadReferenceId(id),
        };
    },

    /**
     * Admin: Update Lead Information
     */
    async updateLead(id, data = {}) {
        const existing = await chatLeadRepository.getLeadById(id);
        if (!existing) {
            const err = new Error(`Lead not found with ID '${id}'.`);
            err.statusCode = 404;
            err.code = "LEAD_NOT_FOUND";
            throw err;
        }

        // If phone or email is provided, validate
        if (data.phone) {
            const phoneRes = validatePhone(data.phone);
            if (!phoneRes.isValid) {
                const err = new Error(phoneRes.error);
                err.statusCode = 400;
                err.code = "INVALID_PHONE";
                throw err;
            }
            data.phone = phoneRes.value;
        }

        if (data.email) {
            const emailRes = validateEmail(data.email);
            if (!emailRes.isValid) {
                const err = new Error(emailRes.error);
                err.statusCode = 400;
                err.code = "INVALID_EMAIL";
                throw err;
            }
            data.email = emailRes.value;
        }

        if (data.leadStatus) {
            data.leadStatus = data.leadStatus.toLowerCase().trim();
        }

        const updated = await chatLeadRepository.updateLead(id, data);
        return {
            ...updated,
            referenceId: formatLeadReferenceId(id),
        };
    },

    /**
     * Admin: Delete Lead
     */
    async deleteLead(id) {
        const existing = await chatLeadRepository.getLeadById(id);
        if (!existing) {
            const err = new Error(`Lead not found with ID '${id}'.`);
            err.statusCode = 404;
            err.code = "LEAD_NOT_FOUND";
            throw err;
        }

        const deleted = await chatLeadRepository.deleteLead(id);
        return { success: deleted, id, message: "Lead successfully deleted." };
    },
};

export default leadService;
