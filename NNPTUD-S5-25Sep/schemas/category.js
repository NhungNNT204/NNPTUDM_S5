let mongoose = require('mongoose');

let categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true
    }
}, {
    timestamps: true
});

categorySchema.methods.create = function(data) {
    return this.model('category').create(data);
};

categorySchema.methods.read = function(query) {
    return this.model('category').find(query);
};

categorySchema.methods.update = function(id, data) {
    return this.model('category').findByIdAndUpdate(id, data, { new: true });
};

categorySchema.methods.delete = function(id) {
    return this.model('category').findByIdAndDelete(id);
};

module.exports = mongoose.model('category', categorySchema);