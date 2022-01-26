import express from 'express';

const router = express();

router.post('/api/users/signout',(req,res)=>{
    // according to the cookie-session destroying the req.session will delete the cookie information and make the user null hence logout
    req.session = null;

    res.send({});
});

export { router as signOutRouter};