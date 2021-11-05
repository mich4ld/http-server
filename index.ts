import { Http } from './lib/http';

const app = new Http();

app.get('/:userId', (req, res) => {
    const { userId } = req.params;
    return { id: userId, username: 'Karol' }
});

app.listen(8080, (port) => {
    console.log(`App listen at port ${port}`);
});
