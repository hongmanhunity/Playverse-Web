const Game = require('../models/Game');
const gameService = require('../services/gameService');
const asyncHandler = require('../utils/asyncHandler');

const getGames = asyncHandler(async (req, res) => {
  const result = await gameService.listGames(req.query);
  res.json({ success: true, ...result });
});

const getPopularGames = asyncHandler(async (req, res) => {
  const games = await Game.find({ tags: 'Popular' }).limit(10);
  res.json({ success: true, count: games.length, data: games });
});

const getFlashGames = asyncHandler(async (req, res) => {
  const games = await Game.find({ $or: [{ tags: 'Flash' }, { discount: { $gt: 0 } }] }).limit(10);
  res.json({ success: true, count: games.length, data: games });
});

const getGameById = asyncHandler(async (req, res) => {
  const game = await gameService.getGameByIdOrSlug(req.params.id);
  res.json({ success: true, data: game });
});

const createGame = asyncHandler(async (req, res) => {
  const game = await gameService.createNewGame(req.body);
  res.status(201).json({ success: true, message: 'Thêm game mới thành công', data: game });
});

const updateGame = asyncHandler(async (req, res) => {
  const game = await gameService.updateGameById(req.params.id, req.body);
  res.json({ success: true, message: 'Cập nhật game thành công', data: game });
});

const deleteGame = asyncHandler(async (req, res) => {
  await gameService.deleteGameById(req.params.id);
  res.json({ success: true, message: 'Xóa game và toàn bộ dữ liệu liên quan thành công' });
});

module.exports = { getGames, getPopularGames, getFlashGames, getGameById, createGame, updateGame, deleteGame };
