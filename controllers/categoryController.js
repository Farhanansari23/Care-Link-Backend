const Category = require("../Models/Category");
const DoctorDetail = require("../Models/DoctorDetail");

exports.getCategories = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const category = await Category.findById(id);
      if (!category)
        return res.status(404).json({ error: "Category not found" });
      return res.json(category);
    }
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(
      id,
      { name, updatedAt: Date.now() },
      { new: true }
    );
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category updated successfully", category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await DoctorDetail.findOne({ category_id: id });
    if (doctor)
      return res.status(400).json({ error: "Category is in use by a doctor" });
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
