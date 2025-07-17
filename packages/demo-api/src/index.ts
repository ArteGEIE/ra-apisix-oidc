import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';

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

app.route('/api/posts')
.get((req, res) => {
    res.header('Content-Range', `2`);
    return res.status(200)
    .json([
        { id: 1, title: 'Hello World', body: 'This is a post' },
        { id: 2, title: 'Another Post', body: 'This is another post' },
    ]);
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