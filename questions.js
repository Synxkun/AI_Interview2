const questionSchema = new mongoose.Schema({
    question: String,
    category: String,
});

const Question = mongoose.model('Question', questionSchema);