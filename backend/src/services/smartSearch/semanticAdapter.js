/**
 * Semantic Embedding Search Adapter Interface
 * Step 6: Smart Search Engine for Cinematographer Portfolio AI Assistant
 * 
 * NOTE: As per project restrictions, paid external APIs (such as OpenAI or paid cloud vector services)
 * are strictly disabled. This adapter serves as a clean, modular plug-in point for future free local
 * embedding solutions (e.g., local ONNX runtime, Transformers.js, or PostgreSQL pgvector).
 * 
 * We explicitly distinguish keyword, full-text, and fuzzy trigram matching from vector semantic embeddings.
 */

export const semanticSearchAdapter = {
    /**
     * Checks if a local embedding model is configured and active
     * @returns {boolean}
     */
    isAvailable() {
        return false;
    },

    /**
     * Generates a vector embedding for a given text
     * @param {string} text
     * @returns {Promise<Array<number>|null>}
     */
    async generateEmbedding(text) {
        if (!this.isAvailable()) {
            return null;
        }
        // Future local ONNX/Transformers.js embedding hook
        return null;
    },

    /**
     * Calculates cosine similarity between two vector embeddings
     * @param {Array<number>} vecA
     * @param {Array<number>} vecB
     * @returns {number|null}
     */
    computeCosineSimilarity(vecA, vecB) {
        if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) {
            return null;
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    },
};

export default semanticSearchAdapter;

