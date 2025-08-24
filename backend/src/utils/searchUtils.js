/**
 * Utility functions for fuzzy search and better search algorithms
 */

/**
 * Creates a more advanced MongoDB regex pattern for fuzzy searching
 * 
 * @param {string} searchQuery - The user's search query
 * @returns {Object} - MongoDB query object
 */
const createFuzzySearchPattern = (searchQuery) => {
    if (!searchQuery || typeof searchQuery !== 'string') {
        return { $regex: '', $options: 'i' };
    }

    // Clean the search query
    const cleanedQuery = searchQuery.trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
        .replace(/\s+/g, ' '); // Replace multiple spaces with single space

    if (!cleanedQuery) {
        return { $regex: '', $options: 'i' };
    }

    // For single word searches
    if (!cleanedQuery.includes(' ')) {
        // Allow for fuzzy matches by making characters optional
        let fuzzyPattern = '';
        const chars = cleanedQuery.split('');
        
        // Create pattern like "p.*r.*o.*d.*u.*c.*t" for "product"
        // This allows for typos and additional characters between letters
        chars.forEach((char, i) => {
            fuzzyPattern += char;
            if (i < chars.length - 1) {
                fuzzyPattern += '.*';
            }
        });
        
        return { $regex: fuzzyPattern, $options: 'i' };
    }
    
    // For multi-word searches, create a pattern that matches any of the words
    const words = cleanedQuery.split(' ').filter(word => word.length > 0);
    
    // For exact phrase match (higher priority in ranking)
    const exactPhrase = cleanedQuery;
    
    // For individual word matches (lower priority but still relevant)
    const wordPatterns = words.map(word => {
        // For each word, create a pattern that looks for the word as a whole
        return `(?=.*${word})`;
    });
    
    // Combine patterns to require all words to be present in any order
    const combinedPattern = `${wordPatterns.join('')}.*`;
    
    return { $regex: combinedPattern, $options: 'i' };
};

/**
 * Creates scored search conditions for MongoDB aggregate pipeline
 * 
 * @param {string} searchQuery - The user's search query 
 * @param {Array<string>} fields - Database fields to search in
 * @returns {Array} - Array of MongoDB search conditions with scores
 */
const createScoredSearchConditions = (searchQuery, fields) => {
    if (!searchQuery || !fields || !Array.isArray(fields) || fields.length === 0) {
        return [];
    }
    
    const cleanedQuery = searchQuery.trim().toLowerCase();
    if (!cleanedQuery) return [];
    
    const words = cleanedQuery.split(' ').filter(word => word.length > 0);
    
    // Create search conditions with different scoring weights
    const searchConditions = [];
    
    // Exact match conditions (highest score)
    fields.forEach(field => {
        searchConditions.push({
            $addFields: {
                [`${field}_exact_match`]: {
                    $cond: {
                        if: { $regexMatch: { input: { $toLower: `$${field}` }, regex: `^${cleanedQuery}$`, options: 'i' } },
                        then: 100,  // Highest score for exact match
                        else: 0
                    }
                }
            }
        });
    });
    
    // Starts with conditions (high score)
    fields.forEach(field => {
        searchConditions.push({
            $addFields: {
                [`${field}_starts_with`]: {
                    $cond: {
                        if: { $regexMatch: { input: { $toLower: `$${field}` }, regex: `^${cleanedQuery}`, options: 'i' } },
                        then: 75,  // High score for starting with query
                        else: 0
                    }
                }
            }
        });
    });
    
    // Contains whole phrase condition (medium score)
    fields.forEach(field => {
        searchConditions.push({
            $addFields: {
                [`${field}_contains_phrase`]: {
                    $cond: {
                        if: { $regexMatch: { input: { $toLower: `$${field}` }, regex: cleanedQuery, options: 'i' } },
                        then: 50,  // Medium score for containing the whole phrase
                        else: 0
                    }
                }
            }
        });
    });
    
    // Contains all words in any order (lower score)
    fields.forEach(field => {
        const wordConditions = words.map(word => ({
            $regexMatch: { input: { $toLower: `$${field}` }, regex: word, options: 'i' }
        }));
        
        searchConditions.push({
            $addFields: {
                [`${field}_contains_all_words`]: {
                    $cond: {
                        if: { $and: wordConditions },
                        then: 25,  // Lower score for containing all words
                        else: 0
                    }
                }
            }
        });
    });
    
    // Contains any word (lowest score)
    fields.forEach(field => {
        const wordConditions = words.map(word => ({
            $regexMatch: { input: { $toLower: `$${field}` }, regex: word, options: 'i' }
        }));
        
        searchConditions.push({
            $addFields: {
                [`${field}_contains_any_word`]: {
                    $cond: {
                        if: { $or: wordConditions },
                        then: 10,  // Lowest score for containing any word
                        else: 0
                    }
                }
            }
        });
    });
    
    // Calculate total search score as sum of all individual scores
    const scoreFields = [];
    fields.forEach(field => {
        scoreFields.push(`$${field}_exact_match`);
        scoreFields.push(`$${field}_starts_with`);
        scoreFields.push(`$${field}_contains_phrase`);
        scoreFields.push(`$${field}_contains_all_words`);
        scoreFields.push(`$${field}_contains_any_word`);
    });
    
    searchConditions.push({
        $addFields: {
            search_score: { $sum: scoreFields }
        }
    });
    
    return searchConditions;
};

module.exports = {
    createFuzzySearchPattern,
    createScoredSearchConditions
};
