# Http Server
Pseudo Express.js clone in Node.js (NOT production-ready). Project created just for fun.

### Features:
- Simple codebase;
- Error handling;
- TypeScript

### Usage
```ts
import { Http } from './lib/http';

const app = new Http();

app.get('/:userId', (req, res) => {
    const { userId } = req.params;
    return { id: userId, username: 'Karol' }
});

app.listen(8080, (port) => {
    console.log(`App listen at port ${port}`);
});
```
