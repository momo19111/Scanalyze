const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const staffSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    nationalId: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Receptionist', 'LabTechnician', 'ScanTechnician'], 
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    },
    imageProfile: String,
    birthDate: { type: String }, 
    age: { type: Number },   
    addresses: 
    {
        type: String,
        required: true,
    }
}, { timestamps: true });



staffSchema.pre('save', async function (next) {
if (!this.isModified('password')) return next();

this.password = await bcrypt.hash(this.password, 10);
next();
});

const setImageURL = (doc) => {
    if (doc.imageProfile) {
        const imageUrl = `${doc.imageProfile}`;
        doc.imageProfile = imageUrl;
    }
};


function processNationalId(doc) {
    if (!doc.nationalId || doc.nationalId.length !== 14) {
        return new Error('Invalid national ID format. It should be 14 digits long.', 400);
    };

    const century = doc.nationalId.charAt(0) === '2' ? '19' : '20';
    const year = century + doc.nationalId.substring(1, 3);
    const month = doc.nationalId.substring(3, 5);
    const day = doc.nationalId.substring(5, 7);
    const birthDate = new Date(`${year}-${month}-${day}`);
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
        }

    doc.birthDate = birthDate.toISOString().split('T')[0];
    doc.age = age;
}


// findOne, findAll and update
staffSchema.post('init', (doc) => {
    setImageURL(doc);
    processNationalId(doc)

});

// create
staffSchema.post('save', (doc) => {
    setImageURL(doc);
});




module.exports = mongoose.model('Staff', staffSchema);
