const mongoose =  require('mongoose');

const scanSchema = new mongoose.Schema({
    type: {
        type: String
    },
    scanImage: {
        type: String,
        required: [true, 'Please provide a scan image'],
    },
    report: {
        type: String,
        required: [true, 'Please provide a report'],
    },
    patient: {
        type: mongoose.Schema.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide a patient'],
    },
}, { timestamps: true })

const setImageURL = (doc) => {
    if (doc.scanImage) {
        // Assuming scanImage contains the Cloudinary public_id or secure_url
        const imageUrl = `${doc.scanImage}`;
        doc.scanImage = imageUrl;
    }
};

// findOne, findAll and update
scanSchema.post('init', (doc) => {
    setImageURL(doc);
});

// create
scanSchema.post('save', (doc) => {
    setImageURL(doc);
});

module.exports = mongoose.model('Scan', scanSchema);