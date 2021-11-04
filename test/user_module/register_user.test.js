const chai = require("chai"); 
const chaiHttp = require("chai-http");

var should = chai.should(); 
const app = require("../../app");

let random_no = Math.floor(1000 + Math.random() * 9000);
let NationalId = 1233456789101231 + random_no;
let phone = ("0") + (789111100 + random_no).toString()
let email =  (Math.random() + 1).toString(36).substring(7);

chai.use(chaiHttp);

describe('USER MANAGEMENT MODULE', ()=>{
    
    it('Should register new account on /register POST',(done)=> {
       let  registration= {
            Name: "Unit Tests",
            NationalId: NationalId,
            Phone: phone,   
            DateOfBirth: "01-25-1996",
            Email:email,
            Password:"password123"
        }
        chai.request(app)
            .post('/register' )
            .send(registration)
            .end( (err, res)=> {
                if(err){
                    done(err)
                }
                else{
                    res.should.have.property("_id");
                    done();
                }
            });
    });
    it('Should login a user  on /login POST', (done)=> {
        let userDetail={
            'Email': 'pacisnkubito@gmail.com',
            'Password': 'pacis123'
        }
        chai.request(app)
            .post('/login')
            .send(userDetail)
            .end((err, res)=> {
                if(err){
                    done(err)
                }
                else{
                    res.should.have.status(200);
                    done()
                }
            });
        
    });

})