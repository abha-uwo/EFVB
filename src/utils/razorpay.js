const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (amount, currency = 'INR', receipt = '') => {
    try {
        const options = {
            amount: Math.round(amount * 100), // Razorpay handles in paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay Order Creation Error:', error);
        throw error;
    }
};

const verifyPaymentSignature = (orderId, paymentId, signature) => {
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

    return generated_signature === signature;
};

module.exports = {
    razorpay,
    createRazorpayOrder,
    verifyPaymentSignature
};
