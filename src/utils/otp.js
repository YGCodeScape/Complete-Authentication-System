 function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function getOtpHtml(otp) {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 400px; margin: auto; background: #fff; padding: 20px; border-radius: 6px; text-align: center;">
            <h2 style="color: #333;">OTP Verification</h2>
            <p>Your OTP code is:</p>
            <h1 style="letter-spacing: 4px; color: #000;">${otp}</h1>
            <p>This OTP will expire in 5 minutes.</p>
        </div>
    </div>
    `;
}

module.exports = {
    generateOtp,
    getOtpHtml
}