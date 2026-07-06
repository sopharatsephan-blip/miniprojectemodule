const date_utils = require('../libs/date_utils');
const pool = require('../libs/db_pool');

module.exports = {
    getUserAccountById: async (accountId) => {
        let conn;
        let result;
        try {
            conn = await pool.getConnection();
            var sql = `SELECT * FROM user_account WHERE account_id = ?`;
            var rows = await conn.query(sql, [accountId]);
            result ={
                isError: false,
                data: rows

            };
        } catch (error) {
            result = {
                isError: true,
                errorMessage: error.message
            };
        } finally {
            if (conn) 
               conn.release(); //release to pool
        }
        return result;
    }, // <-- เติมจุลภาค (comma) เชื่อมระหว่างฟังก์ชันใน module.exports

    // ย้าย checkAuthenRequest เข้ามาอยู่ด้านในปีกกาของ module.exports
    checkAuthenRequest: async (authenticationString) => {
        let conn;
        let result;
        try {
            conn = await pool.getConnection();

            var sql = "SELECT account_username FROM user_account WHERE" + "SHA2 (CONCAT(account_username, '&' , ?), 256) = ?";

            var rows = await conn.query(sql, [date_utils.getCurrentDateForToken(), authenticationString]);
            
            if (rows.length == 0) {
                result = {
                    isError: true,
                    errorMessage: "ไม่พบข้อมูลผู้ใช้"
                };
            } else {
                result = {
                    isError: false,
                    data: rows
                };
            }
        } 
        catch (error) {
            result = {
                isError: true,
                errorMessage: error.message
            };
        } finally {
            if (conn) 
                conn.release();     
            return result;
        }
    } // <-- ปีกกาปิดของ checkAuthenRequest
}; 

checkAuthenRequest: async (authenticationString) => {
    let conn;
    let result;
    try {
        conn = await pool.getConnection();

        var sql = "SELECT account_username FROM user_account WHERE" + "SHA2 (CONCAT(account_username, '&' , ?), 256) = ?";

        var rows = await conn.query(sql, [date_utils.getCurrentDateForToken(), authenticationString]);
        
        if (rows.length == 0) {
            result = {
                isError: true,
                errorMessage: "รหัสผ่านไม่ถูกต้อง"
            };
        } else {
            result = {
                isError: false,
                data: rows
            };  
        }
    } catch (error) {
        result = {
            isError: true,
            errorMessage: error.message
        };
    } finally {
        if (conn) {
            conn.release();
        }
    }
    return result;
};
