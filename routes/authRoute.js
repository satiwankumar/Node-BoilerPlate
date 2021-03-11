const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator')
const moment = require("moment");
const _ = require('lodash')

const { baseUrl } = require('../utils/url');
//middleware
const auth = require('../middleware/authMiddleware')
const User = require('../models/User.model')
//models
const Token = require('../models/Token.model')
const Session = require('../models/session.model')
//services
const { sendEmail } = require('../service/email')
const Controller = require('../controllers/authController')

moment().format();


//@route Get api/auth
//@desc Test route
//access Public


router.get('/', auth,Controller.LoadUser)



//@route Post api/login
//@desc Test route
//access Public


router.post('/login', [check('email', 'Email is required').isEmail(), check('password', 'password is required').exists(),], Controller.Login);





router.post(
    '/login/admin',
    [

        check('email', 'Email is required').isEmail(),
        check(
            'password',
            'password is required'
        ).exists(),
    ],
    async (req, res) => {
        
        let error = []

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let { email, password } = req.body;
            email = email.toLowerCase()
            //see if user exists
            let user = await User.findOne({ email: email, isAdmin: true });



            if (!user) {
                error.push({ message: "Invalid Credentials" })
                return res.status(400).json({ errors: error });
            }

            const validpassword = await bcrypt.compare(password, user.password)
            if (!validpassword) {
                error.push({ message: "Invalid Credentials" })
                return res.status(400).json({ errors: error });

            }

            const token = user.generateAuthToken()
            let session = await Session.findOne({ user: user.id });
            // console.log(session)
            // if (session) {
            //     session.token = token,
            //         session.status = true,
            //         session.deviceId = req.body.deviceId
            // } else {

            session = new Session({
                token: token,
                user: user.id,
                status: true,
                deviceId: req.body.deviceId,
                deviceType: req.body.deviceType
            })
            // }

            await session.save()
            res.status(200).json({
                "message": "Log in Successfull",

                "token": token

            })

        } catch (err) {


            const errors = []
            errors.push({ message: err.message })
            res.status(500).json({ errors: errors });
        }

        //return json webtoken
    }
);





//Post /api/auth/forgot
//access public 

router.post("/forgot", check('email', 'Email is required').isEmail(), Controller.ForgotPassword)



//post    /api/auth/verifyCode/
//access private


router.post("/verifycode", check('resetCode', 'Code is Required'), Controller.VerifyCode);

//post    /api/auth/reset/
//access private



router.post("/reset/:token", [
    check('newpassword', 'newpassword is required').not().isEmpty(),
    check('confirmpassword', 'confirmpassword is required').not().isEmpty()], Controller.ResetPassword);


//post    /api/auth/changepassword 
//access private
router.post(
    '/changepassword',
    [auth,
        [
            check('currentpassword', 'current Password is required').not().isEmpty(),
            check('newpassword', 'New Password is required').not().isEmpty(),
            check('confirmpassword', 'Confirm password is required').not().isEmpty()

        ]],
    Controller.ChangePassword
);


router.get('/logout', auth, Controller.Logout)


module.exports = router