const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
		const allCategorys = await Category.find(
			{},
			{ name: true, description: true }
		);
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.categoryPageDetails = async (req,res) => {
	try {
		//fetch the id 
		const {categoryId} = req.body;
		//get courses for specified category
		const selectedCategory = await Category.findById(categoryId).populate("courses").exec();
		//validation
		if (!selectedCategory){
			return res
				.status(404)
				.json({ success: false, message: "Category not found" });
		}
		//get courses for different categories
		const differentCategories = await Category.find({_id:{$ne:categoryId}})
                                                  .populate("courses").exec();
	   const allCategories = await Category.find({}).populate("courses").exec();
		//get top selling courses
		const allCourses = allCategories.flatMap((category) => category.courses);
		const mostSellingCourses = allCourses
			.sort((a, b) => b.sold - a.sold)
			.slice(0, 10);

		//return response
		res.status(200).json({
			selectedCourses: selectedCourses,
			differentCategories: differentCategories,
			mostSellingCourses: mostSellingCourses,
			success: true,
		});

	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
}