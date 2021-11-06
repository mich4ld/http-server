import { Http } from './lib/http';

import helmet from 'helmet';
import cors from 'cors';

const app = new Http();

app.use(helmet());
app.use(cors());

app.get('/users/:userId', (req, res) => {
    const { userId } = req.params;
    return { id: userId, username: 'Karol' }
});

app.post('/', (req, res) => {
    return req.body
})

app.listen(8080, (port) => {
    console.log(`App listen at port ${port}`);
});
