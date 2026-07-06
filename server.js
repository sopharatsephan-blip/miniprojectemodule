const http = require('http');
const express = require('express');
const bp = require('body-parser');
const userAccountModel = require('./models/user_account');
const app = express();
const jwt = require('./libs/jwt');
const database = require('./libs/db_pool');
const date_utils = require('./libs/date_utils');
const cors = require('cors');
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());
app.use(cors());


const hostname = '127.0.0.1';
const port = 3001;

app.post("/api-user", (req, res) => {
    var response = {
        isError: true,
        data: "you are not login",
    };
    res.send(JSON.stringify(response)); // stringify แปลง Object เป็น String
});

app.post("/api/multiple_by_2", (req, res) => {
    var response = {
        isError: false,
        data: {
            no1: req.body.no1 * 2,
            no2: req.body.no2 * 2,
        }
    };
    res.send(JSON.stringify(response)); // stringify แปลง Object เป็น String
});


app.listen(port,  () => {
    console.log(`Server is running at http://${hostname}:${port}/`);   
});


app.post("/api/authen/authan_request", async (req, res) => {
    console.log(req.body.authen_Request)
    const authenRaquest = req.body.authen_request;
    const result = await userAccountModel.checkAuthenRequest(authenRaquest);
    console.log(result);

    let response; 

    if (result.isError) {
        response = {
            isError: true,
            data: "",
            errorMessage: result.errorMessage
        };
    } else {
        var payload = { username: result.data[0].account_username };
        const authenToken = jwt.sign(payload);
        response = {
            isError: false, 
            data: authenToken, 
            errorMessage: ""
        };
    }


    res.send(JSON.stringify(response)); 
}); 

app.get("/api/authen/access_request", async (req, res) => {
    const authenSingnature = req.body.authen_signature;
    const authenToken = req.body.authen_token;

    // แก้ไข: ใช้ await เพราะ jwt.verify ด้านในของคุณสร้างด้วย Promise
    var decoded = await jwt.verify(authenToken);

    let response;

    if(decoded){
        const result = await userAccountModel.checkAuthenRequest(authenSingnature,authenToken);
        console.log(result);
        
        if(result.isError){
            response = {isError: true , data : "" , errorMessage : result.errorMessage};

        } else {
            var payload ={
                user_id :result.data[0].account_id,
                username :result.data[0].account_username,
                image_url :result.data[0].account_imge_url,
                // 1. แก้ไขชื่อตัวแปรจาก dateutils เป็น date_utils ให้ตรงกับที่ require ไว้ด้านบนสุด
                date: date_utils.getCurrentDateForToken() 
            };

            const accessToken = jwt.sign( payload );
            
            // 2. ปรับโครงสร้าง Object response ตรงนี้ให้ถูกต้อง (เติมจุลภาคคั่น และเปลี่ยนเซมิโคลอนเป็นโคลอน)
            response ={
                isError: false, // เติมเครื่องหมายจุลภาค (comma)
                data: {
                    access_token: accessToken, // เติมเครื่องหมายจุลภาค (comma)
                    image_url : result.data[0].account_image_url
                }, // เติมเครื่องหมายจุลภาค (comma) หลังปีกกาปิดของ data
                errorMessage:""
            };

        }
    }else{
        response ={
            isError: true,
            data:"",
            errorMessage: "ข้อมูลไม่ถูกต้อง"
        };
    }
    // 3. เอาเครื่องหมายจุด (.) หน้าคำว่า response ออก และแก้ปีกกาปิดช่องท้ายเราท์ให้สมบูรณ์
    res.send(JSON.stringify(response));
});


        