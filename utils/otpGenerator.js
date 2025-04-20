exports.generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    return { otp, expiry };
};