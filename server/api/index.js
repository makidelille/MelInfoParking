const express = require("express");
const router = express.Router();

const vlille = require("./vlille");

router.get("/", (req, res)=> res.json(true));
router.use('/vlille', vlille);

module.exports = router;