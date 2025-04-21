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
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true});

patientSchema.pre('save', async function (next) {
if (!this.isModified('password')) return next();

this.password = await bcrypt.hash(this.password, 10);
next();
});

const setImageURL = (doc) => {
    if (doc.nationalIDImg) {
        const imageUrl = `${process.env.BASE_URL}/patient/national-id/${doc.nationalIDImg}`;
        doc.nationalIDImg = imageUrl;
    }
};

// findOne, findAll and update
patientSchema.post('init', (doc) => {
    setImageURL(doc);
});

// create
patientSchema.post('save', (doc) => {
    setImageURL(doc);
});

module.exports = mongoose.model('Patient', patientSchema);
