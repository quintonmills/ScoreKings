app.get('/api/players', (req, res) => {
 res.json(players);
});

const PORT = 3001;
app.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT}`);
});
