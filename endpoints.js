app.get('/api/questions', async (req, res) => {
    const questions = await Question.find();
    res.json(questions);
});

app.post('/api/responses', async (req, res) => {
    // Save user response logic here
    res.status(201).send('Response saved');
});