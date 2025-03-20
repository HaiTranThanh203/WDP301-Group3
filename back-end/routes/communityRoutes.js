const express = require("express");
const router = express.Router();

const communityController = require("../controllers/communityController");
router.route("/").get(communityController.getAllCommunities);  // Lấy tất cả cộng đồng // Lấy chi tiết cộng đồng theo id
router.route("/create").post(communityController.createNewCommunity);
router.route("/join").post(communityController.addUserById);
router.route("/access/:id").patch(communityController.accessRequest);
router.route("/edit/:id").patch(communityController.updateCommunity);
router.route("/request/:id").patch(communityController.addRequest);
router.route("/get-post/:id").get(communityController.getPostInCommunity);
router.get("/search", communityController.searchCommunities); // Tìm kiếm community
router.get("/get-user/:id", communityController.getUserInCommunity);
router.get("/:id", communityController.getCommunityById);




module.exports = router;