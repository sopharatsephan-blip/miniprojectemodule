module.exports = {
    getCurrentDateForToken: () => {
        const now = new Date();
        const formattedDate = new Intl.DateTimeFormat('en-G8' , {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(now) . replace(/\//g, ''); // แปลงวันที่เป็นรูปแบบ ddMMyyyy

        return formattedDate;
    }
}