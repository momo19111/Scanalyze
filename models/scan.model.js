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
    patientSnapshot: {
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    gender: String,
    nationalID: String,
    medicalHistory:  {
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
    birthDate: String,
    age: Number
    }
}, { timestamps: true })


scanSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('patient')) {
    const Patient = mongoose.model('Patient');
    const patientData = await Patient.findById(this.patient).lean();

        if (patientData) {
        this.patientSnapshot = {
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            phone: patientData.phone,
            email: patientData.email,
            gender: patientData.gender,
            medicalHistory: patientData.medicalHistory,
            nationalID: patientData.nationalID,
            birthDate: patientData.birthDate,
            age: patientData.age
        };
        }
    }
    next();
});

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