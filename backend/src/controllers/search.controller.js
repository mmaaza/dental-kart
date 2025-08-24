const Product = require('../models/product.model');
const Brand = require('../models/brand.model');
const Category = require('../models/category.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { createFuzzySearchPattern, createScoredSearchConditions } = require('../utils/searchUtils');

/**
 * Search across products, brands, and categories
 * @route GET /api/search
 */
const searchAll = async (req, res) => {
    try {
        const { query, page = 1, limit = 20 } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        
        if (!query || query.trim() === '') {
            return res.status(200).json(
                new ApiResponse(200, { 
                    products: [], 
                    brands: [], 
                    categories: [],
                    totalResults: 0,
                    totalPages: 0,
                    currentPage: pageNumber
                }, 'Empty search query')
            );
        }
        
        // Create fuzzy search pattern for better matching
        const fuzzyPattern = createFuzzySearchPattern(query);
        
        // Product search query with fuzzy matching
        const productQuery = {
            $or: [
                { name: fuzzyPattern },
                { shortDescription: fuzzyPattern },
                { description: fuzzyPattern },
                { tags: fuzzyPattern },
                { keywords: fuzzyPattern },
                { "attributes.value": fuzzyPattern }
            ]
        };
        
        // Brand search query with fuzzy matching
        const brandQuery = {
            $or: [
                { name: fuzzyPattern },
                { description: fuzzyPattern }
            ]
        };
        
        // Category search query with fuzzy matching
        const categoryQuery = {
            $or: [
                { name: fuzzyPattern },
                { description: fuzzyPattern }
            ]
        };
        
        // Count total results for pagination
        const productCount = await Product.countDocuments(productQuery);
        const brandCount = await Brand.countDocuments(brandQuery);
        const categoryCount = await Category.countDocuments(categoryQuery);
        const totalResults = productCount + brandCount + categoryCount;
        
        // Calculate total pages
        const totalPages = Math.ceil(totalResults / limitNumber);
        
        // Get requested page
        let requestedPage = pageNumber;
        if (requestedPage < 1) requestedPage = 1;
        if (requestedPage > totalPages && totalPages > 0) requestedPage = totalPages;
        
        // Calculate skip value based on page and limit
        const skip = (requestedPage - 1) * limitNumber;
        
        // Dynamic result distribution based on query context and result counts
        // If there are many more products than other types, allocate more of the limit to products
        const totalCount = productCount + brandCount + categoryCount;
        const productRatio = totalCount > 0 ? productCount / totalCount : 0.7;
        const brandRatio = totalCount > 0 ? brandCount / totalCount : 0.15;
        const categoryRatio = totalCount > 0 ? categoryCount / totalCount : 0.15;
        
        // Adjust individual limits based on total available and their ratios
        // Calculate limits but always ensure they're at least 1 for the query
        // For display purposes, we'll filter out empty arrays after querying
        const productLimit = Math.max(Math.min(productCount, Math.ceil(limitNumber * Math.max(productRatio, 0.5))), 
                                     productCount > 0 ? 1 : 0);
        const brandLimit = Math.max(Math.min(brandCount, Math.ceil(limitNumber * Math.max(brandRatio, 0.1))), 
                                   brandCount > 0 ? 1 : 0);
        const categoryLimit = Math.max(Math.min(categoryCount, Math.ceil(limitNumber * Math.max(categoryRatio, 0.1))), 
                                      categoryCount > 0 ? 1 : 0);
        
        // Search in products using aggregation for better scoring and ranking
        const products = await Product.aggregate([
            { $match: productQuery },
            ...createScoredSearchConditions(query, ['name', 'shortDescription', 'description', 'tags', 'keywords']),
            { $sort: { search_score: -1, createdAt: -1 } }, // Sort by search score, then by newest
            { $skip: pageNumber === 1 ? 0 : skip },
            { $limit: Math.max(1, productLimit) }, // Ensure limit is at least 1
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand',
                    foreignField: '_id',
                    as: 'brandInfo'
                }
            },
            {
                $addFields: {
                    brand: { $arrayElemAt: ['$brandInfo', 0] }
                }
            },
            {
                $project: {
                    brandInfo: 0,
                    search_score: 0,
                    name_exact_match: 0,
                    name_starts_with: 0,
                    name_contains_phrase: 0,
                    name_contains_all_words: 0,
                    name_contains_any_word: 0,
                    // Remove other scoring fields
                    shortDescription_exact_match: 0,
                    shortDescription_starts_with: 0,
                    shortDescription_contains_phrase: 0,
                    shortDescription_contains_all_words: 0,
                    shortDescription_contains_any_word: 0,
                    description_exact_match: 0,
                    description_starts_with: 0,
                    description_contains_phrase: 0,
                    description_contains_all_words: 0,
                    description_contains_any_word: 0,
                    tags_exact_match: 0,
                    tags_starts_with: 0,
                    tags_contains_phrase: 0,
                    tags_contains_all_words: 0,
                    tags_contains_any_word: 0,
                    keywords_exact_match: 0,
                    keywords_starts_with: 0,
                    keywords_contains_phrase: 0,
                    keywords_contains_all_words: 0,
                    keywords_contains_any_word: 0
                }
            }
        ]);
        
        // Search in brands with scoring
        const brands = await Brand.aggregate([
            { $match: brandQuery },
            ...createScoredSearchConditions(query, ['name', 'description']),
            { $sort: { search_score: -1, name: 1 } },
            { $skip: pageNumber === 1 ? 0 : skip },
            { $limit: Math.max(1, brandLimit) }, // Ensure limit is at least 1
            {
                $project: {
                    search_score: 0,
                    name_exact_match: 0,
                    name_starts_with: 0,
                    name_contains_phrase: 0,
                    name_contains_all_words: 0,
                    name_contains_any_word: 0,
                    description_exact_match: 0,
                    description_starts_with: 0,
                    description_contains_phrase: 0,
                    description_contains_all_words: 0,
                    description_contains_any_word: 0
                }
            }
        ]);
        
        // Search in categories with scoring
        const categories = await Category.aggregate([
            { $match: categoryQuery },
            ...createScoredSearchConditions(query, ['name', 'description']),
            { $sort: { search_score: -1, name: 1 } },
            { $skip: pageNumber === 1 ? 0 : skip },
            { $limit: Math.max(1, categoryLimit) }, // Ensure limit is at least 1
            {
                $project: {
                    search_score: 0,
                    name_exact_match: 0,
                    name_starts_with: 0,
                    name_contains_phrase: 0,
                    name_contains_all_words: 0,
                    name_contains_any_word: 0,
                    description_exact_match: 0,
                    description_starts_with: 0,
                    description_contains_phrase: 0,
                    description_contains_all_words: 0,
                    description_contains_any_word: 0
                }
            }
        ]);
        
        // Filter out empty results if the original count was 0
        const finalProducts = productCount > 0 ? products : [];
        const finalBrands = brandCount > 0 ? brands : [];
        const finalCategories = categoryCount > 0 ? categories : [];

        return res.status(200).json(
            new ApiResponse(200, {
                products: finalProducts,
                brands: finalBrands,
                categories: finalCategories,
                totalResults,
                totalPages,
                currentPage: pageNumber
            }, 'Search results fetched successfully')
        );
    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json(
            new ApiError(500, 'Something went wrong while searching')
        );
    }
};

module.exports = {
    searchAll
};
