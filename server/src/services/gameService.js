const Game = require('../models/Game');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const ApiError = require('../utils/ApiError');
const { escapeRegex } = require('../utils/regexUtils');

const ALLOWED_GAME_FIELDS = [
  'title', 'publisher', 'category', 'tags', 'description', 'price',
  'discount', 'size', 'downloads', 'thumbnail', 'heroBanner', 'screenshots', 'levels',
];

const pickGameFields = (payload = {}) => {
  const data = {};
  for (const key of ALLOWED_GAME_FIELDS) {
    if (payload[key] !== undefined) {
      data[key] = payload[key];
    }
  }
  return data;
};

const SORT_MAP = {
  rating: { averageRating: -1 },
  'price-low': { price: 1 },
  'price-high': { price: -1 },
  discount: { discount: -1 },
};

const listGames = async ({ search, category, tag, sort, page = 1, limit = 20 }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const query = {};
  if (search && search.trim()) {
    const safeSearch = escapeRegex(search.trim());
    query.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { category: { $regex: safeSearch, $options: 'i' } },
    ];
  }
  if (category && category.trim()) {
    query.category = { $regex: escapeRegex(category.trim()), $options: 'i' };
  }
  if (tag) {
    query.tags = tag;
  }

  const sortOptions = SORT_MAP[sort] || { createdAt: -1 };
  const skip = (pageNum - 1) * limitNum;

  const [total, games] = await Promise.all([
    Game.countDocuments(query),
    Game.find(query).sort(sortOptions).skip(skip).limit(limitNum),
  ]);

  return {
    count: games.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data: games,
  };
};

const getGameByIdOrSlug = async (id) => {
  const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
  const game = isObjectId ? await Game.findById(id) : await Game.findOne({ slug: id });

  if (!game) {
    throw new ApiError(404, 'Không tìm thấy tựa game này');
  }
  return game;
};

const createNewGame = async (payload) => {
  const data = pickGameFields(payload);
  const { title, thumbnail } = data;

  if (!title || !title.trim()) {
    throw new ApiError(400, 'Tên game không được để trống');
  }
  if (!thumbnail || !thumbnail.trim()) {
    throw new ApiError(400, 'Ảnh đại diện thumbnail là bắt buộc');
  }

  const existing = await Game.findOne({ title: title.trim() });
  if (existing) {
    throw new ApiError(400, 'Tựa game này đã tồn tại trong kho');
  }

  return Game.create(data);
};

const updateGameById = async (id, payload) => {
  const data = pickGameFields(payload);

  if (data.title) {
    data.slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  const game = await Game.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!game) {
    throw new ApiError(404, 'Không tìm thấy tựa game để cập nhật');
  }
  return game;
};

const deleteGameById = async (id) => {
  const game = await Game.findById(id);
  if (!game) {
    throw new ApiError(404, 'Không tìm thấy tựa game để xóa');
  }

  await Promise.all([
    Game.findByIdAndDelete(id),
    Review.deleteMany({ game: id }),
    Wishlist.deleteMany({ game: id }),
  ]);
};

module.exports = { listGames, getGameByIdOrSlug, createNewGame, updateGameById, deleteGameById };
