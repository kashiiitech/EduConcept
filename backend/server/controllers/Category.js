const Category = require("../models/Category");

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

exports.createCategory = async (req, res) => {
    try {
        // fetch data from req body
        const {name, description} = req.body;
        // data validation
        if(!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }
        // create the entry in DB 
        const CategoryDetails = await Category.create({
            name: name,
            description: description,
        })
        console.log(CategoryDetails);
        // return successful response
        return res.status(200).json({
            success: true,
            message: "Category created successfully...",
        })

    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Show all the categories available in the Database that has been created by Admin 
exports.showAllCategories = async (req, res) => {
    try {
        // find all categories from db
        const allCategories = await Category.find({});

        res.status(200).json({
            success: true,
            data: allCategories,
        })

    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Category page details
exports.categoryPageDetails = async (req, res) => {
    try {
        // fetch the categoryId from req body
        const {categoryId} = req.body;
        console.log("PRINTING CATEGORY ID: ", categoryId);

        // Get courses for the specified categoryId
        const selectedCategory = await Category.findById(categoryId)
                        .populate({
                            path: "courses",
                            match: { status: "Published"},
                            populate: "ratingAndReviews",
                        }).exec();

        console.log("SELECTED COURSE: ", selectedCategory);
        
        // handle the case when the category is not found
        if(!selectedCategory) {
            console.log("Category not found");
            return res.status(404).json({
                success: false,
                message: "Category not found",
            })
        }
        // Handle the case when there are no courses for the given category
        if(selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.");
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        // Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId},
        });

        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
            ._id
        )
        .populate({
            path: "courses",
            match: { status: "Published" },
        }).exec();

        console.log("DIFFERENT COURSE: ", differentCategory);

        // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: {
                    path: "instructor",
                }
            }).exec();
        
        const allCourses = allCategories.flatMap((category) => category.courses);

        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)

        console.log("MOST SELLING COURSES: ", mostSellingCourses);

        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            }
        })

    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}