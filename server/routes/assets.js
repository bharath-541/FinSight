const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createAsset,
    getAssets,
    getAsset,
    updateAsset,
    deleteAsset
} = require('../controllers/assetController');

// All routes are protected (require authentication)
router.use(auth);

router.route('/')
    .get(getAssets)
    .post(createAsset);

router.route('/:id')
    .get(getAsset)
    .put(updateAsset)
    .delete(deleteAsset);

module.exports = router;
