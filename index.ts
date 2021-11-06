import { Http } from './lib/http';

import helmet from 'helmet';

const app = new Http({
    cors: false,
    trustProxy: true,
});

app.use(helmet());

app.get('/users/:userId', (req, res) => {
    const { userId } = req.params;
    return { id: userId, username: 'Karol', ip: req.ip }
});

app.post('/', (req, res) => {
    return req.body
})

app.listen(8080, (port) => {
    console.log(`App listen at port ${port}`);
});
