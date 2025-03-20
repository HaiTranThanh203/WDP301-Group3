const News = require('../models/newsModel');

const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const {
  factoryDeleteOne,
  factoryUpdateOne,
  factoryGetOne,
  factoryGetAll,
  factoryCreateOne,
} = require('./handlerFactory');
// CRUD
exports.getNewsById = factoryGetOne(News, [{ path: 'authorId',select:'username' }]
);
exports.getAllNewsPaginate = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, isActive, title } = req.query;
  
    // Define filter criteria based on query parameters
    let filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (title) filter.title = new RegExp(title, 'i'); // Tìm kiếm tiêu đề không phân biệt hoa thường
  
    // Apply filters and execute pagination
    const features = new APIFeatures(
      News.find(filter)
        .select('title content image isActive authorId createdAt'),
      req.query
    )
      .sort()
      .paginate();
  
    // Execute the query for paginated news
    const news = await features.query;
  
    // Get the total number of matching documents
    const totalNews = await News.countDocuments();
  
    // Get the count of active and inactive news
    const activeNewsCount = await News.countDocuments({
      
      isActive: true,
    });
    const inactiveNewsCount = await News.countDocuments({
      
      isActive: false,
    });
  
    // Send response
    res.status(200).json({
      results: news.length,
      total: totalNews,
      activeNewsCount,
      inactiveNewsCount,
      totalPages: Math.ceil(totalNews / limit),
      currentPage: Number(page),
      hasNextPage: page * limit < totalNews,
      hasPrevPage: page > 1,
      data: news,
    });
  });
  
exports.createNewReport = factoryCreateOne(News);
exports.getAllNews = factoryGetAll(News);
exports.updateNews = factoryUpdateOne(News);
exports.deleteNews = factoryDeleteOne(News);