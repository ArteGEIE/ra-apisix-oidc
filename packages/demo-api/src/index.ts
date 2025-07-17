import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { posts, users } from './data';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: "http://127.0.0.1:9080",
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Credentials',
        'X-Correlation-Id',
    ],
    credentials: true,
    exposedHeaders: 'Content-Range',
}));


app.get('/api/posts', (req, res) => {
    let result = posts;
    const { q } = req.query;
    if (q && typeof q === 'string') {
        const qLower = q.toLowerCase();
        result = result.filter(
            post => post.title.toLowerCase().includes(qLower) ||
                    post.body.toLowerCase().includes(qLower)
        );
    }
    res.header('Content-Range', `${result.length}`);
    return res.status(200).json(result);
});

app.get('/api/posts/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const post = posts.find(p => p.id === id);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    return res.status(200).json(post);
});

app.get('/api/users', (req, res) => {
    let result = users;
    const { q } = req.query;
    if (q && typeof q === 'string') {
        const qLower = q.toLowerCase();
        result = result.filter(
            user => user.name.toLowerCase().includes(qLower) ||
                    user.email.toLowerCase().includes(qLower) ||
                    (user.role && user.role.toLowerCase().includes(qLower))
        );
    }
    res.header('Content-Range', `${result.length}`);
    return res.status(200).json(result);
});

app.get('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const user = users.find(u => u.id === id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
});

app.get('/oidc/me', (req, res) => {
    const accessToken = req.headers['x-access-token'];
    const idToken = req.headers['x-id-token'];
    if (!accessToken) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'You are not authorized to access this resource.',
        });
    }

    const user = jwt.decode(accessToken as string) as jwt.JwtPayload;
    return res.status(200).json({
        user,
        accessToken,
        idToken,
    });
});

app.get('/oidc/login', (req, res) => {
    const accessToken = req.headers['x-access-token'];
    if (!accessToken) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'You are not authorized to access this resource.',
        });
    }
    // redirect to the react-admin page to set the access token in the local storage
    res.redirect(`/#/auth-callback`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});