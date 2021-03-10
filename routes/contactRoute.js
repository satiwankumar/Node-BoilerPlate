const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator')



const Contact = require('../models/Contact.model')
const auth = require('../middleware/authMiddleware')
const admin = require('../middleware/adminMiddleware')








router.post('/',[
    check('first_name', 'First Name is required').not().isEmpty(),
    check('last_name', 'Last Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('message', 'please enter messages').not().isEmpty(),
    

], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

       

        //create new user
        let contact = new Contact({
            first_name: req.body.first_name,
            last_name:req.body.last_name,
            email: req.body.email,
            message:req.body.message

            //   image: req.file.path 
        });


        //hash passoword


        await contact.save()
        res.status(200).json({
         
                
                message : "We will get back to you soon, thank you for reaching out"
               
        });

    } catch (error) {
        const errors =[]
        errors.push({message : err.message}) 
        res.status(500).json({ errors: errors });
    }


})


router.get('/', [auth,admin], async (req, res) => {
    const {page,limit,fieldname,order,searchBy} = req.query
    const currentpage = page?parseInt(page,10):1
    const per_page = limit?parseInt(limit,10):5
    const CurrentField = fieldname?fieldname:"createdAt"
    const currentOrder = order? parseInt(order,10):-1
    let offset = (currentpage - 1) * per_page;
    const sort = {};
    sort[CurrentField] =currentOrder
    // return res.json(sort)
   
    
const search = searchBy ?{"$or":[ 
    { first_name: { '$regex': `${searchBy}`, $options: "i" }},
    {last_name: { '$regex': `${searchBy}`, $options: "i" }},
    {email: { '$regex': `${searchBy}`, $options: "i" }} ] }: {};



    try {
        let contacts = await Contact.find({...search}).limit(per_page).skip(offset).sort(sort)
        // console.log(users)
        if (!contacts.length) {
            return res
                .status(400)
                .json({ message: 'no Contact exist' });
        }
      
            let Totalcount = await Contact.find({...search}).countDocuments()
            const paginate = {
            currentPage: currentpage,
            perPage: per_page,
            total: Math.ceil(Totalcount/per_page),
            to: offset,
            data: contacts
            }
        res.status(200).json(paginate)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});








module.exports = router