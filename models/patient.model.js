const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema({
    phone: {
        type: String,
        match: [ /^201(0|1|2|5)[0-9]{8}$/, "Please enter a valid phone number"], 
    },
    firstName: String,
    lastName: {
        type: String,
    },
    email: {
        type: String
    },
    gender: {
        type: String,
    },
    nationalID: {
        type: String,
        unique: true,
        sparse: true,
    },
    nationalIDImg: {
        type: String,
    },
    password: {
        type: String,
    },
    verifyAccount: {
        type: Boolean,
        default: false,
    },
    medicalHistory: {
        chronicDiseases: {
            hasChronicDiseases: { type: Boolean, default: false },
            diseasesList: [{ type: String }],
            otherDiseases: { type: String }
        },
        allergies: {
            hasAllergies: { type: Boolean, default: false },
            allergyDetails: { type: String }
        },
        medications: {
            takesMedications: { type: Boolean, default: false },
            list: [
            {
                name: { type: String },
                dosage: { type: String },
                reason: { type: String }
            }
            ]
        },
        surgeries: {
            hadSurgeries: { type: Boolean, default: false },
            surgeryDetails: { type: String }
        },
        currentSymptoms: {
            hasSymptoms: { type: Boolean, default: false },
            symptomsDetails: { type: String }
        },
        lifestyle: {
            smokes: { type: Boolean, default: false },
            consumesAlcohol: { type: Boolean, default: false }
        }
},
    otp: String,
    otpExpiry: Date,
    otpVerified: {
        type: Boolean,
        default: false,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    birthDate: { type: String }, 
    age: { type: Number }, 
}, {timestamps: true});

patientSchema.pre('save', async function (next) {
if (!this.isModified('password')) return next();

this.password = await bcrypt.hash(this.password, 10);
next();
});

const setImageURL = (doc) => {
    if (doc.nationalIDImg) {
        const imageUrl = `${doc.nationalIDImg}`;
        doc.nationalIDImg = imageUrl;
    }
};

function processNationalId(doc) {
    if (!doc.nationalID || doc.nationalID.length !== 14) {
        return new Error('Invalid national ID format. It should be 14 digits long.', 400);
    };

    const century = doc.nationalID.charAt(0) === '2' ? '19' : '20';
    const year = century + doc.nationalID.substring(1, 3);
    const month = doc.nationalID.substring(3, 5);
    const day = doc.nationalID.substring(5, 7);
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
patientSchema.post('init', (doc) => {
    processNationalId(doc);
    setImageURL(doc);
});

// create
patientSchema.post('save', (doc) => {
    setImageURL(doc);
});

module.exports = mongoose.model('Patient', patientSchema);
